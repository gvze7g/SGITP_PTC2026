import { useState } from 'react';
import { Heart, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  FALLBACK_IMAGE,
  formatProductPrice,
  getDisplayPrice,
  getProductColors,
  getProductFabrics,
  getProductImage,
  getProductTotalStock,
  isNewProduct,
} from '../../services/catalogService';

function handleImageError(event) {
  if (event.currentTarget.src === FALLBACK_IMAGE) return;
  event.currentTarget.src = FALLBACK_IMAGE;
}

// Etiqueta de la esquina: agotado, oferta (no aplica al mayorista) o nuevo.
function getBadge(product) {
  if (getProductTotalStock(product) <= 0) return { label: 'Agotado', tone: 'muted' };
  if (product.hasActiveOffer && !product.isWholesaleView) {
    return { label: `-${Math.round(product.discountPercentage)}%`, tone: 'accent' };
  }
  if (isNewProduct(product)) return { label: 'Nuevo', tone: 'light' };
  return null;
}

// Tarjeta de producto de la tienda: foto, favorito, categoria, nombre,
// precio (mayorista si corresponde), tela y colores disponibles.
function ProductCard({ product, isFavorite = false, onToggleFavorite, showCategory = true }) {
  const navigate = useNavigate();
  const colors = getProductColors(product);
  const [selectedColor, setSelectedColor] = useState(colors[0]?.name ?? '');
  const fabric = getProductFabrics(product)[0];
  const badge = getBadge(product);
  const showOldPrice = product.hasActiveOffer && !product.isWholesaleView;
  const openDetail = () => navigate(`/product-detail/${product._id}`);
  const selectedHex = colors.find((color) => color.name === selectedColor)?.hex;

  return (
    <article className="shop-card">
      <div className="shop-card-media">
        <button type="button" className="shop-card-image" onClick={openDetail}>
          <img src={getProductImage(product, 800)} alt={product.name} loading="lazy" onError={handleImageError} />
        </button>
        {badge ? <span className={`shop-card-badge shop-card-badge-${badge.tone}`}>{badge.label}</span> : null}
        <button
          type="button"
          className={`shop-card-favorite ${isFavorite ? 'shop-card-favorite-active' : ''}`}
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          aria-pressed={isFavorite}
          onClick={() => onToggleFavorite?.(product._id)}
        >
          <Heart size={15} strokeWidth={1.8} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="shop-card-body">
        {showCategory && product.category ? <span className="shop-eyebrow">{product.category}</span> : null}
        <div className="shop-card-title-row">
          <button type="button" className="shop-card-name" onClick={openDetail}>
            {product.name}
          </button>
          <span className="shop-card-price">
            {showOldPrice ? <s>{formatProductPrice(product.originalPrice)}</s> : null}
            <strong className={showOldPrice ? 'shop-price-offer' : ''}>
              {formatProductPrice(getDisplayPrice(product))}
            </strong>
          </span>
        </div>
        {fabric ? (
          <p className="shop-card-fabric">
            <Layers size={12} strokeWidth={1.6} /> Tela: {fabric}
          </p>
        ) : null}

        {colors.length ? (
          <div className="shop-card-colors">
            <div className="shop-swatches">
              {colors.slice(0, 5).map((color) => (
                <button
                  key={color.name}
                  type="button"
                  title={color.name}
                  aria-label={`Color ${color.name}`}
                  className={color.name === selectedColor ? 'shop-swatch shop-swatch-active' : 'shop-swatch'}
                  style={{ backgroundColor: color.hex }}
                  onClick={() => setSelectedColor(color.name)}
                />
              ))}
            </div>
            <span className="shop-card-color-label">
              <i style={{ backgroundColor: selectedHex }} />
              {selectedColor}
            </span>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default ProductCard;
