import { createContext, useCallback, useContext, useMemo, useState } from 'react';

// Guarda qué productos marcó el usuario como favoritos (solo en memoria: si
// cierra la app se pierde la lista, todavía no hay backend para guardarlo).
const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());

  const toggleFavorite = useCallback((productId) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  }, []);

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
