import { LockKeyhole, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AuthButton from '../../components/auth/AuthButton';

function VerifyRegisterCodePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState('');
  const email = location.state?.email ?? 'tu correo';

  const handleSubmit = (event) => {
    event.preventDefault();

    if (code.trim().length !== 6) {
      toast.error('El codigo debe tener exactamente 6 caracteres.');
      return;
    }

    toast.success('Cuenta verificada correctamente.');
    navigate('/login');
  };

  return (
    <section className="verify-screen">
      <header className="verify-topbar">
        <button type="button" onClick={() => navigate('/')}>
          &lt; Volver
        </button>
        <strong>PEQUES</strong>
        <span />
      </header>

      <main className="verify-content">
        <form className="verify-card" onSubmit={handleSubmit} noValidate>
          <h1>Ingresa tu codigo</h1>
          <p>
            Hemos enviado un codigo de verificacion de 6 digitos a
            <strong>{email}</strong>
          </p>

          <input
            className="verify-code-input"
            type="text"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="-  -  -  -  -  -"
            autoComplete="one-time-code"
            aria-label="Codigo de verificacion"
          />

          <AuthButton type="submit" className="verify-button">
            Verificar codigo
            <LockKeyhole size={16} strokeWidth={1.8} />
          </AuthButton>

          <div className="verify-resend">
            <span>¿No recibiste el codigo?</span>
            <button
              type="button"
              onClick={() => toast('Codigo reenviado correctamente.')}
            >
              <RotateCcw size={13} strokeWidth={1.8} />
              Reenviar codigo
            </button>
          </div>
        </form>
      </main>
    </section>
  );
}

export default VerifyRegisterCodePage;
