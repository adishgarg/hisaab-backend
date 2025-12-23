import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

interface AuthSocket extends Socket {
  userId?: string;
  userType?: "company" | "employee";
  companyId?: string;
}

interface NotificationData {
  title: string;
  message: string;
  type: string;
  priority?: string;
  metadata?: any;
}

class WebSocketService {
  private io: SocketIOServer | null = null;
  private connectedUsers: Map<string, Set<string>> = new Map(); // userId -> Set of socket IDs

  initialize(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
      },
    });

    this.io.use(this.authenticateSocket.bind(this));

    this.io.on("connection", (socket: AuthSocket) => {
      console.log(`✅ Client connected: ${socket.id}`);
      this.handleConnection(socket);

      socket.on("disconnect", () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
        this.handleDisconnection(socket);
      });

      // Listen for custom events
      socket.on("mark_notification_read", this.handleMarkAsRead.bind(this, socket));
      socket.on("mark_all_read", this.handleMarkAllAsRead.bind(this, socket));
    });

    console.log("✅ WebSocket Service Initialized");
  }

  private async authenticateSocket(socket: AuthSocket, next: (err?: Error) => void) {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Authentication token required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any;
      
      socket.userId = decoded.id;
      socket.userType = decoded.type || decoded.userType;
      
      // Set companyId - if user is a company, use their own ID, otherwise use their companyId
      if (socket.userType === "company") {
        socket.companyId = decoded.id;
      } else {
        socket.companyId = decoded.companyId;
      }

      console.log(`🔐 WebSocket authenticated: User ${socket.userId}, Type: ${socket.userType}, CompanyId: ${socket.companyId}`);

      next();
    } catch (error) {
      console.error("WebSocket authentication error:", error);
      next(new Error("Invalid authentication token"));
    }
  }

  private handleConnection(socket: AuthSocket) {
    if (!socket.userId) return;

    // Add socket to user's connections
    if (!this.connectedUsers.has(socket.userId)) {
      this.connectedUsers.set(socket.userId, new Set());
    }
    this.connectedUsers.get(socket.userId)?.add(socket.id);

    // Join user-specific room
    socket.join(`user:${socket.userId}`);

    // Join company-specific room if applicable
    if (socket.companyId) {
      socket.join(`company:${socket.companyId}`);
    }

    console.log(`User ${socket.userId} joined rooms`);
  }

  private handleDisconnection(socket: AuthSocket) {
    if (!socket.userId) return;

    const userSockets = this.connectedUsers.get(socket.userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        this.connectedUsers.delete(socket.userId);
      }
    }
  }

  private async handleMarkAsRead(socket: AuthSocket, data: { notificationId: string }) {
    try {
      if (!socket.userId) return;

      await prisma.notification.update({
        where: { id: data.notificationId },
        data: { isRead: true },
      });

      socket.emit("notification_marked_read", { notificationId: data.notificationId });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      socket.emit("error", { message: "Failed to mark notification as read" });
    }
  }

  private async handleMarkAllAsRead(socket: AuthSocket) {
    try {
      if (!socket.userId) return;

      const updateData: any = { isRead: true };
      const whereClause: any = {};

      if (socket.userType === "employee") {
        whereClause.employeeId = socket.userId;
      } else {
        whereClause.companyId = socket.userId;
      }

      await prisma.notification.updateMany({
        where: whereClause,
        data: updateData,
      });

      socket.emit("all_notifications_marked_read");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      socket.emit("error", { message: "Failed to mark all notifications as read" });
    }
  }

  /**
   * Send notification to a specific user
   */
  async sendToUser(userId: string, notification: NotificationData) {
    if (!this.io) return;

    this.io.to(`user:${userId}`).emit("new_notification", notification);
  }

  /**
   * Send notification to all users in a company
   */
  async sendToCompany(companyId: string, notification: NotificationData) {
    if (!this.io) return;

    this.io.to(`company:${companyId}`).emit("new_notification", notification);
  }

  /**
   * Create and send notification
   */
  async createAndSendNotification(data: {
    title: string;
    message: string;
    type: string;
    priority?: string;
    companyId?: string;
    employeeId?: string;
    metadata?: any;
  }) {
    try {
      // Build notification data conditionally
      const notificationData: any = {
        title: data.title,
        message: data.message,
        type: data.type,
        priority: data.priority || "NORMAL",
      };

      if (data.companyId) {
        notificationData.companyId = data.companyId;
      }

      if (data.employeeId) {
        notificationData.employeeId = data.employeeId;
      }

      if (data.metadata) {
        notificationData.metadata = data.metadata;
      }

      // Save notification to database
      const notification = await prisma.notification.create({
        data: notificationData,
      });

      // Send to appropriate recipients
      if (data.employeeId) {
        await this.sendToUser(data.employeeId, notification as any);
      } else if (data.companyId) {
        await this.sendToCompany(data.companyId, notification as any);
      }

      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  getIO(): SocketIOServer | null {
    return this.io;
  }
}

export const websocketService = new WebSocketService();
