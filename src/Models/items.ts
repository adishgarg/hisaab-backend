import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        sku: {
            type: String,
            required: true,
            unique: true
        },
        description: {
            type: String
        },
        unitId: {  
            type: mongoose.Schema.Types.ObjectId,
            ref: "Unit",
            required: true
        },
        companyId: {  
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true
        },
        quantity: {
            type: Number,
            default: 0
        },
    }, {
        timestamps: true
    }
)

const Item = mongoose.model("Item", itemSchema);  
export default Item;