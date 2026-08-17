import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { loginWithGoogle } from '../../services/customerAuthService';
import { GoogleGlyph } from './socialIcons';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

let googleScriptPromise = null;

function loadGoogleScript() {
  if (typeof window !== 'undefined' && window.google?.accounts?.id) {
    return Promise.resolve(window.google);
  }

  if (!googleScriptPromise) {
    googleScriptPromise = new Promise((resolve, reject) => {
      const fail = () => reject(new Error('No se pudo cargar Google Identity Services.'));
      const existing = document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`);

      const handleLoad = () => {
        if (window.google?.accounts?.id) {
          resolve(window.google);
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
      script.src = GOOGLE_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.addEventListener('load', handleLoad, { once: true });
      script.addEventListener('error', fail, { once: true });
      document.head.appendChild(script);
    });
  }

  return googleScriptPromise;
}

// Botón oficial "Sign In With Google" (Google Identity Services). Abre el selector
// de cuentas real de accounts.google.com; PEQUES nunca dibuja esa pantalla.
// `variant="circle"` solo cambia la forma que Google renderiza (icono redondo
// en vez del botón ancho con texto); el flujo OAuth es exactamente el mismo.
function GoogleAuthButton({ onSuccess, text = 'continue_with', variant = 'standard' }) {
  const containerRef = useRef(null);
  const [status, setStatus] = useState(GOOGLE_CLIENT_ID ? 'loading' : 'unconfigured');

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.warn(
        'VITE_GOOGLE_CLIENT_ID no esta configurado (SGITP_WEB/.env). El boton de Google quedara deshabilitado.'
      );
      return undefined;
    }

    let cancelled = false;

    const handleCredentialResponse = async (response) => {
      if (!response?.credential) {
        toast.error('No se pudo iniciar sesión con Google.');
        return;
      }

      try {
        const data = await loginWithGoogle(response.credential);
        onSuccess?.(data);
      } catch (error) {
        toast.error(error.message ?? 'Ocurrió un problema al verificar tu cuenta.');
      }
    };

    loadGoogleScript()
      .then((google) => {
        if (cancelled || !containerRef.current) return;

        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        containerRef.current.innerHTML = '';

        if (variant === 'circle') {
          google.accounts.id.renderButton(containerRef.current, {
            type: 'icon',
            theme: 'outline',
            size: 'large',
            shape: 'circle',
          });
        } else {
          const width = Math.min(
            Math.max(Math.round(containerRef.current.offsetWidth || 320), 200),
            400
          );

          google.accounts.id.renderButton(containerRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text,
            shape: 'rectangular',
            logo_alignment: 'left',
            width,
          });
        }

        setStatus('ready');
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [onSuccess, text, variant]);

  const isCircle = variant === 'circle';

  if (status === 'unconfigured' || status === 'error') {
    const message =
      status === 'unconfigured'
        ? 'Google Sign-In no está configurado todavía.'
        : 'No se pudo cargar el inicio de sesión de Google. Revisa tu conexión.';

    if (isCircle) {
      return (
        <button
          type="button"
          className="social-icon-btn"
          aria-label="Continuar con Google"
          title="Continuar con Google"
          onClick={() => toast.error(message)}
        >
          <GoogleGlyph size={20} />
        </button>
      );
    }

    return (
      <button
        type="button"
        className="auth-social-btn auth-social-btn-google"
        onClick={() => toast.error(message)}
      >
        <span>google</span>
        <strong>G</strong>
      </button>
    );
  }

  return (
    <div
      className={isCircle ? 'google-auth-circle-wrapper' : 'google-auth-btn-wrapper'}
      ref={containerRef}
    />
  );
}

export default GoogleAuthButton;
