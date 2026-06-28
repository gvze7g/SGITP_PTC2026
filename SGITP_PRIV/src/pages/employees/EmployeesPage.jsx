import { useState } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '../../components/layout/DashboardLayout';
import EmployeesTable from '../../components/employees/EmployeesTable';
import CreateEmployeeModal from '../../components/employees/CreateEmployeeModal';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';

function EmployeesPage({ theme, onToggleTheme }) {
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

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

  return (
    <DashboardLayout theme={theme} onToggleTheme={onToggleTheme}>
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
        onEditEmployee={handleOpenEdit}
        onOpenDeleteModal={() => setDeleteModalOpen(true)}
      />

      <CreateEmployeeModal
        open={employeeModalOpen}
        onClose={handleCloseEmployeeModal}
        employeeData={selectedEmployee}
      />

      <ConfirmDeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          setDeleteModalOpen(false);
          toast.success('Empleado eliminado correctamente.');
        }}
      />
    </DashboardLayout>
  );
}

export default EmployeesPage;