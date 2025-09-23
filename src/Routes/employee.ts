import { Router } from "express";
import employeeController from "../Controllers/employee.js";
import auth from "../middleware/auth.js";

const router = Router();

router.use(auth.authMiddleware);

router.post("/create", auth.companyOnly, employeeController.createEmployee);

router.get("/company/:companyId", auth.requirePermission("VIEW_EMPLOYEES"), employeeController.getEmployeesByCompany);
router.get("/:id", auth.requirePermission("VIEW_EMPLOYEES"), employeeController.getEmployeeById);
router.put("/:id", auth.requirePermission("MANAGE_EMPLOYEES"), employeeController.updateEmployee);
router.patch("/:id/role", auth.requirePermission("MANAGE_EMPLOYEE_ROLES"), employeeController.updateEmployeeRole);
router.delete("/:id", auth.requirePermission("MANAGE_EMPLOYEES"), employeeController.deleteEmployee);

export default router;