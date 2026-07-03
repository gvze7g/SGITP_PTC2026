import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

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
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
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
                {isEditMode ? 'Guardar cambios' : 'Guardar Instalación'}
                <span className="modal-save-arrow">›</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default BranchFormModal;