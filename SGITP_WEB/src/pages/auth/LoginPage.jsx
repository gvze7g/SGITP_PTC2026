import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AuthButton from '../../components/auth/AuthButton';
import AuthCard from '../../components/auth/AuthCard';
import AuthInput from '../../components/auth/AuthInput';
import PequesBrandPanel from '../../components/auth/PequesBrandPanel';

const DEMO_USER = {
  email: 'paulcanas7@gmail.com',
  password: '12345678',
};

function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: DEMO_USER.email,
    password: DEMO_USER.password,
  });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const email = formData.email.trim();
    const password = formData.password.trim();

    if (!email && !password) {
      toast.error('Debes completar el correo y la contraseña.');
      return false;
    }

    if (!email || !email.includes('@') || !emailRegex.test(email)) {
      toast.error('Ingresa un correo electronico valido.');
      return false;
    }

    if (!password) {
      toast.error('La contraseña es obligatoria.');
      return false;
    }

    return true;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    if (
      formData.email.trim() !== DEMO_USER.email ||
      formData.password !== DEMO_USER.password
    ) {
      toast.error('Correo o contraseña incorrectos.');
      return;
    }

    toast.success('Inicio de sesion exitoso.');
    navigate('/home');
  };

  return (
    <section className="auth-split-screen auth-split-screen-login">
      <section className="auth-form-panel auth-login-panel">
        <AuthCard className="auth-login-card">
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
                label="Contraseña"
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
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <AuthButton type="submit">Iniciar sesion</AuthButton>
          </form>

          <AuthButton className="auth-button-secondary" onClick={() => navigate('/')}>
            Crear cuenta
          </AuthButton>

          <div className="auth-divider">
            <span>O unete mediante</span>
          </div>

          <div className="auth-social-grid">
            <button
              type="button"
              className="auth-social-btn"
              onClick={() => toast('Google estara disponible proximamente.')}
            >
              <span>google</span>
              <strong>G</strong>
            </button>

            <button
              type="button"
              className="auth-social-btn"
              onClick={() => toast('Apple estara disponible proximamente.')}
            >
              <span>iOS</span>
              <strong>Apple</strong>
            </button>
          </div>
        </AuthCard>
      </section>

      <PequesBrandPanel />
    </section>
  );
}

export default LoginPage;
