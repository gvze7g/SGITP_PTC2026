import { ArrowLeft, ShieldCheck, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import PublicNavbar from '../../components/home/PublicNavbar';

const CART_ITEMS = [
  {
    name: 'Peleles Lino',
    color: 'Ambar natural',
    size: '06-12M',
    price: 185,
    image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=620&q=90',
  },
  {
    name: 'Cardigan de Lana',
    color: 'Carbon',
    size: '12-18M',
    price: 240,
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=620&q=90',
  },
];

const formatPrice = (value) => `$${value.toFixed(2)}`;

function CartPage() {
  const navigate = useNavigate();
  const subtotal = CART_ITEMS.reduce((total, item) => total + item.price, 0);

  return (
    <div className="commerce-page">
      <PublicNavbar />

      <main className="cart-page">
        <section className="cart-content">
          <button type="button" className="commerce-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={15} strokeWidth={1.6} />
            Atras
          </button>

          <header className="commerce-heading">
            <h1>Tu Carrito de Compras</h1>
            <p>{CART_ITEMS.length} articulos seleccionados</p>
          </header>

          <div className="cart-items">
            {CART_ITEMS.map((item) => (
              <article key={item.name} className="cart-item">
                <img src={item.image} alt={item.name} />

                <div className="cart-item-copy">
                  <h2>{item.name}</h2>
                  <p>Color: {item.color}</p>
                  <p>Talla: {item.size}</p>

                  <div className="quantity-control" aria-label={`Cantidad de ${item.name}`}>
                    <button type="button" aria-label="Reducir cantidad">
                      -
                    </button>
                    <span>01</span>
                    <button type="button" aria-label="Aumentar cantidad">
                      +
                    </button>
                  </div>
                </div>

                <div className="cart-item-side">
                  <span>{formatPrice(item.price)}</span>
                  <button type="button">Eliminar</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="order-summary cart-summary">
          <h2>Resumen</h2>

          <div className="summary-lines">
            <p>
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </p>
            <p>
              <span>Envio</span>
              <strong>Calculado al finalizar la compra</strong>
            </p>
            <p>
              <span>Descuento estimado</span>
              <strong>$0.00</strong>
            </p>
          </div>

          <div className="summary-total">
            <span>Total</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>

          <button type="button" className="commerce-primary-btn" onClick={() => navigate('/checkout')}>
            Proceder al pago
          </button>

          <div className="summary-notes">
            <p>
              <ShieldCheck size={13} strokeWidth={1.6} />
              Transaccion segura
            </p>
            <p>
              <Truck size={13} strokeWidth={1.6} />
              Envio gratuito en pedidos superiores a $500
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default CartPage;
