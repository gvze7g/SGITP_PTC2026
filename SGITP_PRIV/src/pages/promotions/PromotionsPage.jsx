import { useState } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PromotionsGrid from '../../components/promotions/PromotionsGrid';
import PromotionFormModal from '../../components/promotions/PromotionFormModal';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';

function PromotionsPage({ theme, onToggleTheme }) {
  const [promotionModalOpen, setPromotionModalOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [confirmDeactivateOpen, setConfirmDeactivateOpen] = useState(false);

  const handleCreate = () => {
    setSelectedPromotion(null);
    setPromotionModalOpen(true);
  };

  const handleEdit = (promotion) => {
    setSelectedPromotion(promotion);
    setPromotionModalOpen(true);
  };

  const handleClosePromotionModal = () => {
    setPromotionModalOpen(false);
    setSelectedPromotion(null);
  };

  return (
    <DashboardLayout theme={theme} onToggleTheme={onToggleTheme}>
      <div className="page-title-row">
        <h1 className="admin-page-title promotions-title-break">
          Campañas y
          <br />
          Promociones
        </h1>

        <button type="button" className="admin-primary-btn" onClick={handleCreate}>
          + Nuevo Código
        </button>
      </div>

      <PromotionsGrid
        onEditPromotion={handleEdit}
        onDeactivatePromotion={(promotion) => {
          setSelectedPromotion(promotion);
          setConfirmDeactivateOpen(true);
        }}
      />

      <PromotionFormModal
        open={promotionModalOpen}
        onClose={handleClosePromotionModal}
        promotionData={selectedPromotion}
      />

      <ConfirmDeleteModal
        open={confirmDeactivateOpen}
        onClose={() => {
          setConfirmDeactivateOpen(false);
          setSelectedPromotion(null);
        }}
        onConfirm={() => {
          setConfirmDeactivateOpen(false);
          toast.success('Promoción desactivada correctamente.');
          setSelectedPromotion(null);
        }}
        title="¿Desea desactivar este código?"
        description="El código no se eliminará, pero su estado cambiará a expirado y dejará de estar disponible para uso."
        confirmText="DESACTIVAR"
        cancelText="CANCELAR"
      />
    </DashboardLayout>
  );
}

export default PromotionsPage;