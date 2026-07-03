import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useState } from "react";
import CustomDropdown from "../ui/CustomDropdown";

const ORIGIN_OPTIONS = [
  { value: "Store", label: "Tienda Física" },
  { value: "Online", label: "En línea" },
  { value: "WhatsApp", label: "WhatsApp" },
  { value: "Instagram", label: "Instagram" },
];

function PointOfSalePanel() {
  const [origin, setOrigin] = useState("Store");
  const [shippingData, setShippingData] = useState("");
  const [phone, setPhone] = useState("");

  const handlePhoneChange = (value) => {
    const phoneRegex = /^[0-9+\-\s]*$/;
    if (!phoneRegex.test(value)) return;
    setPhone(value);
  };

  return (
    <motion.aside
      className="pos-panel"
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="pos-client-card">
        <div className="pos-client-header">
          <span>DETALLES DEL CLIENTE</span>
          <button type="button" className="pos-badge-btn">
            MAYORISTA
          </button>
        </div>

        <div className="pos-client-content">
          <div>
            <h3>Linda Palacios</h3>
            <p>maria.perez@boutique.co</p>
          </div>

          <button
            type="button"
            className="pos-search-btn"
            aria-label="Buscar cliente"
            onClick={() => toast("Búsqueda de clientes disponible próximamente.")}
          >
            <Search size={18} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      <div className="pos-field-block">
        <CustomDropdown
          label="ORIGEN"
          value={origin}
          options={ORIGIN_OPTIONS}
          onChange={setOrigin}
        />
      </div>

      <div className="pos-field-block">
        <span className="pos-field-label">DATOS DE ENVÍO</span>
        <textarea
          className="pos-textarea-field pos-editable-field"
          placeholder="Ej. Colonia Escalón, pasaje 4, casa 12. Referencia: portón negro."
          value={shippingData}
          onChange={(event) => setShippingData(event.target.value)}
          rows={4}
        />
      </div>

      <div className="pos-field-block">
        <span className="pos-field-label">TELÉFONO</span>
        <input
          type="text"
          className="pos-input-field pos-editable-field"
          placeholder="+503 7000-0000"
          value={phone}
          onChange={(event) => handlePhoneChange(event.target.value)}
        />
      </div>

      <div className="pos-order-section">
        <span className="pos-field-label">ORDEN ACTUAL</span>

        <motion.div
          className="pos-order-item"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.25 }}
        >
          <img
            src="https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=300&q=80"
            alt="Producto"
            className="pos-order-image"
          />

          <div className="pos-order-info">
            <div className="pos-order-top">
              <div>
                <h4>Mono de algodón orgánico</h4>
                <p>Talla: 6M, Color: Beige</p>
              </div>

              <span className="pos-order-price">$45.00</span>
            </div>

            <div className="pos-order-qty">
              <button type="button">−</button>
              <span>1</span>
              <button type="button">+</button>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="pos-total-section">
        <div className="pos-total-row">
          <span>Total:</span>
          <strong>$48.60</strong>
        </div>

        <button
          type="button"
          className="pos-confirm-btn"
          onClick={() => toast.success("Venta confirmada correctamente.")}
        >
          Confirmar venta <span>→</span>
        </button>
      </div>
    </motion.aside>
  );
}

export default PointOfSalePanel;