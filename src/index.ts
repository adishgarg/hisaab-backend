import "dotenv/config"
import express from "express";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
// -----------------------------------------------------
import companyRouter from "./Routes/company.js"
import employeeRouter from "./Routes/employee.js";
import loginRouter from "./Routes/login.js"
import signupRouter from "./Routes/signup.js"
import rolesRouter from "./Routes/roles.js"

const db = mongoose.connect(process.env.MONGODB_URI as string)
.then(()=>{
  console.log("Database Connected!");
})
.catch((error)=>{
  console.error("Database Connection Failed:", error);
});

const app = express();
app.use(cors())
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.use("/company", companyRouter);
app.use("/employee", employeeRouter);
app.use("/auth/login", loginRouter);
app.use("/auth/signup", signupRouter);
app.use("/roles", rolesRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});