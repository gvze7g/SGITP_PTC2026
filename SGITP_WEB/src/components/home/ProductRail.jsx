import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  formatProductPrice,
  getBestSellingProducts,
  getCatalogProducts,
  getProductImage,
  getProductMaterial,
} from '../../services/catalogService';

const SKELETON_COUNT = 5;

function ProductRail() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [sourceLabel, setSourceLabel] = useState('Disponible');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadTrendingProducts() {
      try {
        const bestSellers = await getBestSellingProducts(5);
        const catalogProducts = await getCatalogProducts();
        const bestSellerIds = new Set(bestSellers.map((product) => product._id));
        const displayProducts = [
          ...bestSellers,
          ...catalogProducts.filter((product) => !bestSellerIds.has(product._id)),
        ].slice(0, 5);

        if (isMounted) {
          setProducts(displayProducts);
          setSourceLabel(bestSellers.length > 0 ? 'Tambien disponible' : 'Disponible');
        }
      } catch {
        try {
          const catalogProducts = await getCatalogProducts();

          if (isMounted) {
            setProducts(catalogProducts.slice(0, 5));
            setSourceLabel('Disponible');
          }
        } catch (fallbackError) {
          if (isMounted) {
            setProducts([]);
            toast.error(fallbackError.message ?? 'No se pudieron cargar los productos.');
          }
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadTrendingProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="public-section" id="ropa">
      <h2 className="public-section-title">&iexcl;En tendencia ahora mismo!</h2>

      <div className="product-rail">
        {isLoading
          ? Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <article key={index} className="product-card product-card-skeleton" aria-hidden="true">
                <div className="product-skeleton-image" />
                <div className="product-card-info">
                  <div>
                    <div className="product-skeleton-line product-skeleton-line-lg" />
                    <div className="product-skeleton-line product-skeleton-line-sm" />
                  </div>
                  <div className="product-skeleton-line product-skeleton-line-sm" />
                </div>
              </article>
            ))
          : products.map((product) => (
              <article key={product._id} className="product-card">
                <button type="button" onClick={() => navigate(`/product-detail/${product._id}`)}>
                  <img src={getProductImage(product, 700)} alt={product.name} loading="lazy" />
                  <span className="product-card-badge">
                    {product.totalSold ? `${product.totalSold} vendidos` : sourceLabel}
                  </span>
                </button>
                <div className="product-card-info">
                  <div>
                    <h3>{product.name}</h3>
                    <p>{getProductMaterial(product)}</p>
                  </div>
                  <span>{formatProductPrice(product.price)}</span>
                </div>
              </article>
            ))}

        {!isLoading && products.length === 0 ? (
          <p className="catalog-status-text">Todavia no hay productos para mostrar.</p>
        ) : null}
      </div>
    </section>
  );
}

export default ProductRail;
