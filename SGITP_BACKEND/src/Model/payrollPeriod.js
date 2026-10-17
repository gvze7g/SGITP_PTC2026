import mongoose, { Schema, model } from "mongoose";

// Estado de cada mes de nómina. Al cerrar un mes se guarda un resumen de lo
// pagado y ese mes ya no se puede modificar; el siguiente queda abierto.
const payrollPeriodSchema = new Schema(
  {
    month: { type: String, required: true, unique: true }, // "AAAA-MM"
    period: { type: String, required: true }, // "Octubre de 2026"
    status: { type: String, enum: ["Abierto", "Cerrado"], default: "Abierto" },
    closed_at: { type: Date, default: null },
    closed_by: { type: mongoose.Types.ObjectId, ref: "Employee", default: null },
    summary: {
      employees: { type: Number, default: 0 },
      base_total: { type: Number, default: 0 },
      bonuses_total: { type: Number, default: 0 },
      deductions_total: { type: Number, default: 0 },
      net_total: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default model("PayrollPeriod", payrollPeriodSchema);
