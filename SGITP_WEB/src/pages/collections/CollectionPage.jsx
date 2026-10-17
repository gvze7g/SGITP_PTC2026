import { useMemo, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import CollectionFilters from '../../components/collections/CollectionFilters';
import PublicFooter from '../../components/home/PublicFooter';
import PublicNavbar from '../../components/home/PublicNavbar';
import ProductCard from '../../components/products/ProductCard';
import { useInfiniteReveal } from '../../hooks/useInfiniteReveal';
import { useFavoriteIds, useStoreCatalog } from '../../hooks/useStoreCatalog';
import {
  formatProductPrice,
  getDisplayPrice,
  getProductColors,
  getProductFabrics,
  getProductSizes,
} from '../../services/catalogService';

const ALL = 'Todo';
const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: 'featured', label: 'Destacados' },
  { value: 'newest', label: 'Más nuevos' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
  { value: 'name', label: 'Nombre: A – Z' },
];

const EMPTY_FILTERS = {
  category: ALL,
  sizes: new Set(),
  fabrics: new Set(),
  colors: new Set(),
  price: 'all',
  onlyOffers: false,
};

// Texto sin mayúsculas ni tildes, para que "nina" encuentre "niña".
const normalize = (value) =>
  String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

// Ordena tallas de bebé: "0-3 m" antes que "12-18 m" y los meses antes que los años.
function sizeWeight(size) {
  const value = normalize(size);
  const number = Number.parseFloat(value.match(/\d+(\.\d+)?/)?.[0] ?? 'NaN');
  if (Number.isNaN(number)) return Number.MAX_SAFE_INTEGER;
  return /a(no)?s?\b|\d\s*a\b/.test(value) && !/m/.test(value) ? number * 12 : number;
}

const roundTo5 = (value) => Math.max(5, Math.round(value / 5) * 5);

// Rangos de precio según los precios reales del catálogo (tercios).
function buildPriceRanges(products) {
  const prices = products.map(getDisplayPrice).filter((price) => price > 0).sort((a, b) => a - b);
  const ranges = [{ key: 'all', label: 'Todos', test: () => true }];
  if (prices.length < 3) return ranges;

  const low = roundTo5(prices[Math.floor(prices.length / 3)]);
  const high = roundTo5(prices[Math.floor((prices.length * 2) / 3)]);

  ranges.push({ key: 'low', label: `Menos de ${formatProductPrice(low)}`, test: (price) => price < low });
  if (high > low) {
    ranges.push({
      key: 'mid',
      label: `${formatProductPrice(low)} – ${formatProductPrice(high)}`,
      test: (price) => price >= low && price <= high,
    });
    ranges.push({ key: 'high', label: `Más de ${formatProductPrice(high)}`, test: (price) => price > high });
  } else {
    ranges.push({ key: 'high', label: `Desde ${formatProductPrice(low)}`, test: (price) => price >= low });
  }
  return ranges;
}

function countBy(products, getValues) {
  const counts = new Map();
  products.forEach((product) => {
    getValues(product).forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
  });
  return counts;
}

function CollectionPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, categoryGroups, loading, error } = useStoreCatalog();
  const { favoriteIds, toggleFavorite } = useFavoriteIds();
  const [filters, setFilters] = useState(() => ({
    ...EMPTY_FILTERS,
    category: searchParams.get('categoria') || ALL,
  }));
  const [sort, setSort] = useState('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const searchQuery = (searchParams.get('q') || '').trim();

  const options = useMemo(() => {
    // Categorías en el orden de la lista oficial (Niña, Niño, Unisex).
    const officialOrder = categoryGroups.flatMap((group) => group.categories);
    const categoryCounts = countBy(products, (product) => (product.category ? [product.category] : []));
    const categories = [...categoryCounts.entries()]
      .sort(([a], [b]) => {
        const indexA = officialOrder.indexOf(a);
        const indexB = officialOrder.indexOf(b);
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB) || a.localeCompare(b);
      })
      .map(([name, count]) => ({ name, count }));

    const colorHex = new Map();
    products.forEach((product) =>
      getProductColors(product).forEach((color) => {
        if (!colorHex.has(color.name)) colorHex.set(color.name, color.hex);
      })
    );

    return {
      categories: [{ name: ALL, count: products.length }, ...categories],
      sizes: [...new Set(products.flatMap(getProductSizes))].sort((a, b) => sizeWeight(a) - sizeWeight(b)),
      fabrics: [...countBy(products, getProductFabrics).entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, count]) => ({ name, count })),
      colors: [...colorHex.entries()].map(([name, hex]) => ({ name, hex })),
      priceRanges: buildPriceRanges(products),
    };
  }, [products, categoryGroups]);

  const filteredProducts = useMemo(() => {
    const query = normalize(searchQuery);
    const priceRange = options.priceRanges.find((range) => range.key === filters.price) ?? options.priceRanges[0];

    const result = products.filter((product) => {
      if (filters.category !== ALL && product.category !== filters.category) return false;
      if (filters.onlyOffers && !(product.hasActiveOffer && !product.isWholesaleView)) return false;
      if (filters.sizes.size && !getProductSizes(product).some((size) => filters.sizes.has(size))) return false;
      if (filters.fabrics.size && !getProductFabrics(product).some((fabric) => filters.fabrics.has(fabric))) {
        return false;
      }
      if (filters.colors.size && !getProductColors(product).some((color) => filters.colors.has(color.name))) {
        return false;
      }
      if (!priceRange.test(getDisplayPrice(product))) return false;

      if (query) {
        const haystack = normalize(
          [
            product.name,
            product.category,
            product.description,
            ...getProductFabrics(product),
            ...getProductColors(product).map((color) => color.name),
          ].join(' ')
        );
        if (!haystack.includes(query)) return false;
      }
      return true;
    });

    const byNewest = (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    const sorters = {
      // Destacados: primero las ofertas vigentes y luego lo más nuevo.
      featured: (a, b) => Number(Boolean(b.hasActiveOffer)) - Number(Boolean(a.hasActiveOffer)) || byNewest(a, b),
      newest: byNewest,
      'price-asc': (a, b) => getDisplayPrice(a) - getDisplayPrice(b),
      'price-desc': (a, b) => getDisplayPrice(b) - getDisplayPrice(a),
      name: (a, b) => String(a.name).localeCompare(String(b.name)),
    };
    return result.sort(sorters[sort] ?? sorters.featured);
  }, [products, filters, sort, searchQuery, options.priceRanges]);

  const resetKey = JSON.stringify([
    filters.category,
    [...filters.sizes],
    [...filters.fabrics],
    [...filters.colors],
    filters.price,
    filters.onlyOffers,
    sort,
    searchQuery,
  ]);
  const { visibleCount, sentinelRef } = useInfiniteReveal(filteredProducts.length, PAGE_SIZE, resetKey);

  const activeCount =
    (filters.category !== ALL ? 1 : 0) +
    filters.sizes.size +
    filters.fabrics.size +
    filters.colors.size +
    (filters.price !== 'all' ? 1 : 0) +
    (filters.onlyOffers ? 1 : 0);

  const handleChange = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
    if (field === 'category') {
      const next = new URLSearchParams(searchParams);
      if (value === ALL) next.delete('categoria');
      else next.set('categoria', value);
      setSearchParams(next, { replace: true });
    }
  };

  const handleToggleValue = (field, value) => {
    setFilters((current) => {
      const next = new Set(current[field]);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return { ...current, [field]: next };
    });
  };

  const handleClear = () => {
    setFilters({ ...EMPTY_FILTERS, sizes: new Set(), fabrics: new Set(), colors: new Set() });
    setSearchParams({}, { replace: true });
  };

  const clearSearch = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('q');
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="shop-page">
      <PublicNavbar activeItem="categories" />

      <main className="collection-main">
        <nav className="collection-breadcrumb" aria-label="Ruta">
          <button type="button" onClick={() => navigate('/home')}>
            Inicio
          </button>
          <span>/</span>
          <span>Colecciones</span>
        </nav>

        <header className="collection-hero">
          <h1>
            Colección <em>Permanente</em>
          </h1>
          <p>Prendas atemporales y suaves, pensadas para acompañar cada etapa de tu peque.</p>
        </header>

        <div className="collection-chips" aria-label="Categorías">
          {options.categories.map((category) => (
            <button
              key={category.name}
              type="button"
              className={filters.category === category.name ? 'collection-chip-active' : ''}
              onClick={() => handleChange('category', category.name)}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="collection-layout">
          <CollectionFilters
            options={options}
            filters={filters}
            onChange={handleChange}
            onToggleValue={handleToggleValue}
            onClear={handleClear}
            isOpen={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            activeCount={activeCount}
          />
          <button
            type="button"
            className={`collection-filters-backdrop ${filtersOpen ? 'collection-filters-backdrop-open' : ''}`}
            aria-label="Cerrar filtros"
            tabIndex={filtersOpen ? 0 : -1}
            onClick={() => setFiltersOpen(false)}
          />

          <section className="collection-results">
            <div className="collection-toolbar">
              <div className="collection-toolbar-left">
                <button
                  type="button"
                  className="shop-btn shop-btn-outline collection-filters-toggle"
                  onClick={() => setFiltersOpen(true)}
                >
                  <SlidersHorizontal size={14} strokeWidth={1.6} /> Filtros
                  {activeCount ? ` (${activeCount})` : ''}
                </button>
                <span>
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
                </span>
                {searchQuery ? (
                  <button type="button" className="collection-search-tag" onClick={clearSearch}>
                    “{searchQuery}” ✕
                  </button>
                ) : null}
              </div>
              <label className="collection-sort">
                <span>Ordenar</span>
                <select value={sort} onChange={(event) => setSort(event.target.value)}>
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {loading ? <p className="catalog-status-text">Cargando productos...</p> : null}
            {error ? <p className="catalog-status-text">{error}</p> : null}
            {!loading && !error && filteredProducts.length === 0 ? (
              <div className="collection-empty">
                <p>No encontramos prendas con esos filtros.</p>
                <button type="button" className="shop-btn shop-btn-outline" onClick={handleClear}>
                  Limpiar filtros
                </button>
              </div>
            ) : null}

            <div className="shop-grid shop-grid-three">
              {filteredProducts.slice(0, visibleCount).map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  isFavorite={favoriteIds.has(product._id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>

            {visibleCount < filteredProducts.length ? (
              <div ref={sentinelRef} className="catalog-scroll-sentinel" aria-hidden="true" />
            ) : null}
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

export default CollectionPage;
