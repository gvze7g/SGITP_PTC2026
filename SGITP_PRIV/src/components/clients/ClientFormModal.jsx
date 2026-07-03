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

function mapPhoneNumbers(clientData) {
  if (clientData?.phone_numbers?.length) {
    return clientData.phone_numbers.map((phone) => phone.number || "");
  }

  if (clientData?.main_phone) return [clientData.main_phone];

  return ["+503"];
}

function mapAddresses(clientData) {
  if (clientData?.addresses?.length) {
    return clientData.addresses.map((address) => ({
      label: address.label || "",
      street: address.street_and_number || address.street || "",
      city: address.city || "",
      reference: address.reference || "",
    }));
  }

  return EMPTY_FORM.addresses;
}

function ClientFormModal({
  open,
  onClose,
  onSubmit,
  clientData = null,
  isSaving = false,
}) {
  const [formData, setFormData] = useState(EMPTY_FORM);

  const lastNameWarningRef = useRef(0);
  const lastPhoneWarningRef = useRef(0);

  useEffect(() => {
    if (!open || !clientData) return;

    setFormData({
      fullName: clientData.full_name ?? "",
      email: clientData.email ?? "",
      type: clientData.customer_type ?? "Client",
      phones: mapPhoneNumbers(clientData),
      addresses: mapAddresses(clientData),
    });

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
    const nameRegex = /^[A-Za-z\s]*$/;

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
        "El telefono solo puede contener numeros, espacios, + y guion."
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

  const addAddress = () => {
    setFormData((prev) => ({
      ...prev,
      addresses: [
        ...prev.addresses,
        { label: "", street: "", city: "", reference: "" },
      ],
    }));
  };

  const removeAddress = (index) => {
    setFormData((prev) => ({
      ...prev,
      addresses: prev.addresses.filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  const buildPayload = () => {
    const phoneNumbers = formData.phones
      .map((phone) => phone.trim())
      .filter(Boolean)
      .map((number, index) => ({ number, isPrimary: index === 0 }));

    const addresses = formData.addresses
      .filter((address) => address.label || address.street || address.city || address.reference)
      .map((address, index) => ({
        label: address.label.trim(),
        street_and_number: address.street.trim(),
        city: address.city.trim(),
        reference: address.reference.trim(),
        isPrimary: index === 0,
      }));

    return {
      ...clientData,
      customer_type: formData.type,
      full_name: formData.fullName.trim(),
      main_phone: phoneNumbers[0]?.number || "",
      email: formData.email.trim(),
      phone_numbers: phoneNumbers,
      addresses,
    };
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.(buildPayload());
  };

  return (
    <AnimatePresence>
      {open && clientData ? (
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
              <h2>Editar Cliente</h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="client-form-body">
                <div className="client-form-group">
                  <label>Nombre Completo</label>
                  <input
                    type="text"
                    className="form-editable-input"
                    placeholder="Ej. Lucia Mendez"
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

                <div className="client-section-title">TELEFONOS</div>

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
                  + Agregar otro telefono
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
                        <label>Etiqueta</label>
                        <input
                          type="text"
                          className="form-editable-input"
                          value={address.label}
                          onChange={(event) => updateAddress(index, "label", event.target.value)}
                        />
                      </div>

                      <div className="client-form-group">
                        <label>Calle y Numero</label>
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

                <button type="button" className="client-add-link" onClick={addAddress}>
                  + Agregar otra direccion
                </button>
              </div>

              <div className="client-form-footer">
                <button type="button" className="modal-cancel-text-btn" onClick={onClose}>
                  CANCELAR
                </button>

                <button type="submit" className="modal-save-btn" disabled={isSaving}>
                  {isSaving ? "Guardando..." : "Guardar cambios"}
                  <span className="modal-save-arrow">{">"}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default ClientFormModal;
