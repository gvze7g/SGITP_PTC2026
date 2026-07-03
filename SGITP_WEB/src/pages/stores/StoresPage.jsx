import { Clock3, MapPin, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import PublicFooter from '../../components/home/PublicFooter';
import PublicNavbar from '../../components/home/PublicNavbar';

const STORE_MAP_URL =
  'https://www.google.com/maps?q=Calle%2025%20102-120%20Cali%20Valle%20del%20Cauca&output=embed';
const STORE_DIRECTIONS_URL =
  'https://www.google.com/maps/dir/?api=1&destination=Calle%2025%20102-120%20Cali%20Valle%20del%20Cauca';

function StoresPage() {
  const navigate = useNavigate();

  return (
    <div className="stores-page">
      <PublicNavbar activeItem="stores" />

      <main className="stores-main">
        <h1>Tiendas</h1>

        <section className="store-feature">
          <div className="store-map" aria-label="Mapa de ubicacion">
            <iframe
              title="Mapa de Atelier Ebano Valle del Lili"
              src={STORE_MAP_URL}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <article className="store-feature-card">
            <span>Ubicacion destacada</span>
            <h2>Atelier Ebano - Valle del Lili</h2>

            <div className="store-details-grid">
              <div className="store-detail-list">
                <p>
                  <MapPin size={13} strokeWidth={1.6} />
                  <span>
                    <strong>Direccion</strong>
                    Calle 25 # 102-120
                  </span>
                </p>
                <p>
                  <Clock3 size={13} strokeWidth={1.6} />
                  <span>
                    <strong>Horario de atencion</strong>
                    Lun - Sab 10:00 - 19:00
                    <br />
                    Domingo 11:00 - 17:00
                  </span>
                </p>
                <p>
                  <Phone size={13} strokeWidth={1.6} />
                  <span>
                    <strong>Linea directa</strong>
                    +503 6767-2525
                  </span>
                </p>
              </div>

              <figure>
                <img
                  src="https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=720&q=90"
                  alt="Interior del atelier"
                />
                <figcaption>Interior arquitectonico - Valle del Lili</figcaption>
              </figure>
            </div>

            <div className="store-feature-actions">
              <button
                type="button"
                onClick={() => window.open(STORE_DIRECTIONS_URL, '_blank', 'noopener,noreferrer')}
              >
                Como llegar
              </button>
              <button type="button" onClick={() => navigate('/concierge')}>
                Reservar cita privada
              </button>
            </div>
          </article>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

export default StoresPage;
