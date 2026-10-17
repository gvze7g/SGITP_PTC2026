import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ExpensesTable from '../../components/expenses/ExpensesTable';
import ExpenseFormModal from '../../components/expenses/ExpensesFormModal';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';
import CustomDropdown from '../../components/ui/CustomDropdown';
import useSpent from '../../hooks/spent/UseSpent';
import useBranches from '../../hooks/branches/UseBranches';
import { validateExpensePayload } from '../../utils/adminValidation';
import { getMonthKey, getMonthLabel, getTodayLabel } from '../../utils/dateRules';

const ALL_MONTHS = 'all';

// Mes "AAAA-MM" del gasto. Las fechas se guardan como medianoche UTC del día.
const getExpenseMonth = (expense) =>
  expense.expense_date ? new Date(expense.expense_date).toISOString().slice(0, 7) : null;

function ExpensesPage({ theme, onToggleTheme }) {
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const {
    spent,
    loading,
    error,
    getSpent,
    createSpent,
    updateSpent,
    deleteSpent,
  } = useSpent();
  const { branches, getBranches } = useBranches();
  const currentMonth = useMemo(() => getMonthKey(new Date()), []);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // Meses con gastos registrados (más el actual), del más reciente al más viejo.
  const monthOptions = useMemo(() => {
    const months = new Set([currentMonth, ...spent.map(getExpenseMonth).filter(Boolean)]);
    return [
      ...[...months]
        .sort((a, b) => b.localeCompare(a))
        .map((month) => ({
          value: month,
          label: `${getMonthLabel(month)}${month === currentMonth ? ' · Mes actual' : ''}`,
        })),
      { value: ALL_MONTHS, label: 'Todos los meses' },
    ];
  }, [spent, currentMonth]);

  const visibleExpenses = useMemo(
    () =>
      selectedMonth === ALL_MONTHS
        ? spent
        : spent.filter((expense) => getExpenseMonth(expense) === selectedMonth),
    [spent, selectedMonth]
  );

  useEffect(() => {
    getSpent();
    getBranches();
  }, [getBranches, getSpent]);

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

  const handleAskDelete = (expense) => {
    setExpenseToDelete(expense);
    setDeleteModalOpen(true);
  };

  const handleSaveExpense = async (payload) => {
    const validationMessage = validateExpensePayload(payload);

    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }

    const result = selectedExpense
      ? await updateSpent(selectedExpense._id, payload)
      : await createSpent(payload);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(selectedExpense ? 'Gasto actualizado.' : 'Gasto registrado.');
    handleCloseExpenseModal();
    getSpent();
  };

  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return;

    const result = await deleteSpent(expenseToDelete._id);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    setDeleteModalOpen(false);
    setExpenseToDelete(null);
    toast.success('Gasto eliminado correctamente.');
    getSpent();
  };

  return (
    <DashboardLayout
      theme={theme}
      onToggleTheme={onToggleTheme}
    >
      <motion.div
        className="expenses-page-shell"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      >
        <div className="page-title-row">
          <div>
            <h1 className="admin-page-title">Gastos operativos</h1>
            <p className="admin-page-subtitle">Hoy es {getTodayLabel()}</p>
          </div>

          <div className="page-actions-row">
            <CustomDropdown
              className="period-dropdown"
              value={selectedMonth}
              options={monthOptions}
              onChange={setSelectedMonth}
            />

            <button type="button" className="admin-primary-btn" onClick={handleCreateExpense}>
              + Registrar Gasto
            </button>
          </div>
        </div>

        <ExpensesTable
          expenses={visibleExpenses}
          periodLabel={selectedMonth === ALL_MONTHS ? 'Todos los meses' : getMonthLabel(selectedMonth)}
          loading={loading}
          error={error}
          onEditExpense={handleEditExpense}
          onDeleteExpense={handleAskDelete}
        />
      </motion.div>

      <ExpenseFormModal
        open={expenseModalOpen}
        onClose={handleCloseExpenseModal}
        onSubmit={handleSaveExpense}
        expenseData={selectedExpense}
        branches={branches}
        isSaving={loading}
      />

      <ConfirmDeleteModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setExpenseToDelete(null);
        }}
        onConfirm={handleDeleteExpense}
      />
    </DashboardLayout>
  );
}

export default ExpensesPage;
