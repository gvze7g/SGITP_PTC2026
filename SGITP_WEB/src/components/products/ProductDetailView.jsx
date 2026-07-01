import { ArrowLeft } from 'lucide-react';

const SIZES = ['0-3M', '3-6M', '6-12M', '12-18M'];

function ProductDetailView({ product, selectedSize, onSelectSize, onAddToCart, onBack, onOpenStoreSearch }) {
  return (
    <main className="product-detail-page">
      <section className="product-detail-media">
        <img src={product.image} alt={product.name} />
      </section>

      <section className="product-detail-info">
        <button type="button" className="commerce-back-btn product-back-btn" onClick={onBack}>
          <ArrowLeft size={15} strokeWidth={1.6} />
          Atras
        </button>

        <span className="product-eyebrow">Coleccion permanente</span>
        <h1>{product.name}</h1>
        <p className="product-price">{product.price}</p>

        <p className="product-description">{product.description}</p>

        <ul className="product-notes">
          {product.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>

        <div className="product-size-header">
          <span>Seleccionar talla</span>
          <button type="button">Guia de tallas</button>
        </div>

        <div className="product-size-grid">
          {SIZES.map((size) => (
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

        <div className="product-actions">
          <button type="button" className="product-cart-btn" onClick={onAddToCart}>
            Añadir al carrito
          </button>
          <button type="button" className="product-store-btn" onClick={onOpenStoreSearch}>
            Buscar en tienda
          </button>
        </div>
      </section>
    </main>
  );
}

export default ProductDetailView;
