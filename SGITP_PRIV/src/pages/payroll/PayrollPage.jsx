import { useState } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PayrollTable from '../../components/payroll/PayrollTable';
import PayrollReceiptModal from '../../components/payroll/PayrollReceiptModal';

function PayrollPage({ theme, onToggleTheme }) {
  const [selectedPayroll, setSelectedPayroll] = useState(null);

  return (
    <DashboardLayout theme={theme} onToggleTheme={onToggleTheme}>
      <div className="page-title-row">
        <h1 className="admin-page-title">Historial de nómina</h1>

        <div className="page-actions-row">
          <button type="button" className="admin-secondary-btn">
            Octubre 2023
          </button>

          <button
            type="button"
            className="admin-primary-btn"
            onClick={() => toast.success('Mes cerrado correctamente.')}
          >
            Cerrar mes actual
          </button>
        </div>
      </div>

      <PayrollTable onEditPayroll={setSelectedPayroll} />

      <PayrollReceiptModal
        open={Boolean(selectedPayroll)}
        payrollData={selectedPayroll}
        onClose={() => setSelectedPayroll(null)}
      />
    </DashboardLayout>
  );
}

export default PayrollPage;