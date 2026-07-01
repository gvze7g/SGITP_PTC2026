import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AuthButton from '../../components/auth/AuthButton';
import AuthCard from '../../components/auth/AuthCard';
import AuthInput from '../../components/auth/AuthInput';
import PequesBrandPanel from '../../components/auth/PequesBrandPanel';

function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });

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

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    toast.success('Cuenta creada correctamente.');
    navigate('/login');
  };

  return (
    <section className="auth-split-screen">
      <PequesBrandPanel />

      <section className="auth-form-panel">
        <AuthCard>
          <h1 className="auth-title">Crear cuenta</h1>

          <p className="auth-subtitle">
            Crea una cuenta para acceder a colecciones exclusivas y lanzamientos
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

            <AuthButton type="submit">Crear cuenta</AuthButton>
          </form>

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
