import { Bell, Menu, Moon, Search, Settings, Sun } from 'lucide-react';

function AdminTopbar({ theme, onToggleTheme, onOpenMobileMenu }) {
  const isDark = theme === 'dark';

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-left">
        <button
          type="button"
          className="admin-mobile-menu-btn"
          onClick={onOpenMobileMenu}
          aria-label="Abrir menú"
        >
          <Menu size={22} strokeWidth={1.8} />
        </button>

        <div className="admin-search-wrap">
          <Search size={20} strokeWidth={1.8} />
          <input
            type="text"
            placeholder="Buscar..."
            className="admin-search-input"
          />
        </div>
      </div>

      <div className="admin-topbar-actions">
        <button
          type="button"
          className="admin-icon-btn"
          onClick={onToggleTheme}
          aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
        >
          {isDark ? <Sun size={20} strokeWidth={1.8} /> : <Moon size={20} strokeWidth={1.8} />}
        </button>

        <button type="button" className="admin-icon-btn">
          <Bell size={20} strokeWidth={1.8} />
        </button>

        <button type="button" className="admin-icon-btn">
          <Settings size={20} strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
}

export default AdminTopbar;