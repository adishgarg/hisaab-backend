import { Router } from "express";
import companyController from "../Controllers/company.js";
import auth from "../middleware/auth.js";

const router = Router();
// @GetMapping("/create")
router.post("/create", companyController.createCompany);

router.get("/all", auth.authMiddleware, auth.requirePermission("VIEW_COMPANIES"), companyController.getAllCompanies);
router.get("/:id", auth.authMiddleware, auth.requirePermission("VIEW_COMPANIES"), companyController.getCompanyById);
router.put("/:id", auth.authMiddleware, auth.requirePermission("EDIT_COMPANIES"), companyController.updateCompany);
router.delete("/:id", auth.authMiddleware, auth.requirePermission("DELETE_COMPANIES"), companyController.deleteCompany);

export default router;