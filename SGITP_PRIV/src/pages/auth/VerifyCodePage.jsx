import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AuthButton from "../../components/auth/AuthButton";
import AuthCard from "../../components/auth/AuthCard";
import AuthInput from "../../components/auth/AuthInput";
import usePasswordRecovery from "../../hooks/auth/UsePasswordRecovery";

function VerifyCodePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, verifyCode, requestCode } = usePasswordRecovery();

  const [code, setCode] = useState("");
  const email = location.state?.email || "";

  const validateCode = () => {
    const cleanCode = code.trim();

    if (!cleanCode) {
      toast.error("Debes ingresar el código de verificación.");
      return false;
    }

    if (cleanCode.length < 4) {
      toast.error("El código ingresado no es válido.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateCode()) return;

    const result = await verifyCode(code.trim());

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success("Código verificado correctamente.");

    navigate("/reset-password", {
      state: { email },
    });
  };

  const handleResendCode = async () => {
    if (!email) {
      toast.error("No se encontró el correo. Vuelve a solicitar el código.");
      navigate("/forgot-password");
      return;
    }

    const result = await requestCode(email);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success("Código reenviado correctamente.");
  };

  return (
    <section className="auth-screen">
      <AuthCard className="justify-between">
        <div>
          <h1 className="auth-title" style={{ marginTop: "18px" }}>
            Verificar código
          </h1>

          <p className="auth-subtitle">
            Ingresa el código que enviamos a tu correo.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginTop: "132px" }}>
              <AuthInput
                label="Código de verificación"
                name="code"
                type="text"
                placeholder="Ingresa el código"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                autoComplete="one-time-code"
              />
            </div>

            <div style={{ marginTop: "42px" }}>
              <AuthButton type="submit" disabled={loading}>
                {loading ? "Verificando..." : "Verificar código"}
              </AuthButton>
            </div>
          </form>

          <div className="flex justify-center" style={{ marginTop: "18px" }}>
            <button
              type="button"
              onClick={handleResendCode}
              className="auth-text-button"
              style={{ color: "#3d3430" }}
              disabled={loading}
            >
              Reenviar código
            </button>
          </div>
        </div>

        <div className="flex justify-center" style={{ marginBottom: "8px" }}>
          <button
            type="button"
            onClick={() => navigate("/forgot-password", { state: { email } })}
            className="auth-text-button"
            style={{ color: "#3d3430" }}
            disabled={loading}
          >
            &lt; Volver
          </button>
        </div>
      </AuthCard>
    </section>
  );
}

export default VerifyCodePage;