import { useNavigate } from 'react-router-dom';

import PublicFooter from '../../components/home/PublicFooter';
import PublicNavbar from '../../components/home/PublicNavbar';

const CLOTHES = [
  {
    name: 'Camisa de lino',
    material: 'Arena calida / fibra organica',
    price: '$85.00',
    badge: 'Temporada',
    image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=760&q=90',
  },
  {
    name: 'Prendas de punto de merino',
    material: 'Cafe ebano / lana extrafina',
    price: '$120.00',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=760&q=90',
  },
  {
    name: 'Mameluco de algodon organico',
    material: 'Blanco lino / algodon organico',
    price: '$65.00',
    image: 'https://images.unsplash.com/photo-1600369672770-985fd30004eb?auto=format&fit=crop&w=760&q=90',
  },
  {
    name: 'Camisa de lino',
    material: 'Arena calida / fibra organica',
    price: '$85.00',
    image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=760&q=90',
  },
  {
    name: 'Prendas de punto de merino',
    material: 'Cafe ebano / lana extrafina',
    price: '$120.00',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=760&q=90',
  },
  {
    name: 'Mameluco de algodon organico',
    material: 'Blanco lino / algodon organico',
    price: '$65.00',
    image: 'https://images.unsplash.com/photo-1600369672770-985fd30004eb?auto=format&fit=crop&w=760&q=90',
  },
];

function ClothesPage() {
  const navigate = useNavigate();

  return (
    <div className="clothes-page">
      <PublicNavbar activeItem="clothes" />

      <main className="clothes-catalog">
        <h1>Ropa</h1>

        <section className="clothes-grid" aria-label="Catalogo de ropa">
          {CLOTHES.map((product, index) => (
            <article key={`${product.name}-${index}`} className="clothes-card">
              <button type="button" onClick={() => navigate('/product-detail')}>
                {product.badge ? <span>{product.badge}</span> : null}
                <img src={product.image} alt={product.name} />
              </button>

              <div className="clothes-card-info">
                <div>
                  <h2>{product.name}</h2>
                  <p>{product.material}</p>
                </div>
                <strong>{product.price}</strong>
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
