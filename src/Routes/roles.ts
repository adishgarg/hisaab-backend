import { Router } from "express";
import rolesController from "../Controllers/roles.js";
import auth from "../middleware/auth.js";

const router = Router();

router.use(auth.authMiddleware);


router.get("/permissions", auth.requirePermission("VIEW_ROLES"), rolesController.getAllPermissions);
router.get("/", auth.requirePermission("VIEW_ROLES"), rolesController.getCompanyRoles);
router.post("/", auth.requirePermission("MANAGE_ROLES"), rolesController.createRole);
router.put("/:roleId", auth.requirePermission("MANAGE_ROLES"), rolesController.updateRole);
router.delete("/:roleId", auth.requirePermission("MANAGE_ROLES"), rolesController.deleteRole);

export default router;