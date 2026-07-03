import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import DashboardLayout from '../../components/layout/DashboardLayout';
import BranchesGrid from '../../components/branches/BranchesGrid';
import BranchFormModal from '../../components/branches/BranchesFormModal';
import useBranches from '../../hooks/branches/UseBranches';

function BranchesPage({ theme, onToggleTheme }) {
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const navigate = useNavigate();
  const {
    branches,
    loading,
    error,
    getBranches,
    createBranch,
    updateBranch,
    deleteBranch,
  } = useBranches();

  useEffect(() => {
    getBranches();
  }, [getBranches]);

  const handleCreate = () => {
    setSelectedBranch(null);
    setBranchModalOpen(true);
  };

  const handleEdit = (branch) => {
    setSelectedBranch(branch);
    setBranchModalOpen(true);
  };

  const handleClose = () => {
    setBranchModalOpen(false);
    setSelectedBranch(null);
  };

  const handleSave = async (payload) => {
    if (!payload.name) {
      toast.error('El nombre de la sucursal es obligatorio.');
      return;
    }

    const result = selectedBranch
      ? await updateBranch(selectedBranch._id, payload)
      : await createBranch(payload);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(selectedBranch ? 'Sucursal actualizada.' : 'Sucursal creada.');
    handleClose();
    getBranches();
  };

  const handleDelete = async (branch) => {
    const confirmed = window.confirm(`Eliminar ${branch.name}?`);
    if (!confirmed) return;

    const result = await deleteBranch(branch._id);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success('Sucursal eliminada.');
    getBranches();
  };

  return (
    <DashboardLayout theme={theme} onToggleTheme={onToggleTheme}>
      <motion.div
        className="branches-page-shell"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      >
        <div className="page-title-row">
          <h1 className="admin-page-title">Sucursales y bodegas</h1>

          <button type="button" className="admin-primary-btn" onClick={handleCreate}>
            + Nueva Sucursal
          </button>
        </div>

        <BranchesGrid
          branches={branches}
          loading={loading}
          error={error}
          onEditBranch={handleEdit}
          onDeleteBranch={handleDelete}
          onViewInventory={() => navigate('/inventory')}
        />
      </motion.div>

      <BranchFormModal
        open={branchModalOpen}
        onClose={handleClose}
        onSubmit={handleSave}
        branchData={selectedBranch}
        isSaving={loading}
      />
    </DashboardLayout>
  );
}

export default BranchesPage;
