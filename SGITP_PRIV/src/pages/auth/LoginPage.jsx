import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AuthButton from "../../components/auth/AuthButton";
import AuthCard from "../../components/auth/AuthCard";
import AuthInput from "../../components/auth/AuthInput";
import useEmployeeLogin from "../../hooks/auth/UseEmployeeLogin";

function LoginPage() {
  const navigate = useNavigate();
  const { loading, loginEmployee } = useEmployeeLogin();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const email = formData.email.trim();
    const password = formData.password.trim();

    if (!email && !password) {
      toast.error("Debes completar el correo y la contraseña.");
      return false;
    }

    if (!email) {
      toast.error("El correo electrónico es obligatorio.");
      return false;
    }

    if (!email.includes("@")) {
      toast.error("El correo debe incluir el símbolo @.");
      return false;
    }

    if (!emailRegex.test(email)) {
      toast.error("Ingresa un correo electrónico válido.");
      return false;
    }

    if (!password) {
      toast.error("La contraseña es obligatoria.");
      return false;
    }

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const result = await loginEmployee({
      email: formData.email.trim(),
      password: formData.password,
    });

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success("Inicio de sesión exitoso.");
    navigate("/dashboard");
  };

  return (
    <section className="auth-screen">
      <AuthCard>
        <h1 className="auth-title" style={{ marginTop: "4px" }}>
          Bienvenido de nuevo
        </h1>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col h-full"
        >
          <div style={{ marginTop: "56px" }}>
            <AuthInput
              label="Correo electrónico"
              name="email"
              type="email"
              placeholder="ejemplo@correo.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div style={{ marginTop: "36px" }}>
            <AuthInput
              label="Contraseña"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>

          <div className="flex justify-end" style={{ marginTop: "16px" }}>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="auth-text-button"
              disabled={loading}
            >
              Olvidé mi contraseña
            </button>
          </div>

          <div style={{ marginTop: "42px" }}>
            <AuthButton type="submit" disabled={loading}>
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </AuthButton>
          </div>
        </form>
      </AuthCard>
    </section>
  );
}

export default LoginPage;