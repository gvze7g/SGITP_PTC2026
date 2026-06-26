import { Pencil, Trash2 } from 'lucide-react';

const EXPENSES = [
  {
    id: 1,
    paymentDate: '12 Oct, 2025',
    category: 'Empaque',
    description: 'Bolsas de papel kraft premium (500 und)',
    branch: 'Tienda Principal',
    amount: '$250.00',
    amountValue: '250.00',
    paymentMethod: 'Cheque',
  },
  {
    id: 2,
    paymentDate: '12 Oct, 2025',
    category: 'Empaque',
    description: 'Bolsas de papel kraft premium (500 und)',
    branch: 'Tienda Principal',
    amount: '$750.00',
    amountValue: '750.00',
    paymentMethod: 'Cheque',
  },
  {
    id: 3,
    paymentDate: '12 Oct, 2025',
    category: 'Empaque',
    description: 'Bolsas de papel kraft premium (500 und)',
    branch: 'Tienda Principal',
    amount: '$500.00',
    amountValue: '500.00',
    paymentMethod: 'Cheque',
  },
];

function ExpensesTable({ onEditExpense, onDeleteExpense }) {
  return (
    <section className="expenses-page">
      <div className="expenses-summary-grid">
        <div className="metric-card">
          <span className="metric-card-label">TOTAL GASTOS DEL MES</span>
          <h3 className="metric-card-value">$1,500.00</h3>
        </div>

        <div className="metric-card">
          <span className="metric-card-label">CATEGORÍA DE MAYOR GASTO</span>
          <div className="expenses-highlight-block">
            <strong>Alquiler y servicios</strong>
            <p>$1,500.00</p>
          </div>
        </div>
      </div>

      <div className="expenses-table-wrap">
        <div className="expenses-head-row">
          <span>FECHA DE PAGO</span>
          <span>CATEGORÍA</span>
          <span>DESCRIPCION</span>
          <span>SUCURSAL</span>
          <span>MONTO</span>
          <span>METODO DE PAGO</span>
          <span>ACCIONES</span>
        </div>

        {EXPENSES.map((expense) => (
          <article key={expense.id} className="expenses-row">
            <div className="expenses-date-cell">{expense.paymentDate}</div>

            <div className="expenses-category-cell">
              <span className="expenses-category-badge">{expense.category}</span>
            </div>

            <div className="expenses-description-cell">{expense.description}</div>
            <div className="expenses-branch-cell">{expense.branch}</div>
            <div className="expenses-amount-cell">{expense.amount}</div>
            <div className="expenses-method-cell">{expense.paymentMethod}</div>

            <div className="expenses-actions-cell">
              <button
                type="button"
                className="expenses-action-icon"
                onClick={() => onEditExpense?.(expense)}
              >
                <Pencil size={20} strokeWidth={2} />
              </button>

              <button
                type="button"
                className="expenses-action-icon"
                onClick={onDeleteExpense}
              >
                <Trash2 size={20} strokeWidth={2} />
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="expenses-footer">
        <p>Mostrando 1 a 10</p>

        <div className="expenses-pagination">
          <button type="button">‹</button>
          <button type="button" className="expenses-page-active">1</button>
          <button type="button">2</button>
          <button type="button">3</button>
          <button type="button">›</button>
        </div>
      </div>
    </section>
  );
}

export default ExpensesTable;