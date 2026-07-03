import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

const EMPTY_PROMOTION = {
  code: "",
  description: "",
  discount: "",
  startDate: "",
  endDate: "",
  isActive: true,
};

function PromotionFormModal({
  open,
  onClose,
  promotionData = null,
  onSubmit,
  loading = false,
}) {
  // datos del formulario
  const [formData, setFormData] = useState(EMPTY_PROMOTION);

  // saber si estamos editando
  const isEditMode = useMemo(() => Boolean(promotionData), [promotionData]);

  // llenar formulario al abrir
  useEffect(() => {
    if (!open) return;

    if (promotionData) {
      setFormData({
        code: promotionData.coupon_code || "",
        description: promotionData.descriptions || "",
        discount: promotionData.discount_percentage || "",
        startDate: promotionData.start_date
          ? new Date(promotionData.start_date).toISOString().split("T")[0]
          : "",
        endDate: promotionData.end_date
          ? new Date(promotionData.end_date).toISOString().split("T")[0]
          : "",
        isActive:
          typeof promotionData.isActive === "boolean"
            ? promotionData.isActive
            : true,
      });
    } else {
      setFormData(EMPTY_PROMOTION);
    }
  }, [open, promotionData]);

  // cambiar campos
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // validar antes de guardar
  const validateForm = () => {
    if (!formData.code.trim()) {
      toast.error("El código de promoción es obligatorio.");
      return false;
    }

    if (!/^[a-zA-Z0-9]+$/.test(formData.code.trim())) {
      toast.error("El código solo debe contener letras y números.");
      return false;
    }

    if (formData.discount === "") {
      toast.error("El descuento es obligatorio.");
      return false;
    }

    if (Number(formData.discount) < 0) {
      toast.error("El descuento no puede ser menor que 0.");
      return false;
    }

    if (!formData.startDate || !formData.endDate) {
      toast.error("Debes completar la fecha de inicio y fin.");
      return false;
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      toast.error("La fecha final debe ser mayor que la fecha inicial.");
      return false;
    }

    return true;
  };

  // enviar datos al padre
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const payload = {
      coupon_code: formData.code.trim(),
      descriptions: formData.description.trim(),
      discount_percentage: Number(formData.discount),
      start_date: formData.startDate,
      end_date: formData.endDate,
      isActive: formData.isActive,
    };

    await onSubmit?.(payload, isEditMode);
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
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="promotion-form-header">
              <h2>
                {isEditMode
                  ? "Editar Código de Descuento"
                  : "Nuevo Código de Descuento"}
              </h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="promotion-form-body">
                <div className="promotion-line-group promotion-line-group-full">
                  <label>NOMBRE DEL CÓDIGO</label>
                  <input
                    type="text"
                    placeholder="Ej: VERANO20"
                    value={formData.code}
                    onChange={(event) => handleChange("code", event.target.value)}
                  />
                </div>

                <div className="promotion-line-group promotion-line-group-full">
                  <label>DESCRIPCIÓN</label>
                  <input
                    type="text"
                    placeholder="Ej: descuento general de temporada"
                    value={formData.description}
                    onChange={(event) =>
                      handleChange("description", event.target.value)
                    }
                  />
                </div>

                <div className="promotion-form-row">
                  <div className="promotion-line-group">
                    <label>DESCUENTO (%)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="15"
                      value={formData.discount}
                      onChange={(event) => handleChange("discount", event.target.value)}
                    />
                  </div>

                  <div className="promotion-line-group">
                    <label>ESTADO</label>
                    <select
                      value={formData.isActive ? "active" : "inactive"}
                      onChange={(event) =>
                        handleChange("isActive", event.target.value === "active")
                      }
                      className="promotion-line-select"
                    >
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div className="promotion-form-row">
                  <div className="promotion-line-group">
                    <label>FECHA DE INICIO</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(event) => handleChange("startDate", event.target.value)}
                    />
                  </div>

                  <div className="promotion-line-group">
                    <label>FECHA DE FINALIZACIÓN</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(event) => handleChange("endDate", event.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  marginTop: "20px",
                }}
              >
                <button
                  type="button"
                  className="admin-secondary-btn"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="admin-primary-btn"
                  disabled={loading}
                >
                  {loading
                    ? "Guardando..."
                    : isEditMode
                    ? "Actualizar promoción"
                    : "Guardar promoción"}
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