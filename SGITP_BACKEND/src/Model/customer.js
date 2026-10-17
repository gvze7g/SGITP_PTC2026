import { Schema, model } from "mongoose";

const CUSTOMER_TYPES = ["Client", "Wholesale"];

const customerSchema = new Schema(
  {
    customer_type: {
      type: String,
      enum: CUSTOMER_TYPES,
      default: "Client",
    },
    full_name: { type: String },
    main_phone: { type: String },
    email: { type: String },
    password: { type: String },
    provider: { type: String, enum: ["local", "google"], default: "local" },
    googleId: { type: String },
    profileImage: { type: String },
    addresses: [
      {
        label: { type: String },
        street_and_number: { type: String },
        city: { type: String },
        reference: { type: String },
        isPrimary: { type: Boolean },
      },
    ],
    phone_numbers: [
      {
        number: { type: String },
        isPrimary: { type: Boolean },
      },
    ],
    isVerified: { type: Boolean },
    loginAttempts: { type: Number },
    timeOut: { type: Date },
  },
  {
    timestamps: true,
    strict: false,
  }
);

// Login, registro y recuperación buscan siempre por correo.
customerSchema.index({ email: 1 });

export default model("Customer", customerSchema);