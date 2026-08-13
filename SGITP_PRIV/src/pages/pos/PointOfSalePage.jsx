import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ProductCatalogCard from '../../components/pos/ProductCatalogCard';
import PointOfSalePanel from '../../components/pos/PointOfSalePanel';
import useProducts from '../../hooks/Inventory/UseProducts';
import useClients from '../../hooks/clients/UseClients';
import useSales from '../../hooks/sales/UseSales';

const FALLBACK_IMAGE = 'https://via.placeholder.com/300x300?text=Sin+imagen';

function getProductImage(product) {
  return product?.images?.[0]?.image || FALLBACK_IMAGE;
}

// Primera variante con stock disponible (si no hay ninguna, regresa la primera igual)
function getSellableVariant(product) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  return variants.find((variant) => Number(variant.stock || 0) > 0) || variants[0] || {};
}

function getTotalStock(product) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  return variants.reduce((sum, variant) => sum + Number(variant.stock || 0), 0);
}

function PointOfSalePage({ theme, onToggleTheme }) {
  const { products, getProducts } = useProducts();
  const { clients, getClients } = useClients();
  const { createSale, loading: confirming } = useSales();

  const [activeCategory, setActiveCategory] = useState('TODOS');
  const [cartItems, setCartItems] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [origin, setOrigin] = useState('Store');
  const [shippingData, setShippingData] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    getProducts();
    getClients();
  }, [getProducts, getClients]);

  const clientType = customer?.customer_type === 'Wholesale' ? 'Wholesale' : 'Retail';

  const categories = useMemo(() => {
    const unique = [...new Set(products.map((product) => product.category).filter(Boolean))];
    return ['TODOS', ...unique];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'TODOS') return products;
    return products.filter((product) => product.category === activeCategory);
  }, [products, activeCategory]);

  const getUnitPrice = useCallback(
    (product) => Number((clientType === 'Wholesale' ? product.cost : product.price) || 0),
    [clientType]
  );

  const handleAddToCart = (product) => {
    const variant = getSellableVariant(product);
    const stock = Number(variant.stock || 0);

    if (stock <= 0) {
      toast.error('Este producto no tiene stock disponible.');
      return;
    }

    const key = `${product._id}__${variant.size || ''}__${variant.color || ''}`;
    const unitPrice = getUnitPrice(product);

    setCartItems((prev) => {
      const existing = prev.find((item) => item.key === key);

      if (existing) {
        if (existing.quantity >= stock) {
          toast.error('No hay más stock disponible de esta variante.');
          return prev;
        }

        return prev.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [
        ...prev,
        {
          key,
          product_id: product._id,
          name: product.name,
          image: getProductImage(product),
          size: variant.size || '',
          color: variant.color || '',
          maxStock: stock,
          unitPrice,
          quantity: 1,
        },
      ];
    });
  };

  const handleIncrementItem = (key) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.key !== key) return item;
        if (item.quantity >= item.maxStock) {
          toast.error('No hay más stock disponible de esta variante.');
          return item;
        }
        return { ...item, quantity: item.quantity + 1 };
      })
    );
  };

  const handleDecrementItem = (key) => {
    setCartItems((prev) =>
      prev
        .map((item) => (item.key === key ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  // Recalcula los precios del carrito cuando cambia el tipo de cliente (regular/mayorista)
  useEffect(() => {
    setCartItems((prev) =>
      prev.map((item) => {
        const product = products.find((p) => p._id === item.product_id);
        if (!product) return item;
        return { ...item, unitPrice: getUnitPrice(product) };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientType]);

  const total = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const handleConfirmSale = async () => {
    if (cartItems.length === 0) {
      toast.error('Agrega al menos un producto a la orden.');
      return;
    }

    const payload = {
      origin,
      applied_price_type: clientType,
      payment_method: 'Cash',
      payment_status: 'Pagado',
      shipping_address: shippingData,
      shipping_phone: phone,
      shipping_method: 'Store',
      shipping_cost: 0,
      item_details: cartItems.map((item) => ({
        product_id: item.product_id,
        name: item.name,
        selected_variant: [item.size, item.color].filter(Boolean).join(' / '),
        variant_size: item.size,
        variant_color: item.color,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      })),
    };

    const result = await createSale(payload);

    if (!result.success) {
      toast.error(result.message || 'No se pudo registrar la venta.');
      return;
    }

    toast.success('Venta confirmada correctamente.');
    setCartItems([]);
    setCustomer(null);
    setShippingData('');
    setPhone('');
    await getProducts();
  };

  return (
    <DashboardLayout theme={theme} onToggleTheme={onToggleTheme}>
      <div className="pos-page-grid">
        <section className="pos-catalog-section">
          <div className="pos-categories-row">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`pos-category-chip ${
                  activeCategory === category ? 'pos-category-chip-active' : ''
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="pos-products-grid">
            {filteredProducts.map((product) => {
              const variant = getSellableVariant(product);
              const stock = getTotalStock(product);
              const meta = [variant.color, variant.size].filter(Boolean).join(' • ');

              return (
                <ProductCatalogCard
                  key={product._id}
                  image={getProductImage(product)}
                  title={product.name}
                  meta={meta || product.category}
                  price={`$${getUnitPrice(product).toFixed(2)}`}
                  disabled={stock <= 0}
                  onClick={() => handleAddToCart(product)}
                />
              );
            })}
          </div>
        </section>

        <PointOfSalePanel
          cartItems={cartItems}
          onIncrementItem={handleIncrementItem}
          onDecrementItem={handleDecrementItem}
          customer={customer}
          customers={clients}
          onSelectCustomer={setCustomer}
          origin={origin}
          onOriginChange={setOrigin}
          shippingData={shippingData}
          onShippingDataChange={setShippingData}
          phone={phone}
          onPhoneChange={setPhone}
          total={total}
          confirming={confirming}
          onConfirmSale={handleConfirmSale}
        />
      </div>
    </DashboardLayout>
  );
}

export default PointOfSalePage;
