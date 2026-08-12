import { Filter, Pencil, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

const ITEMS_PER_PAGE = 6;

function InventoryTable({
  products = [],
  loading,
  activeTab = "all",
  filtersOpen = false,
  filters,
  onToggleFilters,
  onTabChange,
  onChangeFilter,
  onSearchSubmit,
  onApplyPriceFilter,
  onResetFilters,
  onEditProduct,
  onDeleteProduct,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(products.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = useMemo(
    () => products.slice(startIndex, startIndex + ITEMS_PER_PAGE),
    [products, startIndex]
  );
  const showingFrom = products.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + paginatedProducts.length, products.length);

  const getTotalStock = (variants = []) => {
    if (!Array.isArray(variants)) return 0;

    return variants.reduce((total, variant) => {
      return total + Number(variant?.stock || 0);
    }, 0);
  };

  const getMainImage = (product) => {
    if (product?.images?.length > 0) {
      return product.images[0].image;
    }

    return "https://via.placeholder.com/80x80?text=Sin+imagen";
  };

  const getStockLabel = (totalStock) => {
    if (totalStock <= 5) return "Stock bajo";
    if (totalStock <= 10) return "Stock medio";
    return "Stock estable";
  };

  const handlePriceInputChange = (field, value) => {
    const sanitized = value.replace(/[^\d.]/g, "");
    onChangeFilter?.(field, sanitized);
  };

  return (
    <section className="inventory-panel">
      <div className="inventory-panel-header">
        <div className="inventory-tabs">
          <button
            type="button"
            className={`inventory-tab ${activeTab === "all" ? "inventory-tab-active" : ""}`}
            onClick={() => onTabChange?.("all")}
          >
            PRODUCTOS
          </button>

          <button
            type="button"
            className={`inventory-tab ${activeTab === "low-stock" ? "inventory-tab-active" : ""}`}
            onClick={() => onTabChange?.("low-stock")}
          >
            STOCK BAJO
          </button>
        </div>

        <button
          type="button"
          className="inventory-filter-btn"
          onClick={onToggleFilters}
        >
          <Filter size={18} strokeWidth={1.8} />
          Filtros
        </button>
      </div>

      {filtersOpen ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr auto auto",
            gap: "12px",
            marginBottom: "18px",
            alignItems: "end",
          }}
        >
          <div className="client-form-group">
            <label>Buscar por nombre</label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                className="form-editable-input"
                placeholder="Ej. Body, Peleles, Vestido..."
                value={filters.search}
                onChange={(event) => onChangeFilter?.("search", event.target.value)}
                style={{ paddingRight: "42px" }}
              />
              <button
                type="button"
                onClick={onSearchSubmit}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                }}
                aria-label="Buscar productos"
              >
                <Search size={18} />
              </button>
            </div>
          </div>

          <div className="client-form-group">
            <label>Precio minimo</label>
            <input
              type="text"
              className="form-editable-input"
              placeholder="0.00"
              value={filters.minPrice}
              onChange={(event) =>
                handlePriceInputChange("minPrice", event.target.value)
              }
            />
          </div>

          <div className="client-form-group">
            <label>Precio maximo</label>
            <input
              type="text"
              className="form-editable-input"
              placeholder="999.99"
              value={filters.maxPrice}
              onChange={(event) =>
                handlePriceInputChange("maxPrice", event.target.value)
              }
            />
          </div>

          <button
            type="button"
            className="admin-secondary-btn"
            onClick={onApplyPriceFilter}
          >
            Aplicar
          </button>

          <button
            type="button"
            className="admin-secondary-btn"
            onClick={onResetFilters}
          >
            Limpiar
          </button>
        </div>
      ) : null}

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
          <div style={{ padding: "20px" }}>
            {activeTab === "low-stock"
              ? "No hay productos con stock bajo."
              : "No hay productos registrados."}
          </div>
        ) : (
          paginatedProducts.map((product) => {
            const firstVariant = product.variants?.[0] || {};
            const totalStock = getTotalStock(product.variants);

            return (
              <article key={product._id} className="inventory-row">
                <div className="inventory-image-cell">
                  <img src={getMainImage(product)} alt={product.name} />
                </div>

                <div className="inventory-details-cell">
                  <h4>{product.name}</h4>
                  <p>{product.description || "Sin descripcion"}</p>
                  <p>Categoria: {product.category || "Sin categoria"}</p>
                  <p>Tamano: {firstVariant.size || "No definido"}</p>
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
                  <span>{getStockLabel(totalStock)}</span>
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
        <p>
          Mostrando {showingFrom} a {showingTo} de {products.length} productos
        </p>

        <div className="inventory-pagination">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={safePage === 1}
            aria-label="Pagina anterior"
          >
            {"<"}
          </button>
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              type="button"
              className={safePage === index + 1 ? "inventory-page-active" : ""}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={safePage === totalPages}
            aria-label="Pagina siguiente"
          >
            {">"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default InventoryTable;
