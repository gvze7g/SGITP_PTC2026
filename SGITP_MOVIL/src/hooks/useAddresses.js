import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { request } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

// Ciudades que acepta el backend para una dirección (ver
// validateAddressPayload en customerController.js): mandar cualquier otra
// cosa da 400, así que la pantalla solo deja elegir entre estas.
export const ADDRESS_CITIES = [
  'San Salvador',
  'Santa Ana',
  'San Miguel',
  'Soyapango',
  'Apopa',
  'Mejicanos',
  'Santa Tecla',
  'Antiguo Cuscatlan',
  'Sonsonate',
  'Usulutan',
];

// Direcciones guardadas del cliente logueado (CRUD real contra
// /customer/me/addresses).
export function useAddresses() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: addresses, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => request('/customer/me/addresses', { method: 'GET' }),
    enabled: Boolean(user),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['addresses'] });

  const addMutation = useMutation({
    mutationFn: (payload) =>
      request('/customer/me/addresses', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ addressId, ...payload }) =>
      request(`/customer/me/addresses/${addressId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (addressId) =>
      request(`/customer/me/addresses/${addressId}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });

  return {
    addresses: addresses ?? [],
    isLoading,
    addAddress: (payload) => addMutation.mutateAsync(payload),
    updateAddress: (addressId, payload) => updateMutation.mutateAsync({ addressId, ...payload }),
    removeAddress: (addressId) => removeMutation.mutateAsync(addressId),
  };
}
