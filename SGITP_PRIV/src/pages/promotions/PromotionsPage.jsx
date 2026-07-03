import { useEffect, useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PromotionsGrid from "../../components/promotions/PromotionsGrid";
import PromotionFormModal from "../../components/promotions/PromotionFormModal";
import ConfirmDeleteModal from "../../components/ui/ConfirmDeleteModal";
import usePromotions from "../../hooks/promotions/usePromotions";

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

function PromotionsPage({ theme, onToggleTheme }) {
  // hook con la lógica del CRUD
  const {
    promotions,
    loading,
    getPromotions,
    getPromotionById,
    createPromotion,
    updatePromotion,
    deletePromotion,
  } = usePromotions();

  // modal crear/editar
  const [promotionModalOpen, setPromotionModalOpen] = useState(false);

  // modal confirmar acción
  const [confirmDeactivateOpen, setConfirmDeactivateOpen] = useState(false);

  // promoción seleccionada
  const [selectedPromotion, setSelectedPromotion] = useState(null);

  // tipo de acción de confirmación
  const [confirmAction, setConfirmAction] = useState("deactivate");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  // cargar promociones
  useEffect(() => {
    getPromotions();
  }, [getPromotions]);

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
      getPromotions();
      return;
    }

    if (!OBJECT_ID_PATTERN.test(query)) {
      setSearchResult(null);
      return;
    }

    const result = await getPromotionById(query);

    if (!result.success) {
      setSearchResult([]);
      toast.error(result.message);
      return;
    }

    setSearchResult(result.data ? [result.data] : []);
  };

  // abrir crear
  const handleCreate = () => {
    setSelectedPromotion(null);
    setPromotionModalOpen(true);
  };

  // abrir editar
  const handleEdit = (promotion) => {
    setSelectedPromotion(promotion);
    setPromotionModalOpen(true);
  };

  // cerrar modal principal
  const handleClosePromotionModal = () => {
    setPromotionModalOpen(false);
    setSelectedPromotion(null);
  };

  // guardar promoción
  const handleSavePromotion = async (payload, isEditMode) => {
    let result;

    if (isEditMode && selectedPromotion?._id) {
      result = await updatePromotion(selectedPromotion._id, payload);
    } else {
      result = await createPromotion(payload);
    }

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(
      isEditMode
        ? "Promoción actualizada correctamente."
        : "Promoción creada correctamente."
    );

    handleClosePromotionModal();
    await getPromotions();
  };

  // abrir modal para desactivar
  const handleOpenDeactivate = (promotion) => {
    setSelectedPromotion(promotion);
    setConfirmAction("deactivate");
    setConfirmDeactivateOpen(true);
  };

  // abrir modal para eliminar
  const handleOpenDelete = (promotion) => {
    setSelectedPromotion(promotion);
    setConfirmAction("delete");
    setConfirmDeactivateOpen(true);
  };

  // cerrar modal confirmar
  const handleCloseConfirmModal = () => {
    setConfirmDeactivateOpen(false);
    setSelectedPromotion(null);
    setConfirmAction("deactivate");
  };

  // confirmar acción
  const handleConfirmAction = async () => {
    if (!selectedPromotion?._id) {
      toast.error("No se encontró la promoción.");
      return;
    }

    if (confirmAction === "delete") {
      const result = await deletePromotion(selectedPromotion._id);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success("Promoción eliminada correctamente.");
      handleCloseConfirmModal();
      await getPromotions();
      return;
    }

    const payload = {
      coupon_code: selectedPromotion.coupon_code,
      descriptions: selectedPromotion.descriptions || "",
      discount_percentage: selectedPromotion.discount_percentage,
      start_date: selectedPromotion.start_date,
      end_date: selectedPromotion.end_date,
      isActive: false,
    };

    const result = await updatePromotion(selectedPromotion._id, payload);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success("Promoción desactivada correctamente.");
    handleCloseConfirmModal();
    await getPromotions();
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const visiblePromotions = searchResult ?? promotions.filter((promotion) => {
    if (!normalizedSearch) return true;

    return [
      promotion._id,
      promotion.coupon_code,
      promotion.descriptions,
      promotion.discount_percentage,
      promotion.isActive ? "activo" : "inactivo",
    ].some((value) => String(value ?? "").toLowerCase().includes(normalizedSearch));
  });

  return (
    <DashboardLayout
      theme={theme}
      onToggleTheme={onToggleTheme}
      searchValue={searchTerm}
      onSearchChange={handleSearchChange}
      onSearchSubmit={handleSearchSubmit}
      searchPlaceholder="Buscar promocion por ID, codigo o estado"
    >
      <div className="promotions-page-shell">
        <div className="page-title-row">
          <h1 className="admin-page-title promotions-title-break">
            Campañas y
            <br />
            Promociones
          </h1>

          <button
            type="button"
            className="admin-primary-btn"
            onClick={handleCreate}
          >
            + Nuevo Código
          </button>
        </div>

        <PromotionsGrid
          promotions={visiblePromotions}
          loading={loading}
          onEditPromotion={handleEdit}
          onDeactivatePromotion={handleOpenDeactivate}
          onDeletePromotion={handleOpenDelete}
        />
      </div>

      <PromotionFormModal
        open={promotionModalOpen}
        onClose={handleClosePromotionModal}
        promotionData={selectedPromotion}
        onSubmit={handleSavePromotion}
        loading={loading}
      />

      <ConfirmDeleteModal
        open={confirmDeactivateOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmAction}
        title={
          confirmAction === "delete"
            ? "¿Deseas eliminar esta promoción?"
            : "¿Deseas desactivar esta promoción?"
        }
        description={
          confirmAction === "delete"
            ? "Esta acción eliminará por completo la promoción."
            : "La promoción dejará de estar activa para su uso."
        }
        confirmText={confirmAction === "delete" ? "ELIMINAR" : "DESACTIVAR"}
        cancelText="CANCELAR"
      />
    </DashboardLayout>
  );
}

export default PromotionsPage;
