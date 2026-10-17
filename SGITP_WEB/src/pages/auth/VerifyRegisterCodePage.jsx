import { LockKeyhole, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AuthButton from '../../components/auth/AuthButton';
import OtpInput from '../../components/auth/OtpInput';
import ThemeToggle from '../../components/auth/ThemeToggle';
import { verifyCustomerEmail } from '../../services/customerAuthService';

const CODE_LENGTH = 6;

function VerifyRegisterCodePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const email = location.state?.email ?? '';
  const visibleEmail = email || 'tu correo';

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (code.length !== CODE_LENGTH) {
      toast.error('El código debe tener exactamente 6 caracteres.');
      return;
    }

    setIsSubmitting(true);

    try {
      await verifyCustomerEmail(code);
      // Mensaje propio en español, igual que en la app movil.
      toast.success('Cuenta verificada, ya puedes iniciar sesión.');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error.message ?? 'No se pudo verificar el código.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // No existe un endpoint para reenviar el codigo de registro; el backend
  // deja registrar de nuevo un correo que nunca se verifico y manda otro
  // codigo, asi que se regresa al registro con el correo ya escrito.
  const handleRegisterAgain = () => {
    navigate('/register', { state: { email } });
  };

  return (
    <section className="verify-screen">
      <header className="verify-topbar">
        <button type="button" onClick={() => navigate('/register')}>
          &lt; Volver
        </button>
        <strong>PEQUES</strong>
        <ThemeToggle />
      </header>

      <main className="verify-content">
        <form className="verify-card" onSubmit={handleSubmit} noValidate>
          <h1>Verifica tu cuenta</h1>
          <p>
            Enviamos un código de verificación de 6 caracteres a
            <strong>{visibleEmail}</strong>
          </p>

          <OtpInput
            length={CODE_LENGTH}
            value={code}
            onChange={setCode}
            disabled={isSubmitting}
          />

          <AuthButton
            type="submit"
            className="verify-button"
            disabled={isSubmitting || code.length !== CODE_LENGTH}
          >
            {isSubmitting ? 'Verificando...' : 'Verificar código'}
            <LockKeyhole size={16} strokeWidth={1.8} />
          </AuthButton>

          <div className="verify-resend">
            <span>¿No recibiste el código o ya expiró?</span>
            <button type="button" onClick={handleRegisterAgain}>
              <RotateCcw size={13} strokeWidth={1.8} />
              Registrarme de nuevo
            </button>
          </div>
        </form>
      </main>
    </section>
  );
}

export default VerifyRegisterCodePage;
