import { LockKeyhole, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AuthButton from '../../components/auth/AuthButton';
import {
  requestCustomerRecoveryCode,
  verifyCustomerRecoveryCode,
} from '../../services/passwordRecoveryService';

function RecoveryCodePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const email = location.state?.email ?? '';
  const visibleEmail = email || 'tu correo';

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (code.trim().length !== 6) {
      toast.error('El codigo debe tener exactamente 6 caracteres.');
      return;
    }

    setIsSubmitting(true);

    try {
      await verifyCustomerRecoveryCode(code.trim());
      toast.success('Codigo verificado correctamente.');
      navigate('/reset-password', { state: { email } });
    } catch (error) {
      toast.error(error.message ?? 'No se pudo verificar el codigo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      navigate('/forgot-password');
      return;
    }

    if (isResending) return;
    setIsResending(true);

    try {
      await requestCustomerRecoveryCode(email);
      toast.success('Codigo reenviado correctamente.');
      setCode('');
    } catch (error) {
      toast.error(error.message ?? 'No se pudo reenviar el codigo.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <section className="verify-screen">
      <header className="verify-topbar">
        <button type="button" onClick={() => navigate('/forgot-password')}>
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
            <strong>{visibleEmail}</strong>
          </p>

          <input
            className="verify-code-input"
            type="text"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value.trim())}
            placeholder="-  -  -  -  -  -"
            autoComplete="one-time-code"
            aria-label="Codigo de recuperacion"
          />

          <AuthButton type="submit" className="verify-button" disabled={isSubmitting}>
            {isSubmitting ? 'Verificando...' : 'Verificar codigo'}
            <LockKeyhole size={16} strokeWidth={1.8} />
          </AuthButton>

          <div className="verify-resend">
            <span>¿No recibiste el codigo?</span>
            <button type="button" onClick={handleResendCode} disabled={isResending}>
              <RotateCcw size={13} strokeWidth={1.8} />
              {isResending ? 'Reenviando...' : 'Reenviar codigo'}
            </button>
          </div>
        </form>
      </main>
    </section>
  );
}

export default RecoveryCodePage;
