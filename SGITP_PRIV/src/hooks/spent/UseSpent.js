import { useCallback, useState } from "react";

//URL de la API
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

//Hook personalizado de gastos
function useSpent() {
  const [spent, setSpent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  //Realiza peticiones a la API de gastos
  const request = async (path = "", options = {}) => {
    const response = await fetch(`${API_URL}/spent${path}`, {
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

  //Obtener gastos
  const getSpent = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await request();
      setSpent(Array.isArray(data) ? data : []);

      return { success: true, data };
    } catch (requestError) {
      const message = requestError.message || "No se pudieron obtener los gastos.";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  //Obtener gastos por ID
  const getSpentById = async (id) => {
    try {
      setLoading(true);
      setError("");

      const data = await request(`/${id}`);

      return { success: true, data };
    } catch (requestError) {
      const message = requestError.message || "No se pudo encontrar el gasto.";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };


  //Crear nuevo gasto
  const createSpent = async (payload) => {
    try {
      setLoading(true);
      setError("");

      const data = await request("", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      return { success: true, data };
    } catch (requestError) {
      const message = requestError.message || "No se pudo crear el gasto.";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };


  //Actualizar gasto
  const updateSpent = async (id, payload) => {
    try {
      setLoading(true);
      setError("");

      const data = await request(`/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      return { success: true, data };
    } catch (requestError) {
      const message = requestError.message || "No se pudo actualizar el gasto.";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  //Borrar gasto
  const deleteSpent = async (id) => {
    try {
      setLoading(true);
      setError("");

      const data = await request(`/${id}`, {
        method: "DELETE",
      });

      return { success: true, data };
    } catch (requestError) {
      const message = requestError.message || "No se pudo eliminar el gasto.";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return {
    spent,
    loading,
    error,
    getSpent,
    getSpentById,
    createSpent,
    updateSpent,
    deleteSpent,
  };
}

export default useSpent;
