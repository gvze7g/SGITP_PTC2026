import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { loginWithApple } from '../../services/customerAuthService';
import { AppleGlyph } from './socialIcons';

// Service ID creado en developer.apple.com (ej: com.peques.web).
// No es el Bundle ID de la app movil: Apple exige un identificador distinto
// para el login desde web.
const APPLE_CLIENT_ID = import.meta.env.VITE_APPLE_CLIENT_ID;

// Apple obliga a que la URL de retorno sea HTTPS y este registrada tal cual
// en el Services ID. Por eso no se puede probar en http://localhost sin un
// tunel (ngrok, cloudflared) que de una URL https.
const APPLE_REDIRECT_URI =
  import.meta.env.VITE_APPLE_REDIRECT_URI ?? window.location.origin;

const APPLE_SCRIPT_SRC =
  'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/es_ES/appleid.auth.js';

let appleScriptPromise = null;

function loadAppleScript() {
  if (typeof window !== 'undefined' && window.AppleID?.auth) {
    return Promise.resolve(window.AppleID);
  }

  if (!appleScriptPromise) {
    appleScriptPromise = new Promise((resolve, reject) => {
      const fail = () => reject(new Error('No se pudo cargar Apple Sign In.'));
      const existing = document.querySelector(`script[src="${APPLE_SCRIPT_SRC}"]`);

      const handleLoad = () => {
        if (window.AppleID?.auth) {
          resolve(window.AppleID);
        } else {
          fail();
        }
      };

      if (existing) {
        existing.addEventListener('load', handleLoad, { once: true });
        existing.addEventListener('error', fail, { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = APPLE_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.addEventListener('load', handleLoad, { once: true });
      script.addEventListener('error', fail, { once: true });
      document.head.appendChild(script);
    });
  }

  return appleScriptPromise;
}

// Boton "Continuar con Apple". Abre el popup oficial de appleid.apple.com;
// PEQUES nunca ve la contrasena del usuario, solo recibe el token firmado que
// despues verifica el backend contra las llaves publicas de Apple.
function AppleAuthButton({ onSuccess }) {
  const [status, setStatus] = useState(APPLE_CLIENT_ID ? 'loading' : 'unconfigured');
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (!APPLE_CLIENT_ID) {
      console.warn(
        'VITE_APPLE_CLIENT_ID no esta configurado (SGITP_WEB/.env). El boton de Apple quedara deshabilitado.'
      );
      return undefined;
    }

    let cancelled = false;

    loadAppleScript()
      .then((AppleID) => {
        if (cancelled) return;

        AppleID.auth.init({
          clientId: APPLE_CLIENT_ID,
          scope: 'name email',
          redirectURI: APPLE_REDIRECT_URI,
          // usePopup hace que signIn() devuelva el token directo en el navegador,
          // sin recargar la pagina ni pasar por el backend con un form POST.
          usePopup: true,
        });

        setStatus('ready');
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleClick = useCallback(async () => {
    if (status === 'unconfigured') {
      toast.error('Apple Sign In no esta configurado todavia.');
      return;
    }

    if (status === 'error') {
      toast.error('No se pudo cargar Apple Sign In. Revisa tu conexion.');
      return;
    }

    if (status !== 'ready' || isSigningIn) return;

    setIsSigningIn(true);

    try {
      const data = await window.AppleID.auth.signIn();

      const identityToken = data?.authorization?.id_token;

      if (!identityToken) {
        toast.error('Apple no devolvio un token valido.');
        return;
      }

      // Apple manda el nombre SOLO la primera vez que el usuario autoriza la
      // app, y lo hace fuera del token. Si no se envia ahora, se pierde.
      const result = await loginWithApple({
        identityToken,
        fullName: data?.user?.name,
      });

      onSuccess?.(result);
    } catch (error) {
      // El usuario cerro el popup: no es un error que valga la pena mostrar.
      if (error?.error === 'popup_closed_by_user' || error?.error === 'user_cancelled_authorize') {
        return;
      }

      toast.error(error.message ?? 'Ocurrio un problema al verificar tu cuenta de Apple.');
    } finally {
      setIsSigningIn(false);
    }
  }, [status, isSigningIn, onSuccess]);

  return (
    <button
      type="button"
      className="social-icon-btn"
      aria-label="Continuar con Apple"
      title="Continuar con Apple"
      onClick={handleClick}
      disabled={isSigningIn}
    >
      <AppleGlyph size={20} />
    </button>
  );
}

export default AppleAuthButton;
