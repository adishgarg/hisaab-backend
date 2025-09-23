import mongoose from "mongoose";

const rolesScehma = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true
        },
        permissions:{
            type: Array,
            enums:["Accounts","Ledger","Stock"]
        }
    },
    {
        timestamps: true
    }
)

const Role = mongoose.model("Role", rolesScehma);
export default Role;