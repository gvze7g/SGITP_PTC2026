import { useQuery } from '@tanstack/react-query';

import { request } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

// Trae UN producto por su id (para la pantalla de detalle).
// El tipo de cliente va en la llave de caché (ver useProducts.js).
export function useProduct(id) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['products', id, user?.customer_type ?? 'guest'],
    queryFn: () => request(`/products/catalog/${id}`, { method: 'GET' }),
    enabled: Boolean(id), // no pide nada si todavía no hay id
  });
}
