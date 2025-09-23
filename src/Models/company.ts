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
            type: Number, 
            required: true,
            unique: true 
        },
        email: { 
            type: String, 
            required: true,
            unique: true 
        },
        GST: { 
            type: String, 
            required: true,
            unique: true 
        },
        employees:{
            type: Array,
        },
        password:{
            type: String,
            required: true
        }
    },{ 
        timestamps: true
    }
)

const Company = mongoose.model("Company", companySchema);
export default Company;