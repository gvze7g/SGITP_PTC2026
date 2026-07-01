import { Calendar, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EMPTY_FORM = {
  fullName: '',
  email: '',
  phone: '',
  role: 'Administrador',
  branch: 'Todas',
  hireDate: '',
  birthDate: '',
  temporaryPassword: '',
};

function CreateEmployeeModal({ open, onClose, employeeData = null }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);

  const isEditMode = Boolean(employeeData);

  useEffect(() => {
    if (!open) return;

    if (employeeData) {
      setFormData({
        fullName: employeeData.fullName ?? '',
        email: employeeData.email ?? '',
        phone: employeeData.phone ?? '',
        role: employeeData.role ?? 'Administrador',
        branch: employeeData.branch ?? 'Todas',
        hireDate: employeeData.hireDate ?? '',
        birthDate: employeeData.birthDate ?? '',
        temporaryPassword: employeeData.temporaryPassword ?? '',
      });
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [open, employeeData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className="create-employee-header">
              <h2>{isEditMode ? 'Editar empleado' : 'Registrar nuevo empleado'}</h2>
            </div>

            <div className="create-employee-body">
              <div className="employee-section">
                <div className="employee-section-title">DATOS PERSONALES</div>

                <div className="employee-line-field">
                  <label>Nombre Completo</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(event) => handleChange('fullName', event.target.value)}
                  />
                </div>

                <div className="employee-line-field">
                  <label>Correo Electrónico</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(event) => handleChange('email', event.target.value)}
                  />
                </div>

                <div className="employee-line-field">
                  <label>Teléfono</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(event) => handleChange('phone', event.target.value)}
                  />
                </div>
              </div>

              <div className="employee-section">
                <div className="employee-section-title">ACCESOS Y PERMISOS</div>

                <div className="employee-grid-two">
                  <div className="employee-select-field">
                    <label>Rol del Sistema</label>
                    <button type="button" className="employee-select-box">
                      <span>{formData.role}</span>
                      <ChevronDown size={22} strokeWidth={1.8} />
                    </button>
                  </div>

                  <div className="employee-select-field">
                    <label>Sucursal Asignada</label>
                    <button type="button" className="employee-select-box">
                      <span>{formData.branch}</span>
                      <ChevronDown size={22} strokeWidth={1.8} />
                    </button>
                  </div>
                </div>

                <div className="employee-line-field">
                  <label>Fecha de contratación</label>
                  <input
                    value={formData.hireDate}
                    onChange={(event) => handleChange('hireDate', event.target.value)}
                  />
                </div>

                <div className="employee-line-field employee-line-field-with-icon">
                  <label>Fecha de nacimiento</label>

                  <div className="employee-line-input-wrap">
                    <input
                      type="text"
                      value={formData.birthDate}
                      onChange={(event) => handleChange('birthDate', event.target.value)}
                    />
                    <button type="button" className="employee-field-icon-btn">
                      <Calendar size={24} strokeWidth={1.8} />
                    </button>
                  </div>
                </div>

                <div className="employee-line-field employee-line-field-with-icon">
                  <label>Contraseña Temporal</label>

                  <div className="employee-line-input-wrap">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.temporaryPassword}
                      onChange={(event) => handleChange('temporaryPassword', event.target.value)}
                    />
                    <button
                      type="button"
                      className="employee-field-icon-btn"
                      aria-label={showPassword ? 'Ocultar contraseña temporal' : 'Mostrar contraseña temporal'}
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <EyeOff size={22} strokeWidth={1.8} /> : <Eye size={22} strokeWidth={1.8} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="create-employee-footer">
              <button type="button" className="modal-cancel-text-btn" onClick={onClose}>
                CANCELAR
              </button>

              <button type="button" className="modal-save-btn" onClick={onClose}>
                {isEditMode ? 'Guardar cambios' : 'Guardar y enviar accesos'}
                <span className="modal-save-arrow">›</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default CreateEmployeeModal;