import mongoose, {Schema, model} from "mongoose"

const favoriteSchema = new Schema ({
    customer_id: {
            type: mongoose.Types.ObjectId,
            ref: "Customer"
        },
    product_id: {
        type: mongoose.Types.ObjectId,
        ref: "Products"
    },

},
{
    timestamps: true,
    strict: false
})

export default model ("Favorite", favoriteSchema);