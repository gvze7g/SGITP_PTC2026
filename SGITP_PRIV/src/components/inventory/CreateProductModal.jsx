import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import CustomDropdown from "../ui/CustomDropdown";
import DateField from "../ui/DateField";

const OFFER_ACTIVE_OPTIONS = [
  { value: "yes", label: "Sí" },
  { value: "no", label: "No" },
];

const EMPTY_OFFER = {
  active: false,
  value: "",
  startDate: null,
  endDate: null,
};

const EMPTY_VARIANT = {
  size: "",
  color: "",
  colorHex: "#000000",
  design: "",
  embroidery: "",
  fabric: "",
  stock: "",
};

const EMPTY_FORM = {
  name: "",
  category: "",
  description: "",
  price: "",
  cost: "",
  variants: [{ ...EMPTY_VARIANT }],
  offer: { ...EMPTY_OFFER },
};

function CreateProductModal({
  open,
  onClose,
  onSubmit,
  productData = null,
  loading = false,
}) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [imageSlots, setImageSlots] = useState([null, null, null, null]);
  const fileInputRefs = useRef([]);
  const isEditMode = useMemo(() => Boolean(productData), [productData]);

  const preventWheelChange = (event) => {
    event.target.blur();
  };

  useEffect(() => {
    if (!open) return;

    if (productData) {
      const existingOffer = productData.offers?.[0];

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
                colorHex: variant.colorHex || "#000000",
                design: variant.design || "",
                embroidery: variant.embroidery || "",
                fabric: variant.fabric || "",
                stock: variant.stock || "",
              }))
            : [{ ...EMPTY_VARIANT }],
        offer: existingOffer
          ? {
              active: Boolean(existingOffer.active),
              value: existingOffer.value ?? "",
              startDate: existingOffer.startDate ? new Date(existingOffer.startDate) : null,
              endDate: existingOffer.endDate ? new Date(existingOffer.endDate) : null,
            }
          : { ...EMPTY_OFFER },
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
        offer: { ...EMPTY_OFFER },
      });
      setImageSlots([null, null, null, null]);
    }
  }, [open, productData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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

  const handleOfferChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      offer: {
        ...prev.offer,
        [field]: value,
      },
    }));
  };

  const handleOfferValueChange = (value) => {
    if (value === "") {
      handleOfferChange("value", "");
      return;
    }

    const decimalRegex = /^\d*\.?\d*$/;
    if (!decimalRegex.test(value)) return;
    if (Number(value) < 0 || Number(value) > 100) return;

    handleOfferChange("value", value);
  };

  const handleVariantChange = (index, field, value) => {
    const decimalFields = ["stock"];

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

  const handleAddVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { ...EMPTY_VARIANT }],
    }));
  };

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

  const handleClickImageSlot = (index) => {
    fileInputRefs.current[index]?.click();
  };

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

  const handleRemoveImage = (index) => {
    const updatedSlots = [...imageSlots];
    updatedSlots[index] = null;
    setImageSlots(updatedSlots);
  };

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
      toast.error("El precio mayorista no puede ser menor que 0.");
      return false;
    }

    const invalidVariant = formData.variants.some((variant) => {
      const value = variant.stock;
      return value !== "" && (Number.isNaN(Number(value)) || Number(value) < 0);
    });

    if (invalidVariant) {
      toast.error("Las variantes solo aceptan numeros positivos en el stock.");
      return false;
    }

    const hasAtLeastOneImage = imageSlots.some((slot) => slot !== null);

    if (!hasAtLeastOneImage && !isEditMode) {
      toast.error("Debes subir al menos una imagen.");
      return false;
    }

    if (formData.offer.active) {
      if (formData.offer.value === "" || Number(formData.offer.value) <= 0) {
        toast.error("Ingresa un porcentaje de descuento válido para la oferta.");
        return false;
      }

      if (
        formData.offer.startDate &&
        formData.offer.endDate &&
        formData.offer.startDate > formData.offer.endDate
      ) {
        toast.error("La fecha de inicio de la oferta no puede ser después de la fecha final.");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const payload = new FormData();

    // FormData permite enviar campos del producto junto con las imagenes nuevas.
    payload.append("name", formData.name);
    payload.append("description", formData.description);
    payload.append("category", formData.category);
    payload.append("price", formData.price || 0);
    payload.append("cost", formData.cost || 0);
    payload.append("variants", JSON.stringify(formData.variants));

    const offers =
      formData.offer.active && formData.offer.value !== ""
        ? [
            {
              value: Number(formData.offer.value),
              startDate: formData.offer.startDate,
              endDate: formData.offer.endDate,
              active: true,
            },
          ]
        : [];
    payload.append("offers", JSON.stringify(offers));

    imageSlots.forEach((slot) => {
      if (slot?.file) {
        payload.append("images", slot.file);
      }
    });

    await onSubmit?.(payload, isEditMode);
  };

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
            initial={{ opacity: 0, scale: 0.97, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 18 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{
              width: "min(940px, 94vw)",
              maxHeight: "90vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              borderRadius: "18px",
            }}
          >
            <div
              className="create-product-header"
              style={{
                flexShrink: 0,
                padding: "18px 22px 12px",
              }}
            >
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
                padding: "0 22px 18px",
                gap: "16px",
              }}
            >
              <div
                className="create-product-body"
                style={{
                  display: "grid",
                  gridTemplateColumns: "260px 1fr",
                  gap: "18px",
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
                    gap: "14px",
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
                    <span className="modal-section-label">PRECIO (CLIENTE REGULAR)</span>
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
                    <span className="modal-section-label">COSTO (CLIENTE MAYORISTA)</span>
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
                      style={{ minHeight: "86px", resize: "none" }}
                    />
                  </div>
                </div>
              </div>

              <div className="offer-section" style={{ marginTop: "4px" }}>
                <h3 style={{ marginBottom: "10px" }}>Oferta / Descuento</h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    gap: "14px",
                    alignItems: "start",
                  }}
                >
                  <CustomDropdown
                    label="¿PRODUCTO EN OFERTA?"
                    value={formData.offer.active ? "yes" : "no"}
                    options={OFFER_ACTIVE_OPTIONS}
                    onChange={(value) => handleOfferChange("active", value === "yes")}
                  />

                  <div className="modal-input-group">
                    <span className="modal-section-label">DESCUENTO (%)</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      className="modal-line-input"
                      placeholder="0"
                      value={formData.offer.value}
                      disabled={!formData.offer.active}
                      onChange={(event) => handleOfferValueChange(event.target.value)}
                      onWheel={preventWheelChange}
                    />
                  </div>

                  <DateField
                    label="DESDE (OPCIONAL)"
                    value={formData.offer.startDate}
                    onChange={(date) => handleOfferChange("startDate", date)}
                    disabled={!formData.offer.active}
                  />

                  <DateField
                    label="HASTA (OPCIONAL)"
                    value={formData.offer.endDate}
                    onChange={(date) => handleOfferChange("endDate", date)}
                    minDate={formData.offer.startDate}
                    disabled={!formData.offer.active}
                  />
                </div>
              </div>

              <div className="variant-section" style={{ marginTop: "4px" }}>
                <h3 style={{ marginBottom: "10px" }}>Inventario de variantes</h3>

                {formData.variants.map((variant, index) => (
                  <div key={index} style={{ marginBottom: "14px" }}>
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
                          <span>TONO</span>
                          <span>DISEÑO</span>
                          <span>BORDADO</span>
                          <span>TELA</span>
                          <span>STOCK</span>
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
                            placeholder="Ej: Rosado pastel"
                            onChange={(event) =>
                              handleVariantChange(index, "color", event.target.value)
                            }
                          />
                          <input
                            type="color"
                            className="variant-color-swatch-input"
                            value={variant.colorHex || "#000000"}
                            onChange={(event) =>
                              handleVariantChange(index, "colorHex", event.target.value)
                            }
                            title="Selecciona el tono exacto que se mostrará en la web y la app"
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
                    paddingTop: "12px",
                    borderTop: "1px solid rgba(0,0,0,0.08)",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    className="admin-secondary-btn"
                    onClick={handleAddVariant}
                  >
                    + Agregar variante
                  </button>

                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
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
