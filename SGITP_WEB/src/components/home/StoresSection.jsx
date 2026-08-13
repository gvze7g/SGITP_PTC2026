import { useEffect, useState } from 'react';
import { getPublicBranches } from '../../services/catalogService';

function StoresSection() {
  const [stores, setStores] = useState([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    let isMounted = true;

    getPublicBranches()
      .then((data) => {
        if (isMounted) setStores(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        if (isMounted) setStatus(error.message);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="public-section stores-section" id="tiendas">
      <h2 className="public-section-title">Tiendas físicas</h2>

      {status ? <p className="catalog-status-text">{status}</p> : null}
      {!status && stores.length === 0 ? (
        <p className="catalog-status-text">No hay tiendas disponibles.</p>
      ) : null}

      <div className="stores-grid">
        {stores.map((store, index) => {
          const encodedAddress = encodeURIComponent(store.address || store.name);
          const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

          return (
            <article key={store._id || store.name} className="store-card">
              <div className="store-title-row">
                <h3>{store.name}</h3>
                <span>{String(index + 1).padStart(2, '0')}</span>
              </div>

              <div className="store-meta-grid">
                <div>
                  <h4>Dirección</h4>
                  <p>{store.address || 'Dirección por confirmar'}</p>
                  <p>El Salvador</p>
                </div>

                <div>
                  <h4>Contacto</h4>
                  <p>
                    <span>Teléfono</span>
                    <strong>{store.phone || 'Por confirmar'}</strong>
                  </p>
                  <p>
                    <span>Apertura</span>
                    <strong>
                      {store.opening_date
                        ? new Date(store.opening_date).toLocaleDateString('es-SV')
                        : 'Por confirmar'}
                    </strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="store-map-link"
                onClick={() => window.open(mapUrl, '_blank', 'noopener,noreferrer')}
              >
                Ver en mapa <span>↗</span>
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default StoresSection;
