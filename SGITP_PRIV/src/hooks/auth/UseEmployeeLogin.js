import { useState } from "react";

//URL de la api
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

//Hook personalizado del login
function useEmployeeLogin() {
  const [loading, setLoading] = useState(false);


  //metodo para iniciar sesión
  const loginEmployee = async ({ email, password }) => {
    try {
      setLoading(true);

      //Llamada a la API mediante fetch
      const response = await fetch(`${API_URL}/loginEmployee`, {
        //Cuerpo de la llamada
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

      //Respuesta de la base 
      const data = await response.json();


        //validación de respuesta
      if (!response.ok) {
        return {
          success: false,
          message: data.message || "No se pudo iniciar sesión.",
        };
      }

      //retorno de la petición
      return {
        success: true,
        data,
      };

      //si hay errores
    } catch (error) {
      console.log("loginEmployee error:", error);

      //retornará 
      return {
        success: false,
        message: "Error de conexión con el servidor.",
      };

      //finalizará
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
