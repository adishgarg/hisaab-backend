import { Router } from "express";
import * as unitController from "../Controllers/units.js";
import auth from "../middleware/auth.js";

const router = Router();

router.post("/create", auth.authMiddleware, auth.requirePermission("CREATE_UNITS"),unitController.createUnit);
router.get("/all", auth.authMiddleware, auth.requirePermission("VIEW_UNITS"), unitController.getAllUnits);
router.get("/:id", auth.authMiddleware, auth.requirePermission("VIEW_UNITS"), unitController.getUnitById);
router.put("/:id", auth.authMiddleware, auth.requirePermission("EDIT_UNITS"), unitController.updateUnit);
router.delete("/:id", auth.authMiddleware, auth.requirePermission("DELETE_UNITS"), unitController.deleteUnit);

export default router;