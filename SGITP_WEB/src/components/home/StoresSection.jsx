import { ArrowUpRight } from 'lucide-react';

import { SectionHeading } from './HomeSections';

// Mapa embebido de Google Maps a partir de la dirección de la sucursal (no
// necesita llave de API). Si la sucursal no tiene dirección se busca por nombre.
function getMapQuery(store) {
  return encodeURIComponent(`${store.address || store.name}, El Salvador`);
}

// "Nuestras tiendas" del Inicio: sucursales activas de la API con su mapa.
function StoresSection({ stores, error }) {
  return (
    <section className="home-section" id="tiendas">
      <SectionHeading eyebrow="Visítanos" title="Nuestras Tiendas" centered />

      {error ? <p className="catalog-status-text">{error}</p> : null}
      {!error && stores.length === 0 ? (
        <p className="catalog-status-text">Pronto publicaremos nuestras tiendas.</p>
      ) : null}

      <div className="home-stores-grid">
        {stores.map((store, index) => {
          const query = getMapQuery(store);

          return (
            <article key={store._id || store.name} className="home-store-card">
              <div className="home-store-map">
                <iframe
                  title={`Mapa de ${store.name}`}
                  src={`https://maps.google.com/maps?q=${query}&z=15&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div className="home-store-title">
                <h3>{store.name}</h3>
                <span>{String(index + 1).padStart(2, '0')}</span>
              </div>

              <div className="home-store-meta">
                <div>
                  <span className="shop-eyebrow shop-eyebrow-muted">Dirección</span>
                  <p>{store.address || 'Dirección por confirmar'}</p>
                  <p>El Salvador</p>
                </div>
                <div>
                  <span className="shop-eyebrow shop-eyebrow-muted">Contacto</span>
                  <p>{store.phone || 'Teléfono por confirmar'}</p>
                  {store.email ? <p>{store.email}</p> : null}
                </div>
              </div>

              <a
                className="shop-link"
                href={`https://www.google.com/maps/search/?api=1&query=${query}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver en mapa <ArrowUpRight size={12} strokeWidth={1.8} />
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default StoresSection;
