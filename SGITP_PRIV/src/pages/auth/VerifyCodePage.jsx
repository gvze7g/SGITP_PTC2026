import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AuthButton from "../../components/auth/AuthButton";
import AuthCard from "../../components/auth/AuthCard";
import AuthInput from "../../components/auth/AuthInput";
import usePasswordRecovery from "../../hooks/auth/UsePasswordRecovery";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { loading, requestCode } = usePasswordRecovery();
  const [email, setEmail] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateEmail = () => {
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      toast.error("El correo electrónico es obligatorio.");
      return false;
    }

    if (!cleanEmail.includes("@")) {
      toast.error("El correo debe incluir el símbolo @.");
      return false;
    }

    if (!emailRegex.test(cleanEmail)) {
      toast.error("Ingresa un correo electrónico válido.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateEmail()) return;

    const result = await requestCode(email.trim());

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success("Código enviado correctamente.");
    navigate("/verify-code");
  };

  return (
    <section className="auth-screen">
      <AuthCard className="justify-between">
        <div>
          <h1 className="auth-title" style={{ marginTop: "18px" }}>
            Recuperar contraseña
          </h1>

          <p className="auth-subtitle">
            Te enviaremos un código para restablecerla.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginTop: "132px" }}>
              <AuthInput
                label="Correo electrónico"
                name="email"
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </div>

            <div style={{ marginTop: "42px" }}>
              <AuthButton type="submit" disabled={loading}>
                {loading ? "Enviando..." : "Enviar código"}
              </AuthButton>
            </div>
          </form>
        </div>

        <div className="flex justify-center" style={{ marginBottom: "8px" }}>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="auth-text-button"
            style={{ color: "#3d3430" }}
            disabled={loading}
          >
            &lt; Volver al inicio de sesión
          </button>
        </div>
      </AuthCard>
    </section>
  );
}

export default ForgotPasswordPage;