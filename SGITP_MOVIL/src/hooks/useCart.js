import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { request } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

// Carrito real del cliente (GET/POST/PUT/DELETE /cart/mine, ver
// shopping_cartController.js). React Query comparte la misma caché
// ['cart'] entre todos los componentes que llamen este hook, así que no
// hace falta un Context aparte para que StoreHeader y CartScreen vean el
// mismo carrito actualizado.
export function useCart() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => request('/cart/mine', { method: 'GET' }),
    enabled: Boolean(user),
  });

  const invalidateCart = () => queryClient.invalidateQueries({ queryKey: ['cart'] });

  const addItemMutation = useMutation({
    mutationFn: ({ productId, quantity, size, color }) =>
      request('/cart/mine', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity, size, color }),
      }),
    onSuccess: invalidateCart,
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, quantity }) =>
      request(`/cart/mine/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      }),
    onSuccess: invalidateCart,
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId) => request(`/cart/mine/${itemId}`, { method: 'DELETE' }),
    onSuccess: invalidateCart,
  });

  const checkoutMutation = useMutation({
    mutationFn: (payload) =>
      request('/cart/mine/checkout', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: invalidateCart,
  });

  const items = cart?.products ?? [];

  return {
    cart,
    items,
    itemCount: items.reduce((total, item) => total + Number(item.quantity || 0), 0),
    total: cart?.total ?? 0,
    isLoading,
    // size/color eligen la variante (el stock se lleva por talla y color);
    // sin ellos el backend usa la primera variante con stock.
    addItem: (productId, quantity = 1, { size, color } = {}) =>
      addItemMutation.mutateAsync({ productId, quantity, size, color }),
    // itemId es el _id de la línea del carrito (una por talla/color).
    updateItem: (itemId, quantity) => updateItemMutation.mutateAsync({ itemId, quantity }),
    removeItem: (itemId) => removeItemMutation.mutateAsync(itemId),
    checkout: (payload) => checkoutMutation.mutateAsync(payload),
  };
}
