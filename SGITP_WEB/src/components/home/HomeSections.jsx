import { useEffect, useMemo, useState } from 'react';
import { Feather, Gem, ShieldCheck, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import ProductCard from '../products/ProductCard';
import {
  FALLBACK_IMAGE,
  formatProductPrice,
  getBestSellingProducts,
  getDisplayPrice,
  getProductColors,
  getProductFabrics,
  getProductImage,
} from '../../services/catalogService';

function handleImageError(event) {
  if (event.currentTarget.src === FALLBACK_IMAGE) return;
  event.currentTarget.src = FALLBACK_IMAGE;
}

// title puede llevar una parte en cursiva con <em>, como en el diseño.
export function SectionHeading({ eyebrow, title, actionLabel, onAction, centered = false }) {
  return (
    <div className={`shop-section-heading ${centered ? 'shop-section-heading-centered' : ''}`}>
      <div>
        <span className="shop-section-eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {actionLabel ? (
        <button type="button" className="shop-link" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

// Franja de beneficios debajo de la portada.
export function HomeBenefits({ storesCount }) {
  const items = [
    { icon: Feather, title: 'Telas suaves', text: 'Pensadas para la piel delicada del bebé.' },
    { icon: Gem, title: 'Hecho para durar', text: 'Prendas que pasan de un peque al siguiente.' },
    {
      icon: Store,
      title: storesCount === 1 ? 'Una tienda física' : `${storesCount} tiendas físicas`,
      text: 'Visítanos y conoce las prendas en persona.',
    },
    { icon: ShieldCheck, title: 'Compra segura', text: 'Pago protegido y envíos a todo el país.' },
  ];

  return (
    <section className="home-benefits">
      {items.map(({ icon: Icon, title, text }) => (
        <div key={title} className="home-benefit">
          <Icon size={17} strokeWidth={1.5} />
          <div>
            <strong>{title}</strong>
            <span>{text}</span>
          </div>
        </div>
      ))}
    </section>
  );
}

// "Comprar por categoría": las 4 categorías con más prendas, cada una con
// la foto de uno de sus productos.
export function CategoryShowcase({ products }) {
  const navigate = useNavigate();

  const categories = useMemo(() => {
    const byCategory = new Map();
    products.forEach((product) => {
      if (!product.category) return;
      const current = byCategory.get(product.category) || { name: product.category, count: 0, product };
      current.count += 1;
      if (!current.product.images?.length && product.images?.length) current.product = product;
      byCategory.set(product.category, current);
    });
    return [...byCategory.values()].sort((a, b) => b.count - a.count).slice(0, 4);
  }, [products]);

  if (!categories.length) return null;

  return (
    <section className="home-section">
      <SectionHeading
        eyebrow="Descubre"
        title={
          <>
            Comprar por <em>categoría</em>
          </>
        }
        actionLabel="Ver todo"
        onAction={() => navigate('/categories')}
      />

      <div className="home-category-grid">
        {categories.map((category, index) => (
          <button
            key={category.name}
            type="button"
            className={`home-category-tile ${index % 2 ? 'home-category-arch' : ''}`}
            onClick={() => navigate(`/categories?categoria=${encodeURIComponent(category.name)}`)}
          >
            <span className="home-category-image">
              <img
                src={getProductImage(category.product, 700)}
                alt={category.name}
                loading="lazy"
                onError={handleImageError}
              />
            </span>
            <span className="home-category-label">
              <strong>{category.name}</strong>
              <small>{String(index + 1).padStart(2, '0')}</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

// "En tendencia ahora": los más vendidos (ventas pagadas); si todavía no hay
// suficientes ventas, se completa con lo más nuevo del catálogo.
export function TrendingSection({ products, favoriteIds, onToggleFavorite }) {
  const navigate = useNavigate();
  const [bestSellers, setBestSellers] = useState([]);

  useEffect(() => {
    let isMounted = true;
    getBestSellingProducts(4)
      .then((data) => {
        if (isMounted) setBestSellers(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const trending = useMemo(() => {
    const ids = new Set(bestSellers.map((product) => product._id));
    // Se usa la versión del catálogo (trae el precio correcto para quien mira).
    const fromCatalog = bestSellers
      .map((seller) => products.find((product) => product._id === seller._id))
      .filter(Boolean);
    const newest = [...products]
      .filter((product) => !ids.has(product._id))
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return [...fromCatalog, ...newest].slice(0, 4);
  }, [bestSellers, products]);

  if (!trending.length) return null;

  return (
    <section className="home-section">
      <SectionHeading
        eyebrow="Lo más querido"
        title={
          <>
            En tendencia <em>ahora</em>
          </>
        }
        actionLabel="Ver colección completa"
        onAction={() => navigate('/categories')}
      />
      <div className="shop-grid shop-grid-four">
        {trending.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            showCategory={false}
            isFavorite={favoriteIds.has(product._id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </section>
  );
}

// "Ofertas de temporada": productos con oferta vigente. El mayorista no la
// ve porque paga su precio fijo y las ofertas no le aplican.
export function SeasonOffers({ products }) {
  const navigate = useNavigate();
  const offers = products
    .filter((product) => product.hasActiveOffer && !product.isWholesaleView)
    .sort((a, b) => b.discountPercentage - a.discountPercentage)
    .slice(0, 4);

  if (!offers.length) return null;

  return (
    <section className="home-section">
      <SectionHeading
        eyebrow="Por tiempo limitado"
        title={
          <>
            <em>Ofertas</em> de temporada
          </>
        }
      />
      <div className="home-offer-grid">
        {offers.map((product) => {
          const color = getProductColors(product)[0];
          const fabric = getProductFabrics(product)[0];
          const openDetail = () => navigate(`/product-detail/${product._id}`);

          return (
            <article key={product._id} className="home-offer-card">
              <button type="button" className="home-offer-image" onClick={openDetail}>
                <span className="shop-card-badge shop-card-badge-accent">
                  -{Math.round(product.discountPercentage)}%
                </span>
                <img src={getProductImage(product, 600)} alt={product.name} loading="lazy" onError={handleImageError} />
              </button>
              <div className="home-offer-copy">
                {fabric ? <span className="shop-eyebrow shop-eyebrow-muted">Tela: {fabric}</span> : null}
                <h3>{product.name}</h3>
                {color ? (
                  <span className="shop-card-color-label">
                    <i style={{ backgroundColor: color.hex }} />
                    {color.name}
                  </span>
                ) : null}
                <p className="home-offer-price">
                  <strong>{formatProductPrice(getDisplayPrice(product))}</strong>
                  <s>{formatProductPrice(product.originalPrice)}</s>
                </p>
                <button type="button" className="shop-link" onClick={openDetail}>
                  Ver detalles
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
