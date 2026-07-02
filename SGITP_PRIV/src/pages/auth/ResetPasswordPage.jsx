import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AuthButton from "../../components/auth/AuthButton";
import AuthCard from "../../components/auth/AuthCard";
import AuthInput from "../../components/auth/AuthInput";
import usePasswordRecovery from "../../hooks/auth/UsePasswordRecovery";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { loading, resetPassword } = usePasswordRecovery();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const password = formData.password.trim();
    const confirmPassword = formData.confirmPassword.trim();

    if (!password || !confirmPassword) {
      toast.error("Debes completar ambos campos de contraseña.");
      return false;
    }

    if (password.length < 8) {
      toast.error("La nueva contraseña debe tener al menos 8 caracteres.");
      return false;
    }

    if (!/[A-Z]/.test(password)) {
      toast.error("La contraseña debe incluir al menos una letra mayúscula.");
      return false;
    }

    if (!/[a-z]/.test(password)) {
      toast.error("La contraseña debe incluir al menos una letra minúscula.");
      return false;
    }

    if (!/\d/.test(password)) {
      toast.error("La contraseña debe incluir al menos un número.");
      return false;
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const result = await resetPassword({
      newPassword: formData.password,
      confirmNewPassword: formData.confirmPassword,
    });

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success("Contraseña restablecida correctamente.");
    navigate("/");
  };

  return (
    <section className="auth-screen">
      <AuthCard>
        <h1 className="auth-title" style={{ marginTop: "20px" }}>
          Restablecer contraseña
        </h1>

        <p className="auth-subtitle">
          Ingrese la nueva contraseña para continuar
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginTop: "84px" }}>
            <AuthInput
              label="Nueva contraseña"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>

          <div style={{ marginTop: "44px" }}>
            <AuthInput
              label="Confirmar contraseña"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>

          <div style={{ marginTop: "110px" }}>
            <AuthButton type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar contraseña"}
            </AuthButton>
          </div>
        </form>
      </AuthCard>
    </section>
  );
}

export default ResetPasswordPage;