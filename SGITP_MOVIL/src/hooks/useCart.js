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
    mutationFn: ({ productId, quantity }) =>
      request('/cart/mine', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      }),
    onSuccess: invalidateCart,
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ productId, quantity }) =>
      request(`/cart/mine/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      }),
    onSuccess: invalidateCart,
  });

  const removeItemMutation = useMutation({
    mutationFn: (productId) => request(`/cart/mine/${productId}`, { method: 'DELETE' }),
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
    addItem: (productId, quantity = 1) => addItemMutation.mutateAsync({ productId, quantity }),
    updateItem: (productId, quantity) => updateItemMutation.mutateAsync({ productId, quantity }),
    removeItem: (productId) => removeItemMutation.mutateAsync(productId),
    checkout: (payload) => checkoutMutation.mutateAsync(payload),
  };
}
