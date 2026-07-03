import { useCallback, useState } from "react";

//URL de la api
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

//Hook personalizado
function useBranches() {
  //Lista de sucursales
  const [branches, setBranches] = useState([]);
  //Loading general
  const [loading, setLoading] = useState(false);
  //error simple
  const [error, setError] = useState("");

//realiza peticiones a la API de sucursales
  const request = async (path = "", options = {}) => {
    const response = await fetch(`${API_URL}/branches${path}`, {
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


  //Obtener Sucursales
  const getBranches = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await request();
      setBranches(Array.isArray(data) ? data : []);

      return { success: true, data };
    } catch (requestError) {
      const message = requestError.message || "No se pudieron obtener las sucursales.";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  //Obtener sucursales por ID
  const getBranchById = async (id) => {
    try {
      setLoading(true);
      setError("");

      const data = await request(`/${id}`);

      return { success: true, data };
    } catch (requestError) {
      const message = requestError.message || "No se pudo encontrar la sucursal.";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };


  //Crear sucursal
  const createBranch = async (payload) => {
    try {
      setLoading(true);
      setError("");

      const data = await request("", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      return { success: true, data };
    } catch (requestError) {
      const message = requestError.message || "No se pudo crear la sucursal.";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  //Actualizar Sucursal
  const updateBranch = async (id, payload) => {
    try {
      setLoading(true);
      setError("");

      const data = await request(`/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      return { success: true, data };
    } catch (requestError) {
      const message = requestError.message || "No se pudo actualizar la sucursal.";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  //Eliminar sucursal
  const deleteBranch = async (id) => {
    try {
      setLoading(true);
      setError("");

      const data = await request(`/${id}`, {
        method: "DELETE",
      });

      return { success: true, data };
    } catch (requestError) {
      const message = requestError.message || "No se pudo eliminar la sucursal.";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return {
    branches,
    loading,
    error,
    getBranches,
    getBranchById,
    createBranch,
    updateBranch,
    deleteBranch,
  };
}

export default useBranches;
