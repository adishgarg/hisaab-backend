import items from "../Controllers/items";
import { Router } from "express";
import auth from "../middleware/auth.js";

const router = Router();

router.post("/create", auth.authMiddleware, auth.requirePermission("MANAGE_ITEMS"), items.createItem);

router.get("/all", auth.authMiddleware, auth.requirePermission("VIEW_ITEMS"), items.getAllItems);
router.get("/:id", auth.authMiddleware, auth.requirePermission("VIEW_ITEMS"), items.getItemById);
router.put("/:id",  auth.authMiddleware, auth.requirePermission("MANAGE_ITEMS"), items.updateItem);
router.delete("/:id", auth.authMiddleware, auth.requirePermission("MANAGE_ITEMS"), items.deleteItem);

export default router;