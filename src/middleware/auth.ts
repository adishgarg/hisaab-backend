import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import Company from "../Models/company.js";
import Employee from "../Models/employee.js";
import Role from "../Models/roles.js";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                userType: "company" | "employee";
                permissions?: string[];
            };
        }
    }
}

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const authHeader = req.headers.authorization;
        if (!authHeader){
            return res.status(401).json({error: "Access token is required!"})
        }
        const token = authHeader.split(" ")[1];
        if (!token){
            return res.status(401).json({error: "Access token is Required"})
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret key here") as any;
        
        let userPermissions: string[] = [];

        if (decoded.userType === "employee") {
            const employee = await Employee.findById(decoded.id).populate({
                path: 'roleId',
                populate: {
                    path: 'permissions'
                }
            });

            if (employee && employee.roleId) {
                userPermissions = (employee.roleId as any).permissions.map((p: any) => p.name);
            }
        }

        req.user = {
            id: decoded.id,
            email: decoded.email,
            userType: decoded.userType,
            permissions: userPermissions
        };

        next();
    }catch{
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}

const companyOnly = (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.userType !== "company") {
        return res.status(403).json({ error: "Access denied. Company account required." });
    }
    next();
};

const requirePermission = (permissionName: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.user?.userType === "company") {
            return next();
        }

        if (!req.user?.permissions?.includes(permissionName)) {
            return res.status(403).json({ 
                error: `Access denied. Required permission: ${permissionName}` 
            });
        }

        next();
    };
};

const requireAnyPermission = (permissions: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.user?.userType === "company") {
            return next();
        }

        const hasAny = permissions.some(permission => 
            req.user?.permissions?.includes(permission)
        );

        if (!hasAny) {
            return res.status(403).json({ 
                error: `Access denied. Required at least one of: ${permissions.join(', ')}` 
            });
        }

        next();
    };
};

export { 
    authMiddleware, 
    companyOnly, 
    requirePermission, 
    requireAnyPermission 
};