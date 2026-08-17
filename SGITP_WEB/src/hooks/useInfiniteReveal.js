import { useEffect, useRef, useState } from 'react';

// El catalogo llega completo en un solo fetch (no hay paginacion en el
// backend), asi que esto no ahorra red: solo evita pintar cientos de
// tarjetas de una vez, revelando mas a medida que el usuario baja el
// scroll (como en la coleccion de la app movil, pero automatico en vez de
// un boton "cargar mas").
export function useInfiniteReveal(total, pageSize = 12, resetKey) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const sentinelRef = useRef(null);

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [resetKey, pageSize]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || visibleCount >= total) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((count) => Math.min(count + pageSize, total));
        }
      },
      { rootMargin: '400px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [total, pageSize, visibleCount]);

  return { visibleCount, sentinelRef };
}
