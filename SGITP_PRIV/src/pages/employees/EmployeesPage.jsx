import { useEffect, useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "../../components/layout/DashboardLayout";
import EmployeesTable from "../../components/employees/EmployeesTable";
import CreateEmployeeModal from "../../components/employees/CreateEmployeeModal";
import ConfirmDeleteModal from "../../components/ui/ConfirmDeleteModal";
import useEmployees from "../../hooks/employees/useEmployees";

function EmployeesPage({ theme, onToggleTheme }) {
  const {
    employees,
    loading,
    getEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  } = useEmployees();

  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  // TODO:
  // cuando tengas el usuario autenticado real,
  // reemplaza null por el empleado actual
  const [currentEmployee] = useState(null);

  useEffect(() => {
    getEmployees();
  }, [getEmployees]);

  const handleOpenCreate = () => {
    setSelectedEmployee(null);
    setEmployeeModalOpen(true);
  };

  const handleOpenEdit = (employee) => {
    setSelectedEmployee(employee);
    setEmployeeModalOpen(true);
  };

  const handleCloseEmployeeModal = () => {
    setEmployeeModalOpen(false);
    setSelectedEmployee(null);
  };

  const validateDeleteEmployee = (employee) => {
    if (!employee?._id) {
      return {
        allowed: false,
        message: "No se encontró el empleado seleccionado.",
      };
    }

    if (employees.length === 1) {
      return {
        allowed: false,
        message: "No puedes eliminar el único usuario existente del sistema.",
      };
    }

    if (currentEmployee?._id && currentEmployee._id === employee._id) {
      return {
        allowed: false,
        message: "No puedes eliminar el usuario con el que has iniciado sesión.",
      };
    }

    return {
      allowed: true,
      message: "",
    };
  };

  const handleOpenDeleteModal = (employee) => {
    const validation = validateDeleteEmployee(employee);

    if (!validation.allowed) {
      toast.error(validation.message);
      return;
    }

    setEmployeeToDelete(employee);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setEmployeeToDelete(null);
  };

  const handleSaveEmployee = async (payload, isEditMode) => {
    let result;

    if (isEditMode && selectedEmployee?._id) {
      result = await updateEmployee(selectedEmployee._id, payload);
    } else {
      result = await createEmployee(payload);
    }

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(
      isEditMode
        ? "Empleado actualizado correctamente."
        : "Empleado creado correctamente."
    );

    handleCloseEmployeeModal();
    await getEmployees();
  };

  const handleConfirmDelete = async () => {
    const validation = validateDeleteEmployee(employeeToDelete);

    if (!validation.allowed) {
      toast.error(validation.message);
      handleCloseDeleteModal();
      return;
    }

    const result = await deleteEmployee(employeeToDelete._id);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success("Empleado eliminado correctamente.");
    handleCloseDeleteModal();
    await getEmployees();
  };

  return (
    <DashboardLayout theme={theme} onToggleTheme={onToggleTheme}>
      <div className="employees-page-shell">
        <div className="page-title-row">
          <h1 className="admin-page-title">Empleados</h1>

          <button
            type="button"
            className="admin-primary-btn"
            onClick={handleOpenCreate}
          >
            + Nuevo empleado
          </button>
        </div>

        <EmployeesTable
          employees={employees}
          loading={loading}
          onEditEmployee={handleOpenEdit}
          onDeleteEmployee={handleOpenDeleteModal}
        />
      </div>

      <CreateEmployeeModal
        open={employeeModalOpen}
        onClose={handleCloseEmployeeModal}
        onSubmit={handleSaveEmployee}
        employeeData={selectedEmployee}
        loading={loading}
      />

      <ConfirmDeleteModal
        open={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="¿Deseas eliminar este empleado?"
        description="Esta acción eliminará el registro del empleado."
        confirmText="ELIMINAR"
        cancelText="CANCELAR"
      />
    </DashboardLayout>
  );
}

export default EmployeesPage;