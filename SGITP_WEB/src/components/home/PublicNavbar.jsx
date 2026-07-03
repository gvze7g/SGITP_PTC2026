import { Menu, ShoppingBag, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { key: 'collections', label: 'Colecciones', path: '/collections' },
  { key: 'clothes', label: 'Ropa', path: '/clothes' },
  { key: 'about', label: 'Acerca de nosotros', path: '/about' },
  { key: 'stores', label: 'Tiendas', path: '/stores' },
];

function PublicNavbar({ activeItem = '' }) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigate = (path) => {
    setIsMenuOpen(false);

    if (path.includes('#')) {
      window.location.href = path;
      return;
    }

    navigate(path);
  };

  return (
    <header className="public-navbar">
      <div className="public-nav-top">
        <button
          type="button"
          className="public-menu-toggle"
          aria-label={isMenuOpen ? 'Cerrar menu' : 'Abrir menu'}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          {isMenuOpen ? <X size={18} strokeWidth={1.7} /> : <Menu size={18} strokeWidth={1.7} />}
        </button>

        <button type="button" className="public-logo" onClick={() => navigate('/home')}>
          PEQUES
        </button>

        <div className="public-nav-actions">
          <button type="button" aria-label="Carrito" onClick={() => navigate('/cart')}>
            <ShoppingBag size={17} strokeWidth={1.6} />
          </button>
          <button type="button" aria-label="Perfil" onClick={() => navigate('/profile')}>
            <UserRound size={17} strokeWidth={1.6} />
          </button>
        </div>
      </div>

      <button
        type="button"
        className={`public-nav-overlay ${isMenuOpen ? 'public-nav-overlay-open' : ''}`}
        aria-label="Cerrar menu"
        onClick={() => setIsMenuOpen(false)}
      />

      <nav
        className={`public-nav-links ${isMenuOpen ? 'public-nav-links-open' : ''}`}
        aria-label="Navegacion principal"
      >
        <div className="public-drawer-heading">
          <strong>PEQUES</strong>
        </div>

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
    </header>
  );
}

export default PublicNavbar;
