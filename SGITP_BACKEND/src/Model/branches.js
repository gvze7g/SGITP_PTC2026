import mongoose, {Schema, model} from 'mongoose';


const branchSchema = new Schema({
    name : {
        type : String
    },
    address: {
        type : String
    },
    phone: {
        type: String
    },
    email: {
        type: String
    },
     employee_id:{
        type: mongoose.Types.ObjectId,
        ref: "Employee"
    },
    isActive: {
        type : Boolean  
    },
    opening_date: {
        type: Date
    }

},{
    timestamps : true,
    strict: false
})
export default model("Branches", branchSchema)