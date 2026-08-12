import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PublicFooter from '../../components/home/PublicFooter';
import PublicNavbar from '../../components/home/PublicNavbar';
import {
  formatProductPrice,
  getCatalogProducts,
  getProductImage,
  getProductMaterial,
} from '../../services/catalogService';

function ClothesPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    getCatalogProducts()
      .then((data) => {
        if (isMounted) setProducts(Array.isArray(data) ? data : []);
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
    <div className="clothes-page">
      <PublicNavbar activeItem="clothes" />

      <main className="clothes-catalog">
        <h1>Ropa</h1>

        {loading ? <p className="catalog-status-text">Cargando productos...</p> : null}
        {error ? <p className="catalog-status-text">{error}</p> : null}

        <section className="clothes-grid" aria-label="Catalogo de ropa">
          {!loading && products.length === 0 ? (
            <p className="catalog-status-text">No hay productos disponibles.</p>
          ) : null}

          {products.map((product) => (
            <article key={product._id} className="clothes-card">
              <button type="button" onClick={() => navigate(`/product-detail/${product._id}`)}>
                {product.badge ? <span>{product.badge}</span> : null}
                <img src={getProductImage(product)} alt={product.name} />
              </button>

              <div className="clothes-card-info">
                <div>
                  <h2>{product.name}</h2>
                  <p>{getProductMaterial(product)}</p>
                </div>
                <strong>{formatProductPrice(product.price)}</strong>
              </div>
            </article>
          ))}
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

export default ClothesPage;
