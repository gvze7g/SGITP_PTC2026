import { useCallback, useEffect, useMemo, useState } from "react";
import { getMonthKey } from "../../utils/dateRules";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
const SEEN_STORAGE_KEY = "sgitp-admin-seen-notifications";
const REFRESH_MS = 2 * 60 * 1000;
const LOW_STOCK_THRESHOLD = 5;
const COUPON_WARNING_DAYS = 3;

const getJson = async (path) => {
  const response = await fetch(`${API_URL}${path}`, { credentials: "include" });
  if (!response.ok) return null;
  return response.json().catch(() => null);
};

const readSeen = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(SEEN_STORAGE_KEY) || "[]"));
  } catch {
    return new Set();
  }
};

const totalStock = (product) =>
  (product.variants || []).reduce((sum, variant) => sum + (Number.parseInt(variant.stock, 10) || 0), 0);

// Avisos del panel armados con datos reales de la API: stock bajo, pedidos
// de la web/app pendientes de cobro, nómina del mes sin pagar y cupones por
// vencer. Cada aviso lleva a la página donde se resuelve.
function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [seenIds, setSeenIds] = useState(readSeen);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [lowStock, sales, payrolls, promotions] = await Promise.all([
      getJson(`/products/status/low-stock?threshold=${LOW_STOCK_THRESHOLD}`).catch(() => null),
      getJson("/sales").catch(() => null),
      getJson("/payroll").catch(() => null),
      getJson("/promotions").catch(() => null),
    ]);

    const items = [];

    (Array.isArray(lowStock) ? lowStock : []).forEach((product) => {
      const stock = totalStock(product);
      items.push({
        // El id incluye el stock: si vuelve a bajar, el aviso aparece como nuevo.
        id: `stock-${product._id}-${stock}`,
        tone: stock === 0 ? "danger" : "warning",
        title: stock === 0 ? `${product.name} está agotado` : `Stock bajo: ${product.name}`,
        description: stock === 0 ? "Sin unidades en ninguna talla." : `Quedan ${stock} unidades en total.`,
        path: "/inventory",
      });
    });

    const pendingOrders = (Array.isArray(sales) ? sales : []).filter(
      (sale) => sale.payment_status === "Pending"
    );
    if (pendingOrders.length) {
      items.push({
        id: `orders-${pendingOrders.map((sale) => sale._id).sort().join(",")}`,
        tone: "info",
        title: `${pendingOrders.length} pedido(s) por cobrar`,
        description: "Pedidos de la web o la app esperando confirmación de pago.",
        path: "/sales-history",
      });
    }

    const currentMonth = getMonthKey(new Date());
    const pendingPayroll = (Array.isArray(payrolls) ? payrolls : []).filter(
      (payroll) => getMonthKey(payroll.period) === currentMonth && payroll.status !== "Pagado"
    );
    if (pendingPayroll.length) {
      items.push({
        id: `payroll-${currentMonth}-${pendingPayroll.length}`,
        tone: "info",
        title: `${pendingPayroll.length} pago(s) de nómina pendiente(s)`,
        description: "Nómina del mes actual sin pagar.",
        path: "/payroll",
      });
    }

    const now = Date.now();
    (Array.isArray(promotions) ? promotions : []).forEach((promotion) => {
      if (!promotion.isActive || !promotion.end_date) return;
      const daysLeft = Math.ceil((new Date(promotion.end_date).getTime() - now) / 86400000);
      if (daysLeft < 0 || daysLeft > COUPON_WARNING_DAYS) return;
      items.push({
        id: `coupon-${promotion._id}-${promotion.end_date}`,
        tone: "warning",
        title: `El cupón ${promotion.coupon_code} vence pronto`,
        description: daysLeft === 0 ? "Vence hoy." : `Vence en ${daysLeft} día(s).`,
        path: "/promotions",
      });
    });

    setNotifications(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    // Solo se consulta con la pestaña visible: un panel abierto en segundo
    // plano no debe seguir haciendo peticiones cada 2 minutos.
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, REFRESH_MS);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refresh]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !seenIds.has(notification.id)).length,
    [notifications, seenIds]
  );

  const markAllAsSeen = useCallback(() => {
    const next = new Set(notifications.map((notification) => notification.id));
    setSeenIds(next);
    try {
      localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify([...next]));
    } catch {
      // Sin almacenamiento local, los avisos solo se marcan durante esta visita.
    }
  }, [notifications]);

  return { notifications, unreadCount, seenIds, loading, refresh, markAllAsSeen };
}

export default useNotifications;
