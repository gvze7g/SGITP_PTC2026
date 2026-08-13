import { Search, X } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import CustomDropdown from "../ui/CustomDropdown";

const ORIGIN_OPTIONS = [
  { value: "Store", label: "Tienda Física" },
  { value: "Online", label: "En línea" },
  { value: "WhatsApp", label: "WhatsApp" },
  { value: "Instagram", label: "Instagram" },
];

const formatMoney = (value) => `$${Number(value || 0).toFixed(2)}`;

function PointOfSalePanel({
  cartItems = [],
  onIncrementItem,
  onDecrementItem,
  customer,
  customers = [],
  onSelectCustomer,
  origin,
  onOriginChange,
  shippingData,
  onShippingDataChange,
  phone,
  onPhoneChange,
  total = 0,
  confirming = false,
  onConfirmSale,
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const isWholesale = customer?.customer_type === "Wholesale";

  const searchResults = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return [];
    return customers
      .filter((item) => item.full_name?.toLowerCase().includes(term))
      .slice(0, 6);
  }, [customers, searchTerm]);

  const handlePhoneChange = (value) => {
    const phoneRegex = /^[0-9+\-\s]*$/;
    if (!phoneRegex.test(value)) return;
    onPhoneChange?.(value);
  };

  const handleSelectCustomer = (nextCustomer) => {
    onSelectCustomer?.(nextCustomer);
    setSearchOpen(false);
    setSearchTerm("");
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
            {isWholesale ? "MAYORISTA" : "MINORISTA"}
          </button>
        </div>

        <div className="pos-client-content">
          <div>
            <h3>{customer?.full_name || "Cliente mostrador"}</h3>
            <p>{customer?.email || "Venta sin cliente registrado"}</p>
          </div>

          {customer ? (
            <button
              type="button"
              className="pos-search-btn"
              aria-label="Quitar cliente"
              onClick={() => handleSelectCustomer(null)}
            >
              <X size={18} strokeWidth={1.8} />
            </button>
          ) : (
            <button
              type="button"
              className="pos-search-btn"
              aria-label="Buscar cliente"
              onClick={() => setSearchOpen((prev) => !prev)}
            >
              <Search size={18} strokeWidth={1.8} />
            </button>
          )}
        </div>

        {searchOpen ? (
          <div className="pos-client-search">
            <input
              type="text"
              className="pos-input-field pos-editable-field"
              placeholder="Buscar cliente por nombre..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              autoFocus
            />

            {searchResults.length > 0 ? (
              <div className="pos-client-results">
                {searchResults.map((result) => (
                  <button
                    type="button"
                    key={result._id}
                    className="pos-client-result-item"
                    onClick={() => handleSelectCustomer(result)}
                  >
                    <strong>{result.full_name}</strong>
                    <span>{result.customer_type === "Wholesale" ? "Mayorista" : "Minorista"}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="pos-field-block">
        <CustomDropdown
          label="ORIGEN"
          value={origin}
          options={ORIGIN_OPTIONS}
          onChange={onOriginChange}
        />
      </div>

      <div className="pos-field-block">
        <span className="pos-field-label">DATOS DE ENVÍO</span>
        <textarea
          className="pos-textarea-field pos-editable-field"
          placeholder="Ej. Colonia Escalón, pasaje 4, casa 12. Referencia: portón negro."
          value={shippingData}
          onChange={(event) => onShippingDataChange?.(event.target.value)}
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

        {cartItems.length === 0 ? (
          <p style={{ opacity: 0.7, marginTop: "10px" }}>
            Agrega productos del catálogo para iniciar una venta.
          </p>
        ) : (
          cartItems.map((item) => (
            <motion.div
              key={item.key}
              className="pos-order-item"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <img src={item.image} alt={item.name} className="pos-order-image" />

              <div className="pos-order-info">
                <div className="pos-order-top">
                  <div>
                    <h4>{item.name}</h4>
                    <p>
                      {[item.size && `Talla: ${item.size}`, item.color && `Color: ${item.color}`]
                        .filter(Boolean)
                        .join(", ") || "Variante única"}
                    </p>
                  </div>

                  <span className="pos-order-price">
                    {formatMoney(item.unitPrice * item.quantity)}
                  </span>
                </div>

                <div className="pos-order-qty">
                  <button type="button" onClick={() => onDecrementItem?.(item.key)}>
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => onIncrementItem?.(item.key)}>
                    +
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="pos-total-section">
        <div className="pos-total-row">
          <span>Total:</span>
          <strong>{formatMoney(total)}</strong>
        </div>

        <button
          type="button"
          className="pos-confirm-btn"
          disabled={confirming || cartItems.length === 0}
          onClick={onConfirmSale}
        >
          {confirming ? "Confirmando..." : "Confirmar venta"} <span>→</span>
        </button>
      </div>
    </motion.aside>
  );
}

export default PointOfSalePanel;
