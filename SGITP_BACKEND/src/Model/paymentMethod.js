import mongoose, { Schema, model } from "mongoose";

// Guarda solo datos "de vitrina" de la tarjeta (marca, últimos 4 dígitos,
// vencimiento y nombre del titular). Nunca se guarda el número completo ni
// el CVC: eso es lo que exigiría cumplir PCI-DSS y este proyecto no procesa
// pagos reales todavía (ver checkoutMyCart, que no cobra nada).
const CARD_BRANDS = ["Visa", "Mastercard", "Otra"];

const paymentMethodSchema = new Schema(
  {
    customer_id: {
      type: mongoose.Types.ObjectId,
      ref: "Customer",
    },
    brand: {
      type: String,
      enum: CARD_BRANDS,
      default: "Otra",
    },
    last4: { type: String },
    expiry_month: { type: String },
    expiry_year: { type: String },
    holder_name: { type: String },
    isPrimary: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    strict: false,
  }
);

export default model("PaymentMethod", paymentMethodSchema);
