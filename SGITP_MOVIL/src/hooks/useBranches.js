import { useQuery } from '@tanstack/react-query';

import { request } from '../services/apiClient';

// Trae la lista pública de sucursales para la pantalla "Tiendas" (no
// necesita sesión: es la misma ruta que usa la web pública).
export function useBranches() {
  return useQuery({
    queryKey: ['branches'],
    queryFn: () => request('/branches/public', { method: 'GET' }),
  });
}
