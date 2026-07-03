import { useCallback, useState } from "react";

const API_URL = "http://localhost:4000";

function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJsonResponse = async (response, fallbackMessage) => {
    const data = await response.json();

    if (!response.ok) {
      const message = data.message || fallbackMessage;
      setError(message);
      return {
        success: false,
        message,
        data,
      };
    }

    return {
      success: true,
      data,
    };
  };

  const getProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/products`, {
        method: "GET",
        credentials: "include",
      });

      const result = await handleJsonResponse(
        response,
        "No se pudieron obtener los productos."
      );

      if (!result.success) return result;

      setProducts(Array.isArray(result.data) ? result.data : []);
      return result;
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

  const getLowStockProducts = useCallback(async (threshold = 5) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/products/status/low-stock?threshold=${threshold}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const result = await handleJsonResponse(
        response,
        "No se pudieron obtener los productos con stock bajo."
      );

      if (!result.success) return result;

      setProducts(Array.isArray(result.data) ? result.data : []);
      return result;
    } catch (err) {
      console.log("getLowStockProducts error:", err);
      setError("Error de conexión con el servidor.");

      return {
        success: false,
        message: "Error de conexión con el servidor.",
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const searchProductsByName = useCallback(async (name = "") => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/products/search`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const result = await handleJsonResponse(
        response,
        "No se pudieron buscar los productos."
      );

      if (!result.success) return result;

      setProducts(Array.isArray(result.data) ? result.data : []);
      return result;
    } catch (err) {
      console.log("searchProductsByName error:", err);
      setError("Error de conexión con el servidor.");

      return {
        success: false,
        message: "Error de conexión con el servidor.",
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const getProductsByPriceRange = useCallback(async (minPrice = "", maxPrice = "") => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/products/price-range`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ minPrice, maxPrice }),
      });

      const result = await handleJsonResponse(
        response,
        "No se pudieron filtrar los productos por precio."
      );

      if (!result.success) return result;

      setProducts(Array.isArray(result.data) ? result.data : []);
      return result;
    } catch (err) {
      console.log("getProductsByPriceRange error:", err);
      setError("Error de conexión con el servidor.");

      return {
        success: false,
        message: "Error de conexión con el servidor.",
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const getProductsCount = useCallback(async () => {
    try {
      setError("");

      const response = await fetch(`${API_URL}/api/products/status/count`, {
        method: "GET",
        credentials: "include",
      });

      return await handleJsonResponse(
        response,
        "No se pudieron obtener las estadísticas del inventario."
      );
    } catch (err) {
      console.log("getProductsCount error:", err);
      setError("Error de conexión con el servidor.");

      return {
        success: false,
        message: "Error de conexión con el servidor.",
      };
    }
  }, []);

  const createProduct = async (formData) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      return await handleJsonResponse(response, "No se pudo crear el producto.");
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

  const updateProduct = async (id, formData) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/products/${id}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      return await handleJsonResponse(
        response,
        "No se pudo actualizar el producto."
      );
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

  const deleteProduct = async (id) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      return await handleJsonResponse(
        response,
        "No se pudo eliminar el producto."
      );
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
    getLowStockProducts,
    searchProductsByName,
    getProductsByPriceRange,
    getProductsCount,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}

export default useProducts;