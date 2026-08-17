import { useQuery } from '@tanstack/react-query';

import { request } from '../services/apiClient';

// Trae UN producto por su id (para la pantalla de detalle).
export function useProduct(id) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => request(`/products/catalog/${id}`, { method: 'GET' }),
    enabled: Boolean(id), // no pide nada si todavía no hay id
  });
}
