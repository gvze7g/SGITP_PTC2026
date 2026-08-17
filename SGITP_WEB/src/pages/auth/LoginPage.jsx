import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AuthButton from '../../components/auth/AuthButton';
import AuthCard from '../../components/auth/AuthCard';
import AuthInput from '../../components/auth/AuthInput';
import PequesBeeIcon from '../../components/auth/PequesBeeIcon';
import PequesBrandPanel from '../../components/auth/PequesBrandPanel';
import SocialAuthButtons from '../../components/auth/SocialAuthButtons';
import ThemeToggle from '../../components/auth/ThemeToggle';
import { loginWebUser } from '../../services/customerAuthService';

function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const email = formData.email.trim();
    const password = formData.password.trim();

    if (!email && !password) {
      toast.error('Debes completar el correo y la contrasena.');
      return false;
    }

    if (!email || !email.includes('@') || !emailRegex.test(email)) {
      toast.error('Ingresa un correo electronico valido.');
      return false;
    }

    if (!password) {
      toast.error('La contrasena es obligatoria.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      await loginWebUser({
        email: formData.email.trim(),
        password: formData.password,
      });

      toast.success('Inicio de sesion exitoso.');
      navigate('/home', { replace: true });
    } catch (error) {
      toast.error(error.message ?? 'No se pudo iniciar sesion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = () => {
    toast.success('Inicio de sesion con Google exitoso.');
    navigate('/home', { replace: true });
  };

  return (
    <section className="auth-split-screen auth-split-screen-login">
      <section className="auth-form-panel auth-login-panel">
        <ThemeToggle />

        <AuthCard className="auth-login-card">
          <div className="auth-mobile-brand">
            <PequesBeeIcon size={40} />
            <span>Peques</span>
          </div>

          <h1 className="auth-title">Bienvenido de nuevo</h1>
          <p className="auth-subtitle">Ingresa tus datos para continuar</p>

          <form onSubmit={handleSubmit} noValidate className="auth-form auth-login-form">
            <AuthInput
              label="Email"
              name="email"
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />

            <div>
              <AuthInput
                label="Contrasena"
                name="password"
                type="password"
                placeholder="Minimo 8 caracteres"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
              />

              <button
                type="button"
                className="auth-forgot-link"
                onClick={() => navigate('/forgot-password')}
              >
                Olvidaste tu contrasena?
              </button>
            </div>

            <AuthButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Iniciando...' : 'Iniciar sesion'}
            </AuthButton>

            <AuthButton
              type="button"
              className="auth-button-secondary"
              onClick={() => navigate('/home', { replace: true })}
            >
              Ingresar como invitado
            </AuthButton>

            <AuthButton
              type="button"
              className="auth-button-secondary"
              onClick={() => navigate('/')}
            >
              Crear cuenta
            </AuthButton>
          </form>

          <SocialAuthButtons onGoogleSuccess={handleGoogleSuccess} googleText="continue_with" />
        </AuthCard>
      </section>

      <PequesBrandPanel />
    </section>
  );
}

export default LoginPage;
