import { useNavigate } from 'react-router-dom';

const OFFERS = [
  {
    title: 'Cubrepañal de algodon',
    price: '€22,00',
    oldPrice: '€32,00',
    image: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'Body en lana merino',
    price: '€22,00',
    oldPrice: '€32,00',
    image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=85',
  },
];

function OffersSection() {
  const navigate = useNavigate();

  return (
    <section className="public-section offers-section">
      <h2 className="public-section-title">Ofertas</h2>

      <div className="offers-grid">
        {OFFERS.map((offer) => (
          <article key={offer.title} className="offer-card">
            <div className="offer-image-wrap">
              <span>-30%</span>
              <img src={offer.image} alt={offer.title} />
            </div>

            <div className="offer-copy">
              <h3>{offer.title}</h3>
              <p>
                <strong>{offer.price}</strong>
                <span>{offer.oldPrice}</span>
              </p>
              <button type="button" onClick={() => navigate('/product-detail')}>
                Ver detalles
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default OffersSection;
