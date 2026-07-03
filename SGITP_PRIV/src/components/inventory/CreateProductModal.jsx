import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

const EMPTY_VARIANT = {
  size: "",
  color: "",
  design: "",
  embroidery: "",
  fabric: "",
  stock: "",
  retail: "",
  wholesale: "",
};

const EMPTY_FORM = {
  name: "",
  category: "",
  description: "",
  price: "",
  cost: "",
  variants: [EMPTY_VARIANT],
};

function CreateProductModal({
  open,
  onClose,
  onSubmit,
  productData = null,
  loading = false,
}) {
  // datos del formulario
  const [formData, setFormData] = useState(EMPTY_FORM);

  // aquí guardamos 4 espacios de imágenes
  const [imageSlots, setImageSlots] = useState([null, null, null, null]);

  // refs para abrir input file
  const fileInputRefs = useRef([]);

  // saber si estamos editando
  const isEditMode = useMemo(() => Boolean(productData), [productData]);

  // evita que el scroll cambie precio/costo/stock
  const preventWheelChange = (event) => {
    event.target.blur();
  };

  // llenar formulario cuando abre modal
  useEffect(() => {
    if (!open) return;

    if (productData) {
      setFormData({
        name: productData.name || "",
        category: productData.category || "",
        description: productData.description || "",
        price: productData.price || "",
        cost: productData.cost || "",
        variants:
          productData.variants?.length > 0
            ? productData.variants.map((variant) => ({
                size: variant.size || "",
                color: variant.color || "",
                design: variant.design || "",
                embroidery: variant.embroidery || "",
                fabric: variant.fabric || "",
                stock: variant.stock || "",
                retail: variant.retail || "",
                wholesale: variant.wholesale || "",
              }))
            : [{ ...EMPTY_VARIANT }],
      });

      const existingImages = productData.images?.slice(0, 4) || [];
      const slots = [null, null, null, null];

      existingImages.forEach((img, index) => {
        slots[index] = {
          file: null,
          preview: img.image,
          existing: true,
        };
      });

      setImageSlots(slots);
    } else {
      setFormData({
        ...EMPTY_FORM,
        variants: [{ ...EMPTY_VARIANT }],
      });
      setImageSlots([null, null, null, null]);
    }
  }, [open, productData]);

  // cambiar inputs simples
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // permitir solo positivos y decimales
  const handleDecimalChange = (field, value) => {
    if (value === "") {
      handleChange(field, "");
      return;
    }

    const decimalRegex = /^\d*\.?\d*$/;

    if (!decimalRegex.test(value)) return;
    if (Number(value) < 0) return;

    handleChange(field, value);
  };

  // cambiar una variante
  const handleVariantChange = (index, field, value) => {
    const decimalFields = ["stock", "retail", "wholesale"];

    if (decimalFields.includes(field)) {
      if (value !== "") {
        const decimalRegex = /^\d*\.?\d*$/;
        if (!decimalRegex.test(value)) return;
        if (Number(value) < 0) return;
      }
    }

    setFormData((prev) => {
      const updatedVariants = [...prev.variants];
      updatedVariants[index] = {
        ...updatedVariants[index],
        [field]: value,
      };

      return {
        ...prev,
        variants: updatedVariants,
      };
    });
  };

  // agregar variante
  const handleAddVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { ...EMPTY_VARIANT }],
    }));
  };

  // eliminar variante
  const handleRemoveVariant = (index) => {
    if (formData.variants.length === 1) {
      toast.error("Debe existir al menos una variante.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  // abrir selector de imagen
  const handleClickImageSlot = (index) => {
    fileInputRefs.current[index]?.click();
  };

  // guardar imagen en un slot
  const handleImageChange = (index, event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const updatedSlots = [...imageSlots];
    updatedSlots[index] = {
      file,
      preview: URL.createObjectURL(file),
      existing: false,
    };

    setImageSlots(updatedSlots);
  };

  // quitar imagen de un slot
  const handleRemoveImage = (index) => {
    const updatedSlots = [...imageSlots];
    updatedSlots[index] = null;
    setImageSlots(updatedSlots);
  };

  // validar antes de guardar
  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("El nombre del producto es obligatorio.");
      return false;
    }

    if (!formData.description.trim()) {
      toast.error("La descripción del producto es obligatoria.");
      return false;
    }

    if (!formData.category.trim()) {
      toast.error("La categoría es obligatoria.");
      return false;
    }

    if (formData.price !== "" && Number(formData.price) < 0) {
      toast.error("El precio no puede ser menor que 0.");
      return false;
    }

    if (formData.cost !== "" && Number(formData.cost) < 0) {
      toast.error("El costo no puede ser menor que 0.");
      return false;
    }

    const hasAtLeastOneImage = imageSlots.some((slot) => slot !== null);

    if (!hasAtLeastOneImage && !isEditMode) {
      toast.error("Debes subir al menos una imagen.");
      return false;
    }

    return true;
  };

  // guardar producto
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const payload = new FormData();

    payload.append("name", formData.name);
    payload.append("description", formData.description);
    payload.append("category", formData.category);
    payload.append("price", formData.price || 0);
    payload.append("cost", formData.cost || 0);
    payload.append("variants", JSON.stringify(formData.variants));

    imageSlots.forEach((slot) => {
      if (slot?.file) {
        payload.append("images", slot.file);
      }
    });

    await onSubmit?.(payload, isEditMode);
  };

  // render de slots pequeños
  const renderSmallImageSlot = (index) => {
    const slot = imageSlots[index];

    return (
      <div
        key={index}
        className="upload-thumb-box"
        style={{
          position: "relative",
          overflow: "hidden",
          cursor: "pointer",
        }}
        onClick={() => handleClickImageSlot(index)}
      >
        {slot ? (
          <>
            <img
              src={slot.preview}
              alt={`preview-${index}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "12px",
              }}
            />

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleRemoveImage(index);
              }}
              style={{
                position: "absolute",
                top: "6px",
                right: "6px",
                background: "#ffffff",
                border: "none",
                borderRadius: "999px",
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <span style={{ fontSize: "22px", fontWeight: "600" }}>+</span>
        )}

        <input
          ref={(element) => {
            fileInputRefs.current[index] = element;
          }}
          type="file"
          accept="image/*"
          onChange={(event) => handleImageChange(index, event)}
          style={{ display: "none" }}
        />
      </div>
    );
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
            style={{
              width: "min(980px, 94vw)",
              maxHeight: "92vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div className="create-product-header" style={{ flexShrink: 0 }}>
              <h2>{isEditMode ? "Editar producto" : "Crear producto"}</h2>
            </div>

            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                overflowY: "auto",
                overflowX: "hidden",
                padding: "0 20px 20px 20px",
              }}
            >
              <div
                className="create-product-body"
                style={{
                  display: "grid",
                  gridTemplateColumns: "280px 1fr",
                  gap: "20px",
                  alignItems: "start",
                }}
              >
                <div className="create-product-left">
                  <span className="modal-section-label">IMÁGENES DEL PRODUCTO</span>

                  <div
                    className="upload-main-box"
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      cursor: "pointer",
                    }}
                    onClick={() => handleClickImageSlot(0)}
                  >
                    {imageSlots[0] ? (
                      <>
                        <img
                          src={imageSlots[0].preview}
                          alt="preview-principal"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "12px",
                          }}
                        />

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleRemoveImage(0);
                          }}
                          style={{
                            position: "absolute",
                            top: "8px",
                            right: "8px",
                            background: "#ffffff",
                            border: "none",
                            borderRadius: "999px",
                            width: "28px",
                            height: "28px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                          }}
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <ImagePlus size={38} strokeWidth={1.6} />
                        <span>SUBIR</span>
                      </>
                    )}

                    <input
                      ref={(element) => {
                        fileInputRefs.current[0] = element;
                      }}
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleImageChange(0, event)}
                      style={{ display: "none" }}
                    />
                  </div>

                  <div className="upload-gallery-row">
                    {renderSmallImageSlot(1)}
                    {renderSmallImageSlot(2)}
                    {renderSmallImageSlot(3)}
                  </div>
                </div>

                <div
                  className="create-product-right"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                    alignItems: "start",
                  }}
                >
                  <div className="modal-input-group" style={{ gridColumn: "1 / -1" }}>
                    <span className="modal-section-label">NOMBRE DEL PRODUCTO</span>
                    <input
                      type="text"
                      placeholder="Ej: Body manga larga"
                      className="modal-line-input"
                      value={formData.name}
                      onChange={(event) => handleChange("name", event.target.value)}
                    />
                  </div>

                  <div className="modal-input-group">
                    <span className="modal-section-label">CATEGORÍA</span>
                    <input
                      type="text"
                      className="modal-line-input"
                      placeholder="Ej: Ropa"
                      value={formData.category}
                      onChange={(event) => handleChange("category", event.target.value)}
                    />
                  </div>

                  <div className="modal-input-group">
                    <span className="modal-section-label">PRECIO</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      className="modal-line-input"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(event) =>
                        handleDecimalChange("price", event.target.value)
                      }
                      onWheel={preventWheelChange}
                    />
                  </div>

                  <div className="modal-input-group">
                    <span className="modal-section-label">COSTO</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      className="modal-line-input"
                      placeholder="0.00"
                      value={formData.cost}
                      onChange={(event) =>
                        handleDecimalChange("cost", event.target.value)
                      }
                      onWheel={preventWheelChange}
                    />
                  </div>

                  <div className="modal-input-group" style={{ gridColumn: "1 / -1" }}>
                    <span className="modal-section-label">DESCRIPCIÓN</span>
                    <textarea
                      className="modal-description-area"
                      value={formData.description}
                      onChange={(event) => handleChange("description", event.target.value)}
                      style={{ minHeight: "90px", resize: "none" }}
                    />
                  </div>
                </div>
              </div>

              <div className="variant-section" style={{ marginTop: "16px" }}>
                <h3 style={{ marginBottom: "10px" }}>Inventario de variantes</h3>

                {formData.variants.map((variant, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        marginBottom: "8px",
                      }}
                    >
                      <button
                        type="button"
                        className="admin-secondary-btn"
                        onClick={() => handleRemoveVariant(index)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "8px 12px",
                        }}
                      >
                        <Trash2 size={16} />
                        Eliminar variante
                      </button>
                    </div>

                    <div
                      style={{
                        overflowX: "auto",
                        overflowY: "hidden",
                        width: "100%",
                      }}
                    >
                      <div
                        className="variant-table"
                        style={{
                          width: "920px",
                          minWidth: "920px",
                        }}
                      >
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
                          <input
                            value={variant.size}
                            onChange={(event) =>
                              handleVariantChange(index, "size", event.target.value)
                            }
                          />
                          <input
                            value={variant.color}
                            onChange={(event) =>
                              handleVariantChange(index, "color", event.target.value)
                            }
                          />
                          <input
                            value={variant.design}
                            onChange={(event) =>
                              handleVariantChange(index, "design", event.target.value)
                            }
                          />
                          <input
                            value={variant.embroidery}
                            onChange={(event) =>
                              handleVariantChange(index, "embroidery", event.target.value)
                            }
                          />
                          <input
                            value={variant.fabric}
                            onChange={(event) =>
                              handleVariantChange(index, "fabric", event.target.value)
                            }
                          />
                          <input
                            type="text"
                            inputMode="decimal"
                            value={variant.stock}
                            onChange={(event) =>
                              handleVariantChange(index, "stock", event.target.value)
                            }
                            onWheel={preventWheelChange}
                          />
                          <input
                            type="text"
                            inputMode="decimal"
                            value={variant.retail}
                            onChange={(event) =>
                              handleVariantChange(index, "retail", event.target.value)
                            }
                            onWheel={preventWheelChange}
                          />
                          <input
                            type="text"
                            inputMode="decimal"
                            value={variant.wholesale}
                            onChange={(event) =>
                              handleVariantChange(index, "wholesale", event.target.value)
                            }
                            onWheel={preventWheelChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    marginTop: "12px",
                    paddingTop: "10px",
                    borderTop: "1px solid rgba(0,0,0,0.08)",
                  }}
                >
                  <button
                    type="button"
                    className="admin-secondary-btn"
                    onClick={handleAddVariant}
                  >
                    + Agregar variante
                  </button>

                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      type="button"
                      className="admin-secondary-btn"
                      onClick={onClose}
                      disabled={loading}
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      className="admin-primary-btn"
                      disabled={loading}
                    >
                      {loading
                        ? "Guardando..."
                        : isEditMode
                        ? "Actualizar producto"
                        : "Guardar producto"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default CreateProductModal;