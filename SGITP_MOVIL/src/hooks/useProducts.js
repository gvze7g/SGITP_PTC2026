import { useQuery } from '@tanstack/react-query';

import { request } from '../services/apiClient';

// Trae la lista completa de productos del backend. React Query se encarga
// de guardar el resultado en caché, mostrar isLoading mientras carga, y
// reintentar solo si algo falla.
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => request('/products/catalog', { method: 'GET' }),
  });
}
