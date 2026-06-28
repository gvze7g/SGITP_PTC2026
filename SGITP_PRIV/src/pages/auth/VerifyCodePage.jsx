import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AuthButton from "../../components/auth/AuthButton";
import AuthCard from "../../components/auth/AuthCard";
import AuthInput from "../../components/auth/AuthInput";

function VerifyCodePage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  const validateCode = () => {
    const cleanCode = code.trim();

    if (!cleanCode) {
      toast.error("El código de verificación es obligatorio.");
      return false;
    }

    if (!/^\d+$/.test(cleanCode)) {
      toast.error("El código debe contener solo números.");
      return false;
    }

    if (cleanCode.length !== 6) {
      toast.error("El código debe tener exactamente 6 dígitos.");
      return false;
    }

    return true;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateCode()) return;

    toast.success("Código verificado correctamente.");
    navigate("/reset-password");
  };

  return (
    <section className="auth-screen">
      <AuthCard className="justify-between">
        <div>
          <h1 className="auth-title" style={{ marginTop: "18px" }}>
            Verificar código
          </h1>

          <p className="auth-subtitle">
            Ingresa el código enviado a tu correo electrónico.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginTop: "132px" }}>
              <AuthInput
                label="Código de verificación"
                name="code"
                type="text"
                placeholder="Ej. 123456"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                autoComplete="one-time-code"
              />
            </div>

            <div style={{ marginTop: "42px" }}>
              <AuthButton type="submit">Verificar código</AuthButton>
            </div>
          </form>
        </div>

        <div className="flex justify-center" style={{ marginBottom: "8px" }}>
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="auth-text-button"
            style={{ color: "#3d3430" }}
          >
            &lt; Volver
          </button>
        </div>
      </AuthCard>
    </section>
  );
}

export default VerifyCodePage;