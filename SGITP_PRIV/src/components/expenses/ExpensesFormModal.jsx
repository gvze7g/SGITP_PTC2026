import { Calendar, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const EMPTY_EXPENSE = {
  paymentDate: '24 Oct, 2023',
  category: 'Servicios',
  branch: 'Tienda principal',
  amountValue: '0.00',
  paymentMethod: 'Cheque',
  description: '',
};

function ExpenseFormModal({ open, onClose, expenseData = null }) {
  const [formData, setFormData] = useState(EMPTY_EXPENSE);
  const isEditMode = Boolean(expenseData);

  useEffect(() => {
    if (!open) return;

    if (expenseData) {
      setFormData({
        paymentDate: expenseData.paymentDate ?? '24 Oct, 2023',
        category: expenseData.category ?? 'Servicios',
        branch: expenseData.branch ?? 'Tienda principal',
        amountValue: expenseData.amountValue ?? '0.00',
        paymentMethod: expenseData.paymentMethod ?? 'Cheque',
        description: expenseData.description ?? '',
      });
    } else {
      setFormData(EMPTY_EXPENSE);
    }
  }, [open, expenseData]);

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
            className="expense-form-modal"
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className="expense-form-header">
              <h2>{isEditMode ? 'Editar gasto' : 'Registrar gasto'}</h2>
            </div>

            <div className="expense-form-body">
              <div className="expense-form-row expense-form-row-top">
                <div className="expense-line-group expense-line-group-with-icon">
                  <label>FECHA DEL GASTO</label>

                  <div className="expense-line-input-wrap">
                    <input
                      type="text"
                      value={formData.paymentDate}
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, paymentDate: event.target.value }))
                      }
                    />
                    <button type="button" className="employee-field-icon-btn">
                      <Calendar size={22} strokeWidth={1.8} />
                    </button>
                  </div>
                </div>

                <div className="expense-line-group">
                  <label>CATEGORÍA</label>
                  <button type="button" className="expense-line-select">
                    <span>{formData.category}</span>
                    <ChevronDown size={20} strokeWidth={1.8} />
                  </button>
                </div>

                <div className="expense-line-group">
                  <label>SUCURSAL ASIGNADA</label>
                  <button type="button" className="expense-line-select">
                    <span>{formData.branch}</span>
                    <ChevronDown size={20} strokeWidth={1.8} />
                  </button>
                </div>
              </div>

              <div className="expense-form-row">
                <div className="expense-line-group expense-money-group">
                  <label>MONTO TOTAL</label>

                  <div className="expense-money-input">
                    <span>$</span>
                    <input
                      type="text"
                      value={formData.amountValue}
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, amountValue: event.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="expense-line-group">
                  <label>MÉTODO DE PAGO</label>
                  <input
                    type="text"
                    value={formData.paymentMethod}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, paymentMethod: event.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="expense-line-group expense-line-group-full">
                <label>DESCRIPCIÓN / CONCEPTO</label>
                <input
                  type="text"
                  placeholder="Ej. Renovación de empaques"
                  value={formData.description}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, description: event.target.value }))
                  }
                />
              </div>
            </div>

            <div className="expense-form-footer">
              <button type="button" className="modal-cancel-text-btn" onClick={onClose}>
                CANCELAR
              </button>

              <button type="button" className="modal-save-btn" onClick={onClose}>
                {isEditMode ? 'Guardar cambios' : 'Guardar Gasto'}
                <span className="modal-save-arrow">›</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default ExpenseFormModal;