import { Router } from "express";
import companyController from "../Controllers/company.js";

const router = Router();

router.post("/create", companyController.createCompany);

export default router;