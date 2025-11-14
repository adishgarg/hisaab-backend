import { prisma } from "./lib/prisma.js";

const FIXED_PERMISSIONS = [
  // COMPANY
  { name: "VIEW_COMPANIES", description: "View company information", category: "COMPANY" as const },
  { name: "EDIT_COMPANIES", description: "Edit company details", category: "COMPANY" as const },
  { name: "DELETE_COMPANIES", description: "Delete companies", category: "COMPANY" as const },
  
  // EMPLOYEES
  { name: "VIEW_EMPLOYEES", description: "View employee details", category: "EMPLOYEES" as const },
  { name: "MANAGE_EMPLOYEES", description: "Add/Edit/Delete employees", category: "EMPLOYEES" as const },
  
  // ROLES
  { name: "VIEW_ROLES", description: "View roles and permissions", category: "ROLES" as const },
  { name: "MANAGE_ROLES", description: "Create, edit, and delete roles", category: "ROLES" as const },
  
  // ENTITIES
  { name: "VIEW_ENTITIES", description: "View entities", category: "ENTITIES" as const },
  { name: "CREATE_ENTITIES", description: "Create new entities", category: "ENTITIES" as const },
  { name: "EDIT_ENTITIES", description: "Edit existing entities", category: "ENTITIES" as const },
  { name: "DELETE_ENTITIES", description: "Delete entities", category: "ENTITIES" as const },
  
  // ITEMS
  { name: "VIEW_ITEMS", description: "View items", category: "ITEMS" as const },
  { name: "CREATE_ITEMS", description: "Create new items", category: "ITEMS" as const },
  { name: "EDIT_ITEMS", description: "Edit existing items", category: "ITEMS" as const },
  { name: "DELETE_ITEMS", description: "Delete items", category: "ITEMS" as const },
  
  // UNITS
  { name: "VIEW_UNITS", description: "View units", category: "UNITS" as const },
  { name: "CREATE_UNITS", description: "Create new units", category: "UNITS" as const },
  { name: "EDIT_UNITS", description: "Edit existing units", category: "UNITS" as const },
  { name: "DELETE_UNITS", description: "Delete units", category: "UNITS" as const },
  
  // INVOICES
  { name: "VIEW_INVOICES", description: "View invoices", category: "INVOICES" as const },
  { name: "CREATE_INVOICES", description: "Create new invoices", category: "INVOICES" as const },
  { name: "EDIT_INVOICES", description: "Edit existing invoices", category: "INVOICES" as const },
  { name: "DELETE_INVOICES", description: "Delete invoices", category: "INVOICES" as const },
  
  // ACCOUNTS
  { name: "VIEW_ACCOUNTS", description: "View accounts", category: "ACCOUNTS" as const },
  { name: "MANAGE_ACCOUNTS", description: "Manage accounts", category: "ACCOUNTS" as const },
  
  // LEDGER
  { name: "VIEW_LEDGER", description: "View ledger", category: "LEDGER" as const },
  { name: "MANAGE_LEDGER", description: "Manage ledger entries", category: "LEDGER" as const },
  
  // STOCK
  { name: "VIEW_STOCK", description: "View stock information", category: "STOCK" as const },
  { name: "MANAGE_STOCK", description: "Manage stock levels", category: "STOCK" as const },
  
  // REPORTS
  { name: "VIEW_REPORTS", description: "View reports", category: "REPORTS" as const },
  { name: "GENERATE_REPORTS", description: "Generate new reports", category: "REPORTS" as const },
];

export const seedPermissions = async () => {
  try {
    const existingPermissions = await prisma.permission.count();
    
    if (existingPermissions === 0) {
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