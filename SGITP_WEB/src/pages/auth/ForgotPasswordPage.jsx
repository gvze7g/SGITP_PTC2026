import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AuthButton from '../../components/auth/AuthButton';
import AuthInput from '../../components/auth/AuthInput';
import { requestCustomerRecoveryCode } from '../../services/passwordRecoveryService';

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const cleanEmail = email.trim();

    if (!cleanEmail || !cleanEmail.includes('@') || !emailRegex.test(cleanEmail)) {
      toast.error('Ingresa un correo electronico valido.');
      return;
    }

    setIsSubmitting(true);

    try {
      await requestCustomerRecoveryCode(cleanEmail);
      toast.success('Codigo enviado correctamente.');
      navigate('/recovery-code', { state: { email: cleanEmail } });
    } catch (error) {
      toast.error(error.message ?? 'No se pudo enviar el codigo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="verify-screen">
      <header className="verify-topbar">
        <button type="button" onClick={() => navigate('/login')}>
          &lt; Volver
        </button>
        <strong>PEQUES</strong>
        <span />
      </header>

      <main className="verify-content">
        <form className="verify-card recovery-card" onSubmit={handleSubmit} noValidate>
          <h1>Recuperar contraseña</h1>
          <p>
            Ingresa tu correo y enviaremos un codigo para cambiar tu contraseña.
          </p>

          <div className="recovery-input-wrap">
            <AuthInput
              label="Email"
              name="email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </div>

          <AuthButton type="submit" className="verify-button" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar codigo'}
          </AuthButton>
        </form>
      </main>
    </section>
  );
}

export default ForgotPasswordPage;
