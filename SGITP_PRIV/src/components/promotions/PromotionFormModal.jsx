import { Calendar, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

const EMPTY_PROMOTION = {
  code: '',
  type: 'Porcentaje',
  value: '',
  startDate: '',
  endDate: '',
  minimumPurchase: '0.00',
  usageLimit: '100',
};

function PromotionFormModal({ open, onClose, promotionData = null }) {
  const [formData, setFormData] = useState(EMPTY_PROMOTION);
  const isEditMode = Boolean(promotionData);

  useEffect(() => {
    if (!open) return;

    if (promotionData) {
      setFormData({
        code: promotionData.code?.replace('#', '') ?? '',
        type: promotionData.type ?? 'Porcentaje',
        value: promotionData.value ?? '',
        startDate: promotionData.startDate ?? '',
        endDate: promotionData.endDate ?? '',
        minimumPurchase: promotionData.minimumPurchase ?? '0.00',
        usageLimit: promotionData.usageLimit ?? '100',
      });
    } else {
      setFormData(EMPTY_PROMOTION);
    }
  }, [open, promotionData]);

  if (!open) return null;

  return (
    <div className="app-modal-overlay app-modal-overlay-dark">
      <div className="promotion-form-modal">
        <div className="promotion-form-header">
          <h2>{isEditMode ? 'Editar Código de Descuento' : 'Nuevo Código de Descuento'}</h2>
        </div>

        <div className="promotion-form-body">
          <div className="promotion-line-group promotion-line-group-full">
            <label>NOMBRE DEL CÓDIGO</label>
            <input
              type="text"
              placeholder="Ej: VERANO20"
              value={formData.code}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, code: event.target.value }))
              }
            />
          </div>

          <div className="promotion-form-row">
            <div className="promotion-line-group">
              <label>TIPO DE DESCUENTO</label>
              <button type="button" className="promotion-line-select">
                <span>{formData.type}</span>
                <ChevronDown size={20} strokeWidth={1.8} />
              </button>
            </div>

            <div className="promotion-line-group">
              <label>VALOR DEL DESCUENTO</label>
              <input
                type="text"
                placeholder="15"
                value={formData.value}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, value: event.target.value }))
                }
              />
            </div>
          </div>

          <div className="promotion-form-row">
            <div className="promotion-line-group promotion-line-group-with-icon">
              <label>FECHA DE INICIO</label>

              <div className="promotion-line-input-wrap">
                <input
                  type="text"
                  placeholder="mm/dd/yyyy"
                  value={formData.startDate}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, startDate: event.target.value }))
                  }
                />
                <button type="button" className="employee-field-icon-btn">
                  <Calendar size={22} strokeWidth={1.8} />
                </button>
              </div>
            </div>

            <div className="promotion-line-group promotion-line-group-with-icon">
              <label>FECHA DE EXPIRACIÓN</label>

              <div className="promotion-line-input-wrap">
                <input
                  type="text"
                  placeholder="mm / dd / yyyy"
                  value={formData.endDate}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, endDate: event.target.value }))
                  }
                />
                <button type="button" className="employee-field-icon-btn">
                  <Calendar size={22} strokeWidth={1.8} />
                </button>
              </div>
            </div>
          </div>

          <div className="promotion-form-row">
            <div className="promotion-line-group">
              <label>MÍNIMO DE COMPRA (OPCIONAL)</label>
              <input
                type="text"
                placeholder="0.00"
                value={formData.minimumPurchase}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, minimumPurchase: event.target.value }))
                }
              />
            </div>

            <div className="promotion-line-group">
              <label>LÍMITE DE USOS TOTALES</label>
              <input
                type="text"
                placeholder="100"
                value={formData.usageLimit}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, usageLimit: event.target.value }))
                }
              />
            </div>
          </div>
        </div>

        <div className="promotion-form-footer">
          <button type="button" className="modal-cancel-text-btn" onClick={onClose}>
            CANCELAR
          </button>

          <button type="button" className="modal-save-btn" onClick={onClose}>
            {isEditMode ? 'Guardar cambios' : 'Guardar código'}
            <span className="modal-save-arrow">›</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PromotionFormModal;