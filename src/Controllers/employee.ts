import {prisma} from "../lib/prisma.js"
import type { Response } from "express";
import type { Request } from "express";
import bcrypt from "bcrypt";
import { websocketService } from "../services/websocket.js"; 

const createEmployee = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, roleId, password } = req.body;
        const companyId = req.user?.id; 
        if (!name || !email || !roleId || !password) {
            return res.status(400).json({ 
                error: "Name, email, role, and password are required" 
            });
        }

        if (!companyId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const role = await prisma.role.findFirst({ where: {id: roleId, companyId} });
        if (!role) {
            return res.status(400).json({ 
                error: "Invalid role" 
            });
        }

        const existingEmployee = await prisma.employee.findFirst({ where:{email: email} });
        if (existingEmployee) {
            return res.status(409).json({ 
                error: "Employee with this email already exists" 
            });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const employee = await prisma.employee.create({
            data: {
                name,
                email,
                phone,
                companyId,
                roleId,
                password: hashedPassword
            },
            include: {
                company: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: {
                                    select: {
                                        name: true,
                                        description: true,
                                        category: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Remove password from response
        const { password: _, ...employeeWithoutPassword } = employee;

        // Send notification
        await websocketService.createAndSendNotification({
            title: "New Employee Added",
            message: `${name} has been added as a new employee`,
            type: "EMPLOYEE_ADDED",
            priority: "NORMAL",
            companyId,
            metadata: {
                employeeId: employee.id,
                employeeName: name,
                roleName: employee.role.name,
            },
        });

        res.status(201).json({
            message: "Employee created successfully",
            employee: employeeWithoutPassword
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: errorMessage });
    }
}

const getEmployeesByCompany = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;

        if (!companyId) {
            return res.status(400).json({ error: "Company ID is required" });
        }

        const employees = await prisma.employee.findMany({
            where: { companyId },
            include: {
                company: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: {
                                    select: {
                                        name: true,
                                        description: true,
                                        category: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Remove passwords from response
        const employeesResponse = employees.map(({ password, ...employee }) => employee);

        res.status(200).json({ employees: employeesResponse });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: errorMessage });
    }
}

const getEmployeeById = async (req: Request, res: Response) => {
    try {
        const { employeeId } = req.params;
        const companyId = req.user?.id;

        if (!companyId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!employeeId) {
            return res.status(400).json({ error: "Employee ID is required" });
        }

        const employee = await prisma.employee.findFirst({
            where: {
                id: employeeId,
                companyId
            },
            include: {
                company: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: {
                                    select: {
                                        name: true,
                                        description: true,
                                        category: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!employee) {
            return res.status(404).json({ error: "Employee not found" });
        }

        // Remove password from response
        const { password, ...employeeWithoutPassword } = employee;

        res.status(200).json({ employee: employeeWithoutPassword });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: errorMessage });
    }
}

const updateEmployee = async (req: Request, res: Response) => {
    try {
        const { employeeId } = req.params;
        const { name, email, phone, roleId } = req.body;
        const companyId = req.user?.id;

        if (!companyId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!employeeId) {
            return res.status(400).json({ error: "Employee ID is required" });
        }

        if (roleId) {
            const role = await prisma.role.findFirst({
                where: {
                    id: roleId,
                    companyId
                }
            });
            if (!role) {
                return res.status(400).json({ 
                    error: "Invalid role or role doesn't belong to your company" 
                });
            }
        }

        const employee = await prisma.employee.update({
            where: {
                id: employeeId
            },
            data: {
                ...(name && { name }),
                ...(email && { email }),
                ...(phone && { phone }),
                ...(roleId && { roleId })
            },
            include: {
                company: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: {
                                    select: {
                                        name: true,
                                        description: true,
                                        category: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Remove password from response
        const { password, ...employeeWithoutPassword } = employee;

        res.status(200).json({
            message: "Employee updated successfully",
            employee: employeeWithoutPassword
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: errorMessage });
    }
}

const updateEmployeeRole = async (req: Request, res: Response) => {
    try {
        const { employeeId } = req.params;
        const { roleId } = req.body;
        const companyId = req.user?.id;

        if (!companyId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!employeeId) {
            return res.status(400).json({ error: "Employee ID is required" });
        }

        if (!roleId) {
            return res.status(400).json({ error: "Role ID is required" });
        }

        // Validate role belongs to company
        const role = await prisma.role.findFirst({
            where: {
                id: roleId,
                companyId
            }
        });
        if (!role) {
            return res.status(400).json({ 
                error: "Invalid role or role doesn't belong to your company" 
            });
        }

        // First verify employee exists and belongs to company
        const existingEmployee = await prisma.employee.findFirst({
            where: {
                id: employeeId,
                companyId
            }
        });

        if (!existingEmployee) {
            return res.status(404).json({ error: "Employee not found" });
        }

        const employee = await prisma.employee.update({
            where: {
                id: employeeId
            },
            data: {
                roleId
            },
            include: {
                company: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: {
                                    select: {
                                        name: true,
                                        description: true,
                                        category: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Remove password from response
        const { password, ...employeeWithoutPassword } = employee;

        res.status(200).json({
            message: "Employee role updated successfully",
            employee: employeeWithoutPassword
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: errorMessage });
    }
}

const deleteEmployee = async (req: Request, res: Response) => {
    try {
        const { employeeId } = req.params;
        const companyId = req.user?.id;

        if (!companyId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!employeeId) {
            return res.status(400).json({ error: "Employee ID is required" });
        }

        // First check if employee exists and belongs to company
        const existingEmployee = await prisma.employee.findFirst({
            where: {
                id: employeeId,
                companyId
            }
        });
        
        if (!existingEmployee) {
            return res.status(404).json({ error: "Employee not found" });
        }

        await prisma.employee.delete({
            where: {
                id: employeeId
            }
        });

        res.status(200).json({ message: "Employee deleted successfully" });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: errorMessage });
    }
}

export default {
    createEmployee,
    getEmployeesByCompany,
    getEmployeeById,
    updateEmployee,
    updateEmployeeRole,
    deleteEmployee
}