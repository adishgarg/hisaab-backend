import mongoose from "mongoose";
const unitSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        abbreviation: {
            type: String,
            required: true,
            unique: true
        },}
)

const Unit = mongoose.model("Unit", unitSchema);  
export default Unit;