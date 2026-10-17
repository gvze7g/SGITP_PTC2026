import mongoose, {Schema, model} from "mongoose"

const cartSchema = new Schema({
    customerId:{
        type: mongoose.Types.ObjectId,
        ref: "Customer"
    },
    products: [
        {
            productId: {
                type: mongoose.Types.ObjectId,
                ref: "Products"
            },
            // Variante elegida (talla + color): el stock se lleva por variante
            size: {type: String},
            color: {type: String},
            quantity: {type: Number},
            unitPrice: {type: Number},
            subtotal: {type: Number}
        }
    ],
    total: {type: Number},
    status: {type: String}
},
{
    timestamps: true,
    strict: false
})

// El carrito activo de un cliente se busca en casi cada petición de la tienda.
cartSchema.index({ customerId: 1, status: 1 });

export default model ("cart", cartSchema)