import { toast } from 'sonner';
import GoogleAuthButton from './GoogleAuthButton';
import { AppleGlyph } from './socialIcons';

// Accesos sociales compartidos por Login y Register: solo iconos, circulares.
// Google usa el flujo OAuth real (GoogleAuthButton). Apple aun no tiene
// autenticacion real configurada, asi que queda visualmente lista pero
// avisa que todavia no esta disponible, sin simular un login.
function SocialAuthButtons({ onGoogleSuccess, googleText = 'continue_with' }) {
  return (
    <div className="social-auth-block">
      <div className="auth-divider">
        <span>O continúa con</span>
      </div>

      <div className="social-icon-row">
        <GoogleAuthButton onSuccess={onGoogleSuccess} text={googleText} variant="circle" />

        <button
          type="button"
          className="social-icon-btn"
          aria-label="Continuar con Apple (próximamente)"
          title="Continuar con Apple (próximamente)"
          onClick={() => toast('Apple estará disponible próximamente.')}
        >
          <AppleGlyph size={20} />
        </button>
      </div>
    </div>
  );
}

export default SocialAuthButtons;
