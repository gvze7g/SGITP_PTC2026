import { Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

const ITEMS_PER_PAGE = 6;
const formatMoney = (value) => `$${Number(value || 0).toFixed(2)}`;

function PayrollTable({
  payrolls = [],
  loading,
  totalBaseSalary = 0,
  totalPaidThisMonth = 0,
  onEditPayroll,
  onDeletePayroll,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(payrolls.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedPayroll = useMemo(
    () => payrolls.slice(startIndex, startIndex + ITEMS_PER_PAGE),
    [payrolls, startIndex]
  );
  const showingFrom = payrolls.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + paginatedPayroll.length, payrolls.length);

  return (
    <section className="payroll-panel">
      <div className="payroll-summary-grid">
        <div className="metric-card">
          <span className="metric-card-label">TOTAL NOMINA BASE (MES ACTUAL)</span>
          <h3 className="metric-card-value">{formatMoney(totalBaseSalary)}</h3>
        </div>

        <div className="metric-card">
          <span className="metric-card-label">TOTAL PAGADO ESTE MES</span>
          <h3 className="metric-card-value">{formatMoney(totalPaidThisMonth)}</h3>
        </div>
      </div>

      <div className="payroll-table-wrap">
        <div className="payroll-head-row">
          <span>Empleado</span>
          <span>Sucursal</span>
          <span>Salario fijo</span>
          <span>Deducciones / Faltas</span>
          <span>Neto a pagar</span>
          <span>Fecha de pago</span>
          <span>Estado</span>
          <span>Acciones</span>
        </div>

        {loading ? (
          <div style={{ padding: "20px" }}>Cargando nomina...</div>
        ) : payrolls.length === 0 ? (
          <div style={{ padding: "20px" }}>No hay registros de nomina todavia.</div>
        ) : (
          paginatedPayroll.map((item) => (
            <article key={item._id} className="payroll-row">
              <div className="payroll-employee-cell">
                <strong>{item.employeeName}</strong>
                <p>{item.role}</p>
              </div>

              <div className="payroll-branch-cell">{item.branch}</div>
              <div className="payroll-money-cell">{item.baseSalary}</div>
              <div className="payroll-money-cell payroll-money-negative">
                {item.deductions}
              </div>
              <div className="payroll-money-cell payroll-money-bold">
                {item.netSalary}
              </div>
              <div className="payroll-date-cell">{item.paymentDate}</div>

              <div className="payroll-status-cell">
                <span className="payroll-status-badge">{item.status}</span>
              </div>

              <div className="payroll-actions-cell">
                <button
                  type="button"
                  className="payroll-action-icon"
                  onClick={() => onEditPayroll?.(item)}
                  aria-label="Editar nomina"
                >
                  <Pencil size={20} strokeWidth={2} />
                </button>

                <button
                  type="button"
                  className="payroll-action-icon"
                  onClick={() => onDeletePayroll?.(item)}
                  aria-label="Eliminar nomina"
                >
                  <Trash2 size={20} strokeWidth={2} />
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="payroll-footer">
        <p>
          Mostrando {showingFrom} a {showingTo} de {payrolls.length}
        </p>

        <div className="payroll-pagination">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={safePage === 1}
            aria-label="Pagina anterior"
          >
            {"<"}
          </button>
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              type="button"
              className={safePage === index + 1 ? "payroll-page-active" : ""}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={safePage === totalPages}
            aria-label="Pagina siguiente"
          >
            {">"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default PayrollTable;
