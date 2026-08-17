import { useState } from 'react';
import { ArrowLeft, Heart, ShoppingBag, Truck, RefreshCcw, ShieldCheck } from 'lucide-react';
import { FALLBACK_IMAGE } from '../../services/catalogService';

function handleImageError(event) {
  if (event.currentTarget.src === FALLBACK_IMAGE) return;
  event.currentTarget.src = FALLBACK_IMAGE;
}

function ProductDetailView({
  product,
  sizeOptions,
  selectedSize,
  onSelectSize,
  colorOptions,
  selectedColor,
  onSelectColor,
  isFavorite,
  favoriteBusy,
  onToggleFavorite,
  onAddToCart,
  onBack,
  onOpenStoreSearch,
}) {
  const [activeImage, setActiveImage] = useState(0);
  const images = product.images?.length ? product.images : [];

  return (
    <main className="product-detail-page">
      <section className="product-detail-media">
        <div className="product-gallery">
          {images.length > 1 ? (
            <div className="product-gallery-thumbs">
              {images.map((image, index) => (
                <button
                  key={image + index}
                  type="button"
                  className={index === activeImage ? 'product-thumb-active' : ''}
                  onClick={() => setActiveImage(index)}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} onError={handleImageError} />
                </button>
              ))}
            </div>
          ) : null}
          <div className="product-gallery-main">
            {product.isNew ? <span className="product-detail-badge">Nuevo</span> : null}
            <img src={images[activeImage] || images[0]} alt={product.name} onError={handleImageError} />
          </div>
        </div>
      </section>

      <section className="product-detail-info">
        <button type="button" className="commerce-back-btn product-back-btn" onClick={onBack}>
          <ArrowLeft size={15} strokeWidth={1.6} /> Atras
        </button>

        <span className="product-eyebrow">{product.category}</span>
        <h1>{product.name}</h1>

        {product.hasActiveOffer ? (
          <p className="product-price product-price-offer">
            <strong>{product.price}</strong>
            <span>{product.originalPrice}</span>
            <em>-{product.discountPercentage}%</em>
          </p>
        ) : (
          <p className="product-price">{product.price}</p>
        )}

        <p className="product-description">{product.description}</p>

        {colorOptions.length ? (
          <div className="product-color-block">
            <span className="product-block-label">
              Color: <strong>{selectedColor || '—'}</strong>
            </span>
            <div className="product-color-grid">
              {colorOptions.map((variant) => (
                <button
                  key={variant.color}
                  type="button"
                  className={variant.color === selectedColor ? 'product-color-active' : ''}
                  style={{ backgroundColor: variant.colorHex || '#d8cfc4' }}
                  title={variant.color}
                  onClick={() => onSelectColor(variant.color)}
                >
                  <span className="sr-only">{variant.color}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="product-size-header">
          <span>Seleccionar talla</span>
          <button type="button" onClick={onOpenStoreSearch}>
            Guia de tallas
          </button>
        </div>
        <div className="product-size-grid">
          {sizeOptions.map((size) => (
            <button
              key={size}
              type="button"
              className={selectedSize === size ? 'product-size-active' : ''}
              onClick={() => onSelectSize(size)}
            >
              {size}
            </button>
          ))}
        </div>

        {product.stockLabel ? (
          <p className={product.inStock ? 'product-stock-status product-stock-ok' : 'product-stock-status product-stock-out'}>
            {product.stockLabel}
          </p>
        ) : null}

        <div className="product-actions">
          <button type="button" className="product-cart-btn" onClick={onAddToCart} disabled={!product.inStock}>
            <ShoppingBag size={17} strokeWidth={1.8} />
            Añadir al carrito
          </button>
          <button
            type="button"
            className={isFavorite ? 'product-favorite-btn product-favorite-active' : 'product-favorite-btn'}
            onClick={onToggleFavorite}
            disabled={favoriteBusy}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          >
            <Heart size={18} strokeWidth={1.8} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        <ul className="product-trust-row">
          <li>
            <Truck size={16} strokeWidth={1.6} /> Envio a todo el pais
          </li>
          <li>
            <RefreshCcw size={16} strokeWidth={1.6} /> Cambios y devoluciones
          </li>
          <li>
            <ShieldCheck size={16} strokeWidth={1.6} /> Pago seguro
          </li>
        </ul>
      </section>
    </main>
  );
}

export default ProductDetailView;
