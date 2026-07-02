import { useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "../../components/layout/DashboardLayout";
import InventoryTable from "../../components/inventory/InventoryTable";
import CreateProductModal from "../../components/inventory/CreateProductModal";
import ConfirmDeleteModal from "../../components/ui/ConfirmDeleteModal";
import { useInventory } from "../../hooks/useInventory";

function InventoryPage({ theme, onToggleTheme }) {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedInventoryId, setSelectedInventoryId] = useState(null);

  const {
    inventory,
    loadingInventory,
    errorInventory,
    createInventory,
    deleteInventory,
  } = useInventory();

  const handleCreateInventory = async (payload) => {
    try {
      await createInventory(payload);
      toast.success("Producto creado correctamente.");
      setCreateModalOpen(false);
    } catch (error) {
      toast.error(error.message || "No se pudo crear el producto.");
    }
  };

  const handleOpenDeleteModal = (inventoryId) => {
    setSelectedInventoryId(inventoryId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedInventoryId) return;

    try {
      await deleteInventory(selectedInventoryId);
      toast.success("Producto eliminado correctamente.");
    } catch (error) {
      toast.error(error.message || "No se pudo eliminar el producto.");
    } finally {
      setDeleteModalOpen(false);
      setSelectedInventoryId(null);
    }
  };

  return (
    <DashboardLayout theme={theme} onToggleTheme={onToggleTheme}>
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

      {errorInventory && (
        <p style={{ color: "red", marginBottom: "12px" }}>{errorInventory}</p>
      )}

      <InventoryTable
        inventory={inventory}
        loading={loadingInventory}
        onOpenCreateModal={() => setCreateModalOpen(true)}
        onOpenDeleteModal={handleOpenDeleteModal}
      />

      <CreateProductModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateInventory}
      />

      <ConfirmDeleteModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedInventoryId(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </DashboardLayout>
  );
}

export default InventoryPage;