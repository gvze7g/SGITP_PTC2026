import { ChevronDown, Eye } from "lucide-react";

function SalesHistoryTable({ sales = [], loading, onViewSale }) {
  return (
    <section className="sales-history-panel">
      <div className="sales-filters-card">
        <div className="sales-filters-grid">
          <div className="sales-filter-block">
            <label>Origen</label>
            <button type="button" className="sales-filter-select">
              <span>Todos</span>
              <ChevronDown size={20} strokeWidth={1.8} />
            </button>
          </div>

          <div className="sales-filter-block">
            <label>Sucursal</label>
            <button type="button" className="sales-filter-select">
              <span>Todas las sucursales</span>
              <ChevronDown size={20} strokeWidth={1.8} />
            </button>
          </div>

          <div className="sales-filter-block">
            <label>Fecha</label>
            <button type="button" className="sales-filter-select">
              <span>Este mes</span>
              <ChevronDown size={20} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </div>

      <div className="sales-table-wrap">
        <div className="sales-head-row">
          <span>ID VENTA</span>
          <span>FECHA</span>
          <span>CLIENTE</span>
          <span>ORIGEN</span>
          <span>TIPO DE PRECIO</span>
          <span>TOTAL</span>
          <span>ACCIONES</span>
        </div>

        {loading ? (
          <div style={{ padding: "20px" }}>Cargando ventas...</div>
        ) : sales.length === 0 ? (
          <div style={{ padding: "20px" }}>No hay ventas registradas.</div>
        ) : (
          sales.map((sale) => (
            <article key={sale._id} className="sales-row">
              <div className="sales-id-cell">{sale.id}</div>
              <div className="sales-date-cell">{sale.date}</div>
              <div className="sales-client-cell">{sale.client}</div>
              <div className="sales-origin-cell">
                <span className="sales-origin-badge">{sale.origin}</span>
              </div>
              <div className="sales-price-type-cell">{sale.priceType}</div>
              <div className="sales-total-cell">{sale.total}</div>
              <div className="sales-actions-cell">
                <button
                  type="button"
                  className="sales-action-icon"
                  onClick={() => onViewSale?.(sale)}
                  aria-label="Ver venta"
                >
                  <Eye size={22} strokeWidth={2} />
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="sales-footer">
        <p>
          Mostrando {sales.length === 0 ? 0 : 1} a {sales.length} de {sales.length} ventas
        </p>

        <div className="sales-pagination">
          <button type="button" aria-label="Pagina anterior">
            {"<"}
          </button>
          <button type="button" className="sales-page-active">
            1
          </button>
          <button type="button">2</button>
          <button type="button">3</button>
          <button type="button" aria-label="Pagina siguiente">
            {">"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default SalesHistoryTable;
