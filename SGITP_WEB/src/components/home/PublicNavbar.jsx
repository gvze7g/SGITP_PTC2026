import { ShoppingBag, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { key: 'collections', label: 'Colecciones', path: '/collections' },
  { key: 'clothes', label: 'Ropa', path: '/clothes' },
  { key: 'about', label: 'Acerca de nosotros', path: '/about' },
  { key: 'stores', label: 'Tiendas', path: '/stores' },
];

function PublicNavbar({ activeItem = '' }) {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    if (path.includes('#')) {
      window.location.href = path;
      return;
    }

    navigate(path);
  };

  return (
    <header className="public-navbar">
      <button type="button" className="public-logo" onClick={() => navigate('/home')}>
        PEQUES
      </button>

      <nav className="public-nav-links" aria-label="Navegacion principal">
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
        <button type="button" aria-label="Carrito" onClick={() => navigate('/cart')}>
          <ShoppingBag size={17} strokeWidth={1.6} />
        </button>
        <button type="button" aria-label="Perfil" onClick={() => navigate('/profile')}>
          <UserRound size={17} strokeWidth={1.6} />
        </button>
      </div>
    </header>
  );
}

export default PublicNavbar;
