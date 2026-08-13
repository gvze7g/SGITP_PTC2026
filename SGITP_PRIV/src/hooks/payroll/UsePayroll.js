import { useCallback, useState } from "react";

//URL de la api
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

//Hook personalizado de nomina
function usePayroll() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  //realiza peticiones a la API de nomina
  const request = async (path = "", options = {}) => {
    const response = await fetch(`${API_URL}/payroll${path}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
      },
      ...options,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "No se pudo completar la accion.");
    }

    return data;
  };

  //Obtener nominas
  const getPayrolls = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await request();
      setPayrolls(Array.isArray(data) ? data : []);

      return { success: true, data };
    } catch (requestError) {
      const message = requestError.message || "No se pudieron obtener las nominas.";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  //Crear nomina para un solo empleado
  const createPayroll = async (payload) => {
    try {
      setLoading(true);
      setError("");

      const data = await request("", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      return { success: true, data };
    } catch (requestError) {
      const message = requestError.message || "No se pudo registrar la nomina.";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  //Generar nomina del periodo actual para todos los empleados
  const generatePayroll = async (period) => {
    try {
      setLoading(true);
      setError("");

      const data = await request("/generate", {
        method: "POST",
        body: JSON.stringify({ period }),
      });

      return { success: true, data };
    } catch (requestError) {
      const message = requestError.message || "No se pudo generar la nomina del periodo.";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  //Actualizar nomina (bonos, deducciones, fecha de pago, estado)
  const updatePayroll = async (id, payload) => {
    try {
      setLoading(true);
      setError("");

      const data = await request(`/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      return { success: true, data };
    } catch (requestError) {
      const message = requestError.message || "No se pudo actualizar la nomina.";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  //Eliminar nomina
  const deletePayroll = async (id) => {
    try {
      setLoading(true);
      setError("");

      const data = await request(`/${id}`, {
        method: "DELETE",
      });

      return { success: true, data };
    } catch (requestError) {
      const message = requestError.message || "No se pudo eliminar la nomina.";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return {
    payrolls,
    loading,
    error,
    getPayrolls,
    createPayroll,
    generatePayroll,
    updatePayroll,
    deletePayroll,
  };
}

export default usePayroll;
