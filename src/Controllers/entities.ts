import {prisma} from "../lib/prisma.js"
import type { Response } from "express";
import type { Request } from "express";
import { EntityType, EntityStatus } from "@prisma/client";

const createEntity = async (req: Request, res: Response) => {
    try {
        const { name, type, email, phone, address, gstNumber, panNumber, contactPerson, creditLimit, paymentTerms, notes } = req.body;
        const companyId = req.user?.id;

        if (!name || !type || !companyId) {
            return res.status(400).json({ 
                error: "Name, type, and company are required" 
            });
        }

        // Validate entity type
        if (!Object.values(EntityType).includes(type)) {
            return res.status(400).json({ 
                error: "Invalid entity type. Must be CUSTOMER or BUSINESS" 
            });
        }

        // Check if entity with same name already exists for this company
        const existingEntity = await prisma.entity.findFirst({
            where: {
                name,
                companyId
            }
        });

        if (existingEntity) {
            return res.status(409).json({ 
                error: "Entity with this name already exists for your company" 
            });
        }

        const entity = await prisma.entity.create({
            data: {
                name,
                type,
                email: email || null,
                phone: phone || null,
                address: address || null,
                gstNumber: gstNumber || null,
                panNumber: panNumber || null,
                contactPerson: contactPerson || null,
                creditLimit: creditLimit || 0,
                paymentTerms: paymentTerms || null,
                notes: notes || null,
                status: EntityStatus.ACTIVE,
                companyId
            },
            include: {
                company: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        res.status(201).json({
            message: "Entity created successfully",
            entity
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: errorMessage });
    }
}

const getAllEntities = async (req: Request, res: Response) => {
    try {
        const companyId = req.user?.id;

        if (!companyId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { type, status } = req.query;
        
        const where: any = { companyId };
        
        if (type && Object.values(EntityType).includes(type as EntityType)) {
            where.type = type;
        }
        
        if (status && Object.values(EntityStatus).includes(status as EntityStatus)) {
            where.status = status;
        }

        const entities = await prisma.entity.findMany({
            where,
            include: {
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

        res.status(200).json({ entities });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: errorMessage });
    }
}

const getEntityById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const companyId = req.user?.id;

        if (!id) {
            return res.status(400).json({ error: "Entity ID is required" });
        }

        if (!companyId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const entity = await prisma.entity.findFirst({
            where: {
                id,
                companyId
            },
            include: {
                company: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                invoices: {
                    select: {
                        id: true,
                        invoiceNumber: true,
                        date: true,
                        totalAmount: true
                    },
                    orderBy: {
                        date: 'desc'
                    },
                    take: 5 // Last 5 invoices
                }
            }
        });

        if (!entity) {
            return res.status(404).json({ error: "Entity not found" });
        }

        res.status(200).json(entity);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: errorMessage });
    }
}

const updateEntity = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const companyId = req.user?.id;

        if (!id) {
            return res.status(400).json({ error: "Entity ID is required" });
        }

        if (!companyId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Check if entity exists and belongs to company
        const existingEntity = await prisma.entity.findFirst({
            where: {
                id,
                companyId
            }
        });

        if (!existingEntity) {
            return res.status(404).json({ error: "Entity not found" });
        }

        // Validate entity type if provided
        if (req.body.type && !Object.values(EntityType).includes(req.body.type)) {
            return res.status(400).json({ 
                error: "Invalid entity type. Must be CUSTOMER or BUSINESS" 
            });
        }

        // Validate entity status if provided
        if (req.body.status && !Object.values(EntityStatus).includes(req.body.status)) {
            return res.status(400).json({ 
                error: "Invalid entity status. Must be ACTIVE or INACTIVE" 
            });
        }

        // Check if name is being changed and if it conflicts
        if (req.body.name && req.body.name !== existingEntity.name) {
            const nameConflict = await prisma.entity.findFirst({
                where: {
                    name: req.body.name,
                    companyId,
                    id: { not: id }
                }
            });

            if (nameConflict) {
                return res.status(409).json({ 
                    error: "Entity with this name already exists for your company" 
                });
            }
        }

        const entity = await prisma.entity.update({
            where: { id },
            data: {
                ...req.body,
                updatedAt: new Date()
            },
            include: {
                company: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        res.status(200).json({
            message: "Entity updated successfully",
            entity
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: errorMessage });
    }
}

const deleteEntity = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const companyId = req.user?.id;

        if (!id) {
            return res.status(400).json({ error: "Entity ID is required" });
        }

        if (!companyId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Check if entity exists and belongs to company
        const existingEntity = await prisma.entity.findFirst({
            where: {
                id,
                companyId
            }
        });

        if (!existingEntity) {
            return res.status(404).json({ error: "Entity not found" });
        }

        // Check if entity has associated invoices
        const invoiceCount = await prisma.invoice.count({
            where: { customerId: id }
        });

        if (invoiceCount > 0) {
            return res.status(400).json({ 
                error: `Cannot delete entity. It has ${invoiceCount} associated invoice(s). Please delete all invoices first or set entity status to INACTIVE.` 
            });
        }

        await prisma.entity.delete({
            where: { id }
        });

        res.status(200).json({ message: "Entity deleted successfully" });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: errorMessage });
    }
}

export default {
    createEntity,
    getAllEntities,
    getEntityById,
    updateEntity,
    deleteEntity
}