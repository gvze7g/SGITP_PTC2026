import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  formatProductPrice,
  getBestSellingProducts,
  getCatalogProducts,
  getProductImage,
  getProductMaterial,
} from '../../services/catalogService';

function ProductRail() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [sourceLabel, setSourceLabel] = useState('Mas vendido');

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

        if (isMounted && displayProducts.length > 0) {
          setProducts(displayProducts);
          setSourceLabel(bestSellers.length > 0 ? 'Tambien disponible' : 'Disponible');
          return;
        }
      } catch (error) {
        try {
          const catalogProducts = await getCatalogProducts();

          if (isMounted) {
            setProducts(catalogProducts.slice(0, 5));
            setSourceLabel('Disponible');
          }
        } catch {
          if (isMounted) {
            setProducts([]);
          }
        }
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
        {products.map((product) => (
          <article key={product._id} className="product-card">
            <button type="button" onClick={() => navigate(`/product-detail/${product._id}`)}>
              <img src={getProductImage(product, 700)} alt={product.name} />
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
      </div>
    </section>
  );
}

export default ProductRail;
