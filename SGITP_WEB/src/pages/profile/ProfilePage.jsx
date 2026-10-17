import PublicFooter from '../../components/home/PublicFooter';
import PublicNavbar from '../../components/home/PublicNavbar';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CreditCard, Heart, LogOut, MapPin, Package, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  addCustomerAddress,
  deleteCustomerAddress,
  updateCustomerAddress,
  updateCustomerProfile,
} from '../../services/customerAuthService';
import { getMyOrders } from '../../services/cartService';
import { formatProductPrice, getDisplayPrice, getProductImage } from '../../services/catalogService';
import { getMyFavorites, removeFavorite } from '../../services/favoriteService';
import {
  addMyCard,
  getMyCards,
  removeMyCard,
  setPrimaryCard,
} from '../../services/paymentMethodService';
import {
  cardExpiry,
  cardNumber as filterCardNumber,
  digitsOnly,
  lettersOnly,
} from '../../utils/inputFilters';
import {
  ALPHANUMERIC_PATTERN,
  isValidCardExpiry,
  getCardNumberError,
  isValidName,
  isValidPhone,
} from '../../utils/validators';
import { isWholesaleCustomer } from '../../utils/purchaseRules';

// Secciones del perfil. Se muestra una a la vez (antes todo iba seguido y
// costaba leer); el #hash de la dirección dice cuál está abierta, así el
// corazón del encabezado abre directo /profile#profile-favorites.
const PROFILE_TABS = [
  { id: 'profile-details', label: 'Mis datos', icon: UserRound },
  { id: 'profile-orders', label: 'Pedidos', icon: Package },
  { id: 'profile-favorites', label: 'Favoritos', icon: Heart },
  { id: 'profile-addresses', label: 'Direcciones', icon: MapPin },
  { id: 'profile-cards', label: 'Tarjetas', icon: CreditCard },
];

const PAYMENT_STATUS_TONES = {
  Pending: 'pending',
  Paid: 'paid',
  Pagado: 'paid',
  Cancelado: 'cancelled',
};

const CITY_OPTIONS = [
  'San Salvador',
  'Santa Ana',
  'San Miguel',
  'Soyapango',
  'Apopa',
  'Mejicanos',
  'Santa Tecla',
  'Antiguo Cuscatlan',
  'Sonsonate',
  'Usulutan',
];

const ADDRESS_LIMITS = {
  label: 30,
  street_and_number: 80,
  reference: 80,
};

const EMPTY_ADDRESS_FORM = {
  label: '',
  street_and_number: '',
  city: CITY_OPTIONS[0],
  reference: '',
  isPrimary: false,
};

const EMPTY_CARD_FORM = { cardNumber: '', expiry: '', holderName: '' };

const cleanAddressText = (value) => value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ0-9 ]/g, '');

// El backend guarda el estado del pago en inglés (Pending/Paid) o en español
// (ventas del POS); aquí siempre se muestra en español.
const PAYMENT_STATUS_LABELS = {
  Pending: 'Pendiente de pago',
  Paid: 'Pagado',
  Pagado: 'Pagado',
  Cancelado: 'Cancelado',
};

