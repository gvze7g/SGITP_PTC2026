import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import CustomDropdown from "../ui/CustomDropdown";
import DateField from "../ui/DateField";

const EMPLOYEE_ROLE_OPTIONS = [
  { value: "Administrator", label: "Administrador" },
  { value: "Employee", label: "Empleado" },
];

const EMPTY_FORM = {
  fullName: "",
  email: "",
  phone: "",
  role: "Administrator",
  branch: "",
  hireDate: null,
  birthDate: null,
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
  const isAdministratorRole = formData.role === "Administrator";

  const lastNameWarningRef = useRef(0);
  const lastPhoneWarningRef = useRef(0);

  useEffect(() => {
    if (!open) return;

    if (employeeData) {
      setFormData({
        fullName: employeeData.full_name || "",
        email: employeeData.email || "",
        phone: employeeData.main_phone || "",
        role:
          employeeData.role === "Administrador"
            ? "Administrator"
            : employeeData.role === "Empleado"
            ? "Employee"
            : employeeData.role || "Administrator",
        branch: "",
        hireDate: employeeData.hire_date ? new Date(employeeData.hire_date) : null,
        birthDate: employeeData.birth_date ? new Date(employeeData.birth_date) : null,
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
    setFormData((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };

      if (field === "role" && value !== "Administrator") {
        updated.temporaryPassword = "";
      }

      return updated;
    });
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

    if (!["Administrator", "Employee"].includes(formData.role)) {
      toast.error("Rol de empleado inválido.");
      return false;
    }

    if (
      formData.role === "Administrator" &&
      !isEditMode &&
      !formData.temporaryPassword.trim()
    ) {
      toast.error("La contraseña temporal es obligatoria para administradores.");
      return false;
    }

    if (
      formData.role === "Administrator" &&
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
      birth_date: formData.birthDate
        ? formData.birthDate.toISOString().split("T")[0]
        : null,
      hire_date: formData.hireDate
        ? formData.hireDate.toISOString().split("T")[0]
        : null,
      role: formData.role,
      isVerified: true,
      loginAttempts: 0,
      timeOut: null,
    };

    if (formData.role === "Administrator" && formData.temporaryPassword.trim()) {
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
            initial={{ opacity: 0, scale: 0.97, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 18 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{
              width: "min(820px, 94vw)",
              maxHeight: "90vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              borderRadius: "18px",
            }}
          >
            <div
              className="create-employee-header"
              style={{
                padding: "18px 22px 12px",
                flexShrink: 0,
              }}
            >
              <h2>{isEditMode ? "Editar empleado" : "Registrar nuevo empleado"}</h2>
            </div>

            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                overflowY: "auto",
                overflowX: "hidden",
                padding: "0 22px 18px",
              }}
            >
              <div
                className="create-employee-body"
                style={{
                  padding: 0,
                  display: "grid",
                  gap: "16px",
                }}
              >
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

                  <div className="employee-grid-two" style={{ gap: "14px" }}>
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
                  </div>

                  <div className="employee-grid-two" style={{ gap: "14px" }}>
                    <DateField
                      label="Fecha de contratación"
                      value={formData.hireDate}
                      onChange={(date) => handleChange("hireDate", date)}
                      placeholder="Seleccionar fecha"
                      maxDate={new Date()}
                    />

                    <DateField
                      label="Fecha de nacimiento"
                      value={formData.birthDate}
                      onChange={(date) => handleChange("birthDate", date)}
                      placeholder="Seleccionar fecha"
                      maxDate={new Date()}
                    />
                  </div>
                </div>

                <div className="employee-section">
                  <div className="employee-section-title">ACCESOS Y PERMISOS</div>

                  <div className="employee-grid-two" style={{ gap: "14px" }}>
                    <CustomDropdown
                      label="Rol del sistema"
                      value={formData.role}
                      options={EMPLOYEE_ROLE_OPTIONS}
                      onChange={(value) => handleChange("role", value)}
                    />

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
                      {isAdministratorRole
                        ? isEditMode
                          ? "Nueva contraseña temporal (opcional)"
                          : "Contraseña temporal"
                        : "Contraseña deshabilitada para empleados"}
                    </label>

                    <div style={{ position: "relative" }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.temporaryPassword}
                        onChange={(event) =>
                          handleChange("temporaryPassword", event.target.value)
                        }
                        style={{ paddingRight: "44px" }}
                        disabled={!isAdministratorRole}
                        placeholder={
                          isAdministratorRole
                            ? "Ingresa una contraseña temporal"
                            : "Los empleados no ingresan al sistema privado"
                        }
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
                          cursor: isAdministratorRole ? "pointer" : "not-allowed",
                          opacity: isAdministratorRole ? 1 : 0.5,
                        }}
                        aria-label={
                          showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                        }
                        disabled={!isAdministratorRole}
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
                  marginTop: "16px",
                  paddingTop: "14px",
                  borderTop: "1px solid var(--admin-border-soft)",
                  flexWrap: "wrap",
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