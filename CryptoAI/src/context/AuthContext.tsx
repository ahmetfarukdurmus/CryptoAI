import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types/crypto';
import { authService } from '../services/auth.service';
import {
  getStoredToken,
  getStoredUser,
  setStoredUser,
  clearAuthStorage,
} from '../services/api';

export const INACTIVITY_TIMEOUT_DAYS = 30;
const INACTIVITY_TIMEOUT_MS = INACTIVITY_TIMEOUT_DAYS * 24 * 60 * 60 * 1000;
const LAST_ACTIVE_KEY = '@cryptoai_last_active_at';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  inactivityTimeoutDays: number;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  registerWithEmail: (
    arg1: string,
    arg2: string,
    arg3?: string,
    arg4?: string
  ) => Promise<{ success: boolean; error?: string; message?: string }>;
  register: (email: string, pass: string, fullName: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (idToken?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithApple: () => Promise<boolean>;
  loginDemoUser: () => void;
  logout: () => Promise<void>;
  toggleBiometrics: () => void;
  refreshWallet: () => Promise<number | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  inactivityTimeoutDays: INACTIVITY_TIMEOUT_DAYS,
  loginWithEmail: async () => ({ success: false }),
  registerWithEmail: async () => ({ success: false }),
  register: async () => ({ success: false }),
  verifyOtp: async () => ({ success: false }),
  loginWithGoogle: async () => ({ success: false }),
  loginWithApple: async () => false,
  loginDemoUser: () => {},
  logout: async () => {},
  toggleBiometrics: () => {},
  refreshWallet: async () => null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const recordActivity = async () => {
    try {
      await AsyncStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
    } catch {
      // ignore
    }
  };

  const clearActivity = async () => {
    try {
      await AsyncStorage.removeItem(LAST_ACTIVE_KEY);
    } catch {
      // ignore
    }
  };

  // Restore authenticated session on app launch
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const storedToken = await getStoredToken();
        const storedUser = await getStoredUser();

        if (storedToken) {
          // Check 30-day inactivity timeout
          const lastActiveStr = await AsyncStorage.getItem(LAST_ACTIVE_KEY);
          if (lastActiveStr) {
            const lastActive = parseInt(lastActiveStr, 10);
            const elapsed = Date.now() - lastActive;
            if (elapsed > INACTIVITY_TIMEOUT_MS) {
              console.log('Session expired: 30 days of inactivity exceeded.');
              await authService.logout();
              await clearActivity();
              if (isMounted) {
                setUser(null);
                setLoading(false);
              }
              return;
            }
          }

          await recordActivity();

          // Fetch fresh wallet balance from Spring Boot backend
          const walletRes = await authService.getWallet();
          const balance = walletRes.success ? walletRes.balance : (storedUser?.balance ?? 10000.0);

          const fullName = storedUser?.name || storedUser?.fullName || storedUser?.email?.split('@')[0] || 'Kullanıcı';
          const nameParts = fullName.trim().split(' ');
          const firstName = storedUser?.firstName || nameParts[0] || '';
          const lastName = storedUser?.lastName || nameParts.slice(1).join(' ') || '';

          const restoredProfile: UserProfile = {
            id: storedUser?.id || storedUser?.userId || `user_${Date.now()}`,
            name: fullName,
            firstName,
            lastName,
            email: storedUser?.email || '',
            balance,
            authProvider: storedUser?.authProvider || 'email',
            token: storedToken,
            isBiometricEnabled: storedUser?.isBiometricEnabled ?? true,
          };

          if (isMounted) {
            setUser(restoredProfile);
          }
        } else {
          if (isMounted) {
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Session restore error:', err);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshWallet = useCallback(async (): Promise<number | null> => {
    try {
      const walletRes = await authService.getWallet();
      if (walletRes.success) {
        setUser((prev) => (prev ? { ...prev, balance: walletRes.balance } : null));
        return walletRes.balance;
      }
    } catch (e) {
      console.log('Refresh wallet failed:', e);
    }
    return null;
  }, []);

  /**
   * Register with Spring Boot backend
   * POST /api/auth/register
   */
  const register = async (
    email: string,
    pass: string,
    fullName: string
  ): Promise<{ success: boolean; error?: string; message?: string }> => {
    const res = await authService.register(email, pass, fullName);
    return res;
  };

  /**
   * Overloaded registerWithEmail to support both (firstName, lastName, email, pass) and (email, pass, fullName)
   */
  const registerWithEmail = async (
    arg1: string,
    arg2: string,
    arg3?: string,
    arg4?: string
  ): Promise<{ success: boolean; error?: string; message?: string }> => {
    let email = '';
    let pass = '';
    let fullName = '';

    if (arg4 !== undefined && arg3 !== undefined) {
      // (firstName, lastName, email, pass)
      const firstName = arg1.trim();
      const lastName = arg2.trim();
      fullName = `${firstName} ${lastName}`.trim();
      email = arg3.trim();
      pass = arg4;
    } else {
      // (email, pass, fullName)
      email = arg1.trim();
      pass = arg2;
      fullName = arg3 ? arg3.trim() : email.split('@')[0];
    }

    return await register(email, pass, fullName);
  };

  /**
   * Verify OTP with Spring Boot backend
   * POST /api/auth/verify-email
   */
  const verifyOtp = async (
    email: string,
    otp: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await authService.verifyOtp(email, otp);
      if (!res.success) {
        return { success: false, error: res.error || 'Doğrulama kodu hatalı.' };
      }

      // Fetch wallet balance
      const walletRes = await authService.getWallet();
      const balance = walletRes.success ? walletRes.balance : 10000.0;

      const userObj = res.user || {};
      const fullName = userObj.fullName || (res as any)?.data?.fullName || userObj.name || (userObj.firstName ? (userObj.firstName + ' ' + (userObj.lastName || '')).trim() : '') || userObj.name || email.split('@')[0];
      const nameParts = fullName.trim().split(' ');

      const profile: UserProfile = {
        id: userObj.id || userObj.userId || `usr_${Date.now()}`,
        name: fullName,
        firstName: userObj.firstName || nameParts[0] || '',
        lastName: userObj.lastName || nameParts.slice(1).join(' ') || '',
        email: email.trim(),
        balance,
        authProvider: 'email',
        token: res.accessToken || (await getStoredToken()) || '',
        isBiometricEnabled: true,
      };

      await setStoredUser(profile);
      setUser(profile);
      await recordActivity();

      return { success: true };
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      return { success: false, error: err?.message || 'Doğrulama sırasında hata oluştu.' };
    }
  };

  /**
   * Login with Spring Boot backend
   * POST /api/auth/login
   */
  const loginWithEmail = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await authService.login(email, pass);
      if (!res.success) {
        return { success: false, error: res.error || 'E-posta veya şifre hatalı.' };
      }

      // Fetch wallet balance
      const walletRes = await authService.getWallet();
      const balance = walletRes.success ? walletRes.balance : 10000.0;

      const userObj = res.user || {};
      const fullName = userObj.fullName || (res as any)?.data?.fullName || userObj.name || (userObj.firstName ? (userObj.firstName + ' ' + (userObj.lastName || '')).trim() : '') || userObj.name || email.split('@')[0];
      const nameParts = fullName.trim().split(' ');

      const profile: UserProfile = {
        id: userObj.id || userObj.userId || `usr_${Date.now()}`,
        name: fullName,
        firstName: userObj.firstName || nameParts[0] || '',
        lastName: userObj.lastName || nameParts.slice(1).join(' ') || '',
        email: email.trim(),
        balance,
        authProvider: 'email',
        token: res.accessToken || (await getStoredToken()) || '',
        isBiometricEnabled: true,
      };

      await setStoredUser(profile);
      setUser(profile);
      await recordActivity();

      return { success: true };
    } catch (err: any) {
      console.error('Login error:', err);
      return { success: false, error: err?.message || 'Giriş yapılamadı.' };
    }
  };

  const loginWithGoogle = async (
    idToken?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (idToken) {
        const res = await authService.googleLogin(idToken);
        if (!res.success) {
          return { success: false, error: res.error || 'Google ile giriş başarısız oldu.' };
        }

        // Fetch fresh wallet balance from Spring Boot backend
        const walletRes = await authService.getWallet();
        const balance = walletRes.success ? walletRes.balance : 10000.0;

        const userObj = res.user || {};
        const fullName =
          userObj.fullName || userObj.name || userObj.email?.split('@')[0] || 'Google Kullanıcısı';
        const nameParts = fullName.trim().split(' ');

        const profile: UserProfile = {
          id: userObj.id || userObj.userId || `usr_${Date.now()}`,
          name: fullName,
          firstName: userObj.firstName || nameParts[0] || 'Google',
          lastName: userObj.lastName || nameParts.slice(1).join(' ') || '',
          email: userObj.email || '',
          balance,
          authProvider: 'google',
          token: res.accessToken || (await getStoredToken()) || '',
          isBiometricEnabled: true,
        };

        await setStoredUser(profile);
        setUser(profile);
        await recordActivity();

        return { success: true };
      }

      // Fallback demo/development Google user when no idToken is provided
      const demoGoogleUser: UserProfile = {
        id: 'google_usr_spring_boot',
        name: 'Google Kullanıcısı',
        firstName: 'Google',
        lastName: 'Kullanıcısı',
        email: 'user@google.com',
        balance: 10000.0,
        authProvider: 'google',
        token: `google_spring_boot_token_${Date.now()}`,
        isBiometricEnabled: true,
      };
      await setStoredUser(demoGoogleUser);
      setUser(demoGoogleUser);
      await recordActivity();
      return { success: true };
    } catch (err: any) {
      console.error('Google login context error:', err);
      return { success: false, error: err?.message || 'Google ile giriş yapılamadı.' };
    }
  };

  const loginWithApple = async (): Promise<boolean> => {
    const demoAppleUser: UserProfile = {
      id: 'apple_usr_spring_boot',
      name: 'Apple Kullanıcısı',
      firstName: 'Apple',
      lastName: 'Kullanıcısı',
      email: 'user@privaterelay.appleid.com',
      balance: 10000.0,
      authProvider: 'apple',
      token: `apple_spring_boot_token_${Date.now()}`,
      isBiometricEnabled: true,
    };
    await setStoredUser(demoAppleUser);
    setUser(demoAppleUser);
    await recordActivity();
    return true;
  };

  const loginDemoUser = async () => {
    const demoProfile: UserProfile = {
      id: 'user_academic_evaluator',
      name: 'Beyza Göryunar (Demo)',
      firstName: 'Beyza',
      lastName: 'Göryunar',
      email: 'akademik@cryptoai.edu.tr',
      balance: 10000.0,
      authProvider: 'demo',
      token: `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.demo_spring_boot_token_${Date.now()}`,
      isBiometricEnabled: true,
    };
    await setStoredUser(demoProfile);
    setUser(demoProfile);
    await recordActivity();
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    await clearActivity();
    await clearAuthStorage();
    setUser(null);
  };

  const toggleBiometrics = async () => {
    if (user) {
      const updated = { ...user, isBiometricEnabled: !user.isBiometricEnabled };
      setUser(updated);
      await setStoredUser(updated);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        inactivityTimeoutDays: INACTIVITY_TIMEOUT_DAYS,
        loginWithEmail,
        registerWithEmail,
        register,
        verifyOtp,
        loginWithGoogle,
        loginWithApple,
        loginDemoUser,
        logout,
        toggleBiometrics,
        refreshWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
