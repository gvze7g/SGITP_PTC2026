import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const API_URL = "http://localhost:4000";

function ProtectedRoute({ children }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let ignore = false;

    const validateSession = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
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
      } catch (error) {
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
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;