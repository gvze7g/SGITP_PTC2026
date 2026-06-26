import { ChevronDown, ImagePlus } from 'lucide-react';

function CreateProductModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="app-modal-overlay app-modal-overlay-dark">
      <div className="create-product-modal">
        <div className="create-product-header">
          <h2>Crear producto</h2>
        </div>

        <div className="create-product-body">
          <div className="create-product-left">
            <span className="modal-section-label">IMAGEN PRINCIPAL</span>

            <div className="upload-main-box">
              <ImagePlus size={38} strokeWidth={1.6} />
              <span>SUBIR</span>
            </div>

            <div className="upload-gallery-row">
              <button type="button" className="upload-thumb-box upload-thumb-box-add">+</button>
              <div className="upload-thumb-box" />
              <div className="upload-thumb-box" />
            </div>
          </div>

          <div className="create-product-right">
            <div className="modal-input-group">
              <span className="modal-section-label">NOMBRE DEL PRODUCTO</span>
              <input
                type="text"
                placeholder="ej: luis Boton body"
                className="modal-line-input"
              />
            </div>

            <div className="modal-two-columns">
              <div className="modal-input-group">
                <span className="modal-section-label">CATEGORIA</span>
                <button type="button" className="modal-select-like">
                  <span>SELECCIONAR</span>
                  <ChevronDown size={22} strokeWidth={1.8} />
                </button>
              </div>

              <div className="modal-input-group">
                <span className="modal-section-label">TEMPORADA</span>
                <button type="button" className="modal-select-like">
                  <span>Invierno</span>
                  <ChevronDown size={22} strokeWidth={1.8} />
                </button>
              </div>
            </div>

            <div className="modal-input-group">
              <span className="modal-section-label">DESCRIPCION</span>
              <textarea className="modal-description-area" />
            </div>
          </div>
        </div>

        <div className="variant-section">
          <h3>Inventario de variantes</h3>

          <div className="variant-table">
            <div className="variant-table-head">
              <span>TAMAÑO</span>
              <span>COLOR</span>
              <span>DISEÑO</span>
              <span>BORDADO</span>
              <span>TELA</span>
              <span>STOCK</span>
              <span>MINORISTA</span>
              <span>MAYORISTA</span>
            </div>

            <div className="variant-table-row">
              <input defaultValue="0-3M" />
              <input defaultValue="Avena" />
              <input defaultValue="Tejido acanalado" />
              <input defaultValue="None" />
              <input defaultValue="Algodon" />
              <input defaultValue="24" />
              <input defaultValue="$ 85.00" />
              <input defaultValue="$ 42.50" />
            </div>

            <div className="variant-table-row variant-table-row-muted">
              <input placeholder="Tamaño" />
              <input placeholder="Color" />
              <input placeholder="Diseño" />
              <input placeholder="Bordado" />
              <input placeholder="Tela" />
              <input placeholder="-" />
              <input placeholder="$ 0.00" />
              <input placeholder="$ 0.00" />
            </div>
          </div>
        </div>

        <div className="create-product-footer">
          <button type="button" className="modal-cancel-text-btn" onClick={onClose}>
            CANCELAR
          </button>

          <button type="button" className="modal-save-btn" onClick={onClose}>
            Guardar producto
            <span className="modal-save-arrow">›</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateProductModal;