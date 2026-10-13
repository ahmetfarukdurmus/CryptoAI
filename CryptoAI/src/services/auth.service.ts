import { apiClient, setStoredToken, setStoredUser, clearAuthStorage, ApiError } from './api';

export interface AuthRegisterPayload {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthLoginPayload {
  email: string;
  password: string;
}

export interface AuthVerifyOtpPayload {
  email: string;
  otp: string;
}

export interface AuthResult<T = any> {
  success: boolean;
  accessToken?: string;
  user?: any;
  message?: string;
  error?: string;
  data?: T;
}

export type AuthResponse<T = any> = AuthResult<T>;

export interface GoogleLoginPayload {
  idToken: string;
}

export interface WalletResult {
  success: boolean;
  balance: number;
  portfolio?: any[];
  currency?: string;
  data?: any;
  error?: string;
}

class AuthService {
  /**
   * Yeni kullanıcı kaydı oluşturur.
   * POST /api/auth/register
   */
  async register(email: string, password: string, fullName: string): Promise<AuthResult> {
    try {
      const response = await apiClient.post('/auth/register', {
        email: email.trim(),
        password,
        fullName: fullName.trim(),
      });

      return {
        success: true,
        message: response?.message || 'Kayıt başarılı. Lütfen e-postanıza gönderilen OTP kodunu doğrulayın.',
        data: response,
      };
    } catch (error: any) {
      console.error('Auth register error:', error);
      return {
        success: false,
        error: error instanceof ApiError ? error.message : (error?.message || 'Kayıt işlemi başarısız oldu.'),
      };
    }
  }

  /**
   * E-posta adresine gelen OTP kodunu doğrular.
   * POST /api/auth/verify-email
   * Başarılı olursa accessToken ve kullanıcı bilgilerini AsyncStorage'a kaydeder.
   */
  async verifyOtp(email: string, code: string): Promise<AuthResult> {
    try {
      const trimmedEmail = email.trim();
      const trimmedCode = code.trim();

      // Backend /api/auth/verify-email VerifyOtpDto: { email, otp } bekliyor
      const response = await apiClient.post('/auth/verify-email', {
        email: trimmedEmail,
        otp: trimmedCode,
      });

      // Token çözümleme (farklı backend yanıt formatlarını destekler)
      const token =
        response?.accessToken ||
        response?.token ||
        response?.jwt ||
        response?.data?.accessToken ||
        response?.data?.token;

      // Kullanıcı nesnesi çözümleme
      const userData = response?.user || response?.data?.user || { fullName: response?.fullName, userId: response?.userId, 
        email: trimmedEmail,
        name: response?.fullName || (response?.firstName ? (response?.firstName + ' ' + (response?.lastName || '')).trim() : '') || response?.name || trimmedEmail.split('@')[0],
      };

      if (token) {
        await setStoredToken(token);
      }
      if (userData) {
        await setStoredUser(userData);
      }

      return {
        success: true,
        accessToken: token,
        user: userData,
        message: response?.message || 'E-posta doğrulama başarılı.',
        data: response,
      };
    } catch (error: any) {
      console.error('Auth verify-email error:', error);
      return {
        success: false,
        error: error instanceof ApiError ? error.message : (error?.message || 'Doğrulama kodu geçersiz veya süresi dolmuş.'),
      };
    }
  }

  /**
   * Doğrulanmış kullanıcı ile sisteme giriş yapar.
   * POST /api/auth/login
   * Başarılı olursa accessToken ve kullanıcı bilgilerini AsyncStorage'a kaydeder.
   */
  async login(email: string, password: string): Promise<AuthResult> {
    try {
      const trimmedEmail = email.trim();
      const response = await apiClient.post('/auth/login', {
        email: trimmedEmail,
        password,
      });

      const token =
        response?.accessToken ||
        response?.token ||
        response?.jwt ||
        response?.data?.accessToken ||
        response?.data?.token;

      const userData = response?.user || response?.data?.user || { fullName: response?.fullName, userId: response?.userId, 
        email: trimmedEmail,
        name: response?.fullName || (response?.firstName ? (response?.firstName + ' ' + (response?.lastName || '')).trim() : '') || response?.name || trimmedEmail.split('@')[0],
      };

      if (token) {
        await setStoredToken(token);
      }
      if (userData) {
        await setStoredUser(userData);
      }

      return {
        success: true,
        accessToken: token,
        user: userData,
        message: response?.message || 'Giriş başarılı.',
        data: response,
      };
    } catch (error: any) {
      // console.error('Auth login error:', error);
      return {
        success: false,
        error: error instanceof ApiError ? error.message : (error?.message || 'E-posta veya şifre hatalı.'),
      };
    }
  }

