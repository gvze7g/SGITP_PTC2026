import { Calendar, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const EMPTY_PAYROLL = {
  employeeName: '',
  role: '',
  branch: '',
  paymentDateLong: '',
  baseSalaryValue: '0.00',
  bonusesValue: '0.00',
  deductionsValue: '0.00',
};

function PayrollReceiptModal({ open, onClose, payrollData = null }) {
  const [formData, setFormData] = useState(EMPTY_PAYROLL);

  useEffect(() => {
    if (!open) return;

    if (payrollData) {
      setFormData({
        employeeName: payrollData.employeeName ?? '',
        role: payrollData.role ?? '',
        branch: payrollData.branch ?? '',
        paymentDateLong: payrollData.paymentDateLong ?? '',
        baseSalaryValue: payrollData.baseSalaryValue ?? '0.00',
        bonusesValue: payrollData.bonusesValue ?? '0.00',
        deductionsValue: payrollData.deductionsValue ?? '0.00',
      });
    } else {
      setFormData(EMPTY_PAYROLL);
    }
  }, [open, payrollData]);

  const totalToPay = useMemo(() => {
    const base = Number(formData.baseSalaryValue || 0);
    const bonus = Number(formData.bonusesValue || 0);
    const deductions = Number(formData.deductionsValue || 0);
    return (base + bonus - deductions).toFixed(2);
  }, [formData]);

  if (!open) return null;

  return (
    <div className="app-modal-overlay app-modal-overlay-dark">
      <div className="payroll-receipt-modal">
        <div className="payroll-receipt-header">
          <div>
            <h2>Emisión de Recibo</h2>
            <p>
              Empleado: {formData.employeeName} – {formData.role} | Sucursal: {formData.branch}
            </p>
          </div>

          <button type="button" className="payroll-close-btn" onClick={onClose}>
            <X size={26} strokeWidth={2} />
          </button>
        </div>

        <div className="payroll-receipt-body">
          <div className="payroll-field-group">
            <label>FECHA DE PAGO</label>

            <div className="payroll-line-input payroll-line-input-with-icon">
              <input
                type="text"
                value={formData.paymentDateLong}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    paymentDateLong: event.target.value,
                  }))
                }
              />
              <button type="button" className="employee-field-icon-btn">
                <Calendar size={24} strokeWidth={1.8} />
              </button>
            </div>
          </div>

          <div className="payroll-summary-row-block">
            <span>Salario base fijo</span>
            <strong>${formData.baseSalaryValue}</strong>
          </div>

          <div className="payroll-editable-row">
            <span>Bonos / Horas extras</span>

            <div className="payroll-currency-input">
              <span>$</span>
              <input
                type="text"
                value={formData.bonusesValue}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    bonusesValue: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="payroll-editable-row">
            <span>Deducciones / Faltas</span>

            <div className="payroll-currency-input">
              <span>-$</span>
              <input
                type="text"
                value={formData.deductionsValue}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    deductionsValue: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="payroll-total-box">
            <span>SALARIO NETO A PAGAR</span>
            <strong>${totalToPay}</strong>
          </div>
        </div>

        <div className="payroll-receipt-footer">
          <button type="button" className="modal-cancel-text-btn" onClick={onClose}>
            CANCELAR
          </button>

          <button type="button" className="modal-save-btn" onClick={onClose}>
            Aprobar y registrar pago
            <span className="modal-save-arrow">›</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PayrollReceiptModal;