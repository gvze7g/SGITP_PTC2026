import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  formatProductPrice,
  getOfferProducts,
  getProductImage,
  getProductMaterial,
} from '../../services/catalogService';

const SKELETON_COUNT = 2;

function OffersSection() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getOfferProducts(4)
      .then((data) => {
        if (isMounted) setOffers(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        if (!isMounted) return;
        setHasError(true);
        toast.error(error.message ?? 'No se pudieron cargar las ofertas.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isLoading && !hasError && offers.length === 0) {
    return (
      <section className="public-section offers-section">
        <h2 className="public-section-title">Ofertas</h2>
        <div className="offers-empty">
          <p>Por ahora no tenemos ofertas activas.</p>
          <span>Vuelve pronto, actualizamos las promociones seguido.</span>
        </div>
      </section>
    );
  }

  return (
    <section className="public-section offers-section">
      <h2 className="public-section-title">Ofertas</h2>
      <div className="offers-grid">
        {isLoading
          ? Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <article key={index} className="offer-card offer-card-skeleton" aria-hidden="true">
                <div className="offer-image-wrap">
                  <div className="offer-skeleton-image" />
                </div>
                <div className="offer-copy">
                  <div className="offer-skeleton-line offer-skeleton-line-lg" />
                  <div className="offer-skeleton-line offer-skeleton-line-sm" />
                  <div className="offer-skeleton-line offer-skeleton-line-sm" />
                </div>
              </article>
            ))
          : offers.map((product) => (
              <article key={product._id} className="offer-card">
                <button
                  type="button"
                  className="offer-image-wrap"
                  onClick={() => navigate(`/product-detail/${product._id}`)}
                >
                  <span>-{Math.round(product.discountPercentage)}%</span>
                  <img src={getProductImage(product, 900)} alt={product.name} loading="lazy" />
                </button>
                <div className="offer-copy">
                  <h3>{product.name}</h3>
                  <p className="offer-material">{getProductMaterial(product)}</p>
                  <p className="offer-price-row">
                    <strong>{formatProductPrice(product.finalPrice)}</strong>
                    <span>{formatProductPrice(product.originalPrice)}</span>
                  </p>
                  <button type="button" onClick={() => navigate(`/product-detail/${product._id}`)}>
                    Ver detalles
                  </button>
                </div>
              </article>
            ))}
      </div>
    </section>
  );
}

export default OffersSection;
