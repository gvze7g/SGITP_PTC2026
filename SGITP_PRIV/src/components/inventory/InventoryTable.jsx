import { Filter, Pencil, Trash2 } from "lucide-react";

function InventoryTable({
  products = [],
  loading,
  onEditProduct,
  onDeleteProduct,
}) {
  // calcular stock total de variantes
  const getTotalStock = (variants = []) => {
    if (!Array.isArray(variants)) return 0;

    return variants.reduce((total, variant) => {
      return total + Number(variant?.stock || 0);
    }, 0);
  };

  // obtener imagen principal
  const getMainImage = (product) => {
    if (product?.images?.length > 0) {
      return product.images[0].image;
    }

    return "https://via.placeholder.com/80x80?text=Sin+imagen";
  };

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

        {loading ? (
          <div style={{ padding: "20px" }}>Cargando productos...</div>
        ) : products.length === 0 ? (
          <div style={{ padding: "20px" }}>No hay productos registrados.</div>
        ) : (
          products.map((product) => {
            const firstVariant = product.variants?.[0] || {};
            const totalStock = getTotalStock(product.variants);

            return (
              <article
                key={product._id}
                className="inventory-row"
              >
                <div className="inventory-image-cell">
                  <img src={getMainImage(product)} alt={product.name} />
                </div>

                <div className="inventory-details-cell">
                  <h4>{product.name}</h4>
                  <p>{product.description || "Sin descripción"}</p>
                  <p>Categoría: {product.category || "Sin categoría"}</p>
                  <p>Tamaño: {firstVariant.size || "No definido"}</p>
                  <p>Color: {firstVariant.color || "No definido"}</p>
                </div>

                <div className="inventory-price-cell">
                  ${Number(product.price || 0).toFixed(2)}
                </div>

                <div className="inventory-price-cell">
                  ${Number(product.cost || 0).toFixed(2)}
                </div>

                <div className="inventory-stock-cell">
                  <span>Total en stock: {totalStock}</span>
                  <span>
                    Variantes: {Array.isArray(product.variants) ? product.variants.length : 0}
                  </span>
                </div>

                <div className="inventory-actions-cell">
                  <button
                    type="button"
                    className="inventory-action-icon"
                    aria-label="Editar producto"
                    onClick={() => onEditProduct?.(product)}
                  >
                    <Pencil size={22} strokeWidth={2} />
                  </button>

                  <button
                    type="button"
                    className="inventory-action-icon"
                    onClick={() => onDeleteProduct?.(product)}
                    aria-label="Eliminar producto"
                  >
                    <Trash2 size={22} strokeWidth={2} />
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>

      <div className="inventory-footer">
        <p>Mostrando {products.length} productos</p>

        <div className="inventory-pagination">
          <button type="button">‹</button>
          <button type="button" className="inventory-page-active">
            1
          </button>
          <button type="button">›</button>
        </div>
      </div>
    </section>
  );
}

export default InventoryTable;