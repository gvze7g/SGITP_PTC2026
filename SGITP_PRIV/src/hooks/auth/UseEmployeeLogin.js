import { useState } from "react";

const API_URL = "http://localhost:4000";

function useEmployeeLogin() {
  const [loading, setLoading] = useState(false);

  const loginEmployee = async ({ email, password }) => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/loginEmployee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "No se pudo iniciar sesión.",
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.log("loginEmployee error:", error);

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
    loginEmployee,
  };
}

export default useEmployeeLogin;