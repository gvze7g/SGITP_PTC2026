import { Clock3, MapPin, Phone } from 'lucide-react';

import PublicFooter from '../../components/home/PublicFooter';
import PublicNavbar from '../../components/home/PublicNavbar';

function StoresPage() {
  return (
    <div className="stores-page">
      <PublicNavbar activeItem="stores" />

      <main className="stores-main">
        <h1>Tiendas</h1>

        <section className="store-feature">
          <div className="store-map" aria-label="Mapa de ubicacion">
            <div className="store-map-art">
              <span className="store-map-pin" />
              <span className="store-map-label store-map-label-main">Bosques de la Escalon</span>
              <span className="store-map-label store-map-label-side">Calle El Volcan</span>
              <span className="store-map-label store-map-label-bottom">Calle Mano de Leon</span>
            </div>
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
              <button type="button">Como llegar ↗</button>
              <button type="button">Reservar cita privada</button>
            </div>
          </article>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

export default StoresPage;
