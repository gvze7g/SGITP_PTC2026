import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const EMPTY_FORM = {
  fullName: "",
  email: "",
  phone: "",
  role: "Administrador",
  branch: "",
  hireDate: "",
  birthDate: "",
  temporaryPassword: "",
};

function CreateEmployeeModal({
  open,
  onClose,
  onSubmit,
  employeeData = null,
  loading = false,
}) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);

  const isEditMode = useMemo(() => Boolean(employeeData), [employeeData]);

  const lastNameWarningRef = useRef(0);
  const lastPhoneWarningRef = useRef(0);

  useEffect(() => {
    if (!open) return;

    if (employeeData) {
      setFormData({
        fullName: employeeData.full_name || "",
        email: employeeData.email || "",
        phone: employeeData.main_phone || "",
        role: employeeData.role || "Administrador",
        branch: "",
        hireDate: employeeData.hire_date
          ? new Date(employeeData.hire_date).toISOString().split("T")[0]
          : "",
        birthDate: employeeData.birth_date
          ? new Date(employeeData.birth_date).toISOString().split("T")[0]
          : "",
        temporaryPassword: "",
      });
    } else {
      setFormData(EMPTY_FORM);
    }

    setShowPassword(false);
    lastNameWarningRef.current = 0;
    lastPhoneWarningRef.current = 0;
  }, [open, employeeData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const showRateLimitedWarning = (ref, message) => {
    const now = Date.now();

    if (now - ref.current > 1500) {
      toast.warning(message);
      ref.current = now;
    }
  };

  const handleNameChange = (value) => {
    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]*$/;

    if (!nameRegex.test(value)) {
      showRateLimitedWarning(
        lastNameWarningRef,
        "El nombre solo puede contener letras y espacios."
      );
      return;
    }

    handleChange("fullName", value);
  };

  const handlePhoneChange = (value) => {
    const phoneRegex = /^[0-9-]*$/;

    if (!phoneRegex.test(value)) {
      showRateLimitedWarning(
        lastPhoneWarningRef,
        "El teléfono solo puede contener números y guion."
      );
      return;
    }

    handleChange("phone", value);
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const fullNameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;
    const phoneRegex = /^[0-9-]+$/;

    if (!formData.fullName.trim()) {
      toast.error("El nombre completo es obligatorio.");
      return false;
    }

    if (formData.fullName.trim().length < 3) {
      toast.error("El nombre debe tener al menos 3 caracteres.");
      return false;
    }

    if (!fullNameRegex.test(formData.fullName.trim())) {
      toast.error("El nombre solo puede contener letras y espacios.");
      return false;
    }

    if (!formData.email.trim()) {
      toast.error("El correo electrónico es obligatorio.");
      return false;
    }

    if (!emailRegex.test(formData.email.trim())) {
      toast.error("Ingresa un correo electrónico válido.");
      return false;
    }

    if (!formData.phone.trim()) {
      toast.error("El teléfono es obligatorio.");
      return false;
    }

    if (!phoneRegex.test(formData.phone.trim())) {
      toast.error("El teléfono solo puede contener números y guion.");
      return false;
    }

    if (!isEditMode && !formData.temporaryPassword.trim()) {
      toast.error("La contraseña temporal es obligatoria.");
      return false;
    }

    if (
      formData.temporaryPassword.trim() &&
      formData.temporaryPassword.trim().length < 6
    ) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return false;
    }

    return true;
  };

  const buildPayload = () => {
    const payload = {
      full_name: formData.fullName.trim(),
      main_phone: formData.phone.trim(),
      email: formData.email.trim(),
      branch_id: null,
      addresses: [],
      phone_numbers: formData.phone.trim()
        ? [
            {
              number: formData.phone.trim(),
              type: "Personal",
              isPrimary: true,
            },
          ]
        : [],
      birth_date: formData.birthDate || null,
      hire_date: formData.hireDate || null,
      role: formData.role.trim() || "Administrador",
      isVerified: true,
      loginAttempts: 0,
      timeOut: null,
    };

    if (formData.temporaryPassword.trim()) {
      payload.password = formData.temporaryPassword.trim();
    }

    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const payload = buildPayload();

    await onSubmit?.(payload, isEditMode);
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
            className="create-employee-modal"
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="create-employee-header">
              <h2>{isEditMode ? "Editar empleado" : "Registrar nuevo empleado"}</h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="create-employee-body">
                <div className="employee-section">
                  <div className="employee-section-title">DATOS PERSONALES</div>

                  <div className="employee-line-field">
                    <label>Nombre Completo</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(event) => handleNameChange(event.target.value)}
                    />
                  </div>

                  <div className="employee-line-field">
                    <label>Correo Electrónico</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(event) => handleChange("email", event.target.value)}
                    />
                  </div>

                  <div className="employee-line-field">
                    <label>Teléfono</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(event) => handlePhoneChange(event.target.value)}
                    />
                  </div>

                  <div className="employee-grid-two">
                    <div className="employee-line-field">
                      <label>Fecha de contratación</label>
                      <input
                        type="date"
                        value={formData.hireDate}
                        onChange={(event) => handleChange("hireDate", event.target.value)}
                      />
                    </div>

                    <div className="employee-line-field">
                      <label>Fecha de nacimiento</label>
                      <input
                        type="date"
                        value={formData.birthDate}
                        onChange={(event) => handleChange("birthDate", event.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="employee-section">
                  <div className="employee-section-title">ACCESOS Y PERMISOS</div>

                  <div className="employee-grid-two">
                    <div className="employee-line-field">
                      <label>Rol del sistema</label>
                      <input
                        type="text"
                        value={formData.role}
                        onChange={(event) => handleChange("role", event.target.value)}
                      />
                    </div>

                    <div className="employee-line-field">
                      <label>Sucursal asignada</label>
                      <input
                        type="text"
                        value={formData.branch}
                        onChange={(event) => handleChange("branch", event.target.value)}
                        placeholder="Pendiente conectar con sucursales reales"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="employee-line-field">
                    <label>
                      {isEditMode
                        ? "Nueva contraseña temporal (opcional)"
                        : "Contraseña temporal"}
                    </label>

                    <div style={{ position: "relative" }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.temporaryPassword}
                        onChange={(event) =>
                          handleChange("temporaryPassword", event.target.value)
                        }
                        style={{ paddingRight: "44px" }}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  marginTop: "20px",
                }}
              >
                <button
                  type="button"
                  className="admin-secondary-btn"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="admin-primary-btn"
                  disabled={loading}
                >
                  {loading
                    ? "Guardando..."
                    : isEditMode
                    ? "Actualizar empleado"
                    : "Guardar empleado"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default CreateEmployeeModal;