import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import CustomDropdown from "../ui/CustomDropdown";

function AddPayrollEntryModal({ open, onClose, onSubmit, employees = [], defaultPeriod = "", loading = false }) {
  const [employeeId, setEmployeeId] = useState("");
  const [period, setPeriod] = useState(defaultPeriod);

  useEffect(() => {
    if (!open) return;
    setEmployeeId("");
    setPeriod(defaultPeriod);
  }, [open, defaultPeriod]);

  const employeeOptions = employees.map((employee) => ({
    value: employee._id,
    label: `${employee.full_name}${employee.position ? ` — ${employee.position}` : ""}`,
  }));

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!employeeId) {
      toast.error("Selecciona un empleado.");
      return;
    }

    if (!period.trim()) {
      toast.error("El periodo es obligatorio.");
      return;
    }

    await onSubmit?.({ employee_id: employeeId, period: period.trim() });
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
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{
              width: "min(460px, 92vw)",
              background: "#fff",
              borderRadius: "20px",
              padding: "24px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
            }}
          >
            <h2 style={{ margin: "0 0 18px", fontSize: "22px", fontWeight: 700, color: "#2c2521" }}>
              Registrar nómina de empleado
            </h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <CustomDropdown
                label="EMPLEADO"
                value={employeeId}
                options={employeeOptions}
                onChange={setEmployeeId}
                placeholder="Selecciona un empleado"
              />

              <div className="modal-input-group">
                <span className="modal-section-label">PERIODO</span>
                <input
                  type="text"
                  className="modal-line-input"
                  value={period}
                  onChange={(event) => setPeriod(event.target.value)}
                  placeholder="Ej: Noviembre 2025"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
                <button type="button" className="admin-secondary-btn" onClick={onClose} disabled={loading}>
                  CANCELAR
                </button>

                <button type="submit" className="admin-primary-btn" disabled={loading}>
                  {loading ? "Guardando..." : "REGISTRAR"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default AddPayrollEntryModal;
