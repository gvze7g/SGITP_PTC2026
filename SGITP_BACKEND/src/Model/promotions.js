import {Schema, model} from "mongoose"

const promotionsSchema = new Schema({
     coupon_code: {type: String},
     descriptions: {type: String},
     discount_percentage: {type: Number},
     start_date: {type: Date},
     end_date: {type: Date},
     isActive: {type: Boolean}
},
{
    timestamps: true,
    strict: false
})

export default model ("Promotions", promotionsSchema);
   

