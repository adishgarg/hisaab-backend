import {prisma} from "../lib/prisma.js"
import type { Response } from "express";
import type { Request } from "express";

const createItem = async (req: Request, res: Response) => {
    try {
        const { name, sku, description, quantity, unitId } = req.body;
        const companyId = req.user?.id;

        if (!name || !sku || !unitId || !companyId) {
            return res.status(400).json({ 
                error: "Name, SKU, unit, and company are required" 
            });
        }

        // Check if unit exists
        const unit = await prisma.unit.findUnique({ where: { id: unitId } });
        if (!unit) {
            return res.status(400).json({ error: "Invalid unit" });
        }

        // Check if SKU already exists for this company
        const existingItem = await prisma.item.findFirst({
            where: { 
                sku,
                companyId 
            }
        });
        if (existingItem) {
            return res.status(409).json({ error: "Item with this SKU already exists" });
        }

        const item = await prisma.item.create({
            data: {
                name,
                sku,
                description: description || null,
                quantity: quantity || 0,
                unitId,
                companyId
            },
            include: {
                unit: true,
                company: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        res.status(201).json(item);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: errorMessage });
    }
}

const getAllItems = async (req: Request, res: Response) => {
    try {
        const companyId = req.user?.id;

        if (!companyId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const items = await prisma.item.findMany({
            where: { companyId },
            include: {
                unit: true,
                company: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json({ items });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: errorMessage });
    }
}

const getItemById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const companyId = req.user?.id;

        if (!id) {
            return res.status(400).json({ error: "Item ID is required" });
        }

        if (!companyId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const item = await prisma.item.findFirst({
            where: {
                id,
                companyId
            },
            include: {
                unit: true,
                company: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        if (!item) {
            return res.status(404).json({ error: "Item not found" });
        }

        res.status(200).json(item);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: errorMessage });
    }
}

const updateItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const companyId = req.user?.id;

        if (!id) {
            return res.status(400).json({ error: "Item ID is required" });
        }

        if (!companyId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Check if item exists and belongs to company
        const existingItem = await prisma.item.findFirst({
            where: {
                id,
                companyId
            }
        });

        if (!existingItem) {
            return res.status(404).json({ error: "Item not found" });
        }

        // If updating SKU, check for duplicates
        if (req.body.sku && req.body.sku !== existingItem.sku) {
            const duplicateItem = await prisma.item.findFirst({
                where: {
                    sku: req.body.sku,
                    companyId,
                    id: { not: id }
                }
            });
            if (duplicateItem) {
                return res.status(409).json({ error: "Item with this SKU already exists" });
            }
        }

        // If updating unitId, check if unit exists
        if (req.body.unitId) {
            const unit = await prisma.unit.findUnique({ where: { id: req.body.unitId } });
            if (!unit) {
                return res.status(400).json({ error: "Invalid unit" });
            }
        }

        const item = await prisma.item.update({
            where: { sku: existingItem.sku },
            data: {
                ...req.body,
                updatedAt: new Date()
            },
            include: {
                unit: true,
                company: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        res.status(200).json(item);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: errorMessage });
    }
}

const deleteItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const companyId = req.user?.id;

        if (!id) {
            return res.status(400).json({ error: "Item ID is required" });
        }

        if (!companyId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Check if item exists and belongs to company
        const existingItem = await prisma.item.findFirst({
            where: {
                id,
                companyId
            }
        });

        if (!existingItem) {
            return res.status(404).json({ error: "Item not found" });
        }

        await prisma.item.delete({
            where: { sku: existingItem.sku }
        });

        res.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: errorMessage });
    }
}

export default {
    createItem,
    getAllItems,
    getItemById,
    updateItem,
    deleteItem
};