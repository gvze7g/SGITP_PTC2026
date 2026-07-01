import { ChevronDown, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const EMPTY_FORM = {
  fullName: '',
  email: '',
  type: 'MAYORISTA',
  phones: ['+503'],
  addresses: [
    {
      label: '',
      street: '',
      city: '',
      reference: '',
    },
  ],
};

function ClientFormModal({ open, onClose, clientData = null }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const isEditMode = Boolean(clientData);

  useEffect(() => {
    if (!open) return;

    if (clientData) {
      setFormData({
        fullName: clientData.fullName ?? '',
        email: clientData.email ?? '',
        type: (clientData.type ?? 'MAYORISTA').toUpperCase(),
        phones: clientData.phones?.length ? clientData.phones : ['+503'],
        addresses: clientData.addresses?.length
          ? clientData.addresses
          : [
              {
                label: '',
                street: '',
                city: '',
                reference: '',
              },
            ],
      });
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [open, clientData]);

  const updatePhone = (index, value) => {
    setFormData((prev) => {
      const updated = [...prev.phones];
      updated[index] = value;
      return { ...prev, phones: updated };
    });
  };

  const addPhone = () => {
    setFormData((prev) => ({
      ...prev,
      phones: [...prev.phones, '+503'],
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

  if (!open) return null;

  return (
    <div className="app-modal-overlay app-modal-overlay-dark">
      <div className="client-form-modal">
        <div className="client-form-header">
          <h2>{isEditMode ? 'Editar Cliente' : 'Registrar Cliente'}</h2>
        </div>

        <div className="client-form-body">
          <div className="client-form-group">
            <label>Nombre Completo</label>
            <input
              type="text"
              placeholder="Ej. Lucía Méndez"
              value={formData.fullName}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, fullName: event.target.value }))
              }
            />
          </div>

          <div className="client-form-row">
            <div className="client-form-group">
              <label>Correo</label>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, email: event.target.value }))
                }
              />
            </div>

            <div className="client-form-group">
              <label>Tipo de Cliente</label>
              <button type="button" className="client-select-box">
                <span>{formData.type}</span>
                <ChevronDown size={22} strokeWidth={1.8} />
              </button>
            </div>
          </div>

          <div className="client-form-divider" />

          <div className="client-section-title">TELÉFONOS</div>

          <div className="client-phones-list">
            {formData.phones.map((phone, index) => (
              <div key={`phone-${index}`} className="client-phone-row">
                <input
                  type="text"
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
                    value={address.label}
                    onChange={(event) => updateAddress(index, 'label', event.target.value)}
                  />
                </div>

                <div className="client-form-group">
                  <label>Calle y Número</label>
                  <input
                    type="text"
                    value={address.street}
                    onChange={(event) => updateAddress(index, 'street', event.target.value)}
                  />
                </div>

                <div className="client-form-row">
                  <div className="client-form-group">
                    <label>Ciudad</label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(event) => updateAddress(index, 'city', event.target.value)}
                    />
                  </div>

                  <div className="client-form-group">
                    <label>Referencia</label>
                    <input
                      type="text"
                      value={address.reference}
                      onChange={(event) => updateAddress(index, 'reference', event.target.value)}
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
            {isEditMode ? 'Guardar cambios' : 'Guardar cliente'}
            <span className="modal-save-arrow">›</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClientFormModal;