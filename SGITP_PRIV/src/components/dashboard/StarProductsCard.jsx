const PRODUCTS = [
  {
    id: 1,
    name: 'Body de Lino Orgánico',
    sold: '124 unidades vendidas',
    rank: '#1',
    image:
      'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 2,
    name: 'Mameluco de Punto',
    sold: '98 unidades vendidas',
    rank: '#2',
    image:
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 3,
    name: 'Conjunto de Algodón Pima',
    sold: '85 unidades vendidas',
    rank: '#3',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=300&q=80',
  },
];

function StarProductsCard() {
  return (
    <section className="panel-card star-products-card">
      <div className="star-products-header">
        <h3 className="panel-title">Productos Estrella</h3>
        <button type="button" className="panel-link-button">
          Ver Todos
        </button>
      </div>

      <div className="star-products-list">
        {PRODUCTS.map((product) => (
          <article key={product.id} className="star-product-item">
            <img src={product.image} alt={product.name} className="star-product-image" />

            <div className="star-product-info">
              <h4>{product.name}</h4>
              <p>{product.sold}</p>
            </div>

            <span className="star-product-rank">{product.rank}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

export default StarProductsCard;