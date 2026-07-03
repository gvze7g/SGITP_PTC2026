import { useEffect, useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "../../components/layout/DashboardLayout";
import EmployeesTable from "../../components/employees/EmployeesTable";
import CreateEmployeeModal from "../../components/employees/CreateEmployeeModal";
import ConfirmDeleteModal from "../../components/ui/ConfirmDeleteModal";
import useEmployees from "../../hooks/employees/useEmployees";

function EmployeesPage({ theme, onToggleTheme }) {
  // hook con la lógica del CRUD
  const {
    employees,
    loading,
    getEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  } = useEmployees();

  // controla modal crear/editar
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);

  // controla modal eliminar
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // empleado seleccionado para editar
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // empleado seleccionado para eliminar
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  // cargar empleados al entrar
  useEffect(() => {
    getEmployees();
  }, [getEmployees]);

  // abrir modal para crear
  const handleOpenCreate = () => {
    setSelectedEmployee(null);
    setEmployeeModalOpen(true);
  };

  // abrir modal para editar
  const handleOpenEdit = (employee) => {
    setSelectedEmployee(employee);
    setEmployeeModalOpen(true);
  };

  // cerrar modal
  const handleCloseEmployeeModal = () => {
    setEmployeeModalOpen(false);
    setSelectedEmployee(null);
  };

  // abrir eliminar
  const handleOpenDeleteModal = (employee) => {
    setEmployeeToDelete(employee);
    setDeleteModalOpen(true);
  };

  // cerrar eliminar
  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setEmployeeToDelete(null);
  };

  // guardar empleado
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

  // confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!employeeToDelete?._id) {
      toast.error("No se encontró el empleado a eliminar.");
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