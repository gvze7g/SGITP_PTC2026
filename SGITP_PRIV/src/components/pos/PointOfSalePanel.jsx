import { ChevronDown, Search } from 'lucide-react';

function PointOfSalePanel() {
  return (
    <aside className="pos-panel">
      <div className="pos-client-card">
        <div className="pos-client-header">
          <span>DETALLES DEL CLIENTE</span>
          <button type="button" className="pos-badge-btn">
            MAYORISTA
          </button>
        </div>

        <div className="pos-client-content">
          <div>
            <h3>Linda Palacios</h3>
            <p>maria.perez@boutique.co</p>
          </div>

          <button type="button" className="pos-search-btn">
            <Search size={18} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      <div className="pos-field-block">
        <span className="pos-field-label">ORIGEN</span>
        <button type="button" className="pos-select-field">
          <span>Tienda Física</span>
          <ChevronDown size={22} strokeWidth={1.8} />
        </button>
      </div>

      <div className="pos-field-block">
        <span className="pos-field-label">DATOS DE ENVÍO</span>
        <div className="pos-textarea-placeholder" />
      </div>

      <div className="pos-field-block">
        <span className="pos-field-label">TELÉFONO</span>
        <div className="pos-input-placeholder" />
      </div>

      <div className="pos-order-section">
        <span className="pos-field-label">ORDEN ACTUAL</span>

        <div className="pos-order-item">
          <img
            src="https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=300&q=80"
            alt="Producto"
            className="pos-order-image"
          />

          <div className="pos-order-info">
            <div className="pos-order-top">
              <div>
                <h4>Mono de algodón orgánico</h4>
                <p>Talla: 6M, Color: Beige</p>
              </div>

              <span className="pos-order-price">$45.00</span>
            </div>

            <div className="pos-order-qty">
              <button type="button">−</button>
              <span>1</span>
              <button type="button">+</button>
            </div>
          </div>
        </div>
      </div>

      <div className="pos-total-section">
        <div className="pos-total-row">
          <span>Total:</span>
          <strong>$48.60</strong>
        </div>

        <button type="button" className="pos-confirm-btn">
          Confirmar venta <span>→</span>
        </button>
      </div>
    </aside>
  );
}

export default PointOfSalePanel;