import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SalesHistoryTable from '../../components/sales/SalesHistoryTable';
import SaleDetailsModal from '../../components/sales/SaleDetailsModal';

function SalesHistoryPage({ theme, onToggleTheme }) {
  const [selectedSale, setSelectedSale] = useState(null);
  const navigate = useNavigate();

  return (
    <DashboardLayout theme={theme} onToggleTheme={onToggleTheme}>
      <div className="page-title-row">
        <h1 className="admin-page-title">Historial de ventas</h1>

        <div className="page-actions-row">
          <button
            type="button"
            className="admin-secondary-btn"
            onClick={() => toast.success('Exportación iniciada correctamente.')}
          >
            ↓ Exportar
          </button>

          <button
            type="button"
            className="admin-primary-btn"
            onClick={() => navigate('/point-of-sale')}
          >
            + Nueva Venta
          </button>
        </div>
      </div>

      <SalesHistoryTable onViewSale={setSelectedSale} />

      <SaleDetailsModal
        open={Boolean(selectedSale)}
        sale={selectedSale}
        onClose={() => setSelectedSale(null)}
      />
    </DashboardLayout>
  );
}

export default SalesHistoryPage;