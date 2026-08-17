import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AuthButton from '../../components/auth/AuthButton';
import AuthInput from '../../components/auth/AuthInput';
import ThemeToggle from '../../components/auth/ThemeToggle';
import { updateCustomerPassword } from '../../services/passwordRecoveryService';

function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email ?? '';
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmNewPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.newPassword || !formData.confirmNewPassword) {
      toast.error('Completa ambos campos de contrasena.');
      return false;
    }

    if (formData.newPassword.length < 8) {
      toast.error('La contrasena debe tener minimo 8 caracteres.');
      return false;
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      toast.error('Las contrasenas no coinciden.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      await updateCustomerPassword(formData.newPassword, formData.confirmNewPassword);
      toast.success('Contrasena actualizada correctamente.');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error.message ?? 'No se pudo actualizar la contrasena.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="verify-screen">
      <header className="verify-topbar">
        <button type="button" onClick={() => navigate('/recovery-code', { state: { email } })}>
          &lt; Volver
        </button>
        <strong>PEQUES</strong>
        <ThemeToggle />
      </header>

      <main className="verify-content">
        <form className="verify-card recovery-card" onSubmit={handleSubmit} noValidate>
          <h1>Nueva contraseña</h1>
          <p>Ingresa una nueva contraseña para recuperar el acceso a tu cuenta.</p>

          <div className="recovery-input-wrap recovery-password-fields">
            <AuthInput
              label="Nueva contraseña"
              name="newPassword"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={formData.newPassword}
              onChange={handleChange}
              autoComplete="new-password"
              maxLength={72}
            />

            <AuthInput
              label="Confirmar contraseña"
              name="confirmNewPassword"
              type="password"
              placeholder="Repite la contraseña"
              value={formData.confirmNewPassword}
              onChange={handleChange}
              autoComplete="new-password"
              maxLength={72}
            />
          </div>

          <AuthButton type="submit" className="verify-button" disabled={isSubmitting}>
            {isSubmitting ? 'Cambiando...' : 'Cambiar contraseña'}
          </AuthButton>
        </form>
      </main>
    </section>
  );
}

export default ResetPasswordPage;
