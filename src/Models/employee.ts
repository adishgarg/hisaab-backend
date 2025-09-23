import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        phone: {
            type: String
        },
        companyId: {  
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true
        },
        roleId: {  
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role",
            required: true
        },
        password: {
            type: String,
            required: true
        }
    }, {
        timestamps: true
    }
)

const Employee = mongoose.model("Employee", employeeSchema);  
export default Employee;