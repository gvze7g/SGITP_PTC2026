const DAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTH_LABELS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

function getSaleTotal(sale) {
  const items = Array.isArray(sale.item_details) ? sale.item_details : [];
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.unit_price || 0) * Number(item.quantity || 0),
    0
  );
  return subtotal + Number(sale.shipping_cost || 0);
}

function getSaleDate(sale) {
  return new Date(sale.sales_date || sale.createdAt || Date.now());
}

function isActiveSale(sale) {
  return sale.payment_status !== "Cancelado";
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Ingresos de los ultimos 7 dias, para la vista "Semana" del grafico
export function buildWeekSeries(sales) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = [];
  for (let i = 6; i >= 0; i -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    days.push(day);
  }

  return days.map((day) => {
    const total = sales
      .filter((sale) => isActiveSale(sale) && sameDay(getSaleDate(sale), day))
      .reduce((sum, sale) => sum + getSaleTotal(sale), 0);

    return { label: DAY_LABELS[day.getDay()], ingresos: Math.round(total) };
  });
}

// Ingresos agrupados por semana del mes actual, para la vista "Mes"
export function buildMonthSeries(sales) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const weeks = [];
  for (let start = 1; start <= daysInMonth; start += 7) {
    weeks.push({ start, end: Math.min(start + 6, daysInMonth) });
  }

  return weeks.map(({ start, end }) => {
    const total = sales
      .filter((sale) => isActiveSale(sale))
      .filter((sale) => {
        const date = getSaleDate(sale);
        return (
          date.getFullYear() === year &&
          date.getMonth() === month &&
          date.getDate() >= start &&
          date.getDate() <= end
        );
      })
      .reduce((sum, sale) => sum + getSaleTotal(sale), 0);

    return {
      label: `${String(start).padStart(2, "0")} ${MONTH_LABELS[month]}`,
      ingresos: Math.round(total),
    };
  });
}

// Ingresos por mes del año actual, para la vista "Año"
export function buildYearSeries(sales) {
  const year = new Date().getFullYear();

  return MONTH_LABELS.map((label, monthIndex) => {
    const total = sales
      .filter((sale) => isActiveSale(sale))
      .filter((sale) => {
        const date = getSaleDate(sale);
        return date.getFullYear() === year && date.getMonth() === monthIndex;
      })
      .reduce((sum, sale) => sum + getSaleTotal(sale), 0);

    return { label, ingresos: Math.round(total) };
  });
}

// Ventas totales y ticket promedio del mes actual
export function computeMonthlyTotals(sales) {
  const now = new Date();

  const thisMonthSales = sales.filter((sale) => {
    if (!isActiveSale(sale)) return false;
    const date = getSaleDate(sale);
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  });

  const total = thisMonthSales.reduce((sum, sale) => sum + getSaleTotal(sale), 0);
  const averageTicket = thisMonthSales.length > 0 ? total / thisMonthSales.length : 0;

  return { total, averageTicket, count: thisMonthSales.length };
}

// Clientes nuevos registrados este mes
export function countNewCustomersThisMonth(customers) {
  const now = new Date();

  return customers.filter((customer) => {
    if (!customer.createdAt) return false;
    const date = new Date(customer.createdAt);
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  }).length;
}
