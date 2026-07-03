import { useCallback, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

function useSpent() {
  const [spent, setSpent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
