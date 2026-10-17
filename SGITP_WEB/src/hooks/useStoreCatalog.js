import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuth } from '../context/AuthContext';
import { getCatalogProducts, getProductCategories } from '../services/catalogService';
import { addFavorite, getMyFavorites, removeFavorite } from '../services/favoriteService';

// Catalogo completo + lista de categorias, compartido por el Inicio y la
// pagina de Colecciones. Se vuelve a pedir cuando cambia la sesion porque el
// backend le manda el precio mayorista solo al cliente mayorista.
export function useStoreCatalog() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categoryGroups, setCategoryGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const customerType = user?.customer_type ?? 'guest';

  useEffect(() => {
    let isMounted = true;

    Promise.all([getCatalogProducts(customerType), getProductCategories().catch(() => [])])
      .then(([catalog, groups]) => {
        if (!isMounted) return;
        setProducts(Array.isArray(catalog) ? catalog : []);
        setCategoryGroups(Array.isArray(groups) ? groups : []);
        setError('');
      })
      .catch((requestError) => {
        if (isMounted) setError(requestError.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [customerType]);

  return { products, categoryGroups, loading, error };
}

const EMPTY_IDS = new Set();

// Ids de favoritos del cliente y como marcar/desmarcar uno desde una tarjeta.
export function useFavoriteIds() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    let isMounted = true;
    getMyFavorites()
      .then((favorites) => {
        if (!isMounted) return;
        setFavoriteIds(
          new Set(
            (Array.isArray(favorites) ? favorites : []).map(
              (favorite) => favorite.product_id?._id || favorite.product_id
            )
          )
        );
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const toggleFavorite = useCallback(
    async (productId) => {
      if (!isAuthenticated) {
        toast.error('Inicia sesión para guardar tus favoritos.');
        navigate('/login');
        return;
      }

      if (busyId) return;
      setBusyId(productId);

      const isFavorite = favoriteIds.has(productId);

      try {
        if (isFavorite) {
          await removeFavorite(productId);
        } else {
          await addFavorite(productId);
        }

        setFavoriteIds((current) => {
          const next = new Set(current);
          if (isFavorite) next.delete(productId);
          else next.add(productId);
          return next;
        });
        toast.success(isFavorite ? 'Se quitó de tus favoritos.' : 'Guardado en tus favoritos.');
        window.dispatchEvent(new Event('store-counts-changed'));
      } catch (requestError) {
        toast.error(requestError.message);
      } finally {
        setBusyId(null);
      }
    },
    [busyId, favoriteIds, isAuthenticated, navigate]
  );

  // Sin sesión no hay favoritos (aunque quede guardado lo de la sesión anterior).
  return { favoriteIds: isAuthenticated ? favoriteIds : EMPTY_IDS, toggleFavorite };
}
