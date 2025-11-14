import type { Request, Response } from "express";
import {prisma} from "../lib/prisma.js"

const getAllPermissions = async (req: Request, res: Response) => {
    try {
        const permissions = await prisma.permission.findMany({
            orderBy: [
                { category: 'asc' },
                { name: 'asc' }
            ]
        });
        
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
        
        console.log('Creating role with permissionIds:', permissionIds); // Debug log
        
        if (!companyId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        
        if (!name || !description) {
            return res.status(400).json({ error: "Name and description are required" });
        }

        // Filter and validate permissionIds
        let validatedPermissionIds: string[] = [];
        if (permissionIds && Array.isArray(permissionIds) && permissionIds.length > 0) {
            // Filter out null/undefined/empty values
            validatedPermissionIds = permissionIds.filter((id: any) => id && typeof id === 'string');
            
            if (validatedPermissionIds.length > 0) {
                const validPermissions = await prisma.permission.findMany({
                    where: {
                        id: {
                            in: validatedPermissionIds
                        }
                    }
                });
                if (validPermissions.length !== validatedPermissionIds.length) {
                    return res.status(400).json({ error: "Some permission IDs are invalid" });
                }
            }
        }

        const role = await prisma.role.create({
            data: {
                name,
                description,
                companyId
            },
            include: {
                permissions: {
                    include: {
                        permission: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                category: true
                            }
                        }
                    }
                }
            }
        });

        // Add permissions if provided
        if (validatedPermissionIds.length > 0) {
            await prisma.rolePermission.createMany({
                data: validatedPermissionIds.map((permissionId: string) => ({
                    roleId: role.id,
                    permissionId
                }))
            });
        }

        // Fetch the role with permissions
        const roleWithPermissions = await prisma.role.findUnique({
            where: { id: role.id },
            include: {
                permissions: {
                    include: {
                        permission: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                category: true
                            }
                        }
                    }
                }
            }
        });
            
        res.status(201).json({ 
            message: "Role created successfully", 
            role: roleWithPermissions 
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

        if (!companyId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!roleId) {
            return res.status(400).json({ error: "Role ID is required" });
        }

        // Filter and validate permissionIds
        let validatedPermissionIds: string[] = [];
        if (permissionIds !== undefined) {
            if (Array.isArray(permissionIds) && permissionIds.length > 0) {
                // Filter out null/undefined/empty values
                validatedPermissionIds = permissionIds.filter((id: any) => id && typeof id === 'string');
                
                if (validatedPermissionIds.length > 0) {
                    const validPermissions = await prisma.permission.findMany({
                        where: {
                            id: {
                                in: validatedPermissionIds
                            }
                        }
                    });
                    if (validPermissions.length !== validatedPermissionIds.length) {
                        return res.status(400).json({ error: "Some permission IDs are invalid" });
                    }
                }
            }
        }

        // First verify role exists and belongs to company
        const existingRole = await prisma.role.findFirst({
            where: {
                id: roleId,
                companyId
            }
        });

        if (!existingRole) {
            return res.status(404).json({ error: "Role not found" });
        }

        // Update role with transaction to handle permissions
        const role = await prisma.$transaction(async (tx) => {
            // Update basic role info
            const updatedRole = await tx.role.update({
                where: { id: roleId },
                data: {
                    ...(name && { name }),
                    ...(description && { description })
                }
            });

            // Update permissions if provided
            if (permissionIds !== undefined) {
                // Delete existing role permissions
                await tx.rolePermission.deleteMany({
                    where: { roleId }
                });

                // Create new role permissions
                if (validatedPermissionIds.length > 0) {
                    await tx.rolePermission.createMany({
                        data: validatedPermissionIds.map((permissionId: string) => ({
                            roleId,
                            permissionId
                        }))
                    });
                }
            }

            // Return role with permissions
            return await tx.role.findUnique({
                where: { id: roleId },
                include: {
                    permissions: {
                        include: {
                            permission: {
                                select: {
                                    id: true,
                                    name: true,
                                    description: true,
                                    category: true
                                }
                            }
                        }
                    }
                }
            });
        });

        res.json({ message: "Role updated successfully", role });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: errorMessage });
    }
};

const getCompanyRoles = async (req: Request, res: Response) => {
    try {
        const companyId = req.user?.id;
        
        if (!companyId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        
        const roles = await prisma.role.findMany({
            where: { companyId },
            include: {
                permissions: {
                    include: {
                        permission: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                category: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
            
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

        if (!companyId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!roleId) {
            return res.status(400).json({ error: "Role ID is required" });
        }

        // Check if role exists and belongs to company
        const existingRole = await prisma.role.findFirst({
            where: {
                id: roleId,
                companyId
            }
        });
        
        if (!existingRole) {
            return res.status(404).json({ error: "Role not found" });
        }

        // Check if role is being used by employees
        const employeesUsingRole = await prisma.employee.count({
            where: {
                roleId: roleId
            }
        });

        if (employeesUsingRole > 0) {
            return res.status(400).json({ 
                error: "Cannot delete role. It is assigned to employees." 
            });
        }

        await prisma.role.delete({
            where: {
                id: roleId
            }
        });

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