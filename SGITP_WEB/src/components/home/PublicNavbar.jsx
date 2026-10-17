import { useEffect, useRef, useState } from 'react';
import {
  Building2,
  Heart,
  LogOut,
  Menu,
  Moon,
  Search,
  ShoppingBag,
  ShoppingBasket,
  Sun,
  UserRound,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getMyCart } from '../../services/cartService';
import { getMyFavorites } from '../../services/favoriteService';
import { isWholesaleCustomer } from '../../utils/purchaseRules';

const NAV_ITEMS = [
  { key: 'categories', label: 'Colecciones', path: '/categories' },
  { key: 'about', label: 'Nosotros', path: '/about' },
  { key: 'stores', label: 'Tiendas', path: '/stores' },
];

const EMPTY_COUNTS = { cart: 0, favorites: 0 };

// Cantidad de favoritos y de prendas en el carrito del cliente. Se vuelve a
// pedir cuando otra parte de la tienda avisa con "store-counts-changed".
function useStoreCounts(isAuthenticated) {
  const [counts, setCounts] = useState({ cart: 0, favorites: 0 });

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    let isMounted = true;

    const loadCounts = () => {
      Promise.all([getMyCart().catch(() => null), getMyFavorites().catch(() => [])]).then(
        ([cart, favorites]) => {
          if (!isMounted) return;
          setCounts({
            cart: (cart?.products || []).reduce((total, item) => total + Number(item.quantity || 0), 0),
            favorites: Array.isArray(favorites) ? favorites.length : 0,
          });
        }
      );
    };

    loadCounts();
    window.addEventListener('store-counts-changed', loadCounts);

    return () => {
      isMounted = false;
      window.removeEventListener('store-counts-changed', loadCounts);
    };
  }, [isAuthenticated]);

  return isAuthenticated ? counts : EMPTY_COUNTS;
}

function CountBadge({ value }) {
  if (!value) return null;
  return <span className="store-count-badge">{value > 9 ? '9+' : value}</span>;
}

function PublicNavbar({ activeItem = '' }) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const searchInputRef = useRef(null);
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const isDark = theme === 'dark';
  const isWholesale = isWholesaleCustomer(user);
  const counts = useStoreCounts(isAuthenticated);

  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus();
  }, [isSearchOpen]);

  const handleNavigate = (path) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchText.trim().slice(0, 60);
    setIsSearchOpen(false);
    navigate(query ? `/categories?q=${encodeURIComponent(query)}` : '/categories');
  };

  const handleLogout = async () => {
    setIsMenuOpen(false);

    try {
      await logout();
      toast.success('Sesión cerrada correctamente.');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error.message ?? 'No se pudo cerrar sesión.');
    }
  };

  return (
    <>
      <div className="store-announcement">Ropa para bebés · Visítanos en nuestras tiendas</div>

      <header className="store-header">
        <div className="store-header-row">
          <button
            type="button"
            className="store-icon-btn store-menu-toggle"
            aria-label="Abrir menú"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={19} strokeWidth={1.6} />
          </button>

          <nav className={`store-nav ${isMenuOpen ? 'store-nav-open' : ''}`} aria-label="Navegación principal">
            <div className="store-drawer-heading">
              <strong>PEQUES</strong>
              <button
                type="button"
                className="store-icon-btn"
                aria-label="Cerrar menú"
                onClick={() => setIsMenuOpen(false)}
              >
                <X size={19} strokeWidth={1.6} />
              </button>
            </div>

            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`store-nav-link ${activeItem === item.key ? 'store-nav-link-active' : ''}`}
                onClick={() => handleNavigate(item.path)}
              >
                {item.label}
              </button>
            ))}

            <button
              type="button"
              className="store-nav-link store-nav-mobile-only"
              onClick={() => handleNavigate('/profile')}
            >
              Mi perfil
            </button>
            <button
              type="button"
              className="store-nav-link store-nav-mobile-only"
              onClick={() => handleNavigate('/profile#profile-favorites')}
            >
              Favoritos {counts.favorites ? `(${counts.favorites})` : ''}
            </button>

            {isAuthenticated ? (
              <button type="button" className="store-nav-link store-nav-logout" onClick={handleLogout}>
                <LogOut size={15} strokeWidth={1.7} /> Cerrar sesión
              </button>
            ) : null}
          </nav>

          <button type="button" className="store-logo" onClick={() => navigate('/home')}>
            PEQUES
          </button>

          <div className="store-actions">
            {isAuthenticated ? (
              <span
                className={`store-customer-type ${isWholesale ? 'store-customer-wholesale' : ''}`}
                title={
                  isWholesale
                    ? 'Cliente mayorista: ves precios mayoristas y el stock disponible'
                    : 'Cliente minorista: máximo 4 unidades por producto'
                }
              >
                {isWholesale ? (
                  <Building2 size={13} strokeWidth={1.8} />
                ) : (
                  <ShoppingBasket size={13} strokeWidth={1.8} />
                )}
                <span>{isWholesale ? 'Mayorista' : 'Minorista'}</span>
              </span>
            ) : null}
            <button
              type="button"
              className="store-icon-btn"
              aria-label="Buscar"
              aria-expanded={isSearchOpen}
              onClick={() => setIsSearchOpen((open) => !open)}
            >
              <Search size={17} strokeWidth={1.6} />
            </button>
            <button
              type="button"
              className="store-icon-btn"
              aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
              onClick={toggleTheme}
            >
              {isDark ? <Sun size={17} strokeWidth={1.6} /> : <Moon size={17} strokeWidth={1.6} />}
            </button>
            <button
              type="button"
              className="store-icon-btn store-hide-mobile"
              aria-label="Mi perfil"
              onClick={() => navigate('/profile')}
            >
              <UserRound size={17} strokeWidth={1.6} />
            </button>
            <button
              type="button"
              className="store-icon-btn store-hide-mobile"
              aria-label="Favoritos"
              onClick={() => navigate('/profile#profile-favorites')}
            >
              <Heart size={17} strokeWidth={1.6} />
              <CountBadge value={counts.favorites} />
            </button>
            <button type="button" className="store-icon-btn" aria-label="Carrito" onClick={() => navigate('/cart')}>
              <ShoppingBag size={17} strokeWidth={1.6} />
              <CountBadge value={counts.cart} />
            </button>
          </div>
        </div>

        {isSearchOpen ? (
          <form className="store-search" onSubmit={handleSearch} role="search">
            <Search size={16} strokeWidth={1.6} />
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Buscar prendas, telas o categorías"
              value={searchText}
              maxLength={60}
              onChange={(event) => setSearchText(event.target.value)}
            />
            <button type="submit">Buscar</button>
          </form>
        ) : null}
      </header>

      <button
        type="button"
        className={`store-nav-overlay ${isMenuOpen ? 'store-nav-overlay-open' : ''}`}
        aria-label="Cerrar menú"
        tabIndex={isMenuOpen ? 0 : -1}
        onClick={() => setIsMenuOpen(false)}
      />
    </>
  );
}

export default PublicNavbar;
