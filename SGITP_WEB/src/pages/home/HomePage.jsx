import { useEffect, useMemo, useState } from 'react';

import HomeHero from '../../components/home/HomeHero';
import {
  CategoryShowcase,
  HomeBenefits,
  SeasonOffers,
  TrendingSection,
} from '../../components/home/HomeSections';
import JoinSection from '../../components/home/JoinSection';
import PublicFooter from '../../components/home/PublicFooter';
import PublicNavbar from '../../components/home/PublicNavbar';
import StoresSection from '../../components/home/StoresSection';
import { useFavoriteIds, useStoreCatalog } from '../../hooks/useStoreCatalog';
import { getPublicBranches } from '../../services/catalogService';

function HomePage() {
  const { products, loading, error } = useStoreCatalog();
  const { favoriteIds, toggleFavorite } = useFavoriteIds();
  const [stores, setStores] = useState([]);
  const [storesError, setStoresError] = useState('');

  useEffect(() => {
    let isMounted = true;
    getPublicBranches()
      .then((data) => {
        if (isMounted) setStores(Array.isArray(data) ? data : []);
      })
      .catch((requestError) => {
        if (isMounted) setStoresError(requestError.message);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const categoriesCount = useMemo(
    () => new Set(products.map((product) => product.category).filter(Boolean)).size,
    [products]
  );

  return (
    <div className="shop-page">
      <PublicNavbar />

      <main>
        <HomeHero products={products} storesCount={stores.length} categoriesCount={categoriesCount} />
        <HomeBenefits storesCount={stores.length} />

        {loading ? <p className="catalog-status-text">Cargando productos...</p> : null}
        {error ? <p className="catalog-status-text">{error}</p> : null}

        <CategoryShowcase products={products} />
        <TrendingSection products={products} favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} />
        <SeasonOffers products={products} />
        <StoresSection stores={stores} error={storesError} />
        <JoinSection />
      </main>

      <PublicFooter />
    </div>
  );
}

export default HomePage;
