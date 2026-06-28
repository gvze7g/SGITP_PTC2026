import {
  X,
  LayoutDashboard,
  Package,
  Store,
  BadgeDollarSign,
  BriefcaseBusiness,
  Landmark,
  Users,
  StoreIcon,
  Tag,
  ReceiptText,
} from 'lucide-react';

const SIDEBAR_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'inventory', label: 'Inventario', icon: Package },
  { key: 'point-of-sale', label: 'Punto de venta', icon: Store },
  { key: 'sales-history', label: 'Historial de ventas', icon: BadgeDollarSign },
  { key: 'employees', label: 'Empleados', icon: BriefcaseBusiness },
  { key: 'payroll', label: 'Nómina', icon: Landmark },
  { key: 'clients', label: 'Clientes', icon: Users },
  { key: 'branches', label: 'Sucursales', icon: StoreIcon },
  { key: 'promotions', label: 'Promociones', icon: Tag },
  { key: 'expenses', label: 'Gastos', icon: ReceiptText },
];

function AdminSidebar({
  currentView,
  onNavigate,
  isMobileOpen,
  onCloseMobileMenu,
}) {
  return (
    <>
      <div
        className={`admin-sidebar-overlay ${isMobileOpen ? 'admin-sidebar-overlay-visible' : ''}`}
        onClick={onCloseMobileMenu}
      />

      <aside className={`admin-sidebar ${isMobileOpen ? 'admin-sidebar-mobile-open' : ''}`}>
        <div className="admin-sidebar-top-space">
          <button
            type="button"
            className="admin-sidebar-close-btn"
            onClick={onCloseMobileMenu}
            aria-label="Cerrar menú"
          >
            <X size={22} strokeWidth={1.8} />
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.key;

            return (
              <button
                key={item.key}
                type="button"
                className={`admin-sidebar-item ${isActive ? 'admin-sidebar-item-active' : ''}`}
                onClick={() => {
                  onNavigate(item.key);
                  onCloseMobileMenu();
                }}
              >
                <Icon size={22} strokeWidth={1.8} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

export default AdminSidebar;