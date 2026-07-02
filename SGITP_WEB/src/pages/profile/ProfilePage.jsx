import PublicFooter from '../../components/home/PublicFooter';
import PublicNavbar from '../../components/home/PublicNavbar';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { logoutCustomer } from '../../services/customerAuthService';

const ORDERS = [
  {
    name: 'Capsula de Lana Merino - Otono',
    date: '12.09.2023',
    price: '$1,240.00',
    status: 'Entregado',
    image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=340&q=90',
  },
  {
    name: "Coleccion de Calzado L'Artisan",
    date: '01.09.2023',
    price: '$420.00',
    status: 'En transito',
    image: 'https://images.unsplash.com/photo-1616406432452-07bc5938759d?auto=format&fit=crop&w=340&q=90',
  },
];

function ProfilePage() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutCustomer();
      toast.success('Sesion cerrada correctamente.');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error.message ?? 'No se pudo cerrar sesion.');
    }
  };

  return (
    <div className="profile-page">
      <PublicNavbar />

      <main className="profile-main">
        <header className="profile-hero">
          <h1>Bienvenida, Elena</h1>
          <p>
            Bienvenido de nuevo a tu atelier privado. Tu vestidor curado y tus pedidos a medida se
            gestionan con total dedicacion.
          </p>
        </header>

        <div className="profile-layout">
          <aside className="profile-sidebar">
            <h2>Gestion de cuenta</h2>
            <button type="button">Detalles Personales</button>
            <button type="button">Historial de Pedidos</button>
            <button type="button">Direcciones Guardadas</button>

            <h2>Soporte</h2>
            <button type="button" onClick={() => navigate('/concierge')}>
              Servicio de Conserjeria
            </button>
            <button type="button" onClick={() => navigate('/returns')}>
              Devoluciones y Cambios
            </button>
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
                  Elena Vance-Dubois
                </p>
                <p>
                  <span>Correo electronico</span>
                  elena.vance@atelier.com
                </p>
                <p>
                  <span>Fecha de nacimiento</span>
                  14 de Noviembre, 1992
                </p>
                <p>
                  <span>Miembro desde</span>
                  Octubre 2021
                </p>
              </div>
            </section>

            <section className="profile-section">
              <div className="profile-section-heading">
                <h2>Historial de Pedidos</h2>
                <button type="button">Mostrando recientes</button>
              </div>

              <div className="order-list">
                {ORDERS.map((order) => (
                  <article key={order.name} className="profile-order">
                    <img src={order.image} alt={order.name} />
                    <div>
                      <span>Pedido no. # EB-8219</span>
                      <h3>{order.name}</h3>
                      <p>
                        Pedido el {order.date} <strong>{order.price}</strong>
                      </p>
                    </div>
                    <em>{order.status}</em>
                  </article>
                ))}
              </div>

              <button type="button" className="profile-archive">
                Ver archivo completo
              </button>
            </section>

            <section className="profile-section">
              <div className="profile-section-heading">
                <h2>Direcciones Guardadas</h2>
                <button type="button">Anadir nueva</button>
              </div>

              <div className="address-grid">
                <article>
                  <span>Residencia principal</span>
                  <h3>Elena Vance-Dubois</h3>
                  <p>Apopa</p>
                  <p>75008 Paris, Francia</p>
                  <button type="button">Editar</button>
                  <button type="button">Eliminar</button>
                </article>
                <article>
                  <span>La casa de campo</span>
                  <h3>Elena Vance-Dubois</h3>
                  <p>Apopa City</p>
                  <p>49320 Brissac-Quince, Francia</p>
                  <button type="button">Editar</button>
                  <button type="button">Eliminar</button>
                </article>
              </div>
            </section>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

export default ProfilePage;
