import { Router } from "express";
import auth from "../middleware/auth.js";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
} from "../Controllers/notifications.js";

const router = Router();

// All routes require authentication
router.use(auth.authMiddleware);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.post("/", createNotification);
router.patch("/:id/read", markAsRead);
router.patch("/mark-all-read", markAllAsRead);
router.delete("/:id", deleteNotification);

export default router;
