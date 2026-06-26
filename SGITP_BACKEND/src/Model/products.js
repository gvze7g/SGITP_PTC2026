import {Schema, model} from "mongoose"

const productSchema = new Schema({
     name: {type: String},
     description: {type: String},
     category: {type: String},
     images: [{
        image: {type: String},
        public_id: {type: String}
     }],
     variants: [{
        size: {type: String},
        color: {type: String},
        design: {type: String},
        fabric: {type: String},
        stock: {type: String}
    }],
    price: {type: Number},
    cost: {type: Number},
},
{
    timestamps: true,
    strict: false
})

export default model ("Products", productSchema);
