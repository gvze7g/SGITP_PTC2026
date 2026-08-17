function SaleDetailsModal({ open, onClose, sale, onVoidSale, onCompleteSale }) {
  if (!open || !sale) return null;

  const isVoided = sale.payment_status === "Cancelado";
  const isPending = sale.payment_status === "Pending";

  return (
    <div className="app-modal-overlay app-modal-overlay-dark">
      <div className="sale-details-modal">
        <div className="sale-details-header">
          <div>
            <h2>Detalle de venta</h2>
            <p>{sale.id}</p>
          </div>

          <button
            type="button"
            className="sale-details-close-btn"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="sale-details-body">
          <div className="sale-details-grid">
            <div className="sale-detail-block">
              <span>Fecha</span>
              <strong>{sale.date}</strong>
            </div>

            <div className="sale-detail-block">
              <span>Cliente</span>
              <strong>{sale.client}</strong>
            </div>

            <div className="sale-detail-block">
              <span>Origen</span>
              <strong>{sale.origin}</strong>
            </div>

            <div className="sale-detail-block">
              <span>Tipo de precio</span>
              <strong>{sale.priceType}</strong>
            </div>

            <div className="sale-detail-block">
              <span>Sucursal</span>
              <strong>{sale.branch}</strong>
            </div>

            <div className="sale-detail-block">
              <span>Total</span>
              <strong>{sale.total}</strong>
            </div>

            <div className="sale-detail-block">
              <span>Estado de pago</span>
              <strong>{sale.paymentStatusLabel || sale.payment_status}</strong>
            </div>
          </div>

          <div className="sale-products-section">
            <h3>Productos</h3>

            <div className="sale-products-table">
              <div className="sale-products-head">
                <span>PRODUCTO</span>
                <span>VARIANTE</span>
                <span>CANTIDAD</span>
                <span>PRECIO</span>
                <span>SUBTOTAL</span>
              </div>

              {sale.items.map((item, index) => (
                <div key={`${item.name}-${index}`} className="sale-products-row">
                  <span>{item.name}</span>
                  <span>{item.variant}</span>
                  <span>{item.quantity}</span>
                  <span>{item.price}</span>
                  <span>{item.subtotal}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="sale-summary-card">
            <div className="sale-summary-row">
              <span>Subtotal</span>
              <strong>{sale.subtotal}</strong>
            </div>

            <div className="sale-summary-row">
              <span>Envío</span>
              <strong>{sale.shipping}</strong>
            </div>

            <div className="sale-summary-row sale-summary-row-total">
              <span>Total final</span>
              <strong>{sale.total}</strong>
            </div>
          </div>
        </div>

        <div className="sale-details-footer">
          <button
            type="button"
            className="modal-cancel-text-btn"
            onClick={onClose}
          >
            CERRAR
          </button>

          {!isVoided ? (
            <>
              {isPending ? (
                <button
                  type="button"
                  className="admin-primary-btn"
                  onClick={() => onCompleteSale?.(sale)}
                >
                  Completar venta
                </button>
              ) : null}
              <button
                type="button"
                className="admin-secondary-btn"
                onClick={() => onVoidSale?.(sale)}
              >
                Anular venta
              </button>
            </>
          ) : (
            <span className="sales-origin-badge">VENTA ANULADA</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default SaleDetailsModal;