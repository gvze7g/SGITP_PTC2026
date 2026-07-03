import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import DateField from "../ui/DateField";

const EMPTY_PAYROLL = {
  employeeName: "",
  role: "",
  branch: "",
  paymentDate: null,
  baseSalaryValue: "0.00",
  bonusesValue: "0.00",
  deductionsValue: "0.00",
};

function PayrollReceiptModal({ open, onClose, payrollData = null }) {
  const [formData, setFormData] = useState(EMPTY_PAYROLL);

  useEffect(() => {
    if (!open) return;

    if (payrollData) {
      setFormData({
        employeeName: payrollData.employeeName ?? "",
        role: payrollData.role ?? "",
        branch: payrollData.branch ?? "",
        paymentDate: payrollData.paymentDateLong
          ? new Date(payrollData.paymentDateLong)
          : null,
        baseSalaryValue: payrollData.baseSalaryValue ?? "0.00",
        bonusesValue: payrollData.bonusesValue ?? "0.00",
        deductionsValue: payrollData.deductionsValue ?? "0.00",
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

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      employeeName: formData.employeeName,
      role: formData.role,
      branch: formData.branch,
      paymentDate: formData.paymentDate
        ? formData.paymentDate.toISOString().split("T")[0]
        : null,
      baseSalaryValue: formData.baseSalaryValue,
      bonusesValue: formData.bonusesValue,
      deductionsValue: formData.deductionsValue,
      totalToPay,
    };

    console.log("Payroll payload:", payload);
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
            className="payroll-receipt-modal"
            initial={{ opacity: 0, scale: 0.97, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 18 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="payroll-receipt-header">
              <div>
                <h2>Emisión de Recibo</h2>
                <p>
                  Empleado: {formData.employeeName} – {formData.role} | Sucursal:{" "}
                  {formData.branch}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="payroll-receipt-body">
                <DateField
                  label="Fecha de pago"
                  value={formData.paymentDate}
                  onChange={(date) =>
                    setFormData((prev) => ({ ...prev, paymentDate: date }))
                  }
                  placeholder="Seleccionar fecha"
                />

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
                    <span>$</span>
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
                  <span>Total a pagar</span>
                  <strong>${totalToPay}</strong>
                </div>
              </div>

              <div className="payroll-receipt-footer">
                <button
                  type="button"
                  className="modal-cancel-text-btn"
                  onClick={onClose}
                >
                  CANCELAR
                </button>

                <button type="submit" className="modal-save-btn">
                  Emitir recibo
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

export default PayrollReceiptModal;