  /**
   * Google ID Token ile sisteme giriş yapar.
   * POST /api/v1/auth/google
   * Body: { idToken: string }
   * Standart AuthResponseDto (jwtToken, email, fullName vb.) döner.
   * Başarılı olursa token ve kullanıcı bilgilerini AsyncStorage'a kaydeder.
   */
  async googleLogin(idToken: string): Promise<AuthResponse> {
    try {
      if (!idToken || typeof idToken !== 'string' || !idToken.trim()) {
        console.error('Auth googleLogin: idToken boş veya tanımsızdır!', idToken);
        return {
          success: false,
          error: 'Google ID Token boş veya geçersiz.',
        };
      }

      const trimmedToken = idToken.trim();
      const payload: GoogleLoginPayload = {
        idToken: trimmedToken,
      };

      // Spring Boot backend endpoint (/api/auth/google veya /api/v1/auth/google)
      let response: any;
      try {
        response = await apiClient.post('/api/auth/google', payload);
      } catch (err: any) {
        if (err?.status === 404) {
          response = await apiClient.post('/api/v1/auth/google', payload);
        } else {
          throw err;
        }
      }

      // Token çözümleme: jwtToken, accessToken, token vb.
      const token =
        response?.jwtToken ||
        response?.accessToken ||
        response?.token ||
        response?.jwt ||
        response?.data?.jwtToken ||
        response?.data?.accessToken ||
        response?.data?.token;

      // Kullanıcı nesnesi çözümleme
      const email = response?.email || response?.data?.email || '';
      const fullName =
        response?.fullName ||
        response?.name ||
        response?.data?.fullName ||
        response?.data?.name ||
        (email ? email.split('@')[0] : 'Google Kullanıcısı');

      const nameParts = fullName.trim().split(' ');
      const firstName = response?.firstName || nameParts[0] || 'Google';
      const lastName = response?.lastName || nameParts.slice(1).join(' ') || '';

      const userData = response?.user || response?.data?.user || { fullName: response?.fullName, userId: response?.userId, 
        id: response?.id || response?.userId || response?.data?.id || `usr_google_${Date.now()}`,
        email,
        name: fullName,
        fullName,
        firstName,
        lastName,
        authProvider: 'google',
      };

      if (token) {
        await setStoredToken(token);
      }
      if (userData) {
        await setStoredUser(userData);
      }

      return {
        success: true,
        accessToken: token,
        user: userData,
        message: response?.message || 'Google ile giriş başarılı.',
        data: response,
      };
    } catch (error: any) {
      console.error('Auth googleLogin error:', error);
      return {
        success: false,
        error:
          error instanceof ApiError
            ? error.message
            : (error?.message || 'Google ile giriş başarısız oldu.'),
      };
    }
  }

  /**
   * Kullanıcının cüzdan bakiyesini getirir (Bearer token ile).
   * GET /api/wallet (veya GET /api/wallet/balance)
   */
  async getWallet(): Promise<WalletResult> {
    try {
      let response: any = null;
      try {
        response = await apiClient.get('/wallet');
      } catch (err: any) {
        if (err instanceof ApiError && err.status === 404) {
          // Fallback endpoint
          try {
            response = await apiClient.get('/wallet/balance');
          } catch {
            response = null;
          }
        } else {
          response = null;
        }
      }

      let balance = 10000.0;
      let portfolio: any[] = [];

      if (typeof response === 'number') {
        balance = response;
      } else if (response) {
        if (typeof response.balance === 'number') balance = response.balance;
        else if (typeof response.cashBalance === 'number') balance = response.cashBalance;
        else if (typeof response.amount === 'number') balance = response.amount;
        else if (response.data && typeof response.data.balance === 'number') balance = response.data.balance;
        else if (response.data && typeof response.data.cashBalance === 'number') balance = response.data.cashBalance;

        if (Array.isArray(response.portfolio)) portfolio = response.portfolio;
        else if (Array.isArray(response.positions)) portfolio = response.positions;
        else if (response.data && Array.isArray(response.data.portfolio)) portfolio = response.data.portfolio;
      }

      return {
        success: true,
        balance,
        portfolio,
        currency: response?.currency || 'USD',
        data: response,
      };
    } catch {
      // Backend kapalı veya erişilemez olduğunda LogBox kırmızı hata ekranı (Console Error) vermesini engelle.
      // Sessizce varsayılan yerel sanal cüzdan durumunu dön.
      return {
        success: true,
        balance: 10000.0,
        portfolio: [],
        currency: 'USD',
        data: null,
      };
    }
  }

  /**
   * E-posta adresine tekrar OTP kodu gönderir.
   * POST /api/auth/resend-otp?email=...
   */
  async resendOtp(email: string): Promise<AuthResult> {
    try {
      const trimmedEmail = email.trim();
      const response = await apiClient.post(`/auth/resend-otp?email=${encodeURIComponent(trimmedEmail)}`);
      return {
        success: true,
        message: 'Yeni doğrulama kodu e-postanıza gönderildi.',
        data: response,
      };
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      return {
        success: false,
        error: error instanceof ApiError ? error.message : (error?.message || 'Kod tekrar gönderilemedi.'),
      };
    }
  }

  /**
   * Kullanıcı oturumunu kapatır ve kayıtlı tokenları siler.
   */
  async logout(): Promise<void> {
    await clearAuthStorage();
  }
}

export const authService = new AuthService();
