import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const FALLBACK_IMAGE = 'https://via.placeholder.com/80x80?text=Sin+imagen';

function StarProductsCard({ products = [], loading }) {
  const navigate = useNavigate();

  return (
    <motion.section
      className="panel-card star-products-card"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="star-products-header">
        <h3 className="panel-title">Productos Estrella</h3>
        <button type="button" className="panel-link-button" onClick={() => navigate('/inventory')}>
          Ver Todos
        </button>
      </div>

      <div className="star-products-list">
        {loading ? (
          <p style={{ opacity: 0.7 }}>Cargando productos...</p>
        ) : products.length === 0 ? (
          <p style={{ opacity: 0.7 }}>Todavia no hay ventas registradas.</p>
        ) : (
          products.map((product, index) => (
            <motion.article
              key={product._id}
              className="star-product-item"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
              whileHover={{ x: 4 }}
            >
              <img
                src={product.images?.[0]?.image || FALLBACK_IMAGE}
                alt={product.name}
                className="star-product-image"
              />

              <div className="star-product-info">
                <h4>{product.name}</h4>
                <p>{product.totalSold} unidades vendidas</p>
              </div>

              <span className="star-product-rank">#{index + 1}</span>
            </motion.article>
          ))
        )}
      </div>
    </motion.section>
  );
}

export default StarProductsCard;