import { useState } from 'react';
import AuthButton from '../../components/auth/AuthButton';
import AuthCard from '../../components/auth/AuthCard';
import AuthInput from '../../components/auth/AuthInput';

function LoginPage({ onForgotPassword, onLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (onLogin) {
      onLogin(formData);
    }
  };

  return (
    <section className="auth-screen">
      <AuthCard>
        <h1 className="auth-title" style={{ marginTop: '4px' }}>
          Bienvenido de nuevo
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div style={{ marginTop: '56px' }}>
            <AuthInput
              label="Correo electrónico"
              name="email"
              type="email"
              placeholder="ejemplo@correo.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div style={{ marginTop: '36px' }}>
            <AuthInput
              label="Contraseña"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>

          <div className="flex justify-end" style={{ marginTop: '16px' }}>
            <button
              type="button"
              onClick={onForgotPassword}
              className="auth-text-button"
            >
              Olvidé mi contraseña
            </button>
          </div>

          <div style={{ marginTop: '42px' }}>
            <AuthButton type="submit">Iniciar sesión</AuthButton>
          </div>
        </form>
      </AuthCard>
    </section>
  );
}

export default LoginPage;