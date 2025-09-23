import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ["ACCOUNTS", "LEDGER", "STOCK", "REPORTS"]
    }
}, {
    timestamps: true
});

const Permission = mongoose.model("Permission", permissionSchema);

export const FIXED_PERMISSIONS = [
    // COMPANY
    { name: "VIEW_COMPANIES", description: "View company information", category: "COMPANY" },
    { name: "EDIT_COMPANIES", description: "Edit company details", category: "COMPANY" },
    { name: "DELETE_COMPANIES", description: "Delete companies", category: "COMPANY" },

    // EMPLOYEES
    { name: "VIEW_EMPLOYEES", description: "View employee details", category: "EMPLOYEES" },
    { name: "MANAGE_EMPLOYEES", description: "Add/Edit/Delete employees", category: "EMPLOYEES" },
    { name: "ASSIGN_ROLES", description: "Assign roles to employees", category: "EMPLOYEES" },

    // ROLES & PERMISSIONS
    { name: "VIEW_ROLES", description: "View roles and permissions", category: "ROLES" },
    { name: "MANAGE_ROLES", description: "Create, edit, and delete roles", category: "ROLES" },

    // ACCOUNTS
    { name: "VIEW_ACCOUNTS", description: "View accounting data", category: "ACCOUNTS" },
    { name: "CREATE_ACCOUNTS", description: "Create new accounts", category: "ACCOUNTS" },
    { name: "EDIT_ACCOUNTS", description: "Edit existing accounts", category: "ACCOUNTS" },
    { name: "DELETE_ACCOUNTS", description: "Delete accounts", category: "ACCOUNTS" },
    
    // LEDGER
    { name: "VIEW_LEDGER", description: "View ledger entries", category: "LEDGER" },
    { name: "CREATE_LEDGER_ENTRY", description: "Create ledger entries", category: "LEDGER" },
    { name: "EDIT_LEDGER_ENTRY", description: "Edit ledger entries", category: "LEDGER" },
    { name: "DELETE_LEDGER_ENTRY", description: "Delete ledger entries", category: "LEDGER" },
    
    // STOCK
    { name: "VIEW_STOCK", description: "View inventory/stock", category: "STOCK" },
    { name: "MANAGE_STOCK", description: "Add/Edit stock items", category: "STOCK" },
    { name: "STOCK_ADJUSTMENT", description: "Make stock adjustments", category: "STOCK" },
    { name: "DELETE_STOCK", description: "Delete stock items", category: "STOCK" },
    
    // REPORTS
    { name: "VIEW_REPORTS", description: "View all reports", category: "REPORTS" },
    { name: "EXPORT_REPORTS", description: "Export reports to PDF/Excel", category: "REPORTS" },
    { name: "ADVANCED_REPORTS", description: "Access advanced reporting features", category: "REPORTS" }
];

export default Permission;