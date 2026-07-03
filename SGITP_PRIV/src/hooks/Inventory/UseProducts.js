import { useCallback, useState } from "react";

const API_URL = "http://localhost:4000";

function useProducts() {
  // lista de productos
  const [products, setProducts] = useState([]);

  // loading general de peticiones
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const getProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/products`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "No se pudieron obtener los productos.");
        return {
          success: false,
          message: data.message || "No se pudieron obtener los productos.",
        };
      }

      setProducts(Array.isArray(data) ? data : []);

      return {
        success: true,
        data,
      };
    } catch (err) {
      console.log("getProducts error:", err);
      setError("Error de conexión con el servidor.");

      return {
        success: false,
        message: "Error de conexión con el servidor.",
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // crear producto
  const createProduct = async (formData) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "No se pudo crear el producto.");
        return {
          success: false,
          message: data.message || "No se pudo crear el producto.",
        };
      }

      return {
        success: true,
        data,
      };
    } catch (err) {
      console.log("createProduct error:", err);
      setError("Error de conexión con el servidor.");

      return {
        success: false,
        message: "Error de conexión con el servidor.",
      };
    } finally {
      setLoading(false);
    }
  };

  // actualizar producto
  const updateProduct = async (id, formData) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/products/${id}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "No se pudo actualizar el producto.");
        return {
          success: false,
          message: data.message || "No se pudo actualizar el producto.",
        };
      }

      return {
        success: true,
        data,
      };
    } catch (err) {
      console.log("updateProduct error:", err);
      setError("Error de conexión con el servidor.");

      return {
        success: false,
        message: "Error de conexión con el servidor.",
      };
    } finally {
      setLoading(false);
    }
  };

  // eliminar producto
  const deleteProduct = async (id) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "No se pudo eliminar el producto.");
        return {
          success: false,
          message: data.message || "No se pudo eliminar el producto.",
        };
      }

      return {
        success: true,
        data,
      };
    } catch (err) {
      console.log("deleteProduct error:", err);
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
    products,
    loading,
    error,
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}

export default useProducts;