import DashboardLayout from '../../components/layout/DashboardLayout';
import ProductCatalogCard from '../../components/pos/ProductCatalogCard';
import PointOfSalePanel from '../../components/pos/PointOfSalePanel';

const CATEGORIES = ['TODOS', 'BODYS', 'MAMELUCOS', 'ACCESORIOS'];

const PRODUCTS = [
  {
    id: 1,
    title: 'Enterizo de algodón orgánico',
    meta: 'Beige • 6M, 9M, 12M',
    price: '$45.00',
    image:
      'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    title: 'Body de Lino con Envoltura',
    meta: 'Avena • 3M, 6M',
    price: '$38.00',
    image:
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    title: 'Cardigan de punto grueso',
    meta: 'Piedra • 12M, 18M',
    price: '$65.00',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80',
  },
];

function PointOfSalePage({ currentView, onNavigate, theme, onToggleTheme }) {
  return (
    <DashboardLayout
      currentView={currentView}
      onNavigate={onNavigate}
      theme={theme}
      onToggleTheme={onToggleTheme}
    >
      <div className="pos-page-grid">
        <section className="pos-catalog-section">
          <div className="pos-categories-row">
            {CATEGORIES.map((category, index) => (
              <button
                key={category}
                type="button"
                className={`pos-category-chip ${index === 0 ? 'pos-category-chip-active' : ''}`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="pos-products-grid">
            {PRODUCTS.map((product) => (
              <ProductCatalogCard key={product.id} {...product} />
            ))}
          </div>
        </section>

        <PointOfSalePanel />
      </div>
    </DashboardLayout>
  );
}

export default PointOfSalePage;