import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import BranchesGrid from '../../components/branches/BranchesGrid';
import BranchFormModal from '../../components/branches/BranchesFormModal';

function BranchesPage({ theme, onToggleTheme }) {
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const navigate = useNavigate();

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
          onEditBranch={handleEdit}
          onViewInventory={() => navigate('/inventory')}
        />
      </motion.div>

      <BranchFormModal
        open={branchModalOpen}
        onClose={handleClose}
        branchData={selectedBranch}
      />
    </DashboardLayout>
  );
}

export default BranchesPage;