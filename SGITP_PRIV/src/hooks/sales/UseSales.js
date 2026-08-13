import { useCallback, useState } from "react";

//URL de la api
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

//Hook personalizado de ventas
function useSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  //realiza peticiones a la API de ventas
  const request = async (path = "", options = {}) => {
    const response = await fetch(`${API_URL}/sales${path}`, {
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

  //Obtener ventas
  const getSales = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await request();
      setSales(Array.isArray(data) ? data : []);

      return { success: true, data };
    } catch (requestError) {
      const message = requestError.message || "No se pudieron obtener las ventas.";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  //Obtener productos mas vendidos (para el dashboard)
  const getBestSellers = async (limit = 5) => {
    try {
      const data = await request(`/best-sellers?limit=${limit}`);
      return { success: true, data };
    } catch (requestError) {
      const message = requestError.message || "No se pudieron obtener los productos mas vendidos.";
      return { success: false, message };
    }
  };

  //Crear venta (usado por el punto de venta)
  const createSale = async (payload) => {
    try {
      setLoading(true);
      setError("");

      const data = await request("", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      return { success: true, data };
    } catch (requestError) {
      const message = requestError.message || "No se pudo registrar la venta.";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  //Actualizar venta (usado para anular una venta)
  const updateSale = async (id, payload) => {
    try {
      setLoading(true);
      setError("");

      const data = await request(`/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      return { success: true, data };
    } catch (requestError) {
      const message = requestError.message || "No se pudo actualizar la venta.";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return {
    sales,
    loading,
    error,
    getSales,
    getBestSellers,
    createSale,
    updateSale,
  };
}

export default useSales;
