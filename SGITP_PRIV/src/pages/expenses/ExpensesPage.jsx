import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ExpensesTable from '../../components/expenses/ExpensesTable';
import ExpenseFormModal from '../../components/expenses/ExpensesFormModal';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';
import useSpent from '../../hooks/spent/UseSpent';
import useBranches from '../../hooks/branches/UseBranches';
import { isObjectId, validateExpensePayload } from '../../utils/adminValidation';

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

function ExpensesPage({ theme, onToggleTheme }) {
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const {
    spent,
    loading,
    error,
    getSpent,
    getSpentById,
    createSpent,
    updateSpent,
    deleteSpent,
  } = useSpent();
  const { branches, getBranches } = useBranches();

  useEffect(() => {
    getSpent();
    getBranches();
  }, [getBranches, getSpent]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);

    if (!value.trim() || !OBJECT_ID_PATTERN.test(value.trim())) {
      setSearchResult(null);
    }
  };

  const handleSearchSubmit = async () => {
    const query = searchTerm.trim();

    if (!query) {
      setSearchResult(null);
      getSpent();
      return;
    }

    if (!isObjectId(query)) {
      setSearchResult(null);
      return;
    }

    const result = await getSpentById(query);

    if (!result.success) {
      setSearchResult([]);
      toast.error(result.message);
      return;
    }

    setSearchResult(result.data ? [result.data] : []);
  };

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

  const getBranchName = (expense) => {
    if (expense.branch_id?.name) return expense.branch_id.name;
    const branch = branches.find((item) => item._id === expense.branch_id);
    return branch?.name ?? '';
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const visibleExpenses = searchResult ?? spent.filter((expense) => {
    if (!normalizedSearch) return true;

    return [
      expense._id,
      expense.descriptions,
      expense.description,
      expense.expense_type,
      expense.payment_method,
      getBranchName(expense),
    ].some((value) => String(value ?? '').toLowerCase().includes(normalizedSearch));
  });

  return (
    <DashboardLayout
      theme={theme}
      onToggleTheme={onToggleTheme}
      searchValue={searchTerm}
      onSearchChange={handleSearchChange}
      onSearchSubmit={handleSearchSubmit}
      searchPlaceholder="Buscar gasto por ID, descripcion, tipo o sucursal"
    >
      <motion.div
        className="expenses-page-shell"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      >
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
          expenses={visibleExpenses}
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
