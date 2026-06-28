import MetricCard from '../../components/dashboard/MetricCard';
import SalesChartCard from '../../components/dashboard/SalesChartCard';
import StarProductsCard from '../../components/dashboard/StarProductsCard';
import DashboardLayout from '../../components/layout/DashboardLayout';

function DashboardPage({ currentView, onNavigate, theme, onToggleTheme }) {
  return (
    <DashboardLayout
      currentView={currentView}
      onNavigate={onNavigate}
      theme={theme}
      onToggleTheme={onToggleTheme}
    >
      <section className="dashboard-metrics-grid">
        <MetricCard title="VENTAS TOTALES (MES)" value="$12,450.00" />
        <MetricCard title="TICKET PROMEDIO" value="$185.00" />
        <MetricCard title="CLIENTES NUEVOS" value="42" />
        <MetricCard title="PRODUCTOS BAJOS EN STOCK" value="5" />
      </section>

      <section className="dashboard-bottom-grid">
        <SalesChartCard />
        <StarProductsCard />
      </section>
    </DashboardLayout>
  );
}

export default DashboardPage;