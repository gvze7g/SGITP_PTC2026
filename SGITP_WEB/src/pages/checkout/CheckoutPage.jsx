import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import PublicFooter from '../../components/home/PublicFooter';
import PublicNavbar from '../../components/home/PublicNavbar';

const CHECKOUT_ITEMS = [
  {
    name: 'Mono de Lino',
    material: 'Lino',
    size: '6-12M',
    price: 145,
    image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=420&q=90',
  },
  {
    name: 'Gorro de Cachemira',
    material: 'Lino',
    size: 'S',
    price: 85,
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=420&q=90',
  },
];

const formatPrice = (value) => `€${value.toFixed(2)}`;

function CheckoutPage() {
  const navigate = useNavigate();
  const subtotal = CHECKOUT_ITEMS.reduce((total, item) => total + item.price, 0);

  return (
    <div className="commerce-page checkout-shell">
      <PublicNavbar />

      <main className="checkout-page">
        <section className="checkout-form-area">
          <button type="button" className="commerce-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={15} strokeWidth={1.6} />
            Atras
          </button>

          <section className="checkout-section">
            <h1>Informacion de envio</h1>

            <div className="checkout-form-grid">
              <label>
                <span>Primer nombre</span>
                <input type="text" defaultValue="Jean" />
              </label>
              <label>
                <span>Segundo nombre</span>
                <input type="text" defaultValue="Dupont" />
              </label>
              <label className="checkout-field-full">
                <span>Email</span>
                <input type="email" defaultValue="jean.dupont@atelier.com" />
              </label>
              <label className="checkout-field-full">
                <span>Direccion</span>
                <input type="text" defaultValue="24 Rue de la Paix" />
              </label>
              <label>
                <span>Ciudad</span>
                <input type="text" defaultValue="Paris" />
              </label>
              <label>
                <span>Codigo postal</span>
                <input type="text" defaultValue="75002" />
              </label>
              <label className="checkout-select-field">
                <span>Pais</span>
                <button type="button">
                  France
                  <ChevronDown size={16} strokeWidth={1.6} />
                </button>
              </label>
            </div>
          </section>

          <section className="checkout-section">
            <h2>Metodo de envio</h2>

            <div className="shipping-options">
              <label className="shipping-option shipping-option-active">
                <input type="radio" name="shipping" defaultChecked />
                <span>
                  <strong>Entrega estandar</strong>
                  3-5 dias habiles
                </span>
                <em>Gratis</em>
              </label>
              <label className="shipping-option">
                <input type="radio" name="shipping" />
                <span>
                  <strong>Entrega expres</strong>
                  Entrega al dia siguiente
                </span>
                <em>€25.00</em>
              </label>
            </div>
          </section>

          <section className="checkout-section payment-section">
            <h2>Detalles de Pago</h2>

            <div className="checkout-form-grid">
              <label className="checkout-field-full payment-card-field">
                <span>Numero de tarjeta</span>
                <input type="text" defaultValue="0000 0000 0000 0000" />
              </label>
              <label>
                <span>Fecha de vencimiento</span>
                <input type="text" defaultValue="MM / YY" />
              </label>
              <label>
                <span>CVV</span>
                <input type="text" defaultValue="123" />
              </label>
            </div>
          </section>
        </section>

        <aside className="order-summary checkout-summary">
          <h2>Resumen del Pedido</h2>

          <div className="checkout-summary-items">
            {CHECKOUT_ITEMS.map((item) => (
              <article key={item.name}>
                <img src={item.image} alt={item.name} />
                <div>
                  <h3>{item.name}</h3>
                  <p>
                    {item.material} / {item.size}
                  </p>
                  <strong>{formatPrice(item.price)}</strong>
                </div>
              </article>
            ))}
          </div>

          <div className="summary-lines checkout-lines">
            <p>
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </p>
            <p>
              <span>Envio</span>
              <strong>Gratis</strong>
            </p>
          </div>

          <div className="summary-total">
            <span>Total</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>

          <button type="button" className="commerce-primary-btn">
            Realizar pedido
          </button>

          <p className="terms-copy">Al realizar tu pedido, aceptas nuestros Terminos de Servicio.</p>
        </aside>
      </main>

      <PublicFooter />
    </div>
  );
}

export default CheckoutPage;
