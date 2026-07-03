import { useEffect, useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "../../components/layout/DashboardLayout";
import InventoryTable from "../../components/inventory/InventoryTable";
import CreateProductModal from "../../components/inventory/CreateProductModal";
import ConfirmDeleteModal from "../../components/ui/ConfirmDeleteModal";
import useProducts from "../../hooks/inventory/UseProducts";

function InventoryPage({ theme, onToggleTheme }) {
  // hook con la lógica del CRUD
  const {
    products,
    loading,
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProducts();

  // controla modal crear/editar
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // controla modal eliminar
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // producto seleccionado para editar
  const [selectedProduct, setSelectedProduct] = useState(null);

  // producto seleccionado para eliminar
  const [productToDelete, setProductToDelete] = useState(null);

  // cargar productos al entrar a la página
  useEffect(() => {
    getProducts();
  }, [getProducts]);

  // abrir modal para crear
  const handleOpenCreate = () => {
    setSelectedProduct(null);
    setCreateModalOpen(true);
  };

  // abrir modal para editar
  const handleOpenEdit = (product) => {
    setSelectedProduct(product);
    setCreateModalOpen(true);
  };

  // cerrar modal crear/editar
  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
    setSelectedProduct(null);
  };

  // abrir modal eliminar
  const handleOpenDeleteModal = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  // cerrar modal eliminar
  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  // guardar producto nuevo o editado
  const handleSaveProduct = async (payload, isEditMode) => {
    let result;

    if (isEditMode && selectedProduct?._id) {
      result = await updateProduct(selectedProduct._id, payload);
    } else {
      result = await createProduct(payload);
    }

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(
      isEditMode
        ? "Producto actualizado correctamente."
        : "Producto creado correctamente."
    );

    handleCloseCreateModal();
    await getProducts();
  };

  // confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!productToDelete?._id) {
      toast.error("No se encontró el producto a eliminar.");
      return;
    }

    const result = await deleteProduct(productToDelete._id);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success("Producto eliminado correctamente.");
    handleCloseDeleteModal();
    await getProducts();
  };

  return (
    <DashboardLayout theme={theme} onToggleTheme={onToggleTheme}>
      <div className="inventory-page-shell">
        <div className="page-title-row">
          <h1 className="admin-page-title">Gestión de inventario</h1>

          <button
            type="button"
            className="admin-primary-btn"
            onClick={handleOpenCreate}
          >
            + Crear producto
          </button>
        </div>

        <InventoryTable
          products={products}
          loading={loading}
          onEditProduct={handleOpenEdit}
          onDeleteProduct={handleOpenDeleteModal}
        />
      </div>

      <CreateProductModal
        open={createModalOpen}
        onClose={handleCloseCreateModal}
        onSubmit={handleSaveProduct}
        productData={selectedProduct}
        loading={loading}
      />

      <ConfirmDeleteModal
        open={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </DashboardLayout>
  );
}

export default InventoryPage;