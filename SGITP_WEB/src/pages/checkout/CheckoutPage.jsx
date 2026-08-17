import { ArrowLeft } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import PublicFooter from '../../components/home/PublicFooter';
import PublicNavbar from '../../components/home/PublicNavbar';
import { useAuth } from '../../context/AuthContext';
import { getCurrentCustomer } from '../../services/customerAuthService';
import { getMyCart, placeCartOrder } from '../../services/cartService';
import { getProductImage } from '../../services/catalogService';
import { validateCoupon } from '../../services/promotionsService';
import { cardExpiry, cardNumber as filterCardNumber, digitsOnly } from '../../utils/inputFilters';

const CITY_OPTIONS = [
  { city: 'San Salvador', postal: '1101' },
  { city: 'Santa Ana', postal: '2201' },
  { city: 'San Miguel', postal: '3301' },
  { city: 'Soyapango', postal: '1116' },
  { city: 'Apopa', postal: '1123' },
  { city: 'Mejicanos', postal: '1120' },
  { city: 'Santa Tecla', postal: '1501' },
  { city: 'Antiguo Cuscatlan', postal: '1502' },
  { city: 'Sonsonate', postal: '2301' },
  { city: 'Usulutan', postal: '3401' },
];

const SHIPPING_OPTIONS = {
  standard: {
    label: 'Entrega estandar',
    detail: '3-5 dias habiles',
    price: 0,
  },
  express: {
    label: 'Entrega expres',
    detail: 'Entrega al dia siguiente',
    price: 25,
  },
};

const formatPrice = (value) => `$${value.toFixed(2)}`;

const cleanNameValue = (value) => value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ ]/g, '');
const cleanAddressValue = (value) => value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ0-9 ]/g, '');

const splitFullName = (fullName = '') => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || '',
    secondName: parts.slice(1).join(' '),
  };
};

const getPrimaryAddress = (user) => {
  const addresses = user?.addresses || [];
  return addresses.find((address) => address.isPrimary) || addresses[0] || {};
};

