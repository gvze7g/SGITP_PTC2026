import GoogleAuthButton from './GoogleAuthButton';
import AppleAuthButton from './AppleAuthButton';

// Accesos sociales compartidos por Login y Register: solo iconos, circulares.
// Los dos usan el flujo OAuth real del proveedor: PEQUES nunca dibuja la
// pantalla de contrasena ni ve las credenciales del usuario, solo recibe un
// token firmado que el backend verifica contra Google / Apple.
function SocialAuthButtons({ onGoogleSuccess, onAppleSuccess, googleText = 'continue_with' }) {
  return (
    <div className="social-auth-block">
      <div className="auth-divider">
        <span>O continúa con</span>
      </div>

      <div className="social-icon-row">
        <GoogleAuthButton onSuccess={onGoogleSuccess} text={googleText} variant="circle" />

        {/* Si no se pasa onAppleSuccess se reutiliza el manejador de Google:
            ambos endpoints devuelven la misma forma { message, token, user }. */}
        <AppleAuthButton onSuccess={onAppleSuccess ?? onGoogleSuccess} />
      </div>
    </div>
  );
}

export default SocialAuthButtons;
