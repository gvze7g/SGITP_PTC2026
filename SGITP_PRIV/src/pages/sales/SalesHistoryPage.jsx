import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SalesHistoryTable from '../../components/sales/SalesHistoryTable';
import SaleDetailsModal from '../../components/sales/SaleDetailsModal';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';
import useSales from '../../hooks/sales/UseSales';
import { downloadSalesPdf } from './salesPdf';

const ORIGIN_LABELS = {
  Store: 'Tienda Física',
  Online: 'En línea',
  WhatsApp: 'WhatsApp',
  Instagram: 'Instagram',
  Web: 'Web',
};

const PRICE_TYPE_LABELS = {
  Retail: 'Minorista',
  Wholesale: 'Mayorista',
};

// El pedido nace "Pending" cuando lo hace el cliente desde la web o la app
// movil (no hay pasarela de pago real conectada); un Employee lo completa
// desde aqui una vez confirma el cobro. El POS ya guarda la venta como
// "Pagado" desde que se crea.
const PAYMENT_STATUS_LABELS = {
  Pending: 'Pendiente de pago',
  Paid: 'Pagado',
  Pagado: 'Pagado',
  Cancelado: 'Cancelado',
};

const formatMoney = (value) => `$${Number(value || 0).toFixed(2)}`;

const DATE_FILTER_LABELS = {
  all: 'Todas las fechas',
  today: 'Hoy',
  week: 'Últimos 7 días',
  month: 'Este mes',
  year: 'Este año',
};

function matchesDateFilter(rawDate, dateFilter) {
  if (dateFilter === 'all') return true;
  if (!rawDate) return false;

  const date = new Date(rawDate);
  const now = new Date();

  if (dateFilter === 'today') return date.toDateString() === now.toDateString();
  if (dateFilter === 'week') {
    const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    return date >= weekAgo;
  }
  if (dateFilter === 'month') {
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  }
  if (dateFilter === 'year') return date.getFullYear() === now.getFullYear();
  return true;
}

function formatSale(sale) {
  const items = Array.isArray(sale.item_details) ? sale.item_details : [];
  const subtotalValue = items.reduce(
    (sum, item) => sum + Number(item.unit_price || 0) * Number(item.quantity || 0),
    0
  );
  const shippingValue = Number(sale.shipping_cost || 0);
  const totalValue = subtotalValue + shippingValue;
  const customer = sale.cart_id?.customerId;
  const branch = sale.employee_id?.branch_id;
  const rawDate = sale.sales_date || sale.createdAt;

  return {
    ...sale,
    id: `#${String(sale._id || '').slice(-6).toUpperCase()}`,
    date: rawDate
      ? new Date(rawDate).toLocaleString('es-SV', { dateStyle: 'medium', timeStyle: 'short' })
      : '—',
    client: customer?.full_name || 'Cliente mostrador',
    origin: ORIGIN_LABELS[sale.origin] || sale.origin || '—',
    branch: branch?.name || 'Sin sucursal asignada',
    priceType: PRICE_TYPE_LABELS[sale.applied_price_type] || sale.applied_price_type || '—',
    paymentStatus: sale.payment_status,
    paymentStatusLabel: PAYMENT_STATUS_LABELS[sale.payment_status] || sale.payment_status || '—',
    isPending: sale.payment_status === 'Pending',
    total: formatMoney(totalValue),
    totalValue,
    subtotal: formatMoney(subtotalValue),
    shipping: formatMoney(shippingValue),
    items: items.map((item) => ({
      name: item.name,
      variant: item.selected_variant || '—',
      quantity: item.quantity,
      price: formatMoney(item.unit_price),
      subtotal: formatMoney(Number(item.unit_price || 0) * Number(item.quantity || 0)),
    })),
  };
}

function SalesHistoryPage({ theme, onToggleTheme }) {
  const { sales, loading, getSales, updateSale } = useSales();
  const [selectedSale, setSelectedSale] = useState(null);
  const [saleToVoid, setSaleToVoid] = useState(null);
  const [filters, setFilters] = useState({ origin: 'all', branch: 'all', date: 'month' });
  const navigate = useNavigate();

  const loadSales = useCallback(async () => {
    const result = await getSales();
    if (!result?.success) {
      toast.error(result?.message || 'No se pudo cargar el historial de ventas.');
    }
  }, [getSales]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const formattedSales = sales.map(formatSale);

  const branchOptions = [...new Set(formattedSales.map((sale) => sale.branch))].sort();

  const filteredSales = formattedSales.filter(
    (sale) =>
      (filters.origin === 'all' || sale.origin === (ORIGIN_LABELS[filters.origin] || filters.origin)) &&
      (filters.branch === 'all' || sale.branch === filters.branch) &&
      matchesDateFilter(sale.sales_date || sale.createdAt, filters.date)
  );

  const handleFilterChange = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleExportPdf = () => {
    const totalAmount = filteredSales.reduce(
      (sum, sale) => sum + sale.totalValue,
      0
    );
    const filtersSummary = [
      `Origen: ${filters.origin === 'all' ? 'Todos' : ORIGIN_LABELS[filters.origin] || filters.origin}`,
      `Sucursal: ${filters.branch === 'all' ? 'Todas las sucursales' : filters.branch}`,
      `Fecha: ${DATE_FILTER_LABELS[filters.date]}`,
    ].join('  |  ');

    try {
      downloadSalesPdf({
        sales: filteredSales,
        filtersSummary,
        totalAmount: formatMoney(totalAmount),
      });
      toast.success('PDF descargado correctamente.');
    } catch {
      toast.error('No se pudo generar el PDF.');
    }
  };

  const handleVoidSale = (sale) => {
    setSaleToVoid(sale);
  };

  const handleConfirmVoid = async () => {
    if (!saleToVoid?._id) return;

    const result = await updateSale(saleToVoid._id, { payment_status: 'Cancelado' });

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success('Venta anulada correctamente.');
    setSaleToVoid(null);
    setSelectedSale(null);
    await loadSales();
  };

  const handleCompleteSale = async (sale) => {
    if (!sale?._id) return;

    const result = await updateSale(sale._id, { payment_status: 'Paid' });

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success('Venta marcada como pagada.');
    setSelectedSale(null);
    await loadSales();
  };

  return (
    <DashboardLayout theme={theme} onToggleTheme={onToggleTheme}>
      <div className="page-title-row">
        <h1 className="admin-page-title">Historial de ventas</h1>

        <div className="page-actions-row">
          <button
            type="button"
            className="admin-secondary-btn"
            onClick={handleExportPdf}
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

      <SalesHistoryTable
        sales={filteredSales}
        loading={loading}
        onViewSale={setSelectedSale}
        filters={filters}
        onFilterChange={handleFilterChange}
        originOptions={ORIGIN_LABELS}
        branchOptions={branchOptions}
        dateOptions={DATE_FILTER_LABELS}
      />

      <SaleDetailsModal
        open={Boolean(selectedSale)}
        sale={selectedSale}
        onClose={() => setSelectedSale(null)}
        onVoidSale={handleVoidSale}
        onCompleteSale={handleCompleteSale}
      />

      <ConfirmDeleteModal
        open={Boolean(saleToVoid)}
        onClose={() => setSaleToVoid(null)}
        onConfirm={handleConfirmVoid}
        title="¿Deseas anular esta venta?"
        description="La venta se marcará como cancelada. Esta acción no se puede deshacer."
        confirmText="ANULAR"
      />
    </DashboardLayout>
  );
}

export default SalesHistoryPage;
