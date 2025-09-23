import { Router } from "express";
import loginController from "../Controllers/login.js";

const router = Router();

router.post("/company", loginController.companyLogin);
router.post("/employee", loginController.employeeLogin);

export default router;