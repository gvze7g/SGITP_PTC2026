import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CustomDropdown from "../ui/CustomDropdown";
import DateField from "../ui/DateField";

const PROMOTION_STATUS_OPTIONS = [
  { value: true, label: "Activa" },
  { value: false, label: "Inactiva" },
];

const EMPTY_FORM = {
  couponCode: "",
  descriptions: "",
  discountPercentage: "",
  startDate: null,
  endDate: null,
  isActive: true,
};

function PromotionFormModal({ open, onClose, promotionData = null }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const isEditMode = Boolean(promotionData);

  useEffect(() => {
    if (!open) return;

    if (promotionData) {
      setFormData({
        couponCode: promotionData.coupon_code ?? "",
        descriptions: promotionData.descriptions ?? "",
        discountPercentage:
          promotionData.discount_percentage !== undefined &&
          promotionData.discount_percentage !== null
            ? String(promotionData.discount_percentage)
            : "",
        startDate: promotionData.start_date ? new Date(promotionData.start_date) : null,
        endDate: promotionData.end_date ? new Date(promotionData.end_date) : null,
        isActive:
          typeof promotionData.isActive === "boolean" ? promotionData.isActive : true,
      });
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [open, promotionData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDiscountChange = (value) => {
    const sanitized = value.replace(/[^\d]/g, "");

    if (sanitized === "") {
      handleChange("discountPercentage", "");
      return;
    }

    const numericValue = Number(sanitized);

    if (numericValue > 100) {
      handleChange("discountPercentage", "100");
      return;
    }

    handleChange("discountPercentage", sanitized);
  };

  const buildPayload = () => {
    return {
      coupon_code: formData.couponCode.trim(),
      descriptions: formData.descriptions.trim(),
      discount_percentage: formData.discountPercentage
        ? Number(formData.discountPercentage)
        : 0,
      start_date: formData.startDate
        ? formData.startDate.toISOString().split("T")[0]
        : null,
      end_date: formData.endDate
        ? formData.endDate.toISOString().split("T")[0]
        : null,
      isActive: formData.isActive,
    };
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = buildPayload();
    console.log("Promotion payload:", payload);
    onClose?.();
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="app-modal-overlay app-modal-overlay-dark"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="promotion-form-modal"
            initial={{ opacity: 0, scale: 0.97, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 18 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="promotion-form-header">
              <h2>{isEditMode ? "Editar Promoción" : "Registrar Promoción"}</h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="promotion-form-body">
                <div className="promotion-form-row">
                  <div className="client-form-group">
                    <label>Código del cupón</label>
                    <input
                      type="text"
                      placeholder="Ej. VERANO2026"
                      value={formData.couponCode}
                      onChange={(event) => handleChange("couponCode", event.target.value)}
                    />
                  </div>

                  <div className="client-form-group">
                    <label>Porcentaje de descuento</label>
                    <input
                      type="text"
                      placeholder="Ej. 15"
                      value={formData.discountPercentage}
                      onChange={(event) => handleDiscountChange(event.target.value)}
                    />
                  </div>
                </div>

                <div className="client-form-group">
                  <label>Descripción</label>
                  <input
                    type="text"
                    placeholder="Ej. Promoción de temporada"
                    value={formData.descriptions}
                    onChange={(event) => handleChange("descriptions", event.target.value)}
                  />
                </div>

                <div className="promotion-form-row">
                  <DateField
                    label="Fecha de inicio"
                    value={formData.startDate}
                    onChange={(date) => handleChange("startDate", date)}
                    placeholder="Seleccionar fecha"
                  />

                  <DateField
                    label="Fecha de finalización"
                    value={formData.endDate}
                    onChange={(date) => handleChange("endDate", date)}
                    placeholder="Seleccionar fecha"
                    minDate={formData.startDate || undefined}
                  />
                </div>

                <div className="promotion-form-row">
                  <CustomDropdown
                    label="Estado"
                    value={formData.isActive}
                    options={PROMOTION_STATUS_OPTIONS}
                    onChange={(value) => handleChange("isActive", value)}
                  />
                </div>
              </div>

              <div className="promotion-form-footer">
                <button
                  type="button"
                  className="modal-cancel-text-btn"
                  onClick={onClose}
                >
                  CANCELAR
                </button>

                <button type="submit" className="modal-save-btn">
                  {isEditMode ? "Guardar cambios" : "Guardar promoción"}
                  <span className="modal-save-arrow">›</span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default PromotionFormModal;