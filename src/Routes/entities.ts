import { Router } from "express";
import entityController from "../Controllers/entities.js";
import auth from "../middleware/auth.js";

const router = Router();

router.post("/create", auth.authMiddleware, auth.requirePermission("CREATE_ENTITIES"), entityController.createEntity);

router.get("/all", auth.authMiddleware, auth.requirePermission("VIEW_ENTITIES"), entityController.getAllEntities);
router.get("/:id", auth.authMiddleware, auth.requirePermission("VIEW_ENTITIES"), entityController.getEntityById);
router.put("/:id", auth.authMiddleware, auth.requirePermission("EDIT_ENTITIES"), entityController.updateEntity);
router.delete("/:id", auth.authMiddleware, auth.requirePermission("DELETE_ENTITIES"), entityController.deleteEntity);

export default router;