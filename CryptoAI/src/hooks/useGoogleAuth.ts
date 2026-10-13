import { useState, useEffect, useRef, useCallback } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';

// Tarayıcı popup/yönlendirme penceresinin kimlik doğrulama sonrası otomatik kapanmasını sağlar
try {
  WebBrowser.maybeCompleteAuthSession();
} catch (e) {
  console.warn('WebBrowser.maybeCompleteAuthSession warning:', e);
}

// Google Web Client ID (Spring Boot backend ile birebir eşleşen kimlik)
const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  '136078967221-i10ltkk78iplnbmgooelmu0ehqbhtmmu.apps.googleusercontent.com';

export function useGoogleAuth() {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const processedTokenRef = useRef<string | null>(null);

  // Native build (npx expo run:ios) ve Web için uyumlu redirect URI
  const redirectUri = makeRedirectUri({
    scheme: 'cryptoai',
  });

  // Web ortamında doğrudan ID Token (JWT) dönecek şekilde useIdTokenAuthRequest kullanılır
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    redirectUri,
  });

  // Web üzerinde COOP veya pencere kilitlenmelerinde loading durumunun takılı kalmasını önleyici güvenlik zamanlayıcısı
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      setLoading(false);
    }, 15000);
    return () => clearTimeout(timer);
  }, [loading]);

  // Web platformunda yönlendirme (redirect) sonrası URL hash/search parametrelerinden id_token yakalama
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const hash = window.location.hash || '';
        const search = window.location.search || '';
        const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
        const searchParams = new URLSearchParams(search);

        const idToken =
          hashParams.get('id_token') ||
          searchParams.get('id_token');

        if (idToken && processedTokenRef.current !== idToken) {
          processedTokenRef.current = idToken;
          setTimeout(() => {
            setLoading(true);
          }, 0);

          // URL'deki hassas parametreleri temizle
          if (window.history?.replaceState) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }

          loginWithGoogle(idToken)
            .then((res) => {
              if (res.success) {
                router.replace('/(tabs)');
              }
            })
            .catch((err) => {
              console.error('Web redirect Google login error:', err);
            })
            .finally(() => {
              setLoading(false);
            });
        }
      } catch (err) {
        console.warn('Web URL token extraction error:', err);
        setTimeout(() => {
          setLoading(false);
        }, 0);
      }
    }
  }, [loginWithGoogle]);

  // response dinle: Google yanıtından dönen ID token'ı yakalayıp backend'e iletir
  useEffect(() => {
    if (response?.type === 'success') {
      const idToken =
        response?.authentication?.idToken || response?.params?.id_token;

      if (!idToken) {
        console.warn('Google girişi başarılı fakat geçerli idToken bulunamadı:', response);
        setTimeout(() => {
          setLoading(false);
        }, 0);
        return;
      }

      if (processedTokenRef.current !== idToken) {
        processedTokenRef.current = idToken;
        setTimeout(() => {
          setLoading(true);
        }, 0);

        loginWithGoogle(idToken)
          .then((res) => {
            if (res.success) {
              router.replace('/(tabs)');
            }
          })
          .catch((err) => {
            console.error('Google login error:', err);
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setTimeout(() => {
          setLoading(false);
        }, 0);
      }
    } else if (
      response?.type === 'error' ||
      response?.type === 'dismiss' ||
      response?.type === 'cancel'
    ) {
      setTimeout(() => {
        setLoading(false);
      }, 0);
    }
  }, [response, loginWithGoogle]);

  // Buton tıklandığında promptAsync() çağrısı yapar
  const signInWithGoogle = useCallback(async (): Promise<{
    success: boolean;
    error?: string;
    cancelled?: boolean;
  }> => {
    try {
      setLoading(true);

      // Web platformunda COOP uyumlu ve popup kilitlenmesini engelleyen seçenekler
      const promptOptions =
        Platform.OS === 'web'
          ? { windowFeatures: { popup: false } }
          : undefined;

      const result = await promptAsync(promptOptions);

      if (result.type === 'cancel' || result.type === 'dismiss') {
        setLoading(false);
        return {
          success: false,
          cancelled: true,
          error: 'Google ile giriş iptal edildi.',
        };
      }

      if (result.type === 'error') {
        setLoading(false);
        const errorMsg =
          (result as any)?.error?.message ||
          (result as any)?.params?.error_description ||
          'Google ile giriş yapılamadı.';
        return {
          success: false,
          error: errorMsg,
        };
      }

      if (result.type === 'success') {
        const idToken =
          result.authentication?.idToken || result.params?.id_token;

        if (idToken && processedTokenRef.current !== idToken) {
          processedTokenRef.current = idToken;
          const loginRes = await loginWithGoogle(idToken);
          setLoading(false);
          if (loginRes.success) {
            router.replace('/(tabs)');
          }
          return loginRes;
        }

        // Web ortamında token henüz response nesnesine gelmediyse kısa süreli bekleme sonrası kilitlenmeyi önle
        if (!idToken && Platform.OS === 'web') {
          setTimeout(() => {
            setLoading(false);
          }, 3000);
        }

        return { success: true };
      }

      setLoading(false);
      return { success: true };
    } catch (err: any) {
      setLoading(false);
      console.error('useGoogleAuth signInWithGoogle error:', err);
      return {
        success: false,
        error:
          err?.message ||
          'Google ile giriş sırasında beklenmedik bir hata oluştu.',
      };
    }
  }, [promptAsync, loginWithGoogle]);

  return {
    signInWithGoogle,
    promptAsync,
    loading,
    request,
    response,
    isReady: !!request,
    redirectUri,
    webClientId: GOOGLE_WEB_CLIENT_ID,
  };
}
