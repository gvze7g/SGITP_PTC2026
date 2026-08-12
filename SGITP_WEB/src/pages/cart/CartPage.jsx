import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ShieldCheck, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import PublicNavbar from '../../components/home/PublicNavbar';
import { getMyCart, removeCartItem, updateCartItem } from '../../services/cartService';
import { getProductImage } from '../../services/catalogService';

const formatPrice = (value) => `$${value.toFixed(2)}`;

function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const cartItems = useMemo(() => cart?.products || [], [cart]);
  const subtotal = Number(cart?.total || 0);

  const loadCart = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getMyCart();
      setCart(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleUpdateQuantity = async (item, nextQuantity) => {
    const productId = item.productId?._id;
    if (!productId) return;

    try {
      const data = await updateCartItem(productId, nextQuantity);
      setCart(data);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleRemove = async (item) => {
    const productId = item.productId?._id;
    if (!productId) return;

    try {
      const data = await removeCartItem(productId);
      setCart(data);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

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
            <p>{cartItems.length} articulos seleccionados</p>
          </header>

          {loading ? <p className="catalog-status-text">Cargando carrito...</p> : null}
          {error ? <p className="catalog-status-text">{error}</p> : null}

          <div className="cart-items">
            {!loading && cartItems.length === 0 ? (
              <p className="catalog-status-text">Tu carrito esta vacio.</p>
            ) : null}

            {cartItems.map((item) => {
              const product = item.productId || {};
              const variant = product.variants?.[0] || {};
              const quantity = Number(item.quantity || 1);

              return (
              <article key={product._id} className="cart-item">
                <img src={getProductImage(product, 620)} alt={product.name} />

                <div className="cart-item-copy">
                  <h2>{product.name || 'Producto'}</h2>
                  <p>Color: {variant.color || 'No definido'}</p>
                  <p>Talla: {variant.size || 'No definida'}</p>

                  <div className="quantity-control" aria-label={`Cantidad de ${product.name}`}>
                    <button
                      type="button"
                      aria-label="Reducir cantidad"
                      onClick={() => handleUpdateQuantity(item, quantity - 1)}
                    >
                      -
                    </button>
                    <span>{String(quantity).padStart(2, '0')}</span>
                    <button
                      type="button"
                      aria-label="Aumentar cantidad"
                      onClick={() => handleUpdateQuantity(item, quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="cart-item-side">
                  <span>{formatPrice(Number(item.subtotal || 0))}</span>
                  <button type="button" onClick={() => handleRemove(item)}>Eliminar</button>
                </div>
              </article>
              );
            })}
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
