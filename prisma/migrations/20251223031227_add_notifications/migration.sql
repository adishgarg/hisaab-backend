-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INVOICE_CREATED', 'INVOICE_UPDATED', 'INVOICE_DELETED', 'EMPLOYEE_ADDED', 'EMPLOYEE_UPDATED', 'EMPLOYEE_REMOVED', 'ROLE_CHANGED', 'ENTITY_ADDED', 'ENTITY_UPDATED', 'ITEM_LOW_STOCK', 'SYSTEM_ALERT', 'GENERAL');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "companyId" TEXT,
    "employeeId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_companyId_isRead_idx" ON "notifications"("companyId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_employeeId_isRead_idx" ON "notifications"("employeeId", "isRead");
