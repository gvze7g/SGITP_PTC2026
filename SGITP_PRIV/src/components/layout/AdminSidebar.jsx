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
import { useLocation, useNavigate } from 'react-router-dom';

const SIDEBAR_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { key: 'inventory', label: 'Inventario', icon: Package, path: '/inventory' },
  { key: 'point-of-sale', label: 'Punto de venta', icon: Store, path: '/point-of-sale' },
  { key: 'sales-history', label: 'Historial de ventas', icon: BadgeDollarSign, path: '/sales-history' },
  { key: 'employees', label: 'Empleados', icon: BriefcaseBusiness, path: '/employees' },
  { key: 'payroll', label: 'Nómina', icon: Landmark, path: '/payroll' },
  { key: 'clients', label: 'Clientes', icon: Users, path: '/clients' },
  { key: 'branches', label: 'Sucursales', icon: StoreIcon, path: '/branches' },
  { key: 'promotions', label: 'Promociones', icon: Tag, path: '/promotions' },
  { key: 'expenses', label: 'Gastos', icon: ReceiptText, path: '/expenses' },
];

function AdminSidebar({ isMobileOpen, onCloseMobileMenu }) {
  const navigate = useNavigate();
  const location = useLocation();

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
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.key}
                type="button"
                className={`admin-sidebar-item ${isActive ? 'admin-sidebar-item-active' : ''}`}
                onClick={() => {
                  navigate(item.path);
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