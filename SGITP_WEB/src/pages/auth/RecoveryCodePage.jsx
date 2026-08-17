import { LockKeyhole, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AuthButton from '../../components/auth/AuthButton';
import OtpInput from '../../components/auth/OtpInput';
import ThemeToggle from '../../components/auth/ThemeToggle';
import {
  requestCustomerRecoveryCode,
  verifyCustomerRecoveryCode,
} from '../../services/passwordRecoveryService';

const RESEND_COOLDOWN_SECONDS = 45;

function RecoveryCodePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [focusSignal, setFocusSignal] = useState(0);
  const email = location.state?.email ?? '';
  const visibleEmail = email || 'tu correo';

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;

    const timer = setTimeout(() => {
      setResendCooldown((seconds) => seconds - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (code.length !== 6) {
      toast.error('El código debe tener exactamente 6 caracteres.');
      return;
    }

    setIsSubmitting(true);

    try {
      await verifyCustomerRecoveryCode(code);
      toast.success('Código verificado correctamente.');
      navigate('/reset-password', { state: { email } });
    } catch (error) {
      toast.error(error.message ?? 'No se pudo verificar el código.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      navigate('/forgot-password');
      return;
    }

    if (isResending || resendCooldown > 0) return;
    setIsResending(true);

    try {
      await requestCustomerRecoveryCode(email);
      toast.success('Código reenviado correctamente.');
      setCode('');
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setFocusSignal((value) => value + 1);
    } catch (error) {
      toast.error(error.message ?? 'No se pudo reenviar el código.');
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
        <ThemeToggle />
      </header>

      <main className="verify-content">
        <form className="verify-card" onSubmit={handleSubmit} noValidate>
          <h1>Ingresa tu código</h1>
          <p>
            Enviamos un código de verificación de 6 caracteres a
            <strong>{visibleEmail}</strong>
          </p>

          <OtpInput
            length={6}
            value={code}
            onChange={setCode}
            disabled={isSubmitting}
            focusSignal={focusSignal}
          />

          <AuthButton
            type="submit"
            className="verify-button"
            disabled={isSubmitting || code.length !== 6}
          >
            {isSubmitting ? 'Verificando...' : 'Verificar código'}
            <LockKeyhole size={16} strokeWidth={1.8} />
          </AuthButton>

          <div className="verify-resend">
            <span>¿No recibiste el código?</span>
            <button type="button" onClick={handleResendCode} disabled={isResending || resendCooldown > 0}>
              <RotateCcw size={13} strokeWidth={1.8} />
              {isResending
                ? 'Reenviando...'
                : resendCooldown > 0
                  ? `Reenviar código en ${resendCooldown} s`
                  : 'Reenviar código'}
            </button>
          </div>
        </form>
      </main>
    </section>
  );
}

export default RecoveryCodePage;