function formatMemberSince(date) {
  if (!date) return 'No disponible';

  return new Intl.DateTimeFormat('es-SV', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

function formatOrderDate(date) {
  if (!date) return 'fecha no disponible';

  return new Intl.DateTimeFormat('es-SV', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

function getOrderTotal(order) {
  const productsTotal = (order.item_details || []).reduce((total, item) => {
    return total + Number(item.quantity || 0) * Number(item.unit_price || 0);
  }, 0);

  return productsTotal + Number(order.shipping_cost || 0);
}

function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user: customer, isLoading: loadingSession, logout, refreshUser } = useAuth();
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState('');
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS_FORM);
  const [orders, setOrders] = useState([]);
  const [ordersError, setOrdersError] = useState('');
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [detailsForm, setDetailsForm] = useState({ full_name: '', main_phone: '' });
  const [savingDetails, setSavingDetails] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [favoritesError, setFavoritesError] = useState('');
  const [cards, setCards] = useState([]);
  const [cardsError, setCardsError] = useState('');
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardForm, setCardForm] = useState(EMPTY_CARD_FORM);
  const [savingCard, setSavingCard] = useState(false);

  useEffect(() => {
    if (!customer || customer.userType !== 'Customer') {
      return undefined;
    }

    let isMounted = true;

    async function loadOrders() {
      try {
        const customerOrders = await getMyOrders();

        if (isMounted) {
          setOrders(Array.isArray(customerOrders) ? customerOrders : []);
        }
      } catch (ordersRequestError) {
        if (isMounted) {
          setOrdersError(ordersRequestError.message);
        }
      }
    }

    async function loadFavorites() {
      try {
        const customerFavorites = await getMyFavorites();

        if (isMounted) {
          // Un favorito cuyo producto se borro queda con product_id null.
          setFavorites(
            (Array.isArray(customerFavorites) ? customerFavorites : []).filter(
              (favorite) => favorite.product_id
            )
          );
        }
      } catch (favoritesRequestError) {
        if (isMounted) {
          setFavoritesError(favoritesRequestError.message);
        }
      }
    }

    async function loadCards() {
      try {
        const customerCards = await getMyCards();

        if (isMounted) {
          setCards(Array.isArray(customerCards) ? customerCards : []);
        }
      } catch (cardsRequestError) {
        if (isMounted) {
          setCardsError(cardsRequestError.message);
        }
      }
    }

    loadOrders();
    loadFavorites();
    loadCards();

    return () => {
      isMounted = false;
    };
  }, [customer]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Sesión cerrada correctamente.');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error.message ?? 'No se pudo cerrar sesión.');
    }
  };

  const handleAddressInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    const maxLength = ADDRESS_LIMITS[name];
    const nextValue = type === 'checkbox'
      ? checked
      : maxLength
        ? cleanAddressText(value).slice(0, maxLength)
        : value;

    setAddressForm((currentForm) => ({
      ...currentForm,
      [name]: nextValue,
    }));
  };

  const handleNewAddress = () => {
    setEditingAddressId('');
    setAddressForm({
      ...EMPTY_ADDRESS_FORM,
      isPrimary: !customer?.addresses?.length,
    });
    setShowAddressForm(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddressId(address._id);
    setAddressForm({
      label: address.label || '',
      street_and_number: address.street_and_number || '',
      city: CITY_OPTIONS.includes(address.city) ? address.city : CITY_OPTIONS[0],
      reference: address.reference || '',
      isPrimary: Boolean(address.isPrimary),
    });
    setShowAddressForm(true);
  };

  const handleCancelAddress = () => {
    setShowAddressForm(false);
    setEditingAddressId('');
    setAddressForm(EMPTY_ADDRESS_FORM);
  };

  const handleSaveAddress = async (event) => {
    event.preventDefault();

    if (!addressForm.street_and_number.trim() || !addressForm.city.trim()) {
      toast.error('Completa dirección y ciudad.');
      return;
    }

    if (!ALPHANUMERIC_PATTERN.test(addressForm.street_and_number.trim())) {
      toast.error('La dirección solo puede tener letras y números.');
      return;
    }

    if (addressForm.label.trim() && !ALPHANUMERIC_PATTERN.test(addressForm.label.trim())) {
      toast.error('El nombre de la dirección solo puede tener letras y números.');
      return;
    }

    if (addressForm.reference.trim() && !ALPHANUMERIC_PATTERN.test(addressForm.reference.trim())) {
      toast.error('La referencia solo puede tener letras y números.');
      return;
    }

    if (!CITY_OPTIONS.includes(addressForm.city)) {
      toast.error('Selecciona una ciudad válida.');
      return;
    }

    try {
      if (editingAddressId) {
        await updateCustomerAddress(editingAddressId, addressForm);
      } else {
        await addCustomerAddress(addressForm);
      }

      await refreshUser();
      toast.success(editingAddressId ? 'Dirección actualizada.' : 'Dirección guardada.');
      handleCancelAddress();
    } catch (error) {
      toast.error(error.message ?? 'No se pudo guardar la dirección.');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta dirección?')) return;

    try {
      await deleteCustomerAddress(addressId);
      await refreshUser();
      toast.success('Dirección eliminada.');
    } catch (error) {
      toast.error(error.message ?? 'No se pudo eliminar la dirección.');
    }
  };

  const handleOpenDetailsForm = () => {
    setDetailsForm({
      full_name: customer?.full_name || '',
      main_phone: digitsOnly(customer?.main_phone || ''),
    });
    setShowDetailsForm(true);
  };

  const handleDetailsInputChange = (event) => {
    const { name, value } = event.target;
    const nextValue = name === 'full_name' ? lettersOnly(value) : digitsOnly(value);

    setDetailsForm((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleSaveDetails = async (event) => {
    event.preventDefault();

    if (!detailsForm.full_name.trim()) {
      toast.error('El nombre es obligatorio.');
      return;
    }

    if (!isValidName(detailsForm.full_name)) {
      toast.error('El nombre debe tener al menos 3 letras y no puede llevar números ni símbolos.');
      return;
    }

    if (!detailsForm.main_phone.trim()) {
      toast.error('El teléfono es obligatorio.');
      return;
    }

    if (!isValidPhone(detailsForm.main_phone)) {
      toast.error('El teléfono debe tener entre 8 y 12 dígitos.');
      return;
    }

    setSavingDetails(true);

    try {
      await updateCustomerProfile({
        full_name: detailsForm.full_name.trim(),
        main_phone: detailsForm.main_phone.trim(),
      });
      await refreshUser();
      toast.success('Datos actualizados.');
      setShowDetailsForm(false);
    } catch (error) {
      toast.error(error.message ?? 'No se pudo actualizar tus datos.');
    } finally {
      setSavingDetails(false);
    }
  };

  const handleRemoveFavorite = async (productId) => {
    try {
      await removeFavorite(productId);
      setFavorites((current) => current.filter((favorite) => favorite.product_id._id !== productId));
      toast.success('Se quitó de tus favoritos.');
    } catch (error) {
      toast.error(error.message ?? 'No se pudo quitar de favoritos.');
    }
  };

  const handleCardInputChange = (event) => {
    const { name, value } = event.target;
    const nextValue =
      name === 'cardNumber'
        ? filterCardNumber(value)
        : name === 'expiry'
          ? cardExpiry(value)
          : lettersOnly(value);

    setCardForm((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleCancelCard = () => {
    setShowCardForm(false);
    setCardForm(EMPTY_CARD_FORM);
  };

  const handleSaveCard = async (event) => {
    event.preventDefault();

    if (!cardForm.cardNumber || !cardForm.expiry || !cardForm.holderName.trim()) {
      toast.error('Completa número de tarjeta, vencimiento y titular.');
      return;
    }

    const cardNumberError = getCardNumberError(cardForm.cardNumber);
    if (cardNumberError) {
      toast.error(cardNumberError);
      return;
    }

    if (!isValidCardExpiry(cardForm.expiry)) {
      toast.error('El vencimiento debe ser MM/AA, con un mes válido y sin estar vencida.');
      return;
    }

    if (!isValidName(cardForm.holderName)) {
      toast.error('El nombre del titular solo puede tener letras (mínimo 3).');
      return;
    }

    setSavingCard(true);

    try {
      await addMyCard({ ...cardForm, isPrimary: cards.length === 0 });
      setCards(await getMyCards());
      toast.success('Tarjeta guardada.');
      handleCancelCard();
    } catch (error) {
      toast.error(error.message ?? 'No se pudo guardar la tarjeta.');
    } finally {
      setSavingCard(false);
    }
  };

  const handleSetPrimaryCard = async (cardId) => {
    try {
      await setPrimaryCard(cardId);
      setCards(await getMyCards());
      toast.success('Tarjeta principal actualizada.');
    } catch (error) {
      toast.error(error.message ?? 'No se pudo actualizar la tarjeta.');
    }
  };

  const handleRemoveCard = async (card) => {
    if (!window.confirm(`¿Eliminar la tarjeta terminada en ${card.last4}?`)) return;

    try {
      await removeMyCard(card._id);
      setCards(await getMyCards());
      toast.success('Tarjeta eliminada.');
    } catch (error) {
      toast.error(error.message ?? 'No se pudo eliminar la tarjeta.');
    }
  };

  const customerName = customer?.full_name || customer?.name || 'usuario';
  const isWholesale = isWholesaleCustomer(customer);
  const initials = customerName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
  const activeTab = PROFILE_TABS.some((tab) => tab.id === location.hash.slice(1))
    ? location.hash.slice(1)
    : PROFILE_TABS[0].id;
  const tabCounts = {
    'profile-orders': orders.length,
    'profile-favorites': favorites.length,
    'profile-addresses': customer?.addresses?.length ?? 0,
    'profile-cards': cards.length,
  };
  const openTab = (tabId) => navigate(`/profile#${tabId}`, { replace: true });

  return (
    <div className="shop-page">
      <PublicNavbar />

      <main className="acct-main">
        {loadingSession ? (
          <section className="acct-empty-card">
            <h1>Verificando sesión...</h1>
            <p>Estamos revisando si tienes una cuenta activa en este navegador.</p>
          </section>
        ) : !customer ? (
          <section className="acct-empty-card">
            <span className="shop-section-eyebrow">Modo invitado</span>
            <h1>Tu cuenta Peques</h1>
            <p>Inicia sesión para ver tus datos, pedidos, favoritos y direcciones de entrega.</p>
            <div className="acct-actions">
              <button type="button" className="shop-btn shop-btn-dark" onClick={() => navigate('/login')}>
                Iniciar sesión
              </button>
              <button type="button" className="shop-btn shop-btn-outline" onClick={() => navigate('/register')}>
                Crear cuenta
              </button>
            </div>
          </section>
        ) : (
          <>
            <header className="acct-hero">
              <div className="acct-identity">
                <span className="acct-avatar" aria-hidden="true">
                  {initials || '?'}
                </span>
                <div>
                  <span className="shop-section-eyebrow">Mi cuenta</span>
                  <h1>Hola, {customerName.split(' ')[0]}</h1>
                  <p>{customer.email}</p>
                  <div className="acct-tags">
                    <span className={`acct-tag ${isWholesale ? 'acct-tag-accent' : ''}`}>
                      {isWholesale ? 'Cliente mayorista' : 'Cliente minorista'}
                    </span>
                    <span className="acct-tag">Miembro desde {formatMemberSince(customer.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="acct-stats">
                {PROFILE_TABS.slice(1).map((tab) => (
                  <button key={tab.id} type="button" onClick={() => openTab(tab.id)}>
                    <strong>{tabCounts[tab.id]}</strong>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </header>

            <div className="acct-layout">
              <nav className="acct-tabs" aria-label="Secciones de mi cuenta">
                {PROFILE_TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    className={activeTab === id ? 'acct-tab-active' : ''}
                    aria-current={activeTab === id ? 'page' : undefined}
                    onClick={() => openTab(id)}
                  >
                    <Icon size={18} strokeWidth={1.6} />
                    <span>{label}</span>
                    {tabCounts[id] !== undefined ? <small>{tabCounts[id]}</small> : null}
                  </button>
                ))}
                <button type="button" className="acct-logout" onClick={handleLogout}>
                  <LogOut size={18} strokeWidth={1.6} />
                  <span>Cerrar sesión</span>
                </button>
              </nav>

              <section className="acct-panel">
                {activeTab === 'profile-details' ? (
                  <>
                    <div className="acct-panel-heading">
                      <div>
                        <h2>Mis datos</h2>
                        <p>Tu información de contacto para pedidos y entregas.</p>
                      </div>
                      {!showDetailsForm ? (
                        <button type="button" className="shop-btn shop-btn-outline" onClick={handleOpenDetailsForm}>
                          Editar datos
                        </button>
                      ) : null}
                    </div>

                    {showDetailsForm ? (
                      <form className="acct-form" onSubmit={handleSaveDetails}>
                        <label>
                          <span>Nombre completo</span>
                          <input
                            type="text"
                            name="full_name"
                            value={detailsForm.full_name}
                            onChange={handleDetailsInputChange}
                            maxLength={50}
                            placeholder="Tu nombre completo"
                          />
                        </label>
                        <label>
                          <span>Teléfono principal</span>
                          <input
                            type="text"
                            name="main_phone"
                            inputMode="numeric"
                            value={detailsForm.main_phone}
                            onChange={handleDetailsInputChange}
                            maxLength={12}
                            placeholder="00000000"
                          />
                        </label>
                        <div className="acct-form-actions">
                          <button type="submit" className="shop-btn shop-btn-dark" disabled={savingDetails}>
                            {savingDetails ? 'Guardando...' : 'Guardar cambios'}
                          </button>
                          <button type="button" className="shop-btn shop-btn-outline" onClick={() => setShowDetailsForm(false)}>
                            Cancelar
                          </button>
                        </div>
                      </form>
                    ) : (
                      <dl className="acct-details">
                        <div>
                          <dt>Nombre completo</dt>
                          <dd>{customerName}</dd>
                        </div>
                        <div>
                          <dt>Correo electrónico</dt>
                          <dd>{customer.email || 'No disponible'}</dd>
                        </div>
                        <div>
                          <dt>Teléfono principal</dt>
                          <dd>{customer.main_phone || 'Sin registrar'}</dd>
                        </div>
                        <div>
                          <dt>Tipo de cliente</dt>
                          <dd>
                            {isWholesale
                              ? 'Mayorista: precios mayoristas y stock visible'
                              : 'Minorista: hasta 4 unidades por producto'}
                          </dd>
                        </div>
                      </dl>
                    )}
                  </>
                ) : null}

                {activeTab === 'profile-orders' ? (
                  <>
                    <div className="acct-panel-heading">
                      <div>
                        <h2>Mis pedidos</h2>
                        <p>Del más reciente al más antiguo.</p>
                      </div>
                    </div>

                    {ordersError ? <p className="acct-muted">{ordersError}</p> : null}
                    {!ordersError && orders.length === 0 ? (
                      <div className="acct-empty">
                        <p>Todavía no tienes pedidos.</p>
                        <button type="button" className="shop-btn shop-btn-dark" onClick={() => navigate('/categories')}>
                          Ver colección
                        </button>
                      </div>
                    ) : null}

                    <div className="acct-orders">
                      {(showAllOrders ? orders : orders.slice(0, 5)).map((order) => {
                        const items = order.item_details || [];
                        const units = items.reduce((total, item) => total + Number(item.quantity || 0), 0);
                        const status = order.payment_status;

                        return (
                          <article key={order._id} className="acct-order">
                            <div className="acct-order-thumbs">
                              {items.slice(0, 3).map((item, index) => (
                                <img
                                  key={`${item.product_id?._id || item.name}-${index}`}
                                  src={getProductImage(item.product_id || {}, 240)}
                                  alt={item.name || 'Producto'}
                                />
                              ))}
                            </div>
                            <div className="acct-order-info">
                              <span>Pedido #{order._id.slice(-6).toUpperCase()}</span>
                              <h3>
                                {items[0]?.name || 'Pedido Peques'}
                                {items.length > 1 ? ` y ${items.length - 1} más` : ''}
                              </h3>
                              <p>
                                {formatOrderDate(order.sales_date || order.createdAt)} · {units}{' '}
                                {units === 1 ? 'prenda' : 'prendas'}
                              </p>
                            </div>
                            <div className="acct-order-side">
                              <strong>{formatProductPrice(getOrderTotal(order))}</strong>
                              <span className={`acct-status acct-status-${PAYMENT_STATUS_TONES[status] ?? 'pending'}`}>
                                {PAYMENT_STATUS_LABELS[status] ?? status ?? 'Pendiente de pago'}
                              </span>
                            </div>
                          </article>
                        );
                      })}
                    </div>

                    {orders.length > 5 ? (
                      <button
                        type="button"
                        className="shop-btn shop-btn-outline acct-more"
                        onClick={() => setShowAllOrders((value) => !value)}
                      >
                        {showAllOrders ? 'Ver menos' : `Ver los ${orders.length} pedidos`}
                      </button>
                    ) : null}
                  </>
                ) : null}

                {activeTab === 'profile-favorites' ? (
                  <>
                    <div className="acct-panel-heading">
                      <div>
                        <h2>Mis favoritos</h2>
                        <p>Las prendas que guardaste para después.</p>
                      </div>
                      <button type="button" className="shop-btn shop-btn-outline" onClick={() => navigate('/categories')}>
                        Explorar catálogo
                      </button>
                    </div>

                    {favoritesError ? <p className="acct-muted">{favoritesError}</p> : null}
                    {!favoritesError && favorites.length === 0 ? (
                      <div className="acct-empty">
                        <p>Aún no tienes favoritos. Toca el corazón de cualquier prenda para guardarla.</p>
                      </div>
                    ) : null}

                    <div className="acct-favorites">
                      {favorites.map((favorite) => {
                        const product = favorite.product_id;

                        return (
                          <article key={favorite._id} className="acct-favorite">
                            <button
                              type="button"
                              className="acct-favorite-image"
                              onClick={() => navigate(`/product-detail/${product._id}`)}
                            >
                              <img src={getProductImage(product, 420)} alt={product.name || 'Producto'} />
                            </button>
                            <span className="shop-eyebrow">{product.category || 'Producto'}</span>
                            <h3>{product.name || 'Producto'}</h3>
                            <strong>{formatProductPrice(getDisplayPrice(product))}</strong>
                            <div className="acct-card-actions">
                              <button type="button" onClick={() => navigate(`/product-detail/${product._id}`)}>
                                Ver prenda
                              </button>
                              <button type="button" onClick={() => handleRemoveFavorite(product._id)}>
                                Quitar
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </>
                ) : null}

                {activeTab === 'profile-addresses' ? (
                  <>
                    <div className="acct-panel-heading">
                      <div>
                        <h2>Mis direcciones</h2>
                        <p>Dónde te llevamos tus pedidos.</p>
                      </div>
                      {!showAddressForm ? (
                        <button type="button" className="shop-btn shop-btn-dark" onClick={handleNewAddress}>
                          + Añadir dirección
                        </button>
                      ) : null}
                    </div>

                    {showAddressForm ? (
                      <form className="acct-form" onSubmit={handleSaveAddress}>
                        <label>
                          <span>Nombre de la dirección</span>
                          <input
                            type="text"
                            name="label"
                            value={addressForm.label}
                            onChange={handleAddressInputChange}
                            maxLength={ADDRESS_LIMITS.label}
                            placeholder="Casa, trabajo, oficina"
                          />
                        </label>
                        <label>
                          <span>Dirección</span>
                          <input
                            type="text"
                            name="street_and_number"
                            value={addressForm.street_and_number}
                            onChange={handleAddressInputChange}
                            maxLength={ADDRESS_LIMITS.street_and_number}
                            placeholder="Calle, avenida, número"
                          />
                        </label>
                        <label>
                          <span>Ciudad</span>
                          <select name="city" value={addressForm.city} onChange={handleAddressInputChange}>
                            {CITY_OPTIONS.map((city) => (
                              <option key={city} value={city}>
                                {city}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          <span>Referencia</span>
                          <input
                            type="text"
                            name="reference"
                            value={addressForm.reference}
                            onChange={handleAddressInputChange}
                            maxLength={ADDRESS_LIMITS.reference}
                            placeholder="Punto de referencia"
                          />
                        </label>
                        <label className="acct-check">
                          <input
                            type="checkbox"
                            name="isPrimary"
                            checked={addressForm.isPrimary}
                            onChange={handleAddressInputChange}
                          />
                          <span>Usar como dirección principal</span>
                        </label>
                        <div className="acct-form-actions">
                          <button type="submit" className="shop-btn shop-btn-dark">
                            {editingAddressId ? 'Guardar cambios' : 'Guardar dirección'}
                          </button>
                          <button type="button" className="shop-btn shop-btn-outline" onClick={handleCancelAddress}>
                            Cancelar
                          </button>
                        </div>
                      </form>
                    ) : null}

                    {!customer.addresses?.length && !showAddressForm ? (
                      <div className="acct-empty">
                        <p>Aún no tienes direcciones guardadas.</p>
                      </div>
                    ) : null}

                    <div className="acct-cards">
                      {(customer.addresses || []).map((address) => (
                        <article key={address._id} className={address.isPrimary ? 'acct-card-primary' : ''}>
                          <span className="acct-tag">{address.isPrimary ? 'Principal' : address.label || 'Dirección'}</span>
                          <h3>{address.label || 'Dirección'}</h3>
                          <p>{address.street_and_number || 'Sin calle registrada'}</p>
                          <p>{address.city || 'Sin ciudad registrada'}</p>
                          {address.reference ? <p className="acct-muted">Ref.: {address.reference}</p> : null}
                          <div className="acct-card-actions">
                            <button type="button" onClick={() => handleEditAddress(address)}>
                              Editar
                            </button>
                            <button type="button" onClick={() => handleDeleteAddress(address._id)}>
                              Eliminar
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  </>
                ) : null}

                {activeTab === 'profile-cards' ? (
                  <>
                    <div className="acct-panel-heading">
                      <div>
                        <h2>Mis tarjetas</h2>
                        <p>Solo guardamos la marca y los últimos 4 dígitos. El CVV se pide al pagar.</p>
                      </div>
                      {!showCardForm ? (
                        <button type="button" className="shop-btn shop-btn-dark" onClick={() => setShowCardForm(true)}>
                          + Añadir tarjeta
                        </button>
                      ) : null}
                    </div>

                    {showCardForm ? (
                      <form className="acct-form" onSubmit={handleSaveCard}>
                        <label>
                          <span>Número de tarjeta</span>
                          <input
                            type="text"
                            name="cardNumber"
                            inputMode="numeric"
                            autoComplete="cc-number"
                            value={cardForm.cardNumber}
                            onChange={handleCardInputChange}
                            maxLength={19}
                            placeholder="0000000000000000"
                          />
                        </label>
                        <label>
                          <span>Vencimiento</span>
                          <input
                            type="text"
                            name="expiry"
                            inputMode="numeric"
                            autoComplete="cc-exp"
                            value={cardForm.expiry}
                            onChange={handleCardInputChange}
                            maxLength={5}
                            placeholder="MM/AA"
                          />
                        </label>
                        <label>
                          <span>Titular</span>
                          <input
                            type="text"
                            name="holderName"
                            autoComplete="cc-name"
                            value={cardForm.holderName}
                            onChange={handleCardInputChange}
                            maxLength={50}
                            placeholder="Como aparece en la tarjeta"
                          />
                        </label>
                        <div className="acct-form-actions">
                          <button type="submit" className="shop-btn shop-btn-dark" disabled={savingCard}>
                            {savingCard ? 'Guardando...' : 'Guardar tarjeta'}
                          </button>
                          <button type="button" className="shop-btn shop-btn-outline" onClick={handleCancelCard}>
                            Cancelar
                          </button>
                        </div>
                      </form>
                    ) : null}

                    {cardsError ? <p className="acct-muted">{cardsError}</p> : null}
                    {!cardsError && cards.length === 0 && !showCardForm ? (
                      <div className="acct-empty">
                        <p>Aún no tienes tarjetas guardadas.</p>
                      </div>
                    ) : null}

                    <div className="acct-cards">
                      {cards.map((card) => (
                        <article key={card._id} className={`acct-payment-card ${card.isPrimary ? 'acct-card-primary' : ''}`}>
                          <span className="acct-tag">{card.isPrimary ? 'Principal' : card.brand}</span>
                          <h3>
                            {card.brand} •••• {card.last4}
                          </h3>
                          <p>{card.holder_name || customerName}</p>
                          <p className="acct-muted">
                            Vence {card.expiry_month}/{card.expiry_year}
                          </p>
                          <div className="acct-card-actions">
                            {!card.isPrimary ? (
                              <button type="button" onClick={() => handleSetPrimaryCard(card._id)}>
                                Hacer principal
                              </button>
                            ) : null}
                            <button type="button" onClick={() => handleRemoveCard(card)}>
                              Eliminar
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  </>
                ) : null}
              </section>
            </div>
          </>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}

export default ProfilePage;
