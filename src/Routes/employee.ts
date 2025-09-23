import { Router } from "express";
import employeeController from "../Controllers/employee.js";

const router = Router();

router.post("/create", employeeController.createEmployee);
router.get("/company/:companyId", employeeController.getEmployeeByCompany);
router.get("/all", employeeController.getAllEmployees);
router.get("/:id", employeeController.getEmployeeById);
router.put("/:id", employeeController.updateEmployee);

export default router;