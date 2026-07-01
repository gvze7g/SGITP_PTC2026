import { useNavigate } from 'react-router-dom';

const PRODUCTS = [
  {
    name: 'Abrigo Estructurado',
    material: 'Lana virgen',
    price: '$290',
    image: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=800&q=90',
  },
  {
    name: 'Triptico de Lana',
    material: 'Pima organico',
    price: '$95',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=90',
  },
  {
    name: 'Manta de Lana',
    material: 'Cachemira reciclada',
    price: '$320',
    image: 'https://images.unsplash.com/photo-1600369672770-985fd30004eb?auto=format&fit=crop&w=800&q=90',
  },
  {
    name: 'Botines de Cuero',
    material: 'Cuero curtido vegetal',
    price: '$110',
    image: 'https://images.unsplash.com/photo-1616406432452-07bc5938759d?auto=format&fit=crop&w=800&q=90',
  },
];

function CollectionGrid() {
  const navigate = useNavigate();

  return (
    <section className="collection-product-grid">
      {PRODUCTS.map((product) => (
        <article key={product.name} className="collection-product-card">
          <button type="button" onClick={() => navigate('/product-detail')}>
            <img src={product.image} alt={product.name} />
          </button>

          <div className="collection-product-info">
            <div>
              <h2>{product.name}</h2>
              <p>{product.material}</p>
            </div>
            <span>{product.price}</span>
          </div>
        </article>
      ))}
    </section>
  );
}

export default CollectionGrid;
