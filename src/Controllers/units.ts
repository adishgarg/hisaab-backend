import { prisma } from "../lib/prisma.js";
import type { Request, Response } from "express";

const createUnit = async (req: Request, res: Response) => {
    try {
        const { name, abbreviation } = req.body;
        
        if (!name || !abbreviation) {
            return res.status(400).json({ 
                error: "Name and abbreviation are required" 
            });
        }
        
        const unit = await prisma.unit.create({
            data: {
                name,
                abbreviation
            }
        });
        
        res.status(201).json(unit);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({ error: errorMessage });
    }
};

const getAllUnits = async (req: Request, res: Response) => {
    try {
        const units = await prisma.unit.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.status(200).json(units);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({ error: errorMessage });
    }
};

const getUnitById = async (req: Request, res: Response) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({ error: "Unit ID is required" });
        }
        
        const unit = await prisma.unit.findUnique({
            where: {
                id: req.params.id
            }
        });
        
        if (!unit) {
            return res.status(404).json({ error: "Unit not found" });
        }
        
        res.status(200).json(unit);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({ error: errorMessage });
    }
};

const updateUnit = async (req: Request, res: Response) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({ error: "Unit ID is required" });
        }
        
        const { name, abbreviation } = req.body;
        
        const unit = await prisma.unit.update({
            where: {
                id: req.params.id
            },
            data: {
                ...(name && { name }),
                ...(abbreviation && { abbreviation })
            }
        });
        
        res.status(200).json(unit);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({ error: errorMessage });
    }
};

const deleteUnit = async (req: Request, res: Response) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({ error: "Unit ID is required" });
        }
        
        // Check if unit is being used by any items
        const itemsUsingUnit = await prisma.item.count({
            where: {
                unitId: req.params.id
            }
        });
        
        if (itemsUsingUnit > 0) {
            return res.status(400).json({ 
                error: "Cannot delete unit. It is being used by items." 
            });
        }
        
        await prisma.unit.delete({
            where: {
                id: req.params.id
            }
        });
        
        res.status(200).json({ message: "Unit deleted successfully" });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({ error: errorMessage });
    }
};

export {
    createUnit,
    getAllUnits,
    getUnitById,
    updateUnit,
    deleteUnit
};