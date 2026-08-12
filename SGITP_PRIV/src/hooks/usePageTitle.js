import { useEffect } from "react";

function usePageTitle(title) {
  useEffect(() => {
    // Centraliza los titulos del panel para que cada ruta actualice la pestana
    // sin repetir document.title dentro de cada pagina.
    document.title = title ? `${title} | SGITP Admin` : "SGITP Admin";
  }, [title]);
}

export default usePageTitle;
