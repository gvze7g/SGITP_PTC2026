import GoogleAuthButton from './GoogleAuthButton';

// Acceso social compartido por Login y Register: solo Google, que usa el
// flujo OAuth real (GoogleAuthButton).
function SocialAuthButtons({ onGoogleSuccess, googleText = 'continue_with' }) {
  return (
    <div className="social-auth-block">
      <div className="auth-divider">
        <span>O continúa con</span>
      </div>

      <div className="social-icon-row">
        <GoogleAuthButton onSuccess={onGoogleSuccess} text={googleText} variant="circle" />
      </div>
    </div>
  );
}

export default SocialAuthButtons;
