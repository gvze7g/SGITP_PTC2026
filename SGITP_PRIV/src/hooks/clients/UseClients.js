import { useCallback, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

function useClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const request = async (path = "", options = {}) => {
    const response = await fetch(`${API_URL}/customer${path}`, {
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

  const getClients = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await request();
      setClients(Array.isArray(data) ? data : []);

      return { success: true, data };
    } catch (requestError) {
      const message = requestError.message || "No se pudieron obtener los clientes.";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateClient = async (id, payload) => {
    try {
      setLoading(true);
      setError("");

      const data = await request(`/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      return { success: true, data };
    } catch (requestError) {
      const message = requestError.message || "No se pudo actualizar el cliente.";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const deleteClient = async (id) => {
    try {
      setLoading(true);
      setError("");

      const data = await request(`/${id}`, {
        method: "DELETE",
      });

      return { success: true, data };
    } catch (requestError) {
      const message = requestError.message || "No se pudo eliminar el cliente.";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return {
    clients,
    loading,
    error,
    getClients,
    updateClient,
    deleteClient,
  };
}

export default useClients;
