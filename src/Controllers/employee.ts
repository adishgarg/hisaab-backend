import {prisma} from "../lib/prisma.js"
import type { Response } from "express";
import type { Request } from "express";
import bcrypt from "bcrypt"; 

const createEmployee = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, roleId, password } = req.body;
        const companyId = req.user?.id; 
        if (!name || !email || !roleId || !password) {
            return res.status(400).json({ 
                error: "Name, email, role, and password are required" 
            });
        }

        const role = await Role.findOne({ _id: roleId, companyId });
        if (!role) {
            return res.status(400).json({ 
                error: "Invalid role" 
            });
        }

        const existingEmployee = await Employee.findOne({ email });
        if (existingEmployee) {
            return res.status(409).json({ 
                error: "Employee with this email already exists" 
            });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const employee = await Employee.create({
            name,
            email,
            phone,
            companyId,
            roleId,
            password: hashedPassword
        });

        const populatedEmployee = await Employee.findById(employee._id)
            .populate('companyId', 'name')
            .populate({
                path: 'roleId',
                populate: {
                    path: 'permissions',
                    select: 'name description category'
                }
            })
            .select('-password');

        res.status(201).json({
            message: "Employee created successfully",
            employee: populatedEmployee
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: errorMessage });
    }
}

const getEmployeesByCompany = async (req: Request, res: Response) => {
    try {
        const companyId = req.user?.id; 

        const employees = await Employee.find({ companyId })
            .populate('companyId', 'name')
            .populate({
                path: 'roleId',
                populate: {
                    path: 'permissions',
                    select: 'name description category'
                }
            })
            .select('-password')
            .sort({ createdAt: -1 });

        res.status(200).json({ employees });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: errorMessage });
    }
}

const getEmployeeById = async (req: Request, res: Response) => {
    try {
        const { employeeId } = req.params;
        const companyId = req.user?.id;

        const employee = await Employee.findOne({ _id: employeeId, companyId })
            .populate('companyId', 'name')
            .populate({
                path: 'roleId',
                populate: {
                    path: 'permissions',
                    select: 'name description category'
                }
            })
            .select('-password');

        if (!employee) {
            return res.status(404).json({ error: "Employee not found" });
        }

        res.status(200).json({ employee });
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

        if (roleId) {
            const role = await Role.findOne({ _id: roleId, companyId });
            if (!role) {
                return res.status(400).json({ 
                    error: "Invalid role or role doesn't belong to your company" 
                });
            }
        }

        const employee = await Employee.findOneAndUpdate(
            { _id: employeeId, companyId },
            { 
                ...(name && { name }),
                ...(email && { email }),
                ...(phone && { phone }),
                ...(roleId && { roleId })
            },
            { new: true }
        )
        .populate('companyId', 'name')
        .populate({
            path: 'roleId',
            populate: {
                path: 'permissions',
                select: 'name description category'
            }
        })
        .select('-password');

        if (!employee) {
            return res.status(404).json({ error: "Employee not found" });
        }

        res.status(200).json({
            message: "Employee updated successfully",
            employee
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

        if (!roleId) {
            return res.status(400).json({ error: "Role ID is required" });
        }

        // Validate role belongs to company
        const role = await Role.findOne({ _id: roleId, companyId });
        if (!role) {
            return res.status(400).json({ 
                error: "Invalid role or role doesn't belong to your company" 
            });
        }

        const employee = await Employee.findOneAndUpdate(
            { _id: employeeId, companyId },
            { roleId },
            { new: true }
        )
        .populate('companyId', 'name')
        .populate({
            path: 'roleId',
            populate: {
                path: 'permissions',
                select: 'name description category'
            }
        })
        .select('-password');

        if (!employee) {
            return res.status(404).json({ error: "Employee not found" });
        }

        res.status(200).json({
            message: "Employee role updated successfully",
            employee
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

        const employee = await Employee.findOneAndDelete({ _id: employeeId, companyId });
        
        if (!employee) {
            return res.status(404).json({ error: "Employee not found" });
        }

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