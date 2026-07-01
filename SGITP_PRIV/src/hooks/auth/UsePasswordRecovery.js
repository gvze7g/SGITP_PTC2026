import { useState } from "react";

const API_URL = "http://localhost:4000";

function usePasswordRecovery() {
  const [loading, setLoading] = useState(false);

  const requestCode = async (email) => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/recoveryPassword/requestCode`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          userType: "Employee",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "No se pudo enviar el código.",
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.log("requestCode error:", error);

      return {
        success: false,
        message: "Error de conexión con el servidor.",
      };
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (code) => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/recoveryPassword/verifyCode`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "No se pudo verificar el código.",
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.log("verifyCode error:", error);

      return {
        success: false,
        message: "Error de conexión con el servidor.",
      };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async ({ newPassword, confirmNewPassword }) => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/recoveryPassword/newPassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          newPassword,
          confirmNewPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "No se pudo actualizar la contraseña.",
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.log("resetPassword error:", error);

      return {
        success: false,
        message: "Error de conexión con el servidor.",
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    requestCode,
    verifyCode,
    resetPassword,
  };
}

export default usePasswordRecovery;