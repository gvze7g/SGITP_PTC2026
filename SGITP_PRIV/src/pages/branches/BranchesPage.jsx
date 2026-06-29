import { useState } from 'react';
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

      <BranchFormModal
        open={branchModalOpen}
        onClose={handleClose}
        branchData={selectedBranch}
      />
    </DashboardLayout>
  );
}

export default BranchesPage;