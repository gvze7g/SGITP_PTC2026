import { useState } from 'react';
import AuthButton from '../../components/auth/AuthButton';
import AuthCard from '../../components/auth/AuthCard';
import AuthInput from '../../components/auth/AuthInput';

function ResetPasswordPage({ onVerify }) {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
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

    if (onVerify) {
      onVerify(formData);
    }
  };

  return (
    <section className="auth-screen">
      <AuthCard>
        <h1 className="auth-title" style={{ marginTop: '20px' }}>
          Restablecer contraseña
        </h1>

        <p className="auth-subtitle">
          Ingrese la nueva contraseña para continuar
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginTop: '84px' }}>
            <AuthInput
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>

          <div style={{ marginTop: '44px' }}>
            <AuthInput
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>

          <div style={{ marginTop: '110px' }}>
            <AuthButton type="submit">Verificar</AuthButton>
          </div>
        </form>
      </AuthCard>
    </section>
  );
}

export default ResetPasswordPage;