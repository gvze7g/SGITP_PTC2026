import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import InventoryTable from '../../components/inventory/InventoryTable';
import CreateProductModal from '../../components/inventory/CreateProductModal';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';

function InventoryPage({ currentView, onNavigate, theme, onToggleTheme }) {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <DashboardLayout
      currentView={currentView}
      onNavigate={onNavigate}
      theme={theme}
      onToggleTheme={onToggleTheme}
    >
      <div className="page-title-row">
        <h1 className="admin-page-title">Gestión de inventario</h1>

        <button
          type="button"
          className="admin-primary-btn"
          onClick={() => setCreateModalOpen(true)}
        >
          + Crear producto
        </button>
      </div>

      <InventoryTable
        onOpenCreateModal={() => setCreateModalOpen(true)}
        onOpenDeleteModal={() => setDeleteModalOpen(true)}
      />

      <CreateProductModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      <ConfirmDeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => setDeleteModalOpen(false)}
      />
    </DashboardLayout>
  );
}

export default InventoryPage;