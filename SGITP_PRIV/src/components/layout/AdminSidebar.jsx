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
import useCurrentEmployee from '../../hooks/auth/UseCurrentEmployee';

const ROLE_LABELS = {
  Administrator: 'Administrador',
  Employee: 'Empleado',
};

function getInitials(name = '') {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || '?'
  );
}

const SIDEBAR_ITEMS = [
  { key: 'dashboard', label: 'Panel principal', icon: LayoutDashboard, path: '/dashboard' },
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
  const employee = useCurrentEmployee();

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

        {/* Usuario conectado, arriba del menú de navegación */}
        <div className="admin-sidebar-user" aria-label="Usuario conectado">
          <span className="admin-sidebar-avatar" aria-hidden="true">
            {getInitials(employee?.full_name)}
          </span>
          <div className="admin-sidebar-user-info">
            <span className="admin-sidebar-user-label">Conectado como</span>
            <strong>{employee?.full_name || 'Cargando...'}</strong>
            {employee ? (
              <small>
                {ROLE_LABELS[employee.role] ?? employee.role}
                {employee.email ? ` · ${employee.email}` : ''}
              </small>
            ) : null}
          </div>
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