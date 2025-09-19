import mongoose, { mongo } from "mongoose";

const employeeSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            required: true,
        },
        email:{
            type: String,
        },
        phone:{
            type: String
        },
        company:{
            type: mongoose.Types.ObjectId,
            ref: "Company",
        },
        role:{
            type: mongoose.Types.ObjectId,
            ref: "Roles",
        }
    },{
        timestamps: true
    }
)