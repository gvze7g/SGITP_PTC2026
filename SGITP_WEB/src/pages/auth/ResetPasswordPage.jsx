import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AuthButton from '../../components/auth/AuthButton';
import AuthInput from '../../components/auth/AuthInput';

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmNewPassword: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.newPassword || !formData.confirmNewPassword) {
      toast.error('Completa ambos campos de contraseña.');
      return false;
    }

    if (formData.newPassword.length < 8) {
      toast.error('La contraseña debe tener minimo 8 caracteres.');
      return false;
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      toast.error('Las contraseñas no coinciden.');
      return false;
    }

    return true;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    toast.success('Contraseña actualizada correctamente.');
    navigate('/login');
  };

  return (
    <section className="verify-screen">
      <header className="verify-topbar">
        <button type="button" onClick={() => navigate('/recovery-code')}>
          &lt; Volver
        </button>
        <strong>PEQUES</strong>
        <span />
      </header>

      <main className="verify-content">
        <form className="verify-card recovery-card" onSubmit={handleSubmit} noValidate>
          <h1>Cambiar contraseña</h1>
          <p>Ingresa una nueva contraseña para recuperar el acceso a tu cuenta.</p>

          <div className="recovery-input-wrap recovery-password-fields">
            <AuthInput
              label="Nueva contraseña"
              name="newPassword"
              type="password"
              placeholder="Minimo 8 caracteres"
              value={formData.newPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />

            <AuthInput
              label="Confirmar contraseña"
              name="confirmNewPassword"
              type="password"
              placeholder="Repite la contraseña"
              value={formData.confirmNewPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>

          <AuthButton type="submit" className="verify-button">
            Guardar contraseña
          </AuthButton>
        </form>
      </main>
    </section>
  );
}

export default ResetPasswordPage;
