import type { Request, Response } from "express";
import Role from "../Models/roles.js";
import Permission from "../Models/permissions.js";

const getAllPermissions = async (req: Request, res: Response) => {
    try {
        const permissions = await Permission.find().sort({ category: 1, name: 1 });
        
        const groupedPermissions = permissions.reduce((acc: any, permission: any) => {
            if (!acc[permission.category]) {
                acc[permission.category] = [];
            }
            acc[permission.category].push(permission);
            return acc;
        }, {});
        
        res.json({ permissions: groupedPermissions });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: errorMessage });
    }
};

const createRole = async (req: Request, res: Response) => {
    try {
        const { name, description, permissionIds } = req.body;
        const companyId = req.user?.id;
        
        if (!name || !description) {
            return res.status(400).json({ error: "Name and description are required" });
        }

        if (permissionIds && permissionIds.length > 0) {
            const validPermissions = await Permission.find({ _id: { $in: permissionIds } });
            if (validPermissions.length !== permissionIds.length) {
                return res.status(400).json({ error: "Some permission IDs are invalid" });
            }
        }

        const role = await Role.create({
            name,
            description,
            permissions: permissionIds || [],
            companyId
        });

        const populatedRole = await Role.findById(role._id)
            .populate('permissions', 'name description category');
            
        res.status(201).json({ 
            message: "Role created successfully", 
            role: populatedRole 
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: errorMessage });
    }
};

const updateRole = async (req: Request, res: Response) => {
    try {
        const { roleId } = req.params;
        const { name, description, permissionIds } = req.body;
        const companyId = req.user?.id;

        // Validate permissions if provided
        if (permissionIds && permissionIds.length > 0) {
            const validPermissions = await Permission.find({ _id: { $in: permissionIds } });
            if (validPermissions.length !== permissionIds.length) {
                return res.status(400).json({ error: "Some permission IDs are invalid" });
            }
        }

        const role = await Role.findOneAndUpdate(
            { _id: roleId, companyId },
            { 
                ...(name && { name }),
                ...(description && { description }),
                ...(permissionIds && { permissions: permissionIds })
            },
            { new: true }
        ).populate('permissions', 'name description category');

        if (!role) {
            return res.status(404).json({ error: "Role not found" });
        }

        res.json({ message: "Role updated successfully", role });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: errorMessage });
    }
};

const getCompanyRoles = async (req: Request, res: Response) => {
    try {
        const companyId = req.user?.id;
        const roles = await Role.find({ companyId })
            .populate('permissions', 'name description category')
            .sort({ createdAt: -1 });
            
        res.json({ roles });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: errorMessage });
    }
};

const deleteRole = async (req: Request, res: Response) => {
    try {
        const { roleId } = req.params;
        const companyId = req.user?.id;

        const role = await Role.findOneAndDelete({ _id: roleId, companyId });
        
        if (!role) {
            return res.status(404).json({ error: "Role not found" });
        }

        res.json({ message: "Role deleted successfully" });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: errorMessage });
    }
};

export default {
    getAllPermissions,
    createRole,
    updateRole,
    getCompanyRoles,
    deleteRole
};