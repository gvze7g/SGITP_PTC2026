import { useState } from 'react';
import AuthButton from '../../components/auth/AuthButton';
import AuthCard from '../../components/auth/AuthCard';
import AuthInput from '../../components/auth/AuthInput';

function VerifyCodePage({ onBackToForgotPassword, onVerifyCode }) {
  const [code, setCode] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    if (onVerifyCode) {
      onVerifyCode({ code });
    }
  };

  return (
    <section className="auth-screen">
      <AuthCard className="justify-between">
        <div>
          <h1 className="auth-title" style={{ marginTop: '18px' }}>
            Verificar código
          </h1>

          <p className="auth-subtitle">
            Ingresa el código enviado a tu correo electrónico.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginTop: '132px' }}>
              <AuthInput
                label="Código de verificación"
                name="code"
                type="text"
                placeholder="Ej. 123456"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                autoComplete="one-time-code"
              />
            </div>

            <div style={{ marginTop: '42px' }}>
              <AuthButton type="submit">Verificar código</AuthButton>
            </div>
          </form>
        </div>

        <div className="flex justify-center" style={{ marginBottom: '8px' }}>
          <button
            type="button"
            onClick={onBackToForgotPassword}
            className="auth-text-button"
            style={{ color: '#3d3430' }}
          >
            &lt; Volver
          </button>
        </div>
      </AuthCard>
    </section>
  );
}

export default VerifyCodePage;