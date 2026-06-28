import {Schema, model} from "mongoose"

const salesSchema = new Schema({
     sales_date: {type: Date},
     employee_id: {
                 type: mongoose.Types.ObjectId,
                 ref: "Employee"
             },
    cart_id: {
                type: mongoose.Types.ObjectId,
                ref: "Shoping_cart"
            },
    origin: {type: String},
    applied_price_type: {type: String},
    payment_method: {type: String},
    payment_status: {type: String},
    shipping_address: {type: String},
    shipping_phone: {type: String},
    item_details: [{
        product_id: {
                type: mongoose.Types.ObjectId,
                ref: "Products"
            },
        name: {type: String},
        selected_variant: {type: String},
        quantity: {type: Number},
        unit_price: {type: Number}
    }]
},
{
    timestamps: true,
    strict: false
})

export default model ("sales", salesSchema);
   

