import mongoose from "mongoose";

const { Schema, model } = mongoose;

const EMPLOYEE_ROLES = ["Administrator", "Employee"];

const EmployeeSchema = new Schema(
  {
    full_name: { type: String },
    main_phone: { type: String },
    email: { type: String },
    branch_id: {
      type: mongoose.Types.ObjectId,
      ref: "Branches",
    },
    password: { type: String },
    addresses: [
      {
        label: { type: String },
        address_line: { type: String },
        city: { type: String },
        isPrimary: { type: Boolean },
      },
    ],
    phone_numbers: [
      {
        number: { type: String },
        type: { type: String },
        isPrimary: { type: Boolean },
      },
    ],
    birth_date: { type: Date },
    hire_date: { type: Date },
    role: {
      type: String,
      enum: EMPLOYEE_ROLES,
      default: "Employee",
    },
    position: { type: String },
    base_salary: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    loginAttempts: { type: Number, default: 0 },
    timeOut: { type: Date, default: null },
  },
  {
    timestamps: true,
    strict: false,
  }
);

export default model("Employee", EmployeeSchema);