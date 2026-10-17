import { ArrowRight, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { FALLBACK_IMAGE, getProductImage } from '../../services/catalogService';

function handleImageError(event) {
  if (event.currentTarget.src === FALLBACK_IMAGE) return;
  event.currentTarget.src = FALLBACK_IMAGE;
}

const padNumber = (value) => String(value).padStart(2, '0');

// Portada del Inicio. Las fotos son de productos reales del catalogo y las
// cifras salen de la API (prendas, tiendas y categorias).
function HomeHero({ products, storesCount, categoriesCount }) {
  const navigate = useNavigate();
  const withImages = products.filter((product) => product.images?.length);
  const mainProduct = withImages[0];
  const secondProduct = withImages[1];

  return (
    <section className="home-hero">
      <div className="home-hero-copy">
        <span className="shop-section-eyebrow">Colección permanente</span>
        <h1>
          Lo más suave, <em>para sus primeros</em> días.
        </h1>
        <p>
          Ropa para bebés pensada para acompañar cada etapa de tu peque: telas suaves, diseños
          atemporales y tallas para crecer con ellos.
        </p>

        <div className="home-hero-actions">
          <button type="button" className="shop-btn shop-btn-dark" onClick={() => navigate('/categories')}>
            Explorar colección <ArrowRight size={14} strokeWidth={1.8} />
          </button>
          <button type="button" className="shop-btn shop-btn-outline" onClick={() => navigate('/stores')}>
            Nuestras tiendas
          </button>
        </div>

        <dl className="home-hero-stats">
          <div>
            <dt>{padNumber(products.length)}</dt>
            <dd>Prendas en catálogo</dd>
          </div>
          <div>
            <dt>{padNumber(storesCount)}</dt>
            <dd>Tiendas físicas</dd>
          </div>
          <div>
            <dt>{padNumber(categoriesCount)}</dt>
            <dd>Categorías</dd>
          </div>
        </dl>
      </div>

      <div className="home-hero-visual" aria-hidden={!mainProduct}>
        <div className="home-hero-arch">
          {mainProduct ? (
            <img src={getProductImage(mainProduct, 1200)} alt={mainProduct.name} onError={handleImageError} />
          ) : null}
        </div>
        {secondProduct ? (
          <button
            type="button"
            className="home-hero-card"
            onClick={() => navigate(`/product-detail/${secondProduct._id}`)}
          >
            <img src={getProductImage(secondProduct, 600)} alt={secondProduct.name} onError={handleImageError} />
          </button>
        ) : null}
        <span className="home-hero-seal">
          Hecho
          <br />
          con amor
        </span>
        <span className="home-hero-chip">
          <Heart size={13} strokeWidth={1.8} />
          <span>
            Suave desde el primer día
            <small>Ropa para bebés</small>
          </span>
        </span>
      </div>
    </section>
  );
}

export default HomeHero;
