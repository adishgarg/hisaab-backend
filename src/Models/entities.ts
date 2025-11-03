import mongoose from "mongoose";

const entitiesSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },}
)

const Entity = mongoose.model("Entity", entitiesSchema);  
export default Entity;