import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "../../components/layout/DashboardLayout";
import InventoryTable from "../../components/inventory/InventoryTable";
import CreateProductModal from "../../components/inventory/CreateProductModal";
import ConfirmDeleteModal from "../../components/ui/ConfirmDeleteModal";
import useProducts from "../../hooks/Inventory/UseProducts";
import useDebounce from "../../hooks/useDebounce";
import { isObjectId, validateProductPayload } from "../../utils/adminValidation";

const DEFAULT_FILTERS = {
  search: "",
  minPrice: "",
  maxPrice: "",
  lowStockThreshold: 5,
};

function InventoryPage({ theme, onToggleTheme }) {
  const {
    products,
    loading,
    getProducts,
    getProductById,
    getLowStockProducts,
    searchProductsByName,
    getProductsByPriceRange,
    getProductsCount,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProducts();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  const [activeTab, setActiveTab] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  // Los filtros se escriben en vivo, pero solo se consulta al servidor cuando
  // el usuario deja de teclear; lastQueryKeyRef evita repetir la misma consulta.
  const debouncedFilters = useDebounce(filters, 400);
  const lastQueryKeyRef = useRef("");
  const [inventoryStats, setInventoryStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
  });

  const loadStats = useCallback(async () => {
    const result = await getProductsCount();

    if (result?.success && result.data) {
      setInventoryStats({
        totalProducts: result.data.totalProducts || 0,
        lowStockCount: result.data.lowStockCount || 0,
      });
    }
  }, [getProductsCount]);

  const fetchProducts = useCallback(async (
    currentFilters,
    { tab = activeTab, force = false } = {}
  ) => {
    const trimmedSearch = currentFilters.search.trim();
    const hasPriceFilter =
      currentFilters.minPrice !== "" || currentFilters.maxPrice !== "";

    const queryKey = JSON.stringify([
      tab,
      trimmedSearch,
      currentFilters.minPrice,
      currentFilters.maxPrice,
      currentFilters.lowStockThreshold,
    ]);

    if (!force && queryKey === lastQueryKeyRef.current) return;
    lastQueryKeyRef.current = queryKey;

    let result;

    if (tab === "low-stock") {
      result = await getLowStockProducts(currentFilters.lowStockThreshold || 5);
    } else if (trimmedSearch && isObjectId(trimmedSearch)) {
      result = await getProductById(trimmedSearch);
    } else if (trimmedSearch) {
      result = await searchProductsByName(trimmedSearch);
    } else if (hasPriceFilter) {
      result = await getProductsByPriceRange(
        currentFilters.minPrice,
        currentFilters.maxPrice
      );
    } else {
      result = await getProducts();
    }

    if (!result?.success) {
      // Permite reintentar la misma consulta si fallo.
      lastQueryKeyRef.current = "";
      toast.error(result?.message || "No se pudo cargar el inventario.");
    }
  }, [
    activeTab,
    getProductById,
    getLowStockProducts,
    searchProductsByName,
    getProductsByPriceRange,
    getProducts,
  ]);

  useEffect(() => {
    fetchProducts(debouncedFilters);
  }, [fetchProducts, debouncedFilters]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleOpenCreate = () => {
    setSelectedProduct(null);
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setSelectedProduct(product);
    setCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
    setSelectedProduct(null);
  };

  const handleOpenDeleteModal = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const handleSaveProduct = async (payload, isEditMode) => {
    const validationMessage = validateProductPayload(payload);

    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }

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
    await fetchProducts(filters, { force: true });
    await loadStats();
  };

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
    await fetchProducts(filters, { force: true });
    await loadStats();
  };

  const handleChangeFilter = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Enter o "Aplicar" consultan de inmediato sin esperar el debounce; si la
  // consulta ya se hizo, fetchProducts la descarta.
  const handleSearchSubmit = async () => {
    setActiveTab("all");
    await fetchProducts(filters, { tab: "all" });
  };

  const handleApplyPriceFilter = handleSearchSubmit;

  const handleResetFilters = async () => {
    setActiveTab("all");
    setFilters(DEFAULT_FILTERS);
    setFiltersOpen(false);

    await fetchProducts(DEFAULT_FILTERS, { tab: "all" });
    await loadStats();
  };

  const handleTabChange = async (tab) => {
    setActiveTab(tab);
  };

  return (
    <DashboardLayout
      theme={theme}
      onToggleTheme={onToggleTheme}
    >
      <div className="inventory-page-shell">
        <div className="page-title-row">
          <div>
            <h1 className="admin-page-title">Gestión de inventario</h1>
            <p style={{ marginTop: 6, opacity: 0.75 }}>
              Total: {inventoryStats.totalProducts} | Stock bajo:{" "}
              {inventoryStats.lowStockCount}
            </p>
          </div>

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
          activeTab={activeTab}
          filtersOpen={filtersOpen}
          filters={filters}
          onToggleFilters={() => setFiltersOpen((prev) => !prev)}
          onTabChange={handleTabChange}
          onChangeFilter={handleChangeFilter}
          onSearchSubmit={handleSearchSubmit}
          onApplyPriceFilter={handleApplyPriceFilter}
          onResetFilters={handleResetFilters}
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
