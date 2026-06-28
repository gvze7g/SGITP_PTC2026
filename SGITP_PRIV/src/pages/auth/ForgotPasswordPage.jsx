import { useState } from 'react';
import AuthButton from '../../components/auth/AuthButton';
import AuthCard from '../../components/auth/AuthCard';
import AuthInput from '../../components/auth/AuthInput';

function ForgotPasswordPage({ onBackToLogin, onSendCode }) {
  const [email, setEmail] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    if (onSendCode) {
      onSendCode({ email });
    }
  };

  return (
    <section className="auth-screen">
      <AuthCard className="justify-between">
        <div>
          <h1 className="auth-title" style={{ marginTop: '18px' }}>
            Recuperar contraseña
          </h1>

          <p className="auth-subtitle">
            Te enviaremos un enlace para restablecerla.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginTop: '132px' }}>
              <AuthInput
                label="Correo electrónico"
                name="email"
                type="email"
                placeholder=""
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </div>

            <div style={{ marginTop: '42px' }}>
              <AuthButton type="submit">Enviar código</AuthButton>
            </div>
          </form>
        </div>

        <div className="flex justify-center" style={{ marginBottom: '8px' }}>
          <button
            type="button"
            onClick={onBackToLogin}
            className="auth-text-button"
            style={{ color: '#3d3430' }}
          >
            &lt; Volver al inicio de sesión
          </button>
        </div>
      </AuthCard>
    </section>
  );
}

export default ForgotPasswordPage;