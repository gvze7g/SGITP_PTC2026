import { useQuery } from '@tanstack/react-query';

import { request } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

// Trae la lista completa de productos del backend. React Query se encarga
// de guardar el resultado en caché, mostrar isLoading mientras carga, y
// reintentar solo si algo falla.
// El tipo de cliente va en la llave de caché: el backend le manda precio
// mayorista solo al mayorista, así que al cambiar de sesión hay que volver a
// pedir el catálogo en vez de mostrar el guardado de la sesión anterior.
export function useProducts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['products', 'list', user?.customer_type ?? 'guest'],
    queryFn: () => request('/products/catalog', { method: 'GET' }),
  });
}
