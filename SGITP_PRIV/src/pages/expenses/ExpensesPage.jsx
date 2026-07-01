import { useState } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ExpensesTable from '../../components/expenses/ExpensesTable';
import ExpenseFormModal from '../../components/expenses/ExpensesFormModal';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';

function ExpensesPage({ theme, onToggleTheme }) {
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleCreateExpense = () => {
    setSelectedExpense(null);
    setExpenseModalOpen(true);
  };

  const handleEditExpense = (expense) => {
    setSelectedExpense(expense);
    setExpenseModalOpen(true);
  };

  const handleCloseExpenseModal = () => {
    setExpenseModalOpen(false);
    setSelectedExpense(null);
  };

  return (
    <DashboardLayout theme={theme} onToggleTheme={onToggleTheme}>
      <div className="page-title-row">
        <h1 className="admin-page-title">Gastos operativos</h1>

        <div className="page-actions-row">
          <button type="button" className="admin-secondary-btn">
            Octubre 2023
          </button>

          <button type="button" className="admin-primary-btn" onClick={handleCreateExpense}>
            + Registrar Gasto
          </button>
        </div>
      </div>

      <ExpensesTable
        onEditExpense={handleEditExpense}
        onDeleteExpense={() => setDeleteModalOpen(true)}
      />

      <ExpenseFormModal
        open={expenseModalOpen}
        onClose={handleCloseExpenseModal}
        expenseData={selectedExpense}
      />

      <ConfirmDeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          setDeleteModalOpen(false);
          toast.success('Gasto eliminado correctamente.');
        }}
      />
    </DashboardLayout>
  );
}

export default ExpensesPage;