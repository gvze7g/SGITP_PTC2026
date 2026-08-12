import { useEffect, useMemo, useState } from 'react';
import { Clock3, MapPin, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import PublicFooter from '../../components/home/PublicFooter';
import PublicNavbar from '../../components/home/PublicNavbar';
import { getPublicBranches } from '../../services/catalogService';

const DEFAULT_STORE_IMAGE =
  'https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=720&q=90';

function StoresPage() {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const featuredStore = branches.find((branch) => branch._id === selectedStoreId) || branches[0];
  const encodedAddress = encodeURIComponent(featuredStore?.address || featuredStore?.name || 'Peques');
  const mapUrl = `https://www.google.com/maps?q=${encodedAddress}&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
  const openingDate = useMemo(() => {
    if (!featuredStore?.opening_date) return 'Horario por confirmar';

    return `Apertura: ${new Date(featuredStore.opening_date).toLocaleDateString()}`;
  }, [featuredStore]);

  useEffect(() => {
    let isMounted = true;

    getPublicBranches()
      .then((data) => {
        if (isMounted) {
          const nextBranches = Array.isArray(data) ? data : [];
          setBranches(nextBranches);
          setSelectedStoreId(nextBranches[0]?._id || '');
        }
      })
      .catch((requestError) => {
        if (isMounted) setError(requestError.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="stores-page">
      <PublicNavbar activeItem="stores" />

      <main className="stores-main">
        <h1>Tiendas</h1>
        {loading ? <p className="catalog-status-text">Cargando tiendas...</p> : null}
        {error ? <p className="catalog-status-text">{error}</p> : null}

        {!loading && !featuredStore ? (
          <p className="catalog-status-text">No hay tiendas disponibles.</p>
        ) : null}

        {featuredStore ? (
          <>
            <section className="store-feature">
              <div className="store-map" aria-label="Mapa de ubicacion">
                <iframe
                  title={`Mapa de ${featuredStore.name}`}
                  src={mapUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <article className="store-feature-card">
                <span>Ubicacion destacada</span>
                <h2>{featuredStore.name}</h2>

                <div className="store-details-grid">
                  <div className="store-detail-list">
                    <p>
                      <MapPin size={13} strokeWidth={1.6} />
                      <span>
                        <strong>Direccion</strong>
                        {featuredStore.address || 'Direccion por confirmar'}
                      </span>
                    </p>
                    <p>
                      <Clock3 size={13} strokeWidth={1.6} />
                      <span>
                        <strong>Informacion de atencion</strong>
                        {openingDate}
                      </span>
                    </p>
                    <p>
                      <Phone size={13} strokeWidth={1.6} />
                      <span>
                        <strong>Linea directa</strong>
                        {featuredStore.phone || featuredStore.email || 'Contacto por confirmar'}
                      </span>
                    </p>
                  </div>

                  <figure>
                    <img
                      src={DEFAULT_STORE_IMAGE}
                      alt={`Interior de ${featuredStore.name}`}
                    />
                    <figcaption>{featuredStore.name}</figcaption>
                  </figure>
                </div>

                <div className="store-feature-actions">
                  <button
                    type="button"
                    onClick={() => window.open(directionsUrl, '_blank', 'noopener,noreferrer')}
                  >
                    Como llegar
                  </button>
                  <button type="button" onClick={() => navigate('/concierge')}>
                    Reservar cita privada
                  </button>
                </div>
              </article>
            </section>

            <section className="all-stores-section">
              <h2>Todas las tiendas</h2>

              <div className="all-stores-grid">
                {branches.map((branch) => (
                  <button
                    key={branch._id}
                    type="button"
                    className={branch._id === featuredStore._id ? 'all-store-card-active' : ''}
                    onClick={() => setSelectedStoreId(branch._id)}
                  >
                    <span>{branch.name}</span>
                    <strong>{branch.address || 'Direccion por confirmar'}</strong>
                    <small>{branch.phone || branch.email || 'Contacto por confirmar'}</small>
                  </button>
                ))}
              </div>
            </section>
          </>
        ) : null}
      </main>

      <PublicFooter />
    </div>
  );
}

export default StoresPage;
