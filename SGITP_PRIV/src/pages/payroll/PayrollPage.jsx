import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PayrollTable from '../../components/payroll/PayrollTable';
import PayrollReceiptModal from '../../components/payroll/PayrollReceiptModal';
import AddPayrollEntryModal from '../../components/payroll/AddPayrollEntryModal';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';
import usePayroll from '../../hooks/payroll/UsePayroll';
import useEmployees from '../../hooks/employees/UseEmployees';

const formatMoney = (value) => `$${Number(value || 0).toFixed(2)}`;

function getCurrentPeriod() {
  const label = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatPayroll(payroll) {
  const employee = payroll.employee_id || {};
  const branch = employee.branch_id;

  return {
    ...payroll,
    employeeName: employee.full_name || 'Empleado',
    role: employee.position || 'Sin puesto asignado',
    branch: branch?.name || 'Sin sucursal asignada',
    baseSalary: formatMoney(payroll.base_salary),
    baseSalaryValue: Number(payroll.base_salary || 0).toFixed(2),
    deductions:
      Number(payroll.deductions || 0) > 0
        ? `-${formatMoney(payroll.deductions)}`
        : formatMoney(0),
    deductionsValue: Number(payroll.deductions || 0).toFixed(2),
    bonusesValue: Number(payroll.bonuses || 0).toFixed(2),
    netSalary: formatMoney(payroll.net_salary),
    paymentDate: payroll.payment_date
      ? new Date(payroll.payment_date).toLocaleDateString('es-SV', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : '--',
    paymentDateLong: payroll.payment_date || null,
    status: payroll.status === 'Pagado' ? 'PAGADO' : 'PENDIENTE',
  };
}

function PayrollPage({ theme, onToggleTheme }) {
  const { payrolls, loading, getPayrolls, createPayroll, generatePayroll, updatePayroll, deletePayroll } =
    usePayroll();
  const { employees, getEmployees } = useEmployees();

  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [payrollToDelete, setPayrollToDelete] = useState(null);
  const currentPeriod = useMemo(() => getCurrentPeriod(), []);

  const loadPayrolls = useCallback(async () => {
    const result = await getPayrolls();
    if (!result?.success) {
      toast.error(result?.message || 'No se pudo cargar la nomina.');
    }
  }, [getPayrolls]);

  useEffect(() => {
    loadPayrolls();
    getEmployees();
  }, [loadPayrolls, getEmployees]);

  const formattedPayrolls = payrolls.map(formatPayroll);

  const currentPeriodPayrolls = payrolls.filter((item) => item.period === currentPeriod);
  const totalBaseSalary = currentPeriodPayrolls.reduce(
    (sum, item) => sum + Number(item.base_salary || 0),
    0
  );
  const totalPaidThisMonth = currentPeriodPayrolls
    .filter((item) => item.status === 'Pagado')
    .reduce((sum, item) => sum + Number(item.net_salary || 0), 0);

  const handleCloseMonth = async () => {
    const result = await generatePayroll(currentPeriod);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    const created = result.data?.created ?? 0;

    toast.success(
      created > 0
        ? `Nomina de ${currentPeriod} generada para ${created} empleado(s).`
        : `La nomina de ${currentPeriod} ya estaba generada.`
    );

    await loadPayrolls();
  };

  const handleAddPayrollEntry = async (payload) => {
    const result = await createPayroll(payload);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success('Nomina registrada correctamente.');
    setAddModalOpen(false);
    await loadPayrolls();
  };

  const handleSubmitReceipt = async (payload) => {
    if (!selectedPayroll?._id) return;

    const result = await updatePayroll(selectedPayroll._id, payload);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success('Recibo emitido y pago registrado correctamente.');
    setSelectedPayroll(null);
    await loadPayrolls();
  };

  const handleConfirmDelete = async () => {
    if (!payrollToDelete?._id) return;

    const result = await deletePayroll(payrollToDelete._id);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success('Registro de nomina eliminado.');
    setPayrollToDelete(null);
    await loadPayrolls();
  };

  return (
    <DashboardLayout theme={theme} onToggleTheme={onToggleTheme}>
      <div className="page-title-row">
        <h1 className="admin-page-title">Historial de nómina</h1>

        <div className="page-actions-row">
          <button type="button" className="admin-secondary-btn" disabled>
            {currentPeriod}
          </button>

          <button type="button" className="admin-secondary-btn" onClick={() => setAddModalOpen(true)}>
            + Nueva nómina
          </button>

          <button type="button" className="admin-primary-btn" onClick={handleCloseMonth}>
            Cerrar mes actual
          </button>
        </div>
      </div>

      <PayrollTable
        payrolls={formattedPayrolls}
        loading={loading}
        totalBaseSalary={totalBaseSalary}
        totalPaidThisMonth={totalPaidThisMonth}
        onEditPayroll={setSelectedPayroll}
        onDeletePayroll={setPayrollToDelete}
      />

      <PayrollReceiptModal
        open={Boolean(selectedPayroll)}
        payrollData={selectedPayroll}
        loading={loading}
        onSubmit={handleSubmitReceipt}
        onClose={() => setSelectedPayroll(null)}
      />

      <AddPayrollEntryModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleAddPayrollEntry}
        employees={employees}
        defaultPeriod={currentPeriod}
        loading={loading}
      />

      <ConfirmDeleteModal
        open={Boolean(payrollToDelete)}
        onClose={() => setPayrollToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="¿Deseas eliminar este registro de nómina?"
        description="Esta acción no se puede deshacer."
        confirmText="ELIMINAR"
      />
    </DashboardLayout>
  );
}

export default PayrollPage;
