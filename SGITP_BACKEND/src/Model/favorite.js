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

favoriteSchema.index({ customer_id: 1, product_id: 1 });

export default model ("Favorite", favoriteSchema);