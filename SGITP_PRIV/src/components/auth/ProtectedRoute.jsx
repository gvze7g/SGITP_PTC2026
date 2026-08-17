import { useEffect, useState } from "react";

import NotFoundPage from "../../pages/NotFoundPage";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

function ProtectedRoute({ children }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let ignore = false;

    const validateSession = async () => {
      try {
        // La ruta privada se habilita solo si el backend confirma una sesion
        // activa de empleado administrador.
        const response = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          if (!ignore) setStatus("unauthenticated");
          return;
        }

        const data = await response.json();

        const isAdministrator =
          data?.userType === "Employee" &&
          data?.user?.role === "Administrator";

        if (!ignore) {
          setStatus(isAdministrator ? "authenticated" : "unauthorized");
        }
      } catch {
        if (!ignore) {
          setStatus("unauthenticated");
        }
      }
    };

    validateSession();

    return () => {
      ignore = true;
    };
  }, []);

  if (status === "checking") {
    return null;
  }

  if (status !== "authenticated") {
    return <NotFoundPage variant="protected" />;
  }

  return children;
}

export default ProtectedRoute;
