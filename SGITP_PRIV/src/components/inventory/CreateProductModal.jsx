import { useMemo, useState } from "react";
import { ChevronDown, ImagePlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const emptyVariant = {
  size: "",
  color: "",
  design: "",
  embroidery: "",
  fabric: "",
  stock: "",
  minorista: "",
  mayorista: "",
};

function CreateProductModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    cost: "",
    images: [],
    variants: [{ ...emptyVariant }],
  });

  const previewImages = useMemo(
    () => form.images.map((file) => URL.createObjectURL(file)),
    [form.images]
  );

  const updateVariant = (index, field, value) => {
    setForm((prev) => {
      const next = [...prev.variants];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, variants: next };
    });
  };

  const addVariant = () => {
    setForm((prev) => ({ ...prev, variants: [...prev.variants, { ...emptyVariant }] }));
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setForm((prev) => ({ ...prev, images: files.slice(0, 5) }));
  };

  const handleSave = async () => {
    const payload = {
      name: form.name,
      category: form.category,
      description: form.description,
      price: Number(form.price || 0),
      cost: Number(form.cost || 0),
      images: form.images,
      variants: form.variants.map((v) => ({
        size: v.size,
        color: v.color,
        design: v.design,
        embroidery: v.embroidery,
        fabric: v.fabric,
        stock: Number(v.stock || 0),
        minorista: Number(v.minorista || 0),
        mayorista: Number(v.mayorista || 0),
      })),
    };

    await onSubmit(payload);
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="app-modal-overlay app-modal-overlay-dark"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="create-product-modal"
            initial={{ opacity: 0, scale: 0.96, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="create-product-header">
              <h2>Crear producto</h2>
            </div>

            <div className="create-product-body">
              <div className="create-product-left">
                <span className="modal-section-label">IMAGEN PRINCIPAL</span>

                <label className="upload-main-box" style={{ cursor: "pointer" }}>
                  <ImagePlus size={38} strokeWidth={1.6} />
                  <span>SUBIR</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImagesChange}
                    style={{ display: "none" }}
                  />
                </label>

                <div className="upload-gallery-row">
                  {previewImages.map((src, idx) => (
                    <img key={idx} src={src} alt={`preview-${idx}`} className="upload-thumb-box" />
                  ))}
                </div>
              </div>

              <div className="create-product-right">
                <div className="modal-input-group">
                  <span className="modal-section-label">NOMBRE DEL PRODUCTO</span>
                  <input
                    type="text"
                    placeholder="Ej: Body bebé"
                    className="modal-line-input"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </div>

                <div className="modal-two-columns">
                  <div className="modal-input-group">
                    <span className="modal-section-label">CATEGORÍA</span>
                    <input
                      type="text"
                      className="modal-line-input"
                      value={form.category}
                      onChange={(e) => handleChange("category", e.target.value)}
                    />
                  </div>

                  <div className="modal-input-group">
                    <span className="modal-section-label">PRECIO / COSTO</span>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type="number"
                        className="modal-line-input"
                        placeholder="Precio"
                        value={form.price}
                        onChange={(e) => handleChange("price", e.target.value)}
                      />
                      <input
                        type="number"
                        className="modal-line-input"
                        placeholder="Costo"
                        value={form.cost}
                        onChange={(e) => handleChange("cost", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-input-group">
                  <span className="modal-section-label">DESCRIPCIÓN</span>
                  <textarea
                    className="modal-description-area"
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                  />
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

                {form.variants.map((v, index) => (
                  <div className="variant-table-row" key={index}>
                    <input value={v.size} onChange={(e) => updateVariant(index, "size", e.target.value)} />
                    <input value={v.color} onChange={(e) => updateVariant(index, "color", e.target.value)} />
                    <input value={v.design} onChange={(e) => updateVariant(index, "design", e.target.value)} />
                    <input value={v.embroidery} onChange={(e) => updateVariant(index, "embroidery", e.target.value)} />
                    <input value={v.fabric} onChange={(e) => updateVariant(index, "fabric", e.target.value)} />
                    <input value={v.stock} onChange={(e) => updateVariant(index, "stock", e.target.value)} />
                    <input value={v.minorista} onChange={(e) => updateVariant(index, "minorista", e.target.value)} />
                    <input value={v.mayorista} onChange={(e) => updateVariant(index, "mayorista", e.target.value)} />
                  </div>
                ))}
              </div>

              <button type="button" className="modal-select-like" onClick={addVariant}>
                <span>Agregar variante</span>
                <ChevronDown size={18} />
              </button>
            </div>

            <div className="create-product-footer">
              <button type="button" className="modal-cancel-text-btn" onClick={onClose}>
                CANCELAR
              </button>

              <button type="button" className="modal-save-btn" onClick={handleSave}>
                Guardar producto
                <span className="modal-save-arrow">›</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default CreateProductModal;