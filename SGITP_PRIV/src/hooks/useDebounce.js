import { useEffect, useState } from "react";

// Devuelve el valor solo cuando deja de cambiar durante `delay` ms, para que
// los filtros y buscadores no disparen una peticion al servidor por cada tecla.
function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
