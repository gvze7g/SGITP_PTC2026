import { Pencil } from 'lucide-react';

export const PAYROLL_DATA = [
  {
    id: 1,
    employeeName: 'Carmen Vega',
    role: 'Cajera',
    branch: 'Tienda Principal',
    baseSalary: '$1,200.00',
    baseSalaryValue: '1200.00',
    deductions: '-$20.00',
    deductionsValue: '20.00',
    netSalary: '$1,180.00',
    netSalaryValue: '1180.00',
    paymentDate: '15 Oct, 2023',
    paymentDateLong: '15 de Noviembre, 2023',
    status: 'PAGADO',
    bonusesValue: '0.00',
  },
  {
    id: 2,
    employeeName: 'Jorge Ruiz',
    role: 'Atención',
    branch: 'Remoto',
    baseSalary: '$1,100.00',
    baseSalaryValue: '1100.00',
    deductions: '$0.00',
    deductionsValue: '0.00',
    netSalary: '$1,100.00',
    netSalaryValue: '1100.00',
    paymentDate: '--',
    paymentDateLong: '15 de Noviembre, 2023',
    status: 'PENDIENTE',
    bonusesValue: '0.00',
  },
  {
    id: 3,
    employeeName: 'Elena Silva',
    role: 'Gerente',
    branch: 'Tienda Sur',
    baseSalary: '$2,500.00',
    baseSalaryValue: '2500.00',
    deductions: '-$100.00',
    deductionsValue: '100.00',
    netSalary: '$2,400.00',
    netSalaryValue: '2400.00',
    paymentDate: '15 Oct, 2023',
    paymentDateLong: '15 de Noviembre, 2023',
    status: 'PAGADO',
    bonusesValue: '0.00',
  },
];

function PayrollTable({ onEditPayroll }) {
  return (
    <section className="payroll-panel">
      <div className="payroll-summary-grid">
        <div className="metric-card">
          <span className="metric-card-label">TOTAL NÓMINA BASE</span>
          <h3 className="metric-card-value">$14,500.00</h3>
        </div>

        <div className="metric-card">
          <span className="metric-card-label">TOTAL PAGADO ESTE MES</span>
          <h3 className="metric-card-value">$12,000.00</h3>
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

        {PAYROLL_DATA.map((item) => (
          <article key={item.id} className="payroll-row">
            <div className="payroll-employee-cell">
              <strong>{item.employeeName}</strong>
              <p>{item.role}</p>
            </div>

            <div className="payroll-branch-cell">{item.branch}</div>
            <div className="payroll-money-cell">{item.baseSalary}</div>
            <div className="payroll-money-cell payroll-money-negative">{item.deductions}</div>
            <div className="payroll-money-cell payroll-money-bold">{item.netSalary}</div>
            <div className="payroll-date-cell">{item.paymentDate}</div>

            <div className="payroll-status-cell">
              <span className="payroll-status-badge">{item.status}</span>
            </div>

            <div className="payroll-actions-cell">
              <button
                type="button"
                className="payroll-action-icon"
                onClick={() => onEditPayroll?.(item)}
              >
                <Pencil size={20} strokeWidth={2} />
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="payroll-footer">
        <p>Mostrando 1 a 10</p>

        <div className="payroll-pagination">
          <button type="button">‹</button>
          <button type="button" className="payroll-page-active">1</button>
          <button type="button">2</button>
          <button type="button">3</button>
          <button type="button">›</button>
        </div>
      </div>
    </section>
  );
}

export default PayrollTable;