function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading: loadingSession } = useAuth();
  const couponCodeFromCart = location.state?.couponCode || '';
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    secondName: '',
    email: '',
    address: '',
    city: CITY_OPTIONS[0].city,
    postalCode: CITY_OPTIONS[0].postal,
    country: 'El Salvador',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
  });
  const [cart, setCart] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderMessage, setOrderMessage] = useState('');
  const [shippingType, setShippingType] = useState('standard');

  useEffect(() => {
    if (loadingSession || !isAuthenticated) return undefined;

    let isMounted = true;

    async function loadCheckoutData() {
      try {
        const [user, currentCart] = await Promise.all([
          getCurrentCustomer(),
          getMyCart(),
        ]);

        if (!isMounted) return;

        setCart(currentCart);

        if (user) {
          const names = splitFullName(user.full_name || user.name);
          const address = getPrimaryAddress(user);
          const cityMatch = CITY_OPTIONS.find((option) => option.city === address.city);
          const defaultCity = cityMatch || CITY_OPTIONS[0];

          // Merge, no reemplazo: si se reemplaza el objeto completo se
          // pierden los campos de tarjeta que el usuario ya haya escrito.
          setFormData((prev) => ({
            ...prev,
            firstName: names.firstName,
            secondName: names.secondName,
            email: user.email || '',
            address: address.street_and_number || address.address_line || '',
            city: defaultCity.city,
            postalCode: defaultCity.postal,
            country: 'El Salvador',
          }));
        }
      } catch (error) {
        if (isMounted) {
          setStatusMessage(error.message ?? 'No se pudo cargar la informacion del checkout.');
        }
      }
    }

    loadCheckoutData();

    if (couponCodeFromCart) {
      validateCoupon(couponCodeFromCart)
        .then((coupon) => {
          if (isMounted) setAppliedCoupon(coupon);
        })
        .catch(() => {
          // El cupon pudo vencer justo entre el carrito y el checkout: se
          // ignora en vez de bloquear la compra.
        });
    }

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingSession, isAuthenticated]);

  const checkoutItems = useMemo(() => cart?.products || [], [cart]);
  const subtotal = Number(cart?.total || 0);
  const discountAmount = appliedCoupon
    ? Number((subtotal * (appliedCoupon.discount_percentage / 100)).toFixed(2))
    : 0;
  const shippingOption = SHIPPING_OPTIONS[shippingType];
  const shippingCost = shippingOption.price;
  const orderTotal = Math.max(0, subtotal - discountAmount) + shippingCost;

  const handleFieldChange = (event) => {
    const { name, value } = event.target;

    if (name === 'city' || name === 'postalCode') {
      const selectedCity =
        CITY_OPTIONS.find((option) => option.city === value || option.postal === value) ||
        CITY_OPTIONS[0];
      setFormData((prev) => ({
        ...prev,
        city: selectedCity.city,
        postalCode: selectedCity.postal,
      }));
      return;
    }

    const nextValue =
      name === 'firstName' || name === 'secondName'
        ? cleanNameValue(value)
        : name === 'address'
          ? cleanAddressValue(value)
          : name === 'cardNumber'
            ? filterCardNumber(value)
            : name === 'cardExpiry'
              ? cardExpiry(value)
              : name === 'cardCvv'
                ? digitsOnly(value)
                : value;

    setFormData((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handlePlaceOrder = async () => {
    if (isPlacingOrder) return;

    if (checkoutItems.length === 0) {
      toast.error('Tu carrito esta vacio.');
      return;
    }

    if (!formData.firstName.trim() || !formData.email.trim() || !formData.address.trim()) {
      toast.error('Completa nombre, correo y direccion antes de realizar el pedido.');
      return;
    }

    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(formData.firstName.trim())) {
      toast.error('El primer nombre solo puede tener letras.');
      return;
    }

    if (formData.secondName.trim() && !/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(formData.secondName.trim())) {
      toast.error('El segundo nombre solo puede tener letras.');
      return;
    }

    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 ]+$/.test(formData.address.trim())) {
      toast.error('La direccion solo puede tener letras y numeros.');
      return;
    }

    setIsPlacingOrder(true);
    setOrderMessage('');

    try {
      await placeCartOrder({
        shipping_address: `${formData.address}, ${formData.city}, ${formData.postalCode}, ${formData.country}`,
        shipping_phone: '',
        shipping_method: shippingOption.label,
        shipping_cost: shippingCost,
        payment_method: 'Card',
        payment_status: 'Pending',
        coupon_code: appliedCoupon?.coupon_code || undefined,
      });

      setCart((prev) => ({ ...prev, products: [], total: 0 }));
      setOrderMessage('Pedido realizado correctamente. Tu carrito quedo cerrado.');
      toast.success('Pedido realizado correctamente.');
    } catch (error) {
      toast.error(error.message ?? 'No se pudo realizar el pedido.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (loadingSession) {
    return (
      <div className="commerce-page checkout-shell">
        <PublicNavbar />
        <main className="checkout-page">
          <p className="catalog-status-text">Verificando sesion...</p>
        </main>
        <PublicFooter />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="commerce-page checkout-shell">
        <PublicNavbar />
        <main className="checkout-page">
          <div className="profile-guest-card">
            <span>Modo invitado</span>
            <h2>No hay una sesion iniciada</h2>
            <p>Inicia sesion para completar tu pedido.</p>
            <button type="button" onClick={() => navigate('/login')}>
              Iniciar sesion
            </button>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="commerce-page checkout-shell">
      <PublicNavbar />

      <main className="checkout-page">
        <section className="checkout-form-area">
          <button type="button" className="commerce-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={15} strokeWidth={1.6} />
            Atras
          </button>

          <section className="checkout-section">
            <h1>Informacion de envio</h1>
            {statusMessage ? <p className="catalog-status-text">{statusMessage}</p> : null}

            <div className="checkout-form-grid">
              <label>
                <span>Primer nombre</span>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleFieldChange}
                  maxLength={30}
                />
              </label>
              <label>
                <span>Segundo nombre</span>
                <input
                  type="text"
                  name="secondName"
                  value={formData.secondName}
                  onChange={handleFieldChange}
                  maxLength={30}
                />
              </label>
              <label className="checkout-field-full">
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFieldChange}
                  maxLength={100}
                />
              </label>
              <label className="checkout-field-full">
                <span>Direccion</span>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  maxLength={80}
                  onChange={handleFieldChange}
                />
              </label>
              <label>
                <span>Ciudad</span>
                <select name="city" value={formData.city} onChange={handleFieldChange}>
                  {CITY_OPTIONS.map((option) => (
                    <option key={option.city} value={option.city}>
                      {option.city}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Codigo postal</span>
                <select name="postalCode" value={formData.postalCode} onChange={handleFieldChange}>
                  {CITY_OPTIONS.map((option) => (
                    <option key={option.postal} value={option.postal}>
                      {option.postal}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Pais</span>
                <select name="country" value={formData.country} onChange={handleFieldChange}>
                  <option value="El Salvador">El Salvador</option>
                </select>
              </label>
            </div>
          </section>

          <section className="checkout-section">
            <h2>Metodo de envio</h2>

            <div className="shipping-options">
              <label className={`shipping-option ${shippingType === 'standard' ? 'shipping-option-active' : ''}`}>
                <input
                  type="radio"
                  name="shipping"
                  checked={shippingType === 'standard'}
                  onChange={() => setShippingType('standard')}
                />
                <span>
                  <strong>{SHIPPING_OPTIONS.standard.label}</strong>
                  {SHIPPING_OPTIONS.standard.detail}
                </span>
                <em>Gratis</em>
              </label>
              <label className={`shipping-option ${shippingType === 'express' ? 'shipping-option-active' : ''}`}>
                <input
                  type="radio"
                  name="shipping"
                  checked={shippingType === 'express'}
                  onChange={() => setShippingType('express')}
                />
                <span>
                  <strong>{SHIPPING_OPTIONS.express.label}</strong>
                  {SHIPPING_OPTIONS.express.detail}
                </span>
                <em>{formatPrice(SHIPPING_OPTIONS.express.price)}</em>
              </label>
            </div>
          </section>

          <section className="checkout-section payment-section">
            <h2>Detalles de Pago</h2>

            <div className="checkout-form-grid">
              <label className="checkout-field-full payment-card-field">
                <span>Numero de tarjeta</span>
                <input
                  type="text"
                  name="cardNumber"
                  inputMode="numeric"
                  placeholder="0000 0000 0000 0000"
                  value={formData.cardNumber}
                  onChange={handleFieldChange}
                  maxLength={19}
                />
              </label>
              <label>
                <span>Fecha de vencimiento</span>
                <input
                  type="text"
                  name="cardExpiry"
                  inputMode="numeric"
                  placeholder="MM/YY"
                  value={formData.cardExpiry}
                  onChange={handleFieldChange}
                  maxLength={5}
                />
              </label>
              <label>
                <span>CVV</span>
                <input
                  type="text"
                  name="cardCvv"
                  inputMode="numeric"
                  placeholder="123"
                  value={formData.cardCvv}
                  onChange={handleFieldChange}
                  maxLength={4}
                />
              </label>
            </div>
          </section>
        </section>

        <aside className="order-summary checkout-summary">
          <h2>Resumen del Pedido</h2>

          <div className="checkout-summary-items">
            {checkoutItems.length === 0 ? (
              <p className="catalog-status-text">Tu carrito esta vacio.</p>
            ) : null}

            {checkoutItems.map((item) => {
              const product = item.productId || {};
              const variant = product.variants?.[0] || {};

              return (
              <article key={product._id}>
                <img src={getProductImage(product, 420)} alt={product.name || 'Producto'} />
                <div>
                  <h3>{product.name || 'Producto'}</h3>
                  <p>
                    {variant.fabric || product.category || 'Producto'} / {variant.size || 'Sin talla'}
                  </p>
                  <strong>{formatPrice(Number(item.subtotal || 0))}</strong>
                </div>
              </article>
              );
            })}
          </div>

          <div className="summary-lines checkout-lines">
            <p>
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </p>
            {appliedCoupon ? (
              <p>
                <span>Descuento ({appliedCoupon.coupon_code})</span>
                <strong>-{formatPrice(discountAmount)}</strong>
              </p>
            ) : null}
            <p>
              <span>Envio</span>
              <strong>{shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}</strong>
            </p>
          </div>

          <div className="summary-total">
            <span>Total</span>
            <strong>{formatPrice(orderTotal)}</strong>
          </div>

          <button
            type="button"
            className="commerce-primary-btn"
            disabled={isPlacingOrder || checkoutItems.length === 0}
            onClick={handlePlaceOrder}
          >
            {isPlacingOrder ? 'Procesando...' : 'Realizar pedido'}
          </button>

          {orderMessage ? <p className="checkout-success-text">{orderMessage}</p> : null}

          <p className="terms-copy">Al realizar tu pedido, aceptas nuestros Terminos de Servicio.</p>
        </aside>
      </main>

      <PublicFooter />
    </div>
  );
}

export default CheckoutPage;
