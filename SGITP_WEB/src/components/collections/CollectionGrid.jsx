import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  formatProductPrice,
  getCatalogProducts,
  getProductImage,
  getProductMaterial,
} from '../../services/catalogService';

function CollectionGrid() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
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

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(products.map((product) => product.category).filter(Boolean)),
    ];

    return ['Todos', ...uniqueCategories];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'Todos') return products;

    return products.filter((product) => product.category === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <section className="collection-products-section">
      {loading ? <p className="catalog-status-text">Cargando productos...</p> : null}
      {error ? <p className="catalog-status-text">{error}</p> : null}

      {!loading && !error && categories.length > 1 ? (
        <div className="collection-category-row" aria-label="Categorias">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={selectedCategory === category ? 'collection-category-active' : ''}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      ) : null}

      <div className="collection-toolbar">
        <span>{filteredProducts.length} articulos</span>
      </div>

      <section className="collection-product-grid">
        {!loading && !error && filteredProducts.length === 0 ? (
          <p className="catalog-status-text">No hay productos en esta categoria.</p>
        ) : null}

        {filteredProducts.map((product) => (
          <article key={product._id} className="collection-product-card">
            <button type="button" onClick={() => navigate(`/product-detail/${product._id}`)}>
              <img src={getProductImage(product, 800)} alt={product.name} />
            </button>

            <div className="collection-product-info">
              <div>
                <h2>{product.name}</h2>
                <p>{getProductMaterial(product)}</p>
              </div>
              <span>{formatProductPrice(product.price)}</span>
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}

export default CollectionGrid;
