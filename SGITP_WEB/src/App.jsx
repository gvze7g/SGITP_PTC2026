import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useEffect, useState } from 'react';

import RegisterPage from './pages/auth/RegisterPage';
import VerifyRegisterCodePage from './pages/auth/VerifyRegisterCodePage';
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import RecoveryCodePage from './pages/auth/RecoveryCodePage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import HomePage from './pages/home/HomePage';
import ProductDetailPage from './pages/products/ProductDetailPage';
import CollectionPage from './pages/collections/CollectionPage';
import CartPage from './pages/cart/CartPage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import ClothesPage from './pages/clothes/ClothesPage';
import AboutPage from './pages/about/AboutPage';
import StoresPage from './pages/stores/StoresPage';
import ProfilePage from './pages/profile/ProfilePage';
import ReturnsPage from './pages/returns/ReturnsPage';
import ConciergePage from './pages/concierge/ConciergePage';
import { ThemeContext } from './context/ThemeContext';
import { AuthProvider } from './context/AuthProvider';
import NotFoundPage from './pages/NotFoundPage';
import usePageTitle from './hooks/usePageTitle';

const PAGE_TITLES = {
  '/': 'Inicio',
  '/register': 'Crear cuenta',
  '/verify-code': 'Verificar cuenta',
  '/login': 'Iniciar sesión',
  '/forgot-password': 'Recuperar contraseña',
  '/recovery-code': 'Código de recuperación',
  '/reset-password': 'Restablecer contraseña',
  '/home': 'Inicio',
  '/collections': 'Categorias',
  '/categories': 'Categorias',
  '/clothes': 'Ropa',
  '/about': 'Acerca de nosotros',
  '/stores': 'Tiendas',
  '/profile': 'Perfil',
  '/returns': 'Devoluciones',
  '/concierge': 'Consejería',
  '/product-detail': 'Detalle de producto',
  '/cart': 'Carrito',
  '/checkout': 'Pago',
};

function AppRoutes() {
  const location = useLocation();
  const routeTitle =
    location.pathname.startsWith('/product-detail/')
      ? 'Detalle de producto'
      : PAGE_TITLES[location.pathname];

  // Cada ruta pública actualiza el título del navegador y las rutas no definidas
  // muestran la vista 404 en lugar de volver silenciosamente al inicio.
  usePageTitle(routeTitle ?? 'Página no encontrada');

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-code" element={<VerifyRegisterCodePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/recovery-code" element={<RecoveryCodePage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/collections" element={<CollectionPage />} />
      <Route path="/categories" element={<CollectionPage />} />
      <Route path="/clothes" element={<ClothesPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/stores" element={<StoresPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/returns" element={<ReturnsPage />} />
      <Route path="/concierge" element={<ConciergePage />} />
      <Route path="/product-detail" element={<ProductDetailPage />} />
      <Route path="/product-detail/:productId" element={<ProductDetailPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('sgitp-web-theme');
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }

    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    return 'dark';
  });

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    // El modo oscuro se guarda para mantener la preferencia al recargar o volver al sitio.
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light');
    localStorage.setItem('sgitp-web-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" richColors closeButton duration={2500} />
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeContext.Provider>
  );
}

export default App;
