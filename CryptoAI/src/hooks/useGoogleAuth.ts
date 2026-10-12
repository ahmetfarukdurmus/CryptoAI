import { useState, useEffect, useRef, useCallback } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { useAuth } from '../context/AuthContext';

// Tarayıcı popup/yönlendirme penceresinin kimlik doğrulama sonrası otomatik kapanmasını sağlar
WebBrowser.maybeCompleteAuthSession();

export interface GoogleAuthConfig {
  webClientId: string;
  iosClientId: string;
  androidClientId: string;
}

export const GOOGLE_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  '136078967221-i10ltkk78iplnbmgooelmu0ehqbhtmmu.apps.googleusercontent.com';

export const GOOGLE_CLIENT_CONFIG: GoogleAuthConfig = {
  webClientId: GOOGLE_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || GOOGLE_CLIENT_ID,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || GOOGLE_CLIENT_ID,
};

export const EXPO_PROXY_REDIRECT_URI =
  process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URI ||
  'https://auth.expo.io/@ahmetfarukdurmus/CryptoAI';

/**
 * Google Sign-In Redirect URI resolver:
 * Expo Go yerel exp://192.168.x.x protokolünü Google Web Client kabul etmez.
 * Google Cloud Console'da tanımlı olan Expo Auth Proxy adresi (https://auth.expo.io/@ahmetfarukdurmus/CryptoAI) kullanılır.
 */
export const getGoogleRedirectUri = (): string => {
  try {
    const uri = makeRedirectUri({
      scheme: 'cryptoai',
      path: 'oauthredirect',
      useProxy: true,
    } as any);

    // Eğer üretilen URI exp:// ile başlıyorsa veya yerel IP içeriyorsa, Google 400 hatası vermemesi için
    // Google Cloud Console'da yetkilendirilmiş Expo Proxy URI'sine yönlendirilir.
    if (uri && !uri.startsWith('exp://') && !uri.includes('192.168.') && !uri.includes('localhost') && uri.startsWith('https://')) {
      return uri;
    }
  } catch {
    // ignore
  }

  return EXPO_PROXY_REDIRECT_URI;
};

export function useGoogleAuth() {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const processedTokenRef = useRef<string | null>(null);

  // Google Cloud Console yetkili yönlendirme adresi: https://auth.expo.io/@ahmetfarukdurmus/CryptoAI
  const redirectUri = getGoogleRedirectUri();

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_CLIENT_CONFIG.webClientId,
    webClientId: GOOGLE_CLIENT_CONFIG.webClientId,
    iosClientId: GOOGLE_CLIENT_CONFIG.iosClientId,
    androidClientId: GOOGLE_CLIENT_CONFIG.androidClientId,
    redirectUri,
  });

  // Native cihazlarda derin link (deep link) ile dönen asenkron yanıtı yakalar
  useEffect(() => {
    if (response?.type === 'success') {
      const idToken =
        response.params?.id_token ||
        (response as any)?.authentication?.idToken;

      if (idToken && processedTokenRef.current !== idToken) {
        processedTokenRef.current = idToken;
        setLoading(true);
        loginWithGoogle(idToken).finally(() => {
          setLoading(false);
        });
      }
    }
  }, [response, loginWithGoogle]);

  const signInWithGoogle = useCallback(async (): Promise<{
    success: boolean;
    error?: string;
    cancelled?: boolean;
  }> => {
    try {
      setLoading(true);

      const result = await promptAsync();

      if (result.type === 'success') {
        const idToken =
          result.params?.id_token ||
          (result as any)?.authentication?.idToken;

        if (!idToken) {
          return {
            success: false,
            error: 'Google kimlik doğrulama belirteci (ID Token) alınamadı.',
          };
        }

        processedTokenRef.current = idToken;
        const loginRes = await loginWithGoogle(idToken);
        return loginRes;
      }

      if (result.type === 'cancel' || result.type === 'dismiss') {
        return {
          success: false,
          cancelled: true,
          error: 'Google ile giriş iptal edildi.',
        };
      }

      if (result.type === 'error') {
        const errorMsg =
          (result as any)?.error?.message ||
          (result as any)?.params?.error_description ||
          'Google ile giriş yapılamadı.';
        return {
          success: false,
          error: errorMsg,
        };
      }

      return {
        success: false,
        error: 'Google kimlik doğrulama tamamlanamadı.',
      };
    } catch (err: any) {
      console.error('useGoogleAuth signInWithGoogle error:', err);
      return {
        success: false,
        error: err?.message || 'Google ile giriş sırasında beklenmedik bir hata oluştu.',
      };
    } finally {
      setLoading(false);
    }
  }, [promptAsync, loginWithGoogle]);

  return {
    signInWithGoogle,
    loading,
    request,
    isReady: !!request,
  };
}
