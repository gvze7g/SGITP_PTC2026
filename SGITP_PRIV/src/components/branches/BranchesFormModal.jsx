import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

const EMPTY_BRANCH = {
  name: '',
  type: 'Seleccionar tipo',
  address: '',
  phone: '',
  hours: '',
  manager: 'Asignar responsable',
};

function BranchFormModal({ open, onClose, branchData = null }) {
  const [formData, setFormData] = useState(EMPTY_BRANCH);
  const isEditMode = Boolean(branchData);

  useEffect(() => {
    if (!open) return;

    if (branchData) {
      setFormData({
        name: branchData.name ?? '',
        type: branchData.type ?? 'Seleccionar tipo',
        address: branchData.address ?? '',
        phone: branchData.phone ?? '',
        hours: branchData.hours ?? '',
        manager: branchData.manager ?? 'Asignar responsable',
      });
    } else {
      setFormData(EMPTY_BRANCH);
    }
  }, [open, branchData]);

  if (!open) return null;

  return (
    <div className="app-modal-overlay app-modal-overlay-dark">
      <div className="branch-form-modal">
        <div className="branch-form-header">
          <h2>{isEditMode ? 'Editar Instalación' : 'Registrar Instalación'}</h2>
        </div>

        <div className="branch-form-body">
          <div className="branch-form-row">
            <div className="branch-line-group">
              <label>NOMBRE DE LA SUCURSAL</label>
              <input
                type="text"
                placeholder="Ej. Atelier Flagship Store"
                value={formData.name}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, name: event.target.value }))
                }
              />
            </div>

            <div className="branch-line-group">
              <label>TIPO DE INSTALACIÓN</label>
              <button type="button" className="branch-line-select">
                <span>{formData.type}</span>
                <ChevronDown size={20} strokeWidth={1.8} />
              </button>
            </div>
          </div>

          <div className="branch-line-group branch-line-group-full">
            <label>DIRECCIÓN COMPLETA</label>
            <input
              type="text"
              placeholder="Calle, Número, Ciudad, CP"
              value={formData.address}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, address: event.target.value }))
              }
            />
          </div>

          <div className="branch-line-group branch-line-group-half">
            <label>TELÉFONO DE CONTACTO</label>
            <input
              type="text"
              placeholder="+503 0000-0000"
              value={formData.phone}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, phone: event.target.value }))
              }
            />
          </div>

          <div className="branch-form-row">
            <div className="branch-line-group">
              <label>HORARIO DE ATENCIÓN</label>
              <input
                type="text"
                placeholder="Lun - Sab: 10am - 8pm"
                value={formData.hours}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, hours: event.target.value }))
                }
              />
            </div>

            <div className="branch-line-group">
              <label>GERENTE O ENCARGADO</label>
              <button type="button" className="branch-line-select">
                <span>{formData.manager}</span>
                <ChevronDown size={20} strokeWidth={1.8} />
              </button>
            </div>
          </div>
        </div>

        <div className="branch-form-footer">
          <button type="button" className="modal-cancel-text-btn" onClick={onClose}>
            CANCELAR
          </button>

          <button type="button" className="modal-save-btn" onClick={onClose}>
            {isEditMode ? 'Guardar cambios' : 'Guardar Instalacion'}
            <span className="modal-save-arrow">›</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default BranchFormModal;