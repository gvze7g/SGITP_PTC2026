import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SalesHistoryTable from '../../components/sales/SalesHistoryTable';
import SaleDetailsModal from '../../components/sales/SaleDetailsModal';

function SalesHistoryPage({ currentView, onNavigate, theme, onToggleTheme }) {
  const [selectedSale, setSelectedSale] = useState(null);

  return (
    <DashboardLayout
      currentView={currentView}
      onNavigate={onNavigate}
      theme={theme}
      onToggleTheme={onToggleTheme}
    >
      <div className="page-title-row">
        <h1 className="admin-page-title">Historial de ventas</h1>

        <div className="page-actions-row">
          <button type="button" className="admin-secondary-btn">
            ↓ Exportar
          </button>

          <button
            type="button"
            className="admin-primary-btn"
            onClick={() => onNavigate('point-of-sale')}
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