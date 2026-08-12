import { Menu, Moon, ShoppingBag, Sun, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const NAV_ITEMS = [
  { key: 'collections', label: 'Colecciones', path: '/collections' },
  { key: 'clothes', label: 'Ropa', path: '/clothes' },
  { key: 'about', label: 'Acerca de nosotros', path: '/about' },
  { key: 'stores', label: 'Tiendas', path: '/stores' },
];

function PublicNavbar({ activeItem = '' }) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleNavigate = (path) => {
    closeMenu();

    if (path.includes('#')) {
      window.location.href = path;
      return;
    }

    navigate(path);
  };

  return (
    <>
      <header className="public-navbar">
        <div className="public-nav-top">
          <button
            type="button"
            className="public-menu-toggle"
            aria-label="Abrir menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={18} strokeWidth={1.7} />
          </button>

          <button type="button" className="public-logo" onClick={() => navigate('/home')}>
            PEQUES
          </button>

          <nav
            className={`public-nav-links ${isMenuOpen ? 'public-nav-links-open' : ''}`}
            aria-label="Navegacion principal"
          >
        <div className="public-drawer-heading">
          <button
            type="button"
            className="public-drawer-close"
            aria-label="Cerrar menu"
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              closeMenu();
            }}
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              closeMenu();
            }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              closeMenu();
            }}
          >
            <X size={18} strokeWidth={1.7} />
          </button>
          <strong>PEQUES</strong>
        </div>

        <button
          type="button"
          className="public-drawer-theme"
          onClick={toggleTheme}
        >
          {isDark ? 'Modo claro' : 'Modo oscuro'}
        </button>

        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={activeItem === item.key ? 'public-nav-link-active' : ''}
            onClick={() => handleNavigate(item.path)}
          >
            {item.label}
          </button>
        ))}
          </nav>

          <div className="public-nav-actions">
            <button
              type="button"
              className="public-theme-toggle"
              aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
              onClick={toggleTheme}
            >
              {isDark ? <Sun size={17} strokeWidth={1.7} /> : <Moon size={17} strokeWidth={1.7} />}
            </button>
            <button type="button" aria-label="Carrito" onClick={() => navigate('/cart')}>
              <ShoppingBag size={17} strokeWidth={1.6} />
            </button>
            <button type="button" aria-label="Perfil" onClick={() => navigate('/profile')}>
              <UserRound size={17} strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </header>

      <button
        type="button"
        className={`public-nav-overlay ${isMenuOpen ? 'public-nav-overlay-open' : ''}`}
        aria-label="Cerrar menu"
        onClick={closeMenu}
      />
    </>
  );
}

export default PublicNavbar;
