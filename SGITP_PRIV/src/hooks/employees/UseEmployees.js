import { useCallback, useState } from "react";

//URL de la API
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

function useEmployees() {
  // lista de empleados
  const [employees, setEmployees] = useState([]);

  // loading general
  const [loading, setLoading] = useState(false);

  // error simple
  const [error, setError] = useState("");

  // obtener todos los empleados
  const getEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/employee`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "No se pudieron obtener los empleados.");
        return {
          success: false,
          message: data.message || "No se pudieron obtener los empleados.",
        };
      }

      setEmployees(Array.isArray(data) ? data : []);

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.log("getEmployees error:", error);
      setError("Error de conexión con el servidor.");

      return {
        success: false,
        message: "Error de conexión con el servidor.",
      };
    } finally {
      setLoading(false);
    }
  }, []);

  //Obtener empleados por ID
  const getEmployeeById = async (id) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/employee/${id}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "No se pudo encontrar el empleado.");
        return {
          success: false,
          message: data.message || "No se pudo encontrar el empleado.",
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.log("getEmployeeById error:", error);
      setError("Error de conexión con el servidor.");

      return {
        success: false,
        message: "Error de conexión con el servidor.",
      };
    } finally {
      setLoading(false);
    }
  };

  // crear empleado
  const createEmployee = async (payload) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/employee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "No se pudo crear el empleado.");
        return {
          success: false,
          message: data.message || "No se pudo crear el empleado.",
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.log("createEmployee error:", error);
      setError("Error de conexión con el servidor.");

      return {
        success: false,
        message: "Error de conexión con el servidor.",
      };
    } finally {
      setLoading(false);
    }
  };

  // actualizar empleado
  const updateEmployee = async (id, payload) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/employee/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "No se pudo actualizar el empleado.");
        return {
          success: false,
          message: data.message || "No se pudo actualizar el empleado.",
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.log("updateEmployee error:", error);
      setError("Error de conexión con el servidor.");

      return {
        success: false,
        message: "Error de conexión con el servidor.",
      };
    } finally {
      setLoading(false);
    }
  };

  // eliminar empleado
  const deleteEmployee = async (id) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/employee/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "No se pudo eliminar el empleado.");
        return {
          success: false,
          message: data.message || "No se pudo eliminar el empleado.",
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.log("deleteEmployee error:", error);
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
    employees,
    loading,
    error,
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  };
}

export default useEmployees;
