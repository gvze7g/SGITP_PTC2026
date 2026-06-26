import { Filter, Pencil, Trash2 } from 'lucide-react';

const INVENTORY_ITEMS = [
  {
    id: 1,
    image:
      'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=300&q=80',
    name: 'Body',
    details: [
      'Tamaño: 0-3 meses',
      'Color: avena',
      'Diseño: Sin mangas, con botones',
      'Tela: 100% algodon',
    ],
    retail: '$45.00',
    wholesale: '$22.50',
    stockRetail: 'Minorista: 12 in stock',
    stockWholesale: 'Mayorista: 48 in stock',
  },
  {
    id: 2,
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=300&q=80',
    name: 'Camisa polo',
    details: [
      'Tamaño: 6-9 meses',
      'Color: arena',
      'Diseño: cuello en v con botones',
      'Tela: 100% algodon',
    ],
    retail: '$68.00',
    wholesale: '$34.00',
    stockRetail: 'Retail: 4 in stock',
    stockWholesale: 'Wholesale: 15 in stock',
  },
];

function InventoryTable({ onOpenCreateModal, onOpenDeleteModal }) {
  return (
    <section className="inventory-panel">
      <div className="inventory-panel-header">
        <div className="inventory-tabs">
          <button type="button" className="inventory-tab inventory-tab-active">
            PRODUCTOS
          </button>
          <button type="button" className="inventory-tab">
            STOCK BAJO
          </button>
        </div>

        <button type="button" className="inventory-filter-btn">
          <Filter size={18} strokeWidth={1.8} />
          Filtros
        </button>
      </div>

      <div className="inventory-table-wrap">
        <div className="inventory-head-row">
          <span>IMAGEN</span>
          <span>DETALLES DEL PRODUCTO</span>
          <span>PRECIO AL POR MENOR</span>
          <span>PRECIO MAYORISTA</span>
          <span>ESTADO DE STOCK</span>
          <span>ACCIONES</span>
        </div>

        {INVENTORY_ITEMS.map((item) => (
          <article key={item.id} className="inventory-row">
            <div className="inventory-image-cell">
              <img src={item.image} alt={item.name} />
            </div>

            <div className="inventory-details-cell">
              <h4>{item.name}</h4>
              {item.details.map((detail) => (
                <p key={detail}>{detail}</p>
              ))}
            </div>

            <div className="inventory-price-cell">{item.retail}</div>
            <div className="inventory-price-cell">{item.wholesale}</div>

            <div className="inventory-stock-cell">
              <span>{item.stockRetail}</span>
              <span>{item.stockWholesale}</span>
            </div>

            <div className="inventory-actions-cell">
              <button type="button" className="inventory-action-icon">
                <Pencil size={22} strokeWidth={2} />
              </button>
              <button
                type="button"
                className="inventory-action-icon"
                onClick={onOpenDeleteModal}
              >
                <Trash2 size={22} strokeWidth={2} />
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="inventory-footer">
        <p>Mostrando 1 a 10 de 124 ventas</p>

        <div className="inventory-pagination">
          <button type="button">‹</button>
          <button type="button" className="inventory-page-active">1</button>
          <button type="button">2</button>
          <button type="button">3</button>
          <button type="button">›</button>
        </div>
      </div>
    </section>
  );
}

export default InventoryTable;