import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { websocketService } from "../services/websocket.js";

interface AuthRequest extends Request {
  user?: {
    id: string;
    type: "company" | "employee";
    companyId?: string;
  };
}

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const { page = "1", limit = "20", unreadOnly = "false" } = req.query;
    const userId = req.user?.id;
    const userType = req.user?.type;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const whereClause: any = {};
    
    if (userType === "employee") {
      whereClause.employeeId = userId;
    } else {
      whereClause.companyId = userId;
    }

    if (unreadOnly === "true") {
      whereClause.isRead = false;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.notification.count({ where: whereClause }),
    ]);

    res.json({
      notifications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userType = req.user?.type;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const whereClause: any = { isRead: false };
    
    if (userType === "employee") {
      whereClause.employeeId = userId;
    } else {
      whereClause.companyId = userId;
    }

    const count = await prisma.notification.count({ where: whereClause });

    res.json({ unreadCount: count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    // Verify ownership
    if (notification.employeeId !== userId && notification.companyId !== userId) {
      return res.status(403).json({ error: "Unauthorized access to notification" });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.json({ notification: updated });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userType = req.user?.type;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const whereClause: any = {};
    
    if (userType === "employee") {
      whereClause.employeeId = userId;
    } else {
      whereClause.companyId = userId;
    }

    await prisma.notification.updateMany({
      where: whereClause,
      data: { isRead: true },
    });

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    // Verify ownership
    if (notification.employeeId !== userId && notification.companyId !== userId) {
      return res.status(403).json({ error: "Unauthorized access to notification" });
    }

    await prisma.notification.delete({
      where: { id },
    });

    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Failed to delete notification" });
  }
};

export const createNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { title, message, type, priority, companyId, employeeId, metadata } = req.body;

    const notification = await websocketService.createAndSendNotification({
      title,
      message,
      type,
      priority: priority || "NORMAL",
      companyId,
      employeeId,
      metadata,
    });

    res.status(201).json({ notification });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ error: "Failed to create notification" });
  }
};
