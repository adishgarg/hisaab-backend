import "dotenv/config";
import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma.js";
import { seedPermissions } from "./seed.js";

// Import routes
import companyRouter from "./Routes/company.js";
import employeeRouter from "./Routes/employee.js";
import loginRouter from "./Routes/login.js";
import signupRouter from "./Routes/signup.js";
import rolesRouter from "./Routes/roles.js";
import invoiceRouter from "./Routes/invoices.js";
import entityRouter from "./Routes/entities.js";
import unitsRouter from "./Routes/unit.js";
import itemsRouter from "./Routes/items.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Test database connection and seed permissions
async function initializeDatabase() {
  try {
    await prisma.$connect();
    console.log("✅ Database Connected!");
    await seedPermissions();
  } catch (error) {
    console.error("❌ Database Connection Failed:", error);
    process.exit(1);
  }
}

// Routes
app.use("/company", companyRouter);
app.use("/employee", employeeRouter);
app.use("/auth/login", loginRouter);
app.use("/auth/signup", signupRouter);
app.use("/roles", rolesRouter);
app.use("/permissions", rolesRouter);
app.use("/units", unitsRouter);
app.use("/invoices", invoiceRouter);
app.use("/entities", entityRouter);
app.use("/items", itemsRouter);

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
});