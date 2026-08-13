import { useEffect, useState } from 'react';
import MetricCard from '../../components/dashboard/MetricCard';
import SalesChartCard from '../../components/dashboard/SalesChartCard';
import StarProductsCard from '../../components/dashboard/StarProductsCard';
import DashboardLayout from '../../components/layout/DashboardLayout';
import useSales from '../../hooks/sales/UseSales';
import useClients from '../../hooks/clients/UseClients';
import useProducts from '../../hooks/Inventory/UseProducts';
import {
  buildMonthSeries,
  buildWeekSeries,
  buildYearSeries,
  computeMonthlyTotals,
  countNewCustomersThisMonth,
} from '../../utils/dashboardStats';

const formatMoney = (value) => `$${Number(value || 0).toFixed(2)}`;

function DashboardPage({ theme, onToggleTheme }) {
  const { sales, getSales, getBestSellers } = useSales();
  const { clients, getClients } = useClients();
  const { getProductsCount } = useProducts();

  const [bestSellers, setBestSellers] = useState([]);
  const [bestSellersLoading, setBestSellersLoading] = useState(true);
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    getSales();
    getClients();

    getProductsCount().then((result) => {
      if (result?.success && result.data) {
        setLowStockCount(result.data.lowStockCount || 0);
      }
    });

    getBestSellers(3).then((result) => {
      if (result.success) {
        setBestSellers(Array.isArray(result.data) ? result.data : []);
      }
      setBestSellersLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { total: monthlyTotal, averageTicket } = computeMonthlyTotals(sales);
  const newCustomers = countNewCustomersThisMonth(clients);

  return (
    <DashboardLayout theme={theme} onToggleTheme={onToggleTheme}>
      <section className="dashboard-metrics-grid">
        <MetricCard title="VENTAS TOTALES (MES)" value={formatMoney(monthlyTotal)} />
        <MetricCard title="TICKET PROMEDIO" value={formatMoney(averageTicket)} />
        <MetricCard title="CLIENTES NUEVOS" value={String(newCustomers)} />
        <MetricCard title="PRODUCTOS BAJOS EN STOCK" value={String(lowStockCount)} />
      </section>

      <section className="dashboard-bottom-grid">
        <SalesChartCard
          weekData={buildWeekSeries(sales)}
          monthData={buildMonthSeries(sales)}
          yearData={buildYearSeries(sales)}
        />
        <StarProductsCard products={bestSellers} loading={bestSellersLoading} />
      </section>
    </DashboardLayout>
  );
}

export default DashboardPage;
