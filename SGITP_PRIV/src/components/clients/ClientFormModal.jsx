import { Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import CustomDropdown from "../ui/CustomDropdown";

const CLIENT_TYPE_OPTIONS = [
  { value: "Client", label: "Cliente" },
  { value: "Wholesale", label: "Mayorista" },
];

const EMPTY_FORM = {
  fullName: "",
  email: "",
  type: "Client",
  phones: ["+503"],
  addresses: [
    {
      label: "",
      street: "",
      city: "",
      reference: "",
    },
  ],
};

function ClientFormModal({ open, onClose, clientData = null }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const isEditMode = Boolean(clientData);

  const lastNameWarningRef = useRef(0);
  const lastPhoneWarningRef = useRef(0);

  useEffect(() => {
    if (!open) return;

    if (clientData) {
      setFormData({
        fullName: clientData.fullName ?? "",
        email: clientData.email ?? "",
        type:
          clientData.type === "Cliente"
            ? "Client"
            : clientData.type === "Mayorista"
            ? "Wholesale"
            : clientData.type ?? "Client",
        phones: clientData.phones?.length ? clientData.phones : ["+503"],
        addresses: clientData.addresses?.length
          ? clientData.addresses
          : [
              {
                label: "",
                street: "",
                city: "",
                reference: "",
              },
            ],
      });
    } else {
      setFormData(EMPTY_FORM);
    }

    lastNameWarningRef.current = 0;
    lastPhoneWarningRef.current = 0;
  }, [open, clientData]);

  const showRateLimitedWarning = (ref, message) => {
    const now = Date.now();

    if (now - ref.current > 1500) {
      toast.warning(message);
      ref.current = now;
    }
  };

  const handleFullNameChange = (value) => {
    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]*$/;

    if (!nameRegex.test(value)) {
      showRateLimitedWarning(
        lastNameWarningRef,
        "El nombre solo puede contener letras y espacios."
      );
      return;
    }

    setFormData((prev) => ({ ...prev, fullName: value }));
  };

  const updatePhone = (index, value) => {
    const phoneRegex = /^[0-9+\-\s]*$/;

    if (!phoneRegex.test(value)) {
      showRateLimitedWarning(
        lastPhoneWarningRef,
        "El teléfono solo puede contener números, espacios, + y guion."
      );
      return;
    }

    setFormData((prev) => {
      const updated = [...prev.phones];
      updated[index] = value;
      return { ...prev, phones: updated };
    });
  };

  const addPhone = () => {
    setFormData((prev) => ({
      ...prev,
      phones: [...prev.phones, "+503"],
    }));
  };

  const removePhone = (index) => {
    setFormData((prev) => ({
      ...prev,
      phones: prev.phones.filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  const updateAddress = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.addresses];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, addresses: updated };
    });
  };

  const removeAddress = (index) => {
    setFormData((prev) => ({
      ...prev,
      addresses: prev.addresses.filter((_, currentIndex) => currentIndex !== index),
    }));
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
            className="client-form-modal"
            initial={{ opacity: 0, scale: 0.97, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 18 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="client-form-header">
              <h2>{isEditMode ? "Editar Cliente" : "Registrar Cliente"}</h2>
            </div>

            <div className="client-form-body">
              <div className="client-form-group">
                <label>Nombre Completo</label>
                <input
                  type="text"
                  className="form-editable-input"
                  placeholder="Ej. Lucía Méndez"
                  value={formData.fullName}
                  onChange={(event) => handleFullNameChange(event.target.value)}
                />
              </div>

              <div className="client-form-row">
                <div className="client-form-group">
                  <label>Correo</label>
                  <input
                    type="email"
                    className="form-editable-input"
                    placeholder="correo@ejemplo.com"
                    value={formData.email}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, email: event.target.value }))
                    }
                  />
                </div>

                <CustomDropdown
                  label="Tipo de Cliente"
                  value={formData.type}
                  options={CLIENT_TYPE_OPTIONS}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, type: value }))
                  }
                />
              </div>

              <div className="client-form-divider" />

              <div className="client-section-title">TELÉFONOS</div>

              <div className="client-phones-list">
                {formData.phones.map((phone, index) => (
                  <div key={`phone-${index}`} className="client-phone-row">
                    <input
                      type="text"
                      className="form-editable-input"
                      value={phone}
                      onChange={(event) => updatePhone(index, event.target.value)}
                    />

                    <button
                      type="button"
                      className="client-trash-btn"
                      onClick={() => removePhone(index)}
                    >
                      <Trash2 size={16} strokeWidth={1.8} />
                    </button>
                  </div>
                ))}
              </div>

              <button type="button" className="client-add-link" onClick={addPhone}>
                + Agregar otro teléfono
              </button>

              <div className="client-form-divider" />

              <div className="client-section-title">DIRECCIONES</div>

              <div className="client-addresses-list">
                {formData.addresses.map((address, index) => (
                  <div key={`address-${index}`} className="client-address-card">
                    <button
                      type="button"
                      className="client-address-remove"
                      onClick={() => removeAddress(index)}
                    >
                      <Trash2 size={16} strokeWidth={1.8} />
                    </button>

                    <div className="client-form-group">
                      <label>Etiqueta (Ej. Taller, Oficina)</label>
                      <input
                        type="text"
                        className="form-editable-input"
                        value={address.label}
                        onChange={(event) => updateAddress(index, "label", event.target.value)}
                      />
                    </div>

                    <div className="client-form-group">
                      <label>Calle y Número</label>
                      <input
                        type="text"
                        className="form-editable-input"
                        value={address.street}
                        onChange={(event) => updateAddress(index, "street", event.target.value)}
                      />
                    </div>

                    <div className="client-form-row">
                      <div className="client-form-group">
                        <label>Ciudad</label>
                        <input
                          type="text"
                          className="form-editable-input"
                          value={address.city}
                          onChange={(event) => updateAddress(index, "city", event.target.value)}
                        />
                      </div>

                      <div className="client-form-group">
                        <label>Referencia</label>
                        <input
                          type="text"
                          className="form-editable-input"
                          value={address.reference}
                          onChange={(event) =>
                            updateAddress(index, "reference", event.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="client-form-footer">
              <button type="button" className="modal-cancel-text-btn" onClick={onClose}>
                CANCELAR
              </button>

              <button type="button" className="modal-save-btn" onClick={onClose}>
                {isEditMode ? "Guardar cambios" : "Guardar cliente"}
                <span className="modal-save-arrow">›</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default ClientFormModal;