import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';

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

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors closeButton duration={2500} />

      <Routes>
        <Route path="/" element={<RegisterPage />} />
        <Route path="/verify-code" element={<VerifyRegisterCodePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/recovery-code" element={<RecoveryCodePage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/collections" element={<CollectionPage />} />
        <Route path="/clothes" element={<ClothesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/stores" element={<StoresPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/returns" element={<ReturnsPage />} />
        <Route path="/concierge" element={<ConciergePage />} />
        <Route path="/product-detail" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
