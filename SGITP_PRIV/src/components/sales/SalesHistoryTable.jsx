import { useMemo, useState } from "react";
import { ChevronDown, Eye } from "lucide-react";

const PAGE_SIZE = 10;

function SalesHistoryTable({
  sales = [],
  loading,
  onViewSale,
  filters = { origin: "all", branch: "all", date: "all" },
  onFilterChange,
  originOptions = {},
  branchOptions = [],
  dateOptions = {},
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const filterFields = [
    { name: "origin", label: "Origen", options: { all: "Todos", ...originOptions } },
    {
      name: "branch",
      label: "Sucursal",
      options: {
        all: "Todas las sucursales",
        ...Object.fromEntries(branchOptions.map((branch) => [branch, branch])),
      },
    },
    { name: "date", label: "Fecha", options: dateOptions },
  ];

  const handleFilterChange = (name, value) => {
    setCurrentPage(1);
    onFilterChange?.(name, value);
  };
  const totalPages = Math.max(1, Math.ceil(sales.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pagedSales = useMemo(
    () => sales.slice(startIndex, startIndex + PAGE_SIZE),
    [sales, startIndex]
  );
  const showingFrom = sales.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + pagedSales.length, sales.length);

  return (
    <section className="sales-history-panel">
      <div className="sales-filters-card">
        <div className="sales-filters-grid">
          {filterFields.map((field) => (
            <div key={field.name} className="sales-filter-block">
              <label htmlFor={`sales-filter-${field.name}`}>{field.label}</label>
              <div style={{ position: "relative" }}>
                <button type="button" className="sales-filter-select" tabIndex={-1} aria-hidden="true">
                  <span>{field.options[filters[field.name]] ?? field.options.all}</span>
                  <ChevronDown size={20} strokeWidth={1.8} />
                </button>
                <select
                  id={`sales-filter-${field.name}`}
                  value={filters[field.name]}
                  onChange={(event) => handleFilterChange(field.name, event.target.value)}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
                >
                  {Object.entries(field.options).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sales-table-wrap">
        <div className="sales-head-row">
          <span>ID VENTA</span>
          <span>FECHA</span>
          <span>CLIENTE</span>
          <span>ORIGEN</span>
          <span>TIPO DE PRECIO</span>
          <span>ESTADO</span>
          <span>TOTAL</span>
          <span>ACCIONES</span>
        </div>

        {loading ? (
          <div style={{ padding: "20px" }}>Cargando ventas...</div>
        ) : sales.length === 0 ? (
          <div style={{ padding: "20px" }}>No hay ventas registradas.</div>
        ) : (
          pagedSales.map((sale) => (
            <article key={sale._id} className="sales-row">
              <div className="sales-id-cell">{sale.id}</div>
              <div className="sales-date-cell">{sale.date}</div>
              <div className="sales-client-cell">{sale.client}</div>
              <div className="sales-origin-cell">
                <span className="sales-origin-badge">{sale.origin}</span>
              </div>
              <div className="sales-price-type-cell">{sale.priceType}</div>
              <div className="sales-status-cell">
                <span
                  className={`sales-origin-badge${sale.isPending ? " sales-status-pending" : ""}`}
                >
                  {sale.paymentStatusLabel || sale.payment_status}
                </span>
              </div>
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
          Mostrando {showingFrom} a {showingTo} de {sales.length} ventas
        </p>

        <div className="sales-pagination">
          <button
            type="button"
            aria-label="Pagina anterior"
            disabled={safePage === 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          >
            {"<"}
          </button>

          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              type="button"
              className={safePage === index + 1 ? "sales-page-active" : ""}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}

          <button
            type="button"
            aria-label="Pagina siguiente"
            disabled={safePage === totalPages}
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
          >
            {">"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default SalesHistoryTable;
