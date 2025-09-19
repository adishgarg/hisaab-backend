import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
    {
        name: { 
            type: String,
             required: true
        },
        address: { 
            type: String, 
            required: true 
        },
        phone: { 
            type: String, 
            required: true 
        },
        email: { 
            type: String, 
            required: true 
        },
        GST: { 
            type: String, 
            required: true 
        },
        employees:{
            type: mongoose.Types.ObjectId
        },
    },{ 
        timestamps: true
    }
)

const Company = mongoose.model("Company", companySchema);
export default Company;