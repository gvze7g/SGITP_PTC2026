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
import { registerCustomer } from '../../services/customerAuthService';

function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
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
    const fullName = formData.fullName.trim();
    const email = formData.email.trim();
    const password = formData.password.trim();

    if (!fullName && !email && !password) {
      toast.error('Debes completar nombre, correo y contraseña.');
      return false;
    }

    if (!fullName || fullName.length < 3) {
      toast.error('El nombre debe tener al menos 3 caracteres.');
      return false;
    }

    if (!email || !email.includes('@') || !emailRegex.test(email)) {
      toast.error('Ingresa un correo electronico valido.');
      return false;
    }

    if (!password || password.length < 8) {
      toast.error('La contraseña debe tener minimo 8 caracteres.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const email = formData.email.trim();

      await registerCustomer({
        full_name: formData.fullName.trim(),
        email,
        password: formData.password,
      });

      toast.success('Cuenta creada correctamente.');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error.message ?? 'No se pudo crear la cuenta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google y Apple crean la cuenta automaticamente si el correo aun no existe,
  // asi que el mismo manejador sirve para registro e inicio de sesion.
  const handleSocialSuccess = (provider) => () => {
    toast.success(`Cuenta creada e inicio de sesion con ${provider} exitoso.`);
    navigate('/home', { replace: true });
  };

  const handleGoogleSuccess = handleSocialSuccess('Google');
  const handleAppleSuccess = handleSocialSuccess('Apple');

  return (
    <section className="auth-split-screen">
      <PequesBrandPanel />

      <section className="auth-form-panel">
        <ThemeToggle />

        <AuthCard>
          <div className="auth-mobile-brand">
            <PequesBeeIcon size={40} />
            <span>Peques</span>
          </div>

          <h1 className="auth-title">Crear cuenta</h1>

          <p className="auth-subtitle">
            Crea una cuenta para acceder a categorias exclusivas y lanzamientos
            de temporada cuidadosamente seleccionados.
          </p>

          <form onSubmit={handleSubmit} noValidate className="auth-form">
            <AuthInput
              label="Nombre"
              name="fullName"
              type="text"
              placeholder="Paul Melquisedec Cañas Palacios"
              value={formData.fullName}
              onChange={handleChange}
              autoComplete="name"
            />

            <AuthInput
              label="Email"
              name="email"
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />

            <AuthInput
              label="Contraseña"
              name="password"
              type="password"
              placeholder="Minimo 8 caracteres"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
            />

            <AuthButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear cuenta'}
            </AuthButton>
          </form>

          <SocialAuthButtons
            onGoogleSuccess={handleGoogleSuccess}
            onAppleSuccess={handleAppleSuccess}
            googleText="signup_with"
          />

          <div className="auth-bottom-text">
            <span>¿Ya eres miembro?</span>
            <button type="button" onClick={() => navigate('/login')}>
              Iniciar sesion
            </button>
          </div>
        </AuthCard>
      </section>
    </section>
  );
}

export default RegisterPage;
