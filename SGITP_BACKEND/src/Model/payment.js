import mongoose, {Schema, model} from "mongoose"

const paymentSchema = new Schema ({
    employee_id: {
            type: mongoose.Types.ObjectId,
            ref: "Employee"
        },
    period: {type: Date},
    base_salary: {type: Number},
    bonuses: {type: Number},
    retentions: {type: Number},
    total_paid: {type: Number},
    payment_date: {type: Date},
},
{
    timestamps: true,
    strict: false
})

export default model ("Payment", paymentSchema);