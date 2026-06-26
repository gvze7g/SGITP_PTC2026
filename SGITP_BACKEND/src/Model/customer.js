import { Schema, model } from "mongoose";

const customerSchema = new Schema({
    customer_type: { type: String},
    full_name: {type: String},
    main_phone: {type: String},
    email: {type: String},
    password: {type: String},
    addresses: [{
        label: {type: String},
        street_and_number: {type: String},
        city: {type: String},
        reference: {type: String},
        isPrimary: {type: Boolean}
    }],
    phone_numbers: [{
        number: {type: String},
        isPrimary: {type: Boolean}
    }],
    isVerified: {type: Boolean},
    loginAttempts: {type: Number},
    timeOut: {type: Date},

},
{
    timestamps: true,
    strict: false
})

export default model ("Customer", customerSchema);