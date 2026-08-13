import mongoose, { Schema, model } from "mongoose";

const PAYROLL_STATUSES = ["Pendiente", "Pagado"];

const payrollSchema = new Schema(
  {
    employee_id: {
      type: mongoose.Types.ObjectId,
      ref: "Employee",
    },
    period: { type: String },
    payment_date: { type: Date, default: null },
    base_salary: { type: Number, default: 0 },
    bonuses: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    net_salary: { type: Number, default: 0 },
    status: {
      type: String,
      enum: PAYROLL_STATUSES,
      default: "Pendiente",
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

export default model("Payroll", payrollSchema);
