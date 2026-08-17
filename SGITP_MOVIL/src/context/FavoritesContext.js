import { createContext, useCallback, useContext, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { request } from '../services/apiClient';
import { useAuth } from './AuthContext';

// Guarda qué productos marcó el usuario como favoritos. Pide la lista al
// backend (GET /favorite/mine) y usa mutaciones para agregar/quitar, así la
// lista sobrevive a cerrar la app (antes vivía solo en memoria).
const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // enabled: false mientras no haya sesión, para no pedir /favorite/mine sin
  // cookie de cliente (daría 401).
  const { data: favorites } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => request('/favorite/mine', { method: 'GET' }),
    enabled: Boolean(user),
  });

  // Si cierra sesión, se ignora cualquier dato viejo en caché y se muestra vacío.
  // GET /favorite/mine devuelve product_id ya populado (objeto completo del
  // producto, no el id plano), así que hay que sacar el _id de adentro: si
  // no, el Set queda lleno de objetos y favoriteIds.has(productId) (un
  // string) nunca da true, y el corazón nunca se marca como favorito.
  const favoriteIds = useMemo(() => {
    if (!user) return new Set();
    return new Set(
      (favorites ?? [])
        .map((favorite) => favorite.product_id?._id ?? favorite.product_id)
        .filter(Boolean)
    );
  }, [favorites, user]);

  const invalidateFavorites = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
    [queryClient]
  );

  const addFavorite = useMutation({
    mutationFn: (productId) =>
      request('/favorite/mine', {
        method: 'POST',
        body: JSON.stringify({ product_id: productId }),
      }),
    onSuccess: invalidateFavorites,
  });

  const removeFavorite = useMutation({
    mutationFn: (productId) => request(`/favorite/mine/${productId}`, { method: 'DELETE' }),
    onSuccess: invalidateFavorites,
  });

  const toggleFavorite = useCallback(
    (productId) => {
      if (favoriteIds.has(productId)) {
        removeFavorite.mutate(productId);
      } else {
        addFavorite.mutate(productId);
      }
    },
    [favoriteIds, addFavorite, removeFavorite]
  );

  const isFavorite = useCallback((productId) => favoriteIds.has(productId), [favoriteIds]);

  const value = useMemo(
    () => ({ favoriteIds, toggleFavorite, isFavorite }),
    [favoriteIds, toggleFavorite, isFavorite]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

// Hook para usar/marcar favoritos desde cualquier pantalla.
export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within a FavoritesProvider');
  return context;
}
