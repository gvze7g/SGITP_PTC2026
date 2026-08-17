import { useCallback, useState } from "react";

//URL de la API
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

//Hook personalizado de Productos
function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  //Procesa la respuesta de la API y devuelve el contenido en formato JSON
  const handleJsonResponse = async (response, fallbackMessage) => {
    const data = await response.json();

    //Validación de la respuesta
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

  //Obtener Productos
  const getProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/products`, {
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

  //Obtener productos por ID
  const getProductById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/products/${id}`, {
        method: "GET",
        credentials: "include",
      });

      const result = await handleJsonResponse(
        response,
        "No se pudo encontrar el producto."
      );

      if (!result.success) return result;

      setProducts(result.data ? [result.data] : []);
      return result;
    } catch (err) {
      console.log("getProductById error:", err);
      setError("Error de conexión con el servidor.");

      return {
        success: false,
        message: "Error de conexión con el servidor.",
      };
    } finally {
      setLoading(false);
    }
  }, []);

  //Obtener los productos con stock bajo
  const getLowStockProducts = useCallback(async (threshold = 5) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/products/status/low-stock?threshold=${threshold}`,
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

  //Buscar los productos por nombre
  const searchProductsByName = useCallback(async (name = "") => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/products/search`, {
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

  //Obtener productos por Precio
  const getProductsByPriceRange = useCallback(async (minPrice = "", maxPrice = "") => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/products/price-range`, {
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

  //Obtener conteo de productos
  const getProductsCount = useCallback(async () => {
    try {
      setError("");

      const response = await fetch(`${API_URL}/products/status/count`, {
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


  //Crear productos
  const createProduct = async (formData) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/products`, {
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


  //Actualizar productos
  const updateProduct = async (id, formData) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/products/${id}`, {
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

  //Eliminar productos
  const deleteProduct = async (id) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/products/${id}`, {
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
    getProductById,
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
