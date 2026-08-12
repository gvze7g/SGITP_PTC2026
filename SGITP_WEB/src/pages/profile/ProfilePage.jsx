import PublicFooter from '../../components/home/PublicFooter';
import PublicNavbar from '../../components/home/PublicNavbar';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { getCurrentCustomer, logoutCustomer } from '../../services/customerAuthService';

const ORDERS = [];

function formatMemberSince(date) {
  if (!date) return 'No disponible';

  return new Intl.DateTimeFormat('es-SV', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

function getPrimaryAddress(customer) {
  const addresses = customer?.addresses || [];
  return addresses.find((address) => address.isPrimary) || addresses[0];
}

function ProfilePage() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadCustomerSession() {
      try {
        const currentCustomer = await getCurrentCustomer();

        if (isMounted) {
          setCustomer(currentCustomer);
        }
      } catch (error) {
        toast.error(error.message ?? 'No se pudo verificar la sesion.');
      } finally {
        if (isMounted) {
          setLoadingSession(false);
        }
      }
    }

    loadCustomerSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logoutCustomer();
      setCustomer(null);
      toast.success('Sesión cerrada correctamente.');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error.message ?? 'No se pudo cerrar sesión.');
    }
  };

  const customerName = customer?.full_name || customer?.name || 'usuario';
  const primaryAddress = getPrimaryAddress(customer);

  return (
    <div className="profile-page">
      <PublicNavbar />

      <main className="profile-main">
        <header className="profile-hero">
          <h1>{customer ? `Bienvenido, ${customerName}` : 'Tu cuenta Peques'}</h1>
          <p>
            {customer
              ? 'Bienvenido de nuevo a tu atelier privado. Tu vestidor curado y tus pedidos a medida se gestionan con total dedicación.'
              : 'Inicia sesión para ver tus datos personales, pedidos guardados y direcciones de entrega.'}
          </p>
        </header>

        {loadingSession ? (
          <section className="profile-guest-card">
            <span>Verificando sesión</span>
            <p>Estamos revisando si tienes una cuenta activa en este navegador.</p>
          </section>
        ) : !customer ? (
          <section className="profile-guest-card">
            <span>Modo invitado</span>
            <h2>No hay una sesión iniciada</h2>
            <p>Por seguridad no mostramos datos personales cuando entras como invitado.</p>
            <button type="button" onClick={() => navigate('/login')}>
              Iniciar sesión
            </button>
          </section>
        ) : (
        <div className="profile-layout">
          <aside className="profile-sidebar">
            <h2>Gestión de cuenta</h2>
            <button type="button">Detalles Personales</button>
            <button type="button">Historial de Pedidos</button>
            <button type="button">Direcciones Guardadas</button>

            <h2>Soporte</h2>
            <button type="button" onClick={() => navigate('/concierge')}>
              Servicio de Consejería
            </button>
            <button type="button" onClick={() => navigate('/returns')}>
              Devoluciones y Cambios
            </button>
            <button type="button" className="profile-logout" onClick={handleLogout}>
              Cerrar sesión
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
                  <span>Correo electrónico</span>
                  {customer.email || 'No disponible'}
                </p>
                <p>
                  <span>Teléfono principal</span>
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
                {ORDERS.length > 0 ? (
                  ORDERS.map((order) => (
                    <article key={order.name} className="profile-order">
                      <img src={order.image} alt={order.name} />
                      <div>
                        <span>Pedido no. {order.id}</span>
                        <h3>{order.name}</h3>
                        <p>
                          Pedido el {order.date} <strong>{order.price}</strong>
                        </p>
                      </div>
                      <em>{order.status}</em>
                    </article>
                  ))
                ) : (
                  <p className="profile-empty-text">No hay pedidos registrados todavía.</p>
                )}
              </div>

              {ORDERS.length > 0 ? (
                <button type="button" className="profile-archive">
                  Ver archivo completo
                </button>
              ) : null}
            </section>

            <section className="profile-section">
              <div className="profile-section-heading">
                <h2>Direcciones Guardadas</h2>
                <button type="button">Anadir nueva</button>
              </div>

              <div className="address-grid">
                {primaryAddress ? (
                  <article>
                    <span>{primaryAddress.label || 'Dirección principal'}</span>
                    <h3>{customerName}</h3>
                    <p>{primaryAddress.street_and_number || 'Sin calle registrada'}</p>
                    <p>{primaryAddress.city || 'Sin ciudad registrada'}</p>
                    {primaryAddress.reference ? <p>{primaryAddress.reference}</p> : null}
                  </article>
                ) : (
                  <article>
                    <span>Sin direcciones</span>
                    <h3>{customerName}</h3>
                    <p>Aún no tienes direcciones guardadas.</p>
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
