import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CustomDropdown from "../ui/CustomDropdown";
import DateField from "../ui/DateField";

const EXPENSE_TYPE_OPTIONS = [
  { value: "Services", label: "Servicios" },
  { value: "Payroll", label: "Planilla" },
  { value: "Supplies", label: "Insumos" },
  { value: "Transport", label: "Transporte" },
  { value: "Other", label: "Otro" },
];

const PAYMENT_METHOD_OPTIONS = [
  { value: "Cash", label: "Efectivo" },
  { value: "Transfer", label: "Transferencia" },
  { value: "Card", label: "Tarjeta" },
];

const EMPTY_FORM = {
  description: "",
  amount: "",
  expenseType: "Services",
  paymentMethod: "Cash",
  expenseDate: null,
  notes: "",
};

function ExpenseFormModal({ open, onClose, expenseData = null }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const isEditMode = Boolean(expenseData);

  useEffect(() => {
    if (!open) return;

    if (expenseData) {
      setFormData({
        description: expenseData.description ?? "",
        amount:
          expenseData.amount !== undefined && expenseData.amount !== null
            ? String(expenseData.amount)
            : "",
        expenseType: expenseData.expense_type ?? "Services",
        paymentMethod: expenseData.payment_method ?? "Cash",
        expenseDate: expenseData.expense_date ? new Date(expenseData.expense_date) : null,
        notes: expenseData.notes ?? "",
      });
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [open, expenseData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAmountChange = (value) => {
    const sanitized = value.replace(/[^\d.]/g, "");
    handleChange("amount", sanitized);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      description: formData.description.trim(),
      amount: formData.amount ? Number(formData.amount) : 0,
      expense_type: formData.expenseType,
      payment_method: formData.paymentMethod,
      expense_date: formData.expenseDate
        ? formData.expenseDate.toISOString().split("T")[0]
        : null,
      notes: formData.notes.trim(),
    };

    console.log("Expense payload:", payload);
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
            className="expense-form-modal"
            initial={{ opacity: 0, scale: 0.97, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 18 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="expense-form-header">
              <h2>{isEditMode ? "Editar Gasto" : "Registrar Gasto"}</h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="expense-form-body">
                <div className="expense-form-row">
                  <div className="expense-line-group-full">
                    <label>Descripción</label>
                    <input
                      type="text"
                      className="form-editable-input"
                      placeholder="Ej. Pago de internet"
                      value={formData.description}
                      onChange={(event) => handleChange("description", event.target.value)}
                    />
                  </div>
                </div>

                <div className="expense-form-row-top">
                  <div className="expense-line-group-full">
                    <label>Monto</label>
                    <input
                      type="text"
                      className="form-editable-input"
                      placeholder="Ej. 125.50"
                      value={formData.amount}
                      onChange={(event) => handleAmountChange(event.target.value)}
                    />
                  </div>

                  <CustomDropdown
                    label="Tipo de gasto"
                    value={formData.expenseType}
                    options={EXPENSE_TYPE_OPTIONS}
                    onChange={(value) => handleChange("expenseType", value)}
                  />
                </div>

                <div className="expense-form-row">
                  <CustomDropdown
                    label="Método de pago"
                    value={formData.paymentMethod}
                    options={PAYMENT_METHOD_OPTIONS}
                    onChange={(value) => handleChange("paymentMethod", value)}
                  />

                  <DateField
                    label="Fecha del gasto"
                    value={formData.expenseDate}
                    onChange={(date) => handleChange("expenseDate", date)}
                    placeholder="Seleccionar fecha"
                    maxDate={new Date()}
                  />
                </div>

                <div className="expense-form-row">
                  <div className="expense-line-group-full">
                    <label>Notas</label>
                    <textarea
                      className="form-editable-input"
                      placeholder="Detalle adicional"
                      value={formData.notes}
                      onChange={(event) => handleChange("notes", event.target.value)}
                      rows={4}
                      style={{ resize: "none" }}
                    />
                  </div>
                </div>
              </div>

              <div className="expense-form-footer">
                <button
                  type="button"
                  className="modal-cancel-text-btn"
                  onClick={onClose}
                >
                  CANCELAR
                </button>

                <button type="submit" className="modal-save-btn">
                  {isEditMode ? "Guardar cambios" : "Guardar gasto"}
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

export default ExpenseFormModal;