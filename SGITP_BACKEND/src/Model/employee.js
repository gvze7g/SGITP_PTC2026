import mongoose, {Schema, model} from "mongoose"

const EmployeeSchema = new Schema({
    full_name: {type: String},
    main_phone: {type: String},
    email: {type: String},
    branch_id: {
            type: mongoose.Types.ObjectId,
            ref: "Branches"
        },
    password: {type: String},
    addresses: [{
        label: {type: String},
        address_line: {type: String},
        city: {type: String},
        isPrimary: {type: Boolean}
    }],
    phone_numbers: [{
        number: {type: String},
        type: {type: String},
        isPrimary: {type: Boolean}
    }],
    birth_date: {type: Date},
    hire_date: {type: Date},
    role: {type: String},
    isVerified: {type: Boolean},
    loginAttempts: {type: Number},
    timeOut: {type: Date},
},
{
    timestamps: true,
    strict: false
})

export default model ("Employee", EmployeeSchema);