import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { request } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

// Detecta la marca de la tarjeta por el primer dígito (regla clásica de
// Visa/Mastercard) y separa los últimos 4 dígitos, todo en el teléfono: el
// número completo nunca sale de acá, solo viajan al backend la marca y el
// last4 (ver Model/paymentMethod.js, que ni siquiera tiene campo para el
// número completo).
export function getCardBrand(cardNumber = '') {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.startsWith('4')) return 'Visa';
  if (digits.startsWith('5')) return 'Mastercard';
  return 'Otra';
}

export function getCardLast4(cardNumber = '') {
  const digits = cardNumber.replace(/\D/g, '');
  return digits.slice(-4);
}

// Tarjetas guardadas del cliente logueado (CRUD real contra
// /paymentMethod/mine).
export function usePaymentMethods() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: cards, isLoading } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: () => request('/paymentMethod/mine', { method: 'GET' }),
    enabled: Boolean(user),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });

  const addMutation = useMutation({
    mutationFn: (payload) =>
      request('/paymentMethod/mine', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...payload }) =>
      request(`/paymentMethod/mine/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (id) => request(`/paymentMethod/mine/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });

  return {
    cards: cards ?? [],
    isLoading,
    addCard: (payload) => addMutation.mutateAsync(payload),
    setPrimaryCard: (id) => updateMutation.mutateAsync({ id, isPrimary: true }),
    removeCard: (id) => removeMutation.mutateAsync(id),
  };
}
