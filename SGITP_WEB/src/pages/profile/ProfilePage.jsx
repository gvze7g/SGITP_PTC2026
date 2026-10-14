import PublicFooter from '../../components/home/PublicFooter';
import PublicNavbar from '../../components/home/PublicNavbar';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  addCustomerAddress,
  deleteCustomerAddress,
  updateCustomerAddress,
  updateCustomerProfile,
} from '../../services/customerAuthService';
import { getMyOrders } from '../../services/cartService';
import { formatProductPrice, getProductImage } from '../../services/catalogService';
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
  isValidCardNumber,
  isValidName,
  isValidPhone,
} from '../../utils/validators';

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

const scrollToSection = (sectionId) => {
  document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      toast.success('Sesion cerrada correctamente.');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error.message ?? 'No se pudo cerrar sesion.');
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
      toast.error('Completa direccion y ciudad.');
      return;
    }

    if (!ALPHANUMERIC_PATTERN.test(addressForm.street_and_number.trim())) {
      toast.error('La direccion solo puede tener letras y numeros.');
      return;
    }

    if (addressForm.label.trim() && !ALPHANUMERIC_PATTERN.test(addressForm.label.trim())) {
      toast.error('La etiqueta solo puede tener letras y numeros.');
      return;
    }

    if (addressForm.reference.trim() && !ALPHANUMERIC_PATTERN.test(addressForm.reference.trim())) {
      toast.error('La referencia solo puede tener letras y numeros.');
      return;
    }

    if (!CITY_OPTIONS.includes(addressForm.city)) {
      toast.error('Selecciona una ciudad valida.');
      return;
    }

    try {
      if (editingAddressId) {
        await updateCustomerAddress(editingAddressId, addressForm);
      } else {
        await addCustomerAddress(addressForm);
      }

      await refreshUser();
      toast.success(editingAddressId ? 'Direccion actualizada.' : 'Direccion guardada.');
      handleCancelAddress();
    } catch (error) {
      toast.error(error.message ?? 'No se pudo guardar la direccion.');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta direccion?')) return;

    try {
      await deleteCustomerAddress(addressId);
      await refreshUser();
      toast.success('Direccion eliminada.');
    } catch (error) {
      toast.error(error.message ?? 'No se pudo eliminar la direccion.');
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
      toast.error('El nombre debe tener al menos 3 letras y no puede llevar numeros ni simbolos.');
      return;
    }

    if (!detailsForm.main_phone.trim()) {
      toast.error('El telefono es obligatorio.');
      return;
    }

    if (!isValidPhone(detailsForm.main_phone)) {
      toast.error('El telefono debe tener entre 8 y 12 digitos.');
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
      toast.success('Se quito de tus favoritos.');
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
      toast.error('Completa numero de tarjeta, vencimiento y titular.');
      return;
    }

    if (!isValidCardNumber(cardForm.cardNumber)) {
      toast.error('El numero de tarjeta debe tener entre 13 y 19 digitos.');
      return;
    }

    if (!isValidCardExpiry(cardForm.expiry)) {
      toast.error('El vencimiento debe ser MM/YY, con un mes valido y sin estar vencida.');
      return;
    }

    if (!isValidName(cardForm.holderName)) {
      toast.error('El nombre del titular solo puede tener letras (minimo 3).');
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

  return (
    <div className="profile-page">
      <PublicNavbar />

      <main className="profile-main">
        <header className="profile-hero">
          <h1>{customer ? `Bienvenido, ${customerName}` : 'Tu cuenta Peques'}</h1>
          <p>
            {customer
              ? 'Bienvenido de nuevo a tu atelier privado. Tu vestidor curado y tus pedidos a medida se gestionan con total dedicacion.'
              : 'Inicia sesion para ver tus datos personales, pedidos guardados y direcciones de entrega.'}
          </p>
        </header>

        {loadingSession ? (
          <section className="profile-guest-card">
            <span>Verificando sesion</span>
            <p>Estamos revisando si tienes una cuenta activa en este navegador.</p>
          </section>
        ) : !customer ? (
          <section className="profile-guest-card">
            <span>Modo invitado</span>
            <h2>No hay una sesion iniciada</h2>
            <p>Por seguridad no mostramos datos personales cuando entras como invitado.</p>
            <button type="button" onClick={() => navigate('/login')}>
              Iniciar sesion
            </button>
          </section>
        ) : (
        <div className="profile-layout">
          <aside className="profile-sidebar">
            <h2>Gestion de cuenta</h2>
            <button type="button" onClick={() => scrollToSection('profile-details')}>
              Detalles Personales
            </button>
            <button type="button" onClick={() => scrollToSection('profile-orders')}>
              Historial de Pedidos
            </button>
            <button type="button" onClick={() => scrollToSection('profile-favorites')}>
              Favoritos
            </button>
            <button type="button" onClick={() => scrollToSection('profile-addresses')}>
              Direcciones Guardadas
            </button>
            <button type="button" onClick={() => scrollToSection('profile-cards')}>
              Tarjetas Guardadas
            </button>

            <button type="button" className="profile-logout" onClick={handleLogout}>
              Cerrar sesion
            </button>
          </aside>

          <section className="profile-content">
            <section className="profile-section" id="profile-details">
              <div className="profile-section-heading">
                <h2>Detalles Personales</h2>
                {!showDetailsForm ? (
                  <button type="button" onClick={handleOpenDetailsForm}>
                    Editar detalles
                  </button>
                ) : null}
              </div>

              {showDetailsForm ? (
                <form className="address-form" onSubmit={handleSaveDetails}>
                  <label>
                    <span>Nombre legal</span>
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
                    <span>Telefono principal</span>
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
                  <div className="address-form-actions">
                    <button type="submit" disabled={savingDetails}>
                      {savingDetails ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                    <button type="button" onClick={() => setShowDetailsForm(false)}>
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="personal-grid">
                  <p>
                    <span>Nombre legal</span>
                    {customerName}
                  </p>
                  <p>
                    <span>Correo electronico</span>
                    {customer.email || 'No disponible'}
                  </p>
                  <p>
                    <span>Telefono principal</span>
                    {customer.main_phone || 'No disponible'}
                  </p>
                  <p>
                    <span>Miembro desde</span>
                    {formatMemberSince(customer.createdAt)}
                  </p>
                </div>
              )}
            </section>

            <section className="profile-section" id="profile-orders">
              <div className="profile-section-heading">
                <h2>Historial de Pedidos</h2>
                <span className="profile-orders-sort-label">Mostrando recientes</span>
              </div>

              <div className="order-list">
                {ordersError ? <p className="profile-empty-text">{ordersError}</p> : null}

                {orders.length > 0 ? (
                  (showAllOrders ? orders : orders.slice(0, 5)).map((order) => {
                    const firstItem = order.item_details?.[0] || {};
                    const product = firstItem.product_id || {};
                    const extraItems = Math.max((order.item_details?.length || 0) - 1, 0);

                    return (
                    <article key={order._id} className="profile-order">
                      <img src={getProductImage(product, 320)} alt={firstItem.name || 'Producto'} />
                      <div>
                        <span>Pedido no. {order._id.slice(-6).toUpperCase()}</span>
                        <h3>
                          {firstItem.name || product.name || 'Pedido Peques'}
                          {extraItems ? ` + ${extraItems} mas` : ''}
                        </h3>
                        <p>
                          Pedido el {formatOrderDate(order.sales_date || order.createdAt)}
                          <strong>{formatProductPrice(getOrderTotal(order))}</strong>
                        </p>
                      </div>
                      <em>{order.payment_status || 'Pendiente'}</em>
                    </article>
                    );
                  })
                ) : (
                  !ordersError ? <p className="profile-empty-text">No hay pedidos registrados todavia.</p> : null
                )}
              </div>

              {orders.length > 5 ? (
                <button
                  type="button"
                  className="profile-archive"
                  onClick={() => setShowAllOrders((value) => !value)}
                >
                  {showAllOrders ? 'Ver menos' : 'Ver archivo completo'}
                </button>
              ) : null}
            </section>

            <section className="profile-section" id="profile-favorites">
              <div className="profile-section-heading">
                <h2>Favoritos</h2>
                <button type="button" onClick={() => navigate('/clothes')}>
                  Explorar catalogo
                </button>
              </div>

              <div className="order-list">
                {favoritesError ? <p className="profile-empty-text">{favoritesError}</p> : null}

                {favorites.length > 0 ? (
                  favorites.map((favorite) => {
                    const product = favorite.product_id;

                    return (
                      <article key={favorite._id} className="profile-order">
                        <img src={getProductImage(product, 320)} alt={product.name || 'Producto'} />
                        <div>
                          <span>{product.category || 'Producto'}</span>
                          <h3>{product.name || 'Producto'}</h3>
                          <p>
                            <strong>{formatProductPrice(Number(product.price || 0))}</strong>
                          </p>
                        </div>
                        <div className="profile-favorite-actions">
                          <button
                            type="button"
                            onClick={() => navigate(`/product-detail/${product._id}`)}
                          >
                            Ver
                          </button>
                          <button type="button" onClick={() => handleRemoveFavorite(product._id)}>
                            Quitar
                          </button>
                        </div>
                      </article>
                    );
                  })
                ) : !favoritesError ? (
                  <p className="profile-empty-text">
                    Aun no tienes favoritos. Guarda prendas desde el detalle de cada producto.
                  </p>
                ) : null}
              </div>
            </section>

            <section className="profile-section" id="profile-addresses">
              <div className="profile-section-heading">
                <h2>Direcciones Guardadas</h2>
                <button type="button" onClick={handleNewAddress}>Anadir nueva</button>
              </div>

              {showAddressForm ? (
                <form className="address-form" onSubmit={handleSaveAddress}>
                  <label>
                    <span>Etiqueta</span>
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
                    <span>Direccion</span>
                    <input
                      type="text"
                      name="street_and_number"
                      value={addressForm.street_and_number}
                      onChange={handleAddressInputChange}
                      maxLength={ADDRESS_LIMITS.street_and_number}
                      placeholder="Calle, avenida, numero"
                    />
                  </label>
                  <label>
                    <span>Ciudad</span>
                    <select
                      name="city"
                      value={addressForm.city}
                      onChange={handleAddressInputChange}
                    >
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
                  <label className="address-primary-check">
                    <input
                      type="checkbox"
                      name="isPrimary"
                      checked={addressForm.isPrimary}
                      onChange={handleAddressInputChange}
                    />
                    <span>Usar como direccion principal</span>
                  </label>
                  <div className="address-form-actions">
                    <button type="submit">
                      {editingAddressId ? 'Guardar cambios' : 'Guardar direccion'}
                    </button>
                    <button type="button" onClick={handleCancelAddress}>
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : null}

              <div className="address-grid">
                {customer.addresses?.length > 0 ? (
                  customer.addresses.map((address) => (
                    <article key={address._id}>
                      <span>{address.isPrimary ? 'Direccion principal' : address.label || 'Direccion'}</span>
                      <h3>{customerName}</h3>
                      <p>{address.street_and_number || 'Sin calle registrada'}</p>
                      <p>{address.city || 'Sin ciudad registrada'}</p>
                      {address.reference ? <p>{address.reference}</p> : null}
                      <button type="button" onClick={() => handleEditAddress(address)}>
                        Editar
                      </button>
                      <button type="button" onClick={() => handleDeleteAddress(address._id)}>
                        Eliminar
                      </button>
                    </article>
                  ))
                ) : (
                  <article>
                    <span>Sin direcciones</span>
                    <h3>{customerName}</h3>
                    <p>Aun no tienes direcciones guardadas.</p>
                  </article>
                )}
              </div>
            </section>

            <section className="profile-section" id="profile-cards">
              <div className="profile-section-heading">
                <h2>Tarjetas Guardadas</h2>
                <button type="button" onClick={() => setShowCardForm(true)}>
                  Anadir tarjeta
                </button>
              </div>

              {showCardForm ? (
                <form className="address-form" onSubmit={handleSaveCard}>
                  <label>
                    <span>Numero de tarjeta</span>
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
                      placeholder="MM/YY"
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
                  <p className="profile-empty-text address-primary-check">
                    Solo guardamos la marca y los ultimos 4 digitos. El CVV se pide al pagar.
                  </p>
                  <div className="address-form-actions">
                    <button type="submit" disabled={savingCard}>
                      {savingCard ? 'Guardando...' : 'Guardar tarjeta'}
                    </button>
                    <button type="button" onClick={handleCancelCard}>
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : null}

              {cardsError ? <p className="profile-empty-text">{cardsError}</p> : null}

              <div className="address-grid">
                {cards.length > 0 ? (
                  cards.map((card) => (
                    <article key={card._id}>
                      <span>{card.isPrimary ? 'Tarjeta principal' : card.brand}</span>
                      <h3>
                        {card.brand} •••• {card.last4}
                      </h3>
                      <p>{card.holder_name || customerName}</p>
                      <p>
                        Vence {card.expiry_month}/{card.expiry_year}
                      </p>
                      {!card.isPrimary ? (
                        <button type="button" onClick={() => handleSetPrimaryCard(card._id)}>
                          Hacer principal
                        </button>
                      ) : null}
                      <button type="button" onClick={() => handleRemoveCard(card)}>
                        Eliminar
                      </button>
                    </article>
                  ))
                ) : !cardsError ? (
                  <article>
                    <span>Sin tarjetas</span>
                    <h3>{customerName}</h3>
                    <p>Aun no tienes tarjetas guardadas.</p>
                  </article>
                ) : null}
              </div>
            </section>
          </section>
        </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}

export default ProfilePage;
