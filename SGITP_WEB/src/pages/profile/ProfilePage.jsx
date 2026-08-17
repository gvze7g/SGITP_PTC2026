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
} from '../../services/customerAuthService';
import { getMyOrders } from '../../services/cartService';
import { formatProductPrice, getProductImage } from '../../services/catalogService';

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

const cleanAddressText = (value) => value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ0-9 ]/g, '');

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

    loadOrders();

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

    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 ]+$/.test(addressForm.street_and_number.trim())) {
      toast.error('La direccion solo puede tener letras y numeros.');
      return;
    }

    if (addressForm.label.trim() && !/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 ]+$/.test(addressForm.label.trim())) {
      toast.error('La etiqueta solo puede tener letras y numeros.');
      return;
    }

    if (addressForm.reference.trim() && !/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 ]+$/.test(addressForm.reference.trim())) {
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
    try {
      await deleteCustomerAddress(addressId);
      await refreshUser();
      toast.success('Direccion eliminada.');
    } catch (error) {
      toast.error(error.message ?? 'No se pudo eliminar la direccion.');
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
            <button type="button">Detalles Personales</button>
            <button type="button">Historial de Pedidos</button>
            <button type="button">Direcciones Guardadas</button>

            <button type="button" className="profile-logout" onClick={handleLogout}>
              Cerrar sesion
            </button>
          </aside>

          <section className="profile-content">
            <section className="profile-section">
              <div className="profile-section-heading">
                <h2>Detalles Personales</h2>
                <button type="button">Editar detalles</button>
              </div>

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
            </section>

            <section className="profile-section">
              <div className="profile-section-heading">
                <h2>Historial de Pedidos</h2>
                <button type="button">Mostrando recientes</button>
              </div>

              <div className="order-list">
                {ordersError ? <p className="profile-empty-text">{ordersError}</p> : null}

                {orders.length > 0 ? (
                  orders.map((order) => {
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

              {orders.length > 0 ? (
                <button type="button" className="profile-archive">
                  Ver archivo completo
                </button>
              ) : null}
            </section>

            <section className="profile-section">
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
          </section>
        </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}

export default ProfilePage;
