import Permission, { FIXED_PERMISSIONS } from "../Models/permissions.js";

export const seedPermissions = async () => {
    try {
        const existingPermissions = await Permission.countDocuments();
        
        if (existingPermissions === 0) {
            await Permission.insertMany(FIXED_PERMISSIONS);
            console.log("✅ Fixed permissions seeded successfully");
        } else {
            console.log("📋 Permissions already exist, skipping seed");
        }
    } catch (error) {
        console.error("❌ Error seeding permissions:", error);
    }
};