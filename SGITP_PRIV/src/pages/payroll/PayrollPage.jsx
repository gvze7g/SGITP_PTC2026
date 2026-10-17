import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PayrollTable from '../../components/payroll/PayrollTable';
import PayrollReceiptModal from '../../components/payroll/PayrollReceiptModal';
import AddPayrollEntryModal from '../../components/payroll/AddPayrollEntryModal';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';
import CustomDropdown from '../../components/ui/CustomDropdown';
import usePayroll from '../../hooks/payroll/UsePayroll';
import useEmployees from '../../hooks/employees/UseEmployees';
import { getTodayLabel, getMonthKey, getMonthLabel } from '../../utils/dateRules';

const formatMoney = (value) => `$${Number(value || 0).toFixed(2)}`;

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
          timeZone: 'UTC',
        })
      : '--',
    paymentDateLong: payroll.payment_date || null,
    status: payroll.status === 'Pagado' ? 'PAGADO' : 'PENDIENTE',
  };
}

function PayrollPage({ theme, onToggleTheme }) {
  const {
    payrolls,
    loading,
    getPayrolls,
    createPayroll,
    generatePayroll,
    getPeriods,
    closePeriod,
    updatePayroll,
    deletePayroll,
  } = usePayroll();
  const { employees, getEmployees } = useEmployees();

  const currentMonth = useMemo(() => getMonthKey(new Date()), []);
  const [periods, setPeriods] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [payrollToDelete, setPayrollToDelete] = useState(null);

  const loadData = useCallback(async () => {
    const [payrollResult, periodsResult] = await Promise.all([getPayrolls(), getPeriods()]);
    if (!payrollResult?.success) {
      toast.error(payrollResult?.message || 'No se pudo cargar la nómina.');
    }
    if (periodsResult.success) {
      setPeriods(periodsResult.data);
    } else {
      toast.error(periodsResult.message);
    }
  }, [getPayrolls, getPeriods]);

  useEffect(() => {
    loadData();
    getEmployees();
  }, [loadData, getEmployees]);

  const selectedPeriod = useMemo(
    () =>
      periods.find((period) => period.month === selectedMonth) ?? {
        month: selectedMonth,
        period: getMonthLabel(selectedMonth),
        status: 'Abierto',
        is_future: selectedMonth > currentMonth,
        pending_count: 0,
      },
    [periods, selectedMonth, currentMonth]
  );
  const periodLabel = selectedPeriod.period;
  const isClosed = selectedPeriod.status === 'Cerrado';
  const isFuture = selectedMonth > currentMonth;

  const periodOptions = useMemo(
    () =>
      (periods.length ? periods : [selectedPeriod]).map((period) => ({
        value: period.month,
        label: `${period.period}${period.status === 'Cerrado' ? ' · Cerrada' : ''}${
          period.month === currentMonth ? ' · Mes actual' : ''
        }`,
      })),
    [periods, selectedPeriod, currentMonth]
  );

  // Registros del mes elegido (se compara por mes, así "octubre 2026" y
  // "Octubre de 2026" cuentan como el mismo).
  const periodPayrolls = useMemo(
    () => payrolls.filter((item) => getMonthKey(item.period) === selectedMonth),
    [payrolls, selectedMonth]
  );
  const formattedPayrolls = periodPayrolls.map(formatPayroll);
  const totalBaseSalary = periodPayrolls.reduce((sum, item) => sum + Number(item.base_salary || 0), 0);
  const totalPaid = periodPayrolls
    .filter((item) => item.status === 'Pagado')
    .reduce((sum, item) => sum + Number(item.net_salary || 0), 0);
  const pendingCount = periodPayrolls.filter((item) => item.status !== 'Pagado').length;

  const handleGenerate = async () => {
    const result = await generatePayroll(periodLabel);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    const created = result.data?.created ?? 0;
    toast.success(
      created > 0
        ? `Nómina de ${periodLabel} generada para ${created} empleado(s).`
        : `La nómina de ${periodLabel} ya estaba generada para todos los empleados.`
    );
    await loadData();
  };

  const handleAskClose = () => {
    if (periodPayrolls.length === 0) {
      toast.error(`No hay nómina registrada en ${periodLabel}. Genérala antes de cerrar el mes.`);
      return;
    }
    if (pendingCount > 0) {
      toast.error(`Faltan ${pendingCount} pago(s) pendiente(s) en ${periodLabel}. Regístralos antes de cerrar el mes.`);
      return;
    }
    setCloseModalOpen(true);
  };

  const handleConfirmClose = async () => {
    const result = await closePeriod(periodLabel);
    setCloseModalOpen(false);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.data?.message || `Nómina de ${periodLabel} cerrada.`);
    await loadData();
    if (result.data?.next_month) setSelectedMonth(result.data.next_month);
  };

  const handleAddPayrollEntry = async (payload) => {
    const result = await createPayroll(payload);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success('Nómina registrada correctamente.');
    setAddModalOpen(false);
    await loadData();
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
    await loadData();
  };

  const handleConfirmDelete = async () => {
    if (!payrollToDelete?._id) return;

    const result = await deletePayroll(payrollToDelete._id);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success('Registro de nómina eliminado.');
    setPayrollToDelete(null);
    await loadData();
  };

  return (
    <DashboardLayout theme={theme} onToggleTheme={onToggleTheme}>
      <div className="page-title-row">
        <div>
          <h1 className="admin-page-title">Nómina</h1>
          <p className="admin-page-subtitle">Hoy es {getTodayLabel()}</p>
        </div>

        <div className="page-actions-row">
          <CustomDropdown
            className="period-dropdown"
            value={selectedMonth}
            options={periodOptions}
            onChange={setSelectedMonth}
          />

          <span className={`period-status-badge ${isClosed ? 'period-status-closed' : ''}`}>
            {isClosed ? 'Mes cerrado' : isFuture ? 'Próximo mes' : 'Mes abierto'}
          </span>

          {!isClosed && !isFuture ? (
            <>
              <button type="button" className="admin-secondary-btn" onClick={() => setAddModalOpen(true)}>
                + Nueva nómina
              </button>

              <button type="button" className="admin-secondary-btn" onClick={handleGenerate}>
                Generar nómina del mes
              </button>

              <button type="button" className="admin-primary-btn" onClick={handleAskClose}>
                Cerrar {periodLabel}
              </button>
            </>
          ) : null}
        </div>
      </div>

      {isFuture ? (
        <p className="period-notice">
          La nómina de {periodLabel} se podrá generar a partir del primer día de ese mes.
        </p>
      ) : null}
      {isClosed && selectedPeriod.closed_at ? (
        <p className="period-notice">
          Mes cerrado el{' '}
          {new Date(selectedPeriod.closed_at).toLocaleDateString('es-SV', { dateStyle: 'long' })}. Los
          registros quedan solo para consulta.
        </p>
      ) : null}

      <PayrollTable
        payrolls={formattedPayrolls}
        loading={loading}
        totalBaseSalary={totalBaseSalary}
        totalPaidThisMonth={totalPaid}
        pendingCount={pendingCount}
        periodLabel={periodLabel}
        isClosed={isClosed}
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
        defaultPeriod={periodLabel}
        loading={loading}
      />

      <ConfirmDeleteModal
        open={closeModalOpen}
        onClose={() => setCloseModalOpen(false)}
        onConfirm={handleConfirmClose}
        title={`¿Cerrar la nómina de ${periodLabel}?`}
        description={`Se guardará el resumen del mes (${periodPayrolls.length} empleado(s), ${formatMoney(
          totalPaid
        )} pagado) y ya no se podrá modificar. El mes siguiente quedará abierto para sus pagos.`}
        confirmText="CERRAR MES"
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
