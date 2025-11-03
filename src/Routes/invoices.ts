import { Router } from "express";
import invoiceController from "../Controllers/invoices.js";
import auth from "../middleware/auth.js";

const router = Router();

router.post("/create", auth.authMiddleware, auth.requirePermission("CREATE_INVOICES"), invoiceController.createInvoice);

router.get("/all", auth.authMiddleware, auth.requirePermission("VIEW_INVOICES"), invoiceController.getAllInvoices);
router.get("/:id", auth.authMiddleware, auth.requirePermission("VIEW_INVOICES"), invoiceController.getInvoiceById);
router.put("/:id", auth.authMiddleware, auth.requirePermission("EDIT_INVOICES"), invoiceController.updateInvoice);
router.delete("/:id", auth.authMiddleware, auth.requirePermission("DELETE_INVOICES"), invoiceController.deleteInvoice);

export default router;