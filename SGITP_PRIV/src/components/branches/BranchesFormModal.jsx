import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CustomDropdown from "../ui/CustomDropdown";
import DateField from "../ui/DateField";

const BRANCH_STATUS_OPTIONS = [
  { value: "Active", label: "Activa" },
  { value: "Inactive", label: "Inactiva" },
];

const EMPTY_FORM = {
  name: "",
  address: "",
  phone: "",
  manager: "",
  openingDate: null,
  status: "Active",
};

function BranchFormModal({ open, onClose, branchData = null }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const isEditMode = Boolean(branchData);

  useEffect(() => {
    if (!open) return;

    if (branchData) {
      setFormData({
        name: branchData.name ?? "",
        address: branchData.address ?? "",
        phone: branchData.phone ?? "",
        manager: branchData.manager ?? "",
        openingDate: branchData.opening_date ? new Date(branchData.opening_date) : null,
        status: branchData.status ?? "Active",
      });
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [open, branchData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePhoneChange = (value) => {
    const phoneRegex = /^[0-9+\-\s]*$/;
    if (!phoneRegex.test(value)) return;
    handleChange("phone", value);
  };

  const buildPayload = () => {
    return {
      name: formData.name.trim(),
      address: formData.address.trim(),
      phone: formData.phone.trim(),
      manager: formData.manager.trim(),
      opening_date: formData.openingDate
        ? formData.openingDate.toISOString().split("T")[0]
        : null,
      status: formData.status,
    };
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = buildPayload();
    console.log("Branch payload:", payload);
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
            className="branch-form-modal"
            initial={{ opacity: 0, scale: 0.97, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 18 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="branch-form-header">
              <h2>{isEditMode ? "Editar Sucursal" : "Registrar Sucursal"}</h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="branch-form-body">
                <div className="branch-form-group">
                  <label>Nombre de la sucursal</label>
                  <input
                    type="text"
                    className="form-editable-input"
                    placeholder="Ej. Sucursal Centro"
                    value={formData.name}
                    onChange={(event) => handleChange("name", event.target.value)}
                  />
                </div>

                <div className="branch-form-group">
                  <label>Dirección</label>
                  <input
                    type="text"
                    className="form-editable-input"
                    placeholder="Ej. Avenida Central, local 12"
                    value={formData.address}
                    onChange={(event) => handleChange("address", event.target.value)}
                  />
                </div>

                <div className="branch-form-row">
                  <div className="branch-form-group">
                    <label>Teléfono</label>
                    <input
                      type="text"
                      className="form-editable-input"
                      placeholder="Ej. +503 2222-2222"
                      value={formData.phone}
                      onChange={(event) => handlePhoneChange(event.target.value)}
                    />
                  </div>

                  <div className="branch-form-group">
                    <label>Encargado</label>
                    <input
                      type="text"
                      className="form-editable-input"
                      placeholder="Ej. María López"
                      value={formData.manager}
                      onChange={(event) => handleChange("manager", event.target.value)}
                    />
                  </div>
                </div>

                <div className="branch-form-row">
                  <DateField
                    label="Fecha de apertura"
                    value={formData.openingDate}
                    onChange={(date) => handleChange("openingDate", date)}
                    placeholder="Seleccionar fecha"
                    maxDate={new Date()}
                  />

                  <CustomDropdown
                    label="Estado"
                    value={formData.status}
                    options={BRANCH_STATUS_OPTIONS}
                    onChange={(value) => handleChange("status", value)}
                  />
                </div>
              </div>

              <div className="branch-form-footer">
                <button
                  type="button"
                  className="modal-cancel-text-btn"
                  onClick={onClose}
                >
                  CANCELAR
                </button>

                <button type="submit" className="modal-save-btn">
                  {isEditMode ? "Guardar cambios" : "Guardar sucursal"}
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

export default BranchFormModal;