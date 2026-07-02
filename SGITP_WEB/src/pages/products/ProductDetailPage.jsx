import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductDetailView from '../../components/products/ProductDetailView';
import PublicNavbar from '../../components/home/PublicNavbar';
import StoreAvailabilityPanel from '../../components/products/StoreAvailabilityPanel';

const PRODUCT = {
  name: 'El Peleles Lino',
  price: '$185.00',
  image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1400&q=90',
  thumbnail: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=500&q=90',
  description:
    'Confeccionado con lino belga de grado arquitectonico, el mono Lino es un estudio de pureza funcional. Presenta acabados con bordes sin rematar y botones de madera de olivo torneados a mano, ofreciendo una silueta estructurada que respira con el movimiento de la infancia.',
  notes: [
    '100% lino organico de alto gramaje',
    'Herrajes de madera obtenidos de forma sostenible',
    'Confeccionado eticamente en Provenza',
  ],
};

function ProductDetailPage() {
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState('0-3M');
  const [showStoreAvailability, setShowStoreAvailability] = useState(false);

  return (
    <div className="product-shell">
      <PublicNavbar />

      {showStoreAvailability ? (
        <StoreAvailabilityPanel
          product={PRODUCT}
          selectedSize={selectedSize}
          onEdit={() => setShowStoreAvailability(false)}
        />
      ) : (
        <ProductDetailView
          product={PRODUCT}
          selectedSize={selectedSize}
          onSelectSize={setSelectedSize}
          onAddToCart={() => navigate('/cart')}
          onBack={() => navigate(-1)}
          onOpenStoreSearch={() => setShowStoreAvailability(true)}
        />
      )}
    </div>
  );
}

export default ProductDetailPage;
