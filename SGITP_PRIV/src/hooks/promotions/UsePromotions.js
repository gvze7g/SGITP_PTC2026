import { useCallback, useState } from "react";

//URL de la API
const API_URL = "http://localhost:4000";

//Hook personalizado de promociones
function usePromotions() {
  // lista de promociones
  const [promotions, setPromotions] = useState([]);

  // loading general
  const [loading, setLoading] = useState(false);

  // error simple
  const [error, setError] = useState("");

  // obtener promociones
  const getPromotions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/promotions`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "No se pudieron obtener las promociones.");
        return {
          success: false,
          message: data.message || "No se pudieron obtener las promociones.",
        };
      }

      setPromotions(Array.isArray(data) ? data : []);

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.log("getPromotions error:", error);
      setError("Error de conexión con el servidor.");

      return {
        success: false,
        message: "Error de conexión con el servidor.",
      };
    } finally {
      setLoading(false);
    }
  }, []);

  //Obtener promociones por ID
  const getPromotionById = async (id) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/promotions/${id}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "No se pudo encontrar la promociÃ³n.");
        return {
          success: false,
          message: data.message || "No se pudo encontrar la promociÃ³n.",
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.log("getPromotionById error:", error);
      setError("Error de conexiÃ³n con el servidor.");

      return {
        success: false,
        message: "Error de conexiÃ³n con el servidor.",
      };
    } finally {
      setLoading(false);
    }
  };

  // crear promoción
  const createPromotion = async (payload) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/promotions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "No se pudo crear la promoción.");
        return {
          success: false,
          message: data.message || "No se pudo crear la promoción.",
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.log("createPromotion error:", error);
      setError("Error de conexión con el servidor.");

      return {
        success: false,
        message: "Error de conexión con el servidor.",
      };
    } finally {
      setLoading(false);
    }
  };

  // actualizar promoción
  const updatePromotion = async (id, payload) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/promotions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "No se pudo actualizar la promoción.");
        return {
          success: false,
          message: data.message || "No se pudo actualizar la promoción.",
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.log("updatePromotion error:", error);
      setError("Error de conexión con el servidor.");

      return {
        success: false,
        message: "Error de conexión con el servidor.",
      };
    } finally {
      setLoading(false);
    }
  };

  // eliminar promoción
  const deletePromotion = async (id) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/promotions/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "No se pudo eliminar la promoción.");
        return {
          success: false,
          message: data.message || "No se pudo eliminar la promoción.",
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.log("deletePromotion error:", error);
      setError("Error de conexión con el servidor.");

      return {
        success: false,
        message: "Error de conexión con el servidor.",
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    promotions,
    loading,
    error,
    getPromotions,
    getPromotionById,
    createPromotion,
    updatePromotion,
    deletePromotion,
  };
}

export default usePromotions;
