import { ArrowLeft, ChevronDown } from 'lucide-react';

function StoreAvailabilityPanel({ product, selectedSize, onEdit }) {
  return (
    <main className="store-availability-page">
      <section className="store-availability-preview">
        <img src={product.image} alt={product.name} />
      </section>

      <section className="store-availability-panel">
        <button type="button" className="commerce-back-btn store-back-btn" onClick={onEdit}>
          <ArrowLeft size={15} strokeWidth={1.6} />
          Atras
        </button>

        <h1>Disponibilidad en tienda</h1>

        <div className="store-product-summary">
          <img src={product.thumbnail} alt={product.name} />

          <div>
            <h2>{product.name}</h2>
            <p>Color: marfil natural</p>
            <p>Talla: {selectedSize}</p>
            <button type="button" onClick={onEdit}>
              Editar
            </button>
          </div>
        </div>

        <form className="store-check-form">
          <label>
            <span>Ciudad</span>
            <button type="button">
              San Salvador
              <ChevronDown size={16} strokeWidth={1.7} />
            </button>
          </label>

          <label>
            <span>Tienda</span>
            <button type="button">
              Seleccione una tienda
              <ChevronDown size={16} strokeWidth={1.7} />
            </button>
          </label>

          <button type="button" className="store-check-button">
            Comprobar stock
          </button>
        </form>

        <button type="button" className="store-location-button">
          Usar mi ubicacion
        </button>
      </section>
    </main>
  );
}

export default StoreAvailabilityPanel;
