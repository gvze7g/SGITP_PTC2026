import mongoose from "mongoose"
import {Schema, model} from "mongoose"


const salesSchema = new Schema({
     sales_date: {type: Date},
     employee_id: {
                 type: mongoose.Types.ObjectId,
                 ref: "Employee"
             },
    cart_id: {
                type: mongoose.Types.ObjectId,
                ref: "cart"
            },
    origin: {type: String},
    applied_price_type: {type: String},
    payment_method: {type: String},
    payment_status: {type: String},
    shipping_address: {type: String},
    shipping_phone: {type: String},
    shipping_method: {type: String},
    shipping_cost: {type: Number},
    coupon_code: {type: String},
    discount_percentage: {type: Number},
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

// "Mis pedidos" busca por carrito; el historial y los más vendidos, por estado y fecha.
salesSchema.index({ cart_id: 1 });
salesSchema.index({ payment_status: 1, createdAt: -1 });

export default model ("sales", salesSchema);
   

