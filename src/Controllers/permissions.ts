import {prisma} from "../lib/prisma.js"
import { PermissionCategory } from "@prisma/client";

export const seedPermissions = async () => {
    try {
        const existingPermissions = await prisma.permission.count();
        
        if (existingPermissions === 0) {
            const FIXED_PERMISSIONS = [
                // COMPANY
                { name: "VIEW_COMPANIES", description: "View company information", category: PermissionCategory.COMPANY },
                { name: "EDIT_COMPANIES", description: "Edit company details", category: PermissionCategory.COMPANY },
                { name: "DELETE_COMPANIES", description: "Delete companies", category: PermissionCategory.COMPANY },
                
                // EMPLOYEES
                { name: "VIEW_EMPLOYEES", description: "View employee details", category: PermissionCategory.EMPLOYEES },
                { name: "MANAGE_EMPLOYEES", description: "Add/Edit/Delete employees", category: PermissionCategory.EMPLOYEES },
                { name: "MANAGE_EMPLOYEE_ROLES", description: "Update employee roles", category: PermissionCategory.EMPLOYEES },
                
                // ROLES
                { name: "VIEW_ROLES", description: "View roles and permissions", category: PermissionCategory.ROLES },
                { name: "MANAGE_ROLES", description: "Create, edit, and delete roles", category: PermissionCategory.ROLES },
                
                // ENTITIES
                { name: "VIEW_ENTITIES", description: "View entities", category: PermissionCategory.ENTITIES },
                { name: "MANAGE_ENTITIES", description: "Manage entities", category: PermissionCategory.ENTITIES },
                
                // ITEMS
                { name: "VIEW_ITEMS", description: "View items", category: PermissionCategory.ITEMS },
                { name: "MANAGE_ITEMS", description: "Manage items", category: PermissionCategory.ITEMS },
                
                // INVOICES
                { name: "VIEW_INVOICES", description: "View invoices", category: PermissionCategory.INVOICES },
                { name: "CREATE_INVOICES", description: "Create new invoices", category: PermissionCategory.INVOICES },
                { name: "EDIT_INVOICES", description: "Edit existing invoices", category: PermissionCategory.INVOICES },
                { name: "DELETE_INVOICES", description: "Delete invoices", category: PermissionCategory.INVOICES },
                
                // UNITS
                { name: "VIEW_UNITS", description: "View units of measurement", category: PermissionCategory.UNITS },
                { name: "MANAGE_UNITS", description: "Manage units", category: PermissionCategory.UNITS },
                
                // ACCOUNTS
                { name: "VIEW_ACCOUNTS", description: "View accounts", category: PermissionCategory.ACCOUNTS },
                { name: "MANAGE_ACCOUNTS", description: "Manage accounts", category: PermissionCategory.ACCOUNTS },
                
                // LEDGER
                { name: "VIEW_LEDGER", description: "View ledger", category: PermissionCategory.LEDGER },
                { name: "MANAGE_LEDGER", description: "Manage ledger entries", category: PermissionCategory.LEDGER },
                
                // STOCK
                { name: "VIEW_STOCK", description: "View stock information", category: PermissionCategory.STOCK },
                { name: "MANAGE_STOCK", description: "Manage stock levels", category: PermissionCategory.STOCK },
                
                // REPORTS
                { name: "VIEW_REPORTS", description: "View reports", category: PermissionCategory.REPORTS },
                { name: "GENERATE_REPORTS", description: "Generate new reports", category: PermissionCategory.REPORTS },
            ];

            await prisma.permission.createMany({
                data: FIXED_PERMISSIONS,
                skipDuplicates: true,
            });
            console.log("✅ Fixed permissions seeded successfully");
        } else {
            console.log("📋 Permissions already exist, skipping seed");
        }
    } catch (error) {
        console.error("❌ Error seeding permissions:", error);
    }
};