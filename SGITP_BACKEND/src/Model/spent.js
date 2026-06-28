import mongoose, {Schema, model} from "mongoose"

const spentSchema = new Schema({
    description: {type: String},
    amount: {type: Number},
    expense_date: {type: Date},
    expense_type: {type: String},
    payment_method: {type: String},
     branch_id: {
                 type: mongoose.Types.ObjectId,
                 ref: "Branches"
             }
},
{
    timestamps: true,
    strict: false
})

export default model ("Spent", spentSchema)