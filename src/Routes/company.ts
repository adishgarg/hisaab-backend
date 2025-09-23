import { Router } from "express";
import companyController from "../Controllers/company.js";

const router = Router();

router.post("/create", companyController.createCompany);
router.get("/all", companyController.getAllCompanies);
router.get("/:id", companyController.getCompanyById);
router.put("/:id", companyController.updateCompany);
router.delete("/:id", companyController.deleteCompany);

export default router;