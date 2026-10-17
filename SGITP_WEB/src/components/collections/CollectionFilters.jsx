import { SlidersHorizontal, X } from 'lucide-react';

// Barra lateral de filtros de Colecciones. Solo muestra opciones que existen
// en el catálogo actual (tallas, telas y colores salen de las variantes).
function CollectionFilters({
  options,
  filters,
  onChange,
  onToggleValue,
  onClear,
  isOpen,
  onClose,
  activeCount,
}) {
  return (
    <aside className={`collection-filters ${isOpen ? 'collection-filters-open' : ''}`} aria-label="Filtros">
      <div className="collection-filters-heading">
        <span>
          <SlidersHorizontal size={14} strokeWidth={1.6} /> Filtros
          {activeCount ? ` (${activeCount})` : ''}
        </span>
        <div>
          <button type="button" className="shop-link" onClick={onClear} disabled={!activeCount}>
            Limpiar
          </button>
          <button type="button" className="store-icon-btn collection-filters-close" aria-label="Cerrar filtros" onClick={onClose}>
            <X size={17} strokeWidth={1.6} />
          </button>
        </div>
      </div>

      <div className="collection-filter-group">
        <h3>Categoría</h3>
        <ul className="collection-category-list">
          {options.categories.map((category) => (
            <li key={category.name}>
              <button
                type="button"
                className={filters.category === category.name ? 'collection-category-active' : ''}
                onClick={() => onChange('category', category.name)}
              >
                <span>{category.name}</span>
                <small>{category.count}</small>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {options.sizes.length ? (
        <div className="collection-filter-group">
          <h3>Talla</h3>
          <div className="collection-size-grid">
            {options.sizes.map((size) => (
              <button
                key={size}
                type="button"
                aria-pressed={filters.sizes.has(size)}
                className={filters.sizes.has(size) ? 'collection-size-active' : ''}
                onClick={() => onToggleValue('sizes', size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {options.fabrics.length ? (
        <div className="collection-filter-group">
          <h3>Tela</h3>
          {options.fabrics.map((fabric) => (
            <label key={fabric.name} className="collection-check">
              <input
                type="checkbox"
                checked={filters.fabrics.has(fabric.name)}
                onChange={() => onToggleValue('fabrics', fabric.name)}
              />
              <span>{fabric.name}</span>
              <small>{fabric.count}</small>
            </label>
          ))}
        </div>
      ) : null}

      {options.colors.length ? (
        <div className="collection-filter-group">
          <h3>Color</h3>
          <div className="collection-color-grid">
            {options.colors.map((color) => (
              <button
                key={color.name}
                type="button"
                aria-pressed={filters.colors.has(color.name)}
                className={filters.colors.has(color.name) ? 'collection-color-active' : ''}
                onClick={() => onToggleValue('colors', color.name)}
              >
                <i style={{ backgroundColor: color.hex }} />
                {color.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="collection-filter-group">
        <h3>Precio</h3>
        {options.priceRanges.map((range) => (
          <label key={range.key} className="collection-check collection-radio">
            <input
              type="radio"
              name="price-range"
              checked={filters.price === range.key}
              onChange={() => onChange('price', range.key)}
            />
            <span>{range.label}</span>
          </label>
        ))}
      </div>

      <label className="collection-switch">
        <span>Solo ofertas</span>
        <input
          type="checkbox"
          role="switch"
          checked={filters.onlyOffers}
          onChange={(event) => onChange('onlyOffers', event.target.checked)}
        />
        <i aria-hidden="true" />
      </label>
    </aside>
  );
}

export default CollectionFilters;
