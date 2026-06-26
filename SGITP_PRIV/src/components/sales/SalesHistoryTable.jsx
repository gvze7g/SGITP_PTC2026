import { ChevronDown, Eye } from 'lucide-react';

export const SALES = [
  {
    id: '#VT-0924',
    date: '12 Oct 2023, 10:45 AM',
    client: 'María Fernanda López',
    origin: 'Tienda Física',
    branch: 'Sucursal Merliot',
    priceType: 'Minorista',
    total: '$1,250.00',
    subtotal: '$1,220.00',
    shipping: '$30.00',
    items: [
      {
        name: 'Body de lino orgánico',
        variant: 'Beige · 6M',
        quantity: '2',
        price: '$45.00',
        subtotal: '$90.00',
      },
      {
        name: 'Cardigan de punto grueso',
        variant: 'Piedra · 12M',
        quantity: '4',
        price: '$65.00',
        subtotal: '$260.00',
      },
    ],
  },
  {
    id: '#VW-0925',
    date: '12 Oct 2023, 11:30 AM',
    client: 'Andrea Castro',
    origin: 'Web',
    branch: 'Sucursal Escalón',
    priceType: 'Minorista',
    total: '$890.00',
    subtotal: '$860.00',
    shipping: '$30.00',
    items: [
      {
        name: 'Mameluco de punto',
        variant: 'Arena · 9M',
        quantity: '3',
        price: '$38.00',
        subtotal: '$114.00',
      },
    ],
  },
  {
    id: '#VWA-0926',
    date: '12 Oct 2023, 02:15 PM',
    client: 'Boutique Pequeñines (Empresa)',
    origin: 'WhatsApp',
    branch: 'Sucursal San Benito',
    priceType: 'Mayorista',
    total: '$15,400.00',
    subtotal: '$15,400.00',
    shipping: '$0.00',
    items: [
      {
        name: 'Enterizo de algodón orgánico',
        variant: 'Beige · 6M',
        quantity: '80',
        price: '$45.00',
        subtotal: '$3,600.00',
      },
    ],
  },
  {
    id: '#VT-0927',
    date: '13 Oct 2023, 09:10 AM',
    client: 'Cliente Mostrador',
    origin: 'Tienda Física',
    branch: 'Sucursal Centro',
    priceType: 'Minorista',
    total: '$450.00',
    subtotal: '$450.00',
    shipping: '$0.00',
    items: [
      {
        name: 'Body de algodón',
        variant: 'Blanco · 3M',
        quantity: '5',
        price: '$45.00',
        subtotal: '$225.00',
      },
    ],
  },
];

function SalesHistoryTable({ onViewSale }) {
  return (
    <section className="sales-history-panel">
      <div className="sales-filters-card">
        <div className="sales-filters-grid">
          <div className="sales-filter-block">
            <label>Origen</label>
            <button type="button" className="sales-filter-select">
              <span>Todos</span>
              <ChevronDown size={20} strokeWidth={1.8} />
            </button>
          </div>

          <div className="sales-filter-block">
            <label>Sucursal</label>
            <button type="button" className="sales-filter-select">
              <span>Todas las sucursales</span>
              <ChevronDown size={20} strokeWidth={1.8} />
            </button>
          </div>

          <div className="sales-filter-block">
            <label>Fecha</label>
            <button type="button" className="sales-filter-select">
              <span>Este mes</span>
              <ChevronDown size={20} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </div>

      <div className="sales-table-wrap">
        <div className="sales-head-row">
          <span>ID VENTA</span>
          <span>FECHA</span>
          <span>CLIENTE</span>
          <span>ORIGEN</span>
          <span>TIPO DE PRECIO</span>
          <span>TOTAL</span>
          <span>ACCIONES</span>
        </div>

        {SALES.map((sale) => (
          <article key={sale.id} className="sales-row">
            <div className="sales-id-cell">{sale.id}</div>
            <div className="sales-date-cell">{sale.date}</div>
            <div className="sales-client-cell">{sale.client}</div>
            <div className="sales-origin-cell">
              <span className="sales-origin-badge">{sale.origin}</span>
            </div>
            <div className="sales-price-type-cell">{sale.priceType}</div>
            <div className="sales-total-cell">{sale.total}</div>
            <div className="sales-actions-cell">
              <button
                type="button"
                className="sales-action-icon"
                onClick={() => onViewSale?.(sale)}
              >
                <Eye size={22} strokeWidth={2} />
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="sales-footer">
        <p>Mostrando 1 a 10 de 124 ventas</p>

        <div className="sales-pagination">
          <button type="button">‹</button>
          <button type="button" className="sales-page-active">1</button>
          <button type="button">2</button>
          <button type="button">3</button>
          <button type="button">›</button>
        </div>
      </div>
    </section>
  );
}

export default SalesHistoryTable;