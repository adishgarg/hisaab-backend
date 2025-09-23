import mongoose from "mongoose";

const rolesSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        permissions: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Permission"
        }],
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true
        }
    },
    {
        timestamps: true
    }
)

const Role = mongoose.model("Role", rolesSchema);
export default Role;