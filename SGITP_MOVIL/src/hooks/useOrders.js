import { useQuery } from '@tanstack/react-query';

import { request } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

// Pedidos reales del cliente logueado (GET /sales/mine, ver
// salesController.getMySales). El backend no guarda un estado de envío
// ("en camino"/"entregado"/etc) todavía, solo payment_status, así que la
// pantalla de pedidos muestra eso en vez de inventar un seguimiento que no existe.
export function useOrders() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['orders'],
    queryFn: () => request('/sales/mine', { method: 'GET' }),
    enabled: Boolean(user),
  });
}
