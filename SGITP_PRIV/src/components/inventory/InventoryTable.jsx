import { Filter, Pencil, Trash2 } from "lucide-react";

function InventoryTable({
  inventory = [],
  loading = false,
  onOpenCreateModal,
  onOpenDeleteModal,
}) {
  if (loading) {
    return <section className="inventory-panel">Cargando inventario...</section>;
  }

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

        {inventory.map((item) => {
          const firstImage = item?.images?.[0]?.image || "https://via.placeholder.com/80";
          const firstVariant = item?.variants?.[0] || {};
          const totalStock = (item?.variants || []).reduce(
            (acc, v) => acc + Number(v?.stock || 0),
            0
          );

          return (
            <article key={item._id} className="inventory-row">
              <div className="inventory-image-cell">
                <img src={firstImage} alt={item.name} />
              </div>

              <div className="inventory-details-cell">
                <h4>{item.name}</h4>
                <p>Tamaño: {firstVariant.size || "-"}</p>
                <p>Color: {firstVariant.color || "-"}</p>
                <p>Diseño: {firstVariant.design || "-"}</p>
                <p>Tela: {firstVariant.fabric || "-"}</p>
              </div>

              <div className="inventory-price-cell">${Number(item.price || 0).toFixed(2)}</div>
              <div className="inventory-price-cell">${Number(item.cost || 0).toFixed(2)}</div>

              <div className="inventory-stock-cell">
                <span>Total en stock: {totalStock}</span>
              </div>

              <div className="inventory-actions-cell">
                <button type="button" className="inventory-action-icon" aria-label="Editar producto">
                  <Pencil size={22} strokeWidth={2} />
                </button>
                <button
                  type="button"
                  className="inventory-action-icon"
                  onClick={() => onOpenDeleteModal(item._id)}
                  aria-label="Eliminar producto"
                >
                  <Trash2 size={22} strokeWidth={2} />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="inventory-footer">
        <p>Mostrando {inventory.length} producto(s)</p>
        <button type="button" className="admin-primary-btn" onClick={onOpenCreateModal}>
          + Crear producto
        </button>
      </div>
    </section>
  );
}

export default InventoryTable;