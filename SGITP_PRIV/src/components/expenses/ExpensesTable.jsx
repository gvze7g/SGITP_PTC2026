import { Pencil, Trash2 } from "lucide-react";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

function getTopCategory(expenses) {
  const totals = expenses.reduce((acc, expense) => {
    const category = expense.expense_type || "Other";
    acc[category] = (acc[category] || 0) + Number(expense.amount || 0);
    return acc;
  }, {});

  const [category, amount] =
    Object.entries(totals).sort((a, b) => b[1] - a[1])[0] || [];

  return {
    category: category || "-",
    amount: amount || 0,
  };
}

function ExpensesTable({
  expenses = [],
  loading = false,
  error = "",
  onEditExpense,
  onDeleteExpense,
}) {
  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const topCategory = getTopCategory(expenses);

  return (
    <section className="expenses-page">
      <div className="expenses-summary-grid">
        <div className="metric-card">
          <span className="metric-card-label">TOTAL GASTOS</span>
          <h3 className="metric-card-value">{formatCurrency(total)}</h3>
        </div>

        <div className="metric-card">
          <span className="metric-card-label">CATEGORIA DE MAYOR GASTO</span>
          <div className="expenses-highlight-block">
            <strong>{topCategory.category}</strong>
            <p>{formatCurrency(topCategory.amount)}</p>
          </div>
        </div>
      </div>

      {error ? <p className="admin-error-text">{error}</p> : null}
      {loading ? <p className="admin-muted-text">Cargando gastos...</p> : null}

      <div className="expenses-table-wrap">
        <div className="expenses-head-row">
          <span>FECHA DE PAGO</span>
          <span>CATEGORIA</span>
          <span>DESCRIPCION</span>
          <span>SUCURSAL</span>
          <span>MONTO</span>
          <span>METODO DE PAGO</span>
          <span>ACCIONES</span>
        </div>

        {!loading && expenses.length === 0 ? (
          <article className="expenses-row">
            <div className="expenses-description-cell">No hay gastos registrados.</div>
          </article>
        ) : null}

        {expenses.map((expense) => (
          <article key={expense._id} className="expenses-row">
            <div className="expenses-date-cell">{formatDate(expense.expense_date)}</div>

            <div className="expenses-category-cell">
              <span className="expenses-category-badge">
                {expense.expense_type || "Other"}
              </span>
            </div>

            <div className="expenses-description-cell">
              {expense.descriptions || expense.description || "-"}
            </div>
            <div className="expenses-branch-cell">
              {expense.branch_id?.name || expense.branch_name || "-"}
            </div>
            <div className="expenses-amount-cell">{formatCurrency(expense.amount)}</div>
            <div className="expenses-method-cell">{expense.payment_method || "-"}</div>

            <div className="expenses-actions-cell">
              <button
                type="button"
                className="expenses-action-icon"
                onClick={() => onEditExpense?.(expense)}
                aria-label="Editar gasto"
              >
                <Pencil size={20} strokeWidth={2} />
              </button>

              <button
                type="button"
                className="expenses-action-icon"
                onClick={() => onDeleteExpense?.(expense)}
                aria-label="Eliminar gasto"
              >
                <Trash2 size={20} strokeWidth={2} />
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="expenses-footer">
        <p>Mostrando {expenses.length} gastos</p>
      </div>
    </section>
  );
}

export default ExpensesTable;
