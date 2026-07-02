//crud 

import mongoose, {Schema, model} from "mongoose"

const PosSchema = new Schema({
    customerId:{
        type: mongoose.Types.ObjectId,
        ref: "Customers"
    },
    employee_id: {
        type: mongoose.Types.ObjectId,
        ref: "Employee"
    },
    origin: {type: String},
    shippingData: {type: String},
    phone: {type: String},
    sales_id: {
        type: mongoose.Types.ObjectId,
        ref: "sales"
    },

},
{
    timestamps: true,
    strict: false
})

export default model ("pointSales", PosSchema)