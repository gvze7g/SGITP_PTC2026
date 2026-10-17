import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

// Se guarda en memoria mientras la pestaña esté abierta: así el nombre del
// usuario no parpadea cada vez que se cambia de página en el panel.
let cachedEmployee = null;

// Empleado con sesión iniciada (GET /auth/me), para mostrar quién está
// conectado en el menú lateral.
function useCurrentEmployee() {
  const [employee, setEmployee] = useState(cachedEmployee);

  useEffect(() => {
    let ignore = false;

    fetch(`${API_URL}/auth/me`, { credentials: "include" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (ignore || data?.userType !== "Employee") return;
        cachedEmployee = data.user;
        setEmployee(data.user);
      })
      .catch(() => {});

    return () => {
      ignore = true;
    };
  }, []);

  return employee;
}

export default useCurrentEmployee;
