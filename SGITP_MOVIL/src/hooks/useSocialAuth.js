import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

import { GOOGLE_CLIENT_IDS } from '../constants/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Cierra la ventana del navegador y devuelve el control a la app cuando
// termina el flujo de Google. Debe llamarse una sola vez, fuera del componente.
WebBrowser.maybeCompleteAuthSession();

// Toda la lógica de "Continuar con Google" y "Continuar con Apple".
// Las pantallas solo llaman a signInWithGoogle() / signInWithApple().
export function useSocialAuth(onSuccess) {
  const { loginWithGoogle, loginWithApple } = useAuth();
  const { showToast } = useToast();

  const [isAppleAvailable, setIsAppleAvailable] = useState(false);
  const [pendingProvider, setPendingProvider] = useState(null); // 'google' | 'apple' | null

  // Google entrega un client ID por plataforma. Si falta el de la plataforma
  // actual, el botón se deshabilita en vez de fallar con un error confuso.
  const isGoogleConfigured = Boolean(
    GOOGLE_CLIENT_IDS.expo || GOOGLE_CLIENT_IDS.ios || GOOGLE_CLIENT_IDS.android
  );

  // useIdTokenAuthRequest pide directamente el id_token, que es lo único que
  // necesita nuestro backend para verificar la identidad del usuario.
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_CLIENT_IDS.expo,
    iosClientId: GOOGLE_CLIENT_IDS.ios,
    androidClientId: GOOGLE_CLIENT_IDS.android,
  });

  // Sign in with Apple solo existe en iOS 13+. En Android el botón se oculta.
  useEffect(() => {
    let cancelled = false;

    if (Platform.OS !== 'ios') {
      setIsAppleAvailable(false);
      return undefined;
    }

    AppleAuthentication.isAvailableAsync()
      .then((available) => {
        if (!cancelled) setIsAppleAvailable(available);
      })
      .catch(() => {
        if (!cancelled) setIsAppleAvailable(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Guardamos las funciones en un ref para poder usarlas dentro del efecto
  // que reacciona a `response` sin que el efecto se vuelva a disparar solo.
  const handlersRef = useRef({ loginWithGoogle, showToast, onSuccess });
  handlersRef.current = { loginWithGoogle, showToast, onSuccess };

  // El flujo de Google no devuelve el token de una: abre el navegador y la
  // respuesta llega después, por eso hay que escucharla en un efecto.
  useEffect(() => {
    if (!response) return;

    const handlers = handlersRef.current;

    if (response.type === 'error') {
      setPendingProvider(null);
      handlers.showToast('No se pudo iniciar sesión con Google.', 'error');
      return;
    }

    // 'dismiss' y 'cancel' = el usuario cerró la ventana, no es un error.
    if (response.type !== 'success') {
      setPendingProvider(null);
      return;
    }

    const idToken = response.params?.id_token ?? response.authentication?.idToken;

    if (!idToken) {
      setPendingProvider(null);
      handlers.showToast('Google no devolvió un token válido.', 'error');
      return;
    }

    (async () => {
      try {
        const loggedInUser = await handlers.loginWithGoogle(idToken);
        handlers.showToast(`Bienvenido, ${loggedInUser.full_name}`, 'success');
        handlers.onSuccess?.();
      } catch (error) {
        handlers.showToast(error.message, 'error');
      } finally {
        setPendingProvider(null);
      }
    })();
  }, [response]);

  const signInWithGoogle = useCallback(async () => {
    if (!isGoogleConfigured) {
      showToast(
        'Google Sign-In todavía no está configurado. Falta el client ID en el .env.',
        'error'
      );
      return;
    }

    setPendingProvider('google');

    try {
      await promptAsync();
    } catch (error) {
      setPendingProvider(null);
      showToast('No se pudo abrir el inicio de sesión de Google.', 'error');
    }
  }, [isGoogleConfigured, promptAsync, showToast]);

  const signInWithApple = useCallback(async () => {
    setPendingProvider('apple');

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        showToast('Apple no devolvió un token válido.', 'error');
        return;
      }

      // fullName solo viene la PRIMERA vez que el usuario autoriza la app.
      const loggedInUser = await loginWithApple({
        identityToken: credential.identityToken,
        fullName: credential.fullName,
      });

      showToast(`Bienvenido, ${loggedInUser.full_name}`, 'success');
      onSuccess?.();
    } catch (error) {
      // El usuario tocó "Cancelar" en la hoja de Apple: no es un error real.
      if (error.code === 'ERR_REQUEST_CANCELED') return;

      showToast(error.message || 'No se pudo iniciar sesión con Apple.', 'error');
    } finally {
      setPendingProvider(null);
    }
  }, [loginWithApple, onSuccess, showToast]);

  return {
    signInWithGoogle,
    signInWithApple,
    // El botón de Google se deshabilita hasta que expo-auth-session terminó
    // de preparar la petición (request === null mientras tanto).
    isGoogleReady: Boolean(request) && isGoogleConfigured,
    isAppleAvailable,
    isGoogleLoading: pendingProvider === 'google',
    isAppleLoading: pendingProvider === 'apple',
  };
}
