import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import DashboardLayout from '../../components/layout/DashboardLayout';
import BranchesGrid from '../../components/branches/BranchesGrid';
import BranchFormModal from '../../components/branches/BranchesFormModal';
import useBranches from '../../hooks/branches/UseBranches';
import { isObjectId, validateBranchPayload } from '../../utils/adminValidation';

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

function BranchesPage({ theme, onToggleTheme }) {
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const navigate = useNavigate();
  const {
    branches,
    loading,
    error,
    getBranches,
    getBranchById,
    createBranch,
    updateBranch,
    deleteBranch,
  } = useBranches();

  useEffect(() => {
    getBranches();
  }, [getBranches]);

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
      getBranches();
      return;
    }

    if (!isObjectId(query)) {
      setSearchResult(null);
      return;
    }

    const result = await getBranchById(query);

    if (!result.success) {
      setSearchResult([]);
      toast.error(result.message);
      return;
    }

    setSearchResult(result.data ? [result.data] : []);
  };

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
    const validationMessage = validateBranchPayload(payload);

    if (validationMessage) {
      toast.error(validationMessage);
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

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const visibleBranches = searchResult ?? branches.filter((branch) => {
    if (!normalizedSearch) return true;

    return [
      branch._id,
      branch.name,
      branch.address,
      branch.phone,
      branch.email,
      branch.isActive === false ? 'inactiva' : 'operativa',
    ].some((value) => String(value ?? '').toLowerCase().includes(normalizedSearch));
  });

  return (
    <DashboardLayout
      theme={theme}
      onToggleTheme={onToggleTheme}
      searchValue={searchTerm}
      onSearchChange={handleSearchChange}
      onSearchSubmit={handleSearchSubmit}
      searchPlaceholder="Buscar sucursal por ID, nombre o contacto"
    >
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
          branches={visibleBranches}
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
