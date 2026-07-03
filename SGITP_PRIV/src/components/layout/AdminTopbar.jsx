import { Bell, Menu, Moon, Search, Settings, Sun, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const API_URL = 'http://localhost:4000';

function AdminTopbar({
  theme,
  onToggleTheme,
  onOpenMobileMenu,
  searchValue = '',
  onSearchChange,
  onSearchSubmit,
  searchPlaceholder = 'Buscar...',
}) {
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const clearClientCookies = () => {
    const cookieNames = ['token', 'authToken', 'accessToken', 'refreshToken', 'connect.sid'];

    cookieNames.forEach((cookieName) => {
      document.cookie = `${cookieName}=; Max-Age=0; path=/`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_URL}/api/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('No se pudo cerrar sesión en el servidor.');
      }

      toast.success('Sesión cerrada correctamente.');
    } catch (error) {
      console.log('logout error:', error);
      toast.error('No se pudo cerrar la sesión correctamente.');
    } finally {
      clearClientCookies();
      navigate('/', { replace: true });
    }
  };

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

        <form
          className="admin-search-wrap"
          onSubmit={(event) => {
            event.preventDefault();
            onSearchSubmit?.();
          }}
        >
          <Search size={20} strokeWidth={1.8} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="admin-search-input"
            aria-label="Buscar"
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
          />
        </form>
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

        <button
          type="button"
          className="admin-icon-btn"
          aria-label="Notificaciones"
          onClick={() => toast('No hay notificaciones nuevas.')}
        >
          <Bell size={20} strokeWidth={1.8} />
        </button>

        <button
          type="button"
          className="admin-icon-btn"
          aria-label="Configuración"
          onClick={() => toast('Configuración disponible próximamente.')}
        >
          <Settings size={20} strokeWidth={1.8} />
        </button>

        <button
          type="button"
          className="admin-icon-btn"
          aria-label="Cerrar sesión"
          onClick={handleLogout}
        >
          <LogOut size={20} strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
}

export default AdminTopbar;
