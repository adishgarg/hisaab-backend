import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import validator from "validator";

const companySignup = async (req: Request, res: Response) => {
    try {
        const { name, address, phone, email, GST, password } = req.body;
        
        if (!name || !address || !phone || !email || !GST || !password) {
            return res.status(400).json({ 
                error: "All fields are required: name, address, phone, email, GST, password" 
            });
        }
        
        if (!validator.isEmail(email)) {
            return res.status(400).json({ 
                error: "Please provide a valid email address" 
            });
        }
        
        // Check for existing company using Prisma syntax
        const existingCompany = await prisma.company.findFirst({ 
            where: {
                OR: [
                    { email: email },
                    { phone: phone },
                    { gst: GST }  // Note: using 'gst' (lowercase) as defined in schema
                ]
            }
        });
        
        if (existingCompany) {
            return res.status(409).json({ 
                error: "Company with this email, phone, or GST already exists" 
            });
        }
        
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create company using Prisma syntax
        const company = await prisma.company.create({
            data: {
                name,
                address,
                phone,
                email,
                gst: GST,  // Map GST to gst field
                password: hashedPassword
            }
        });
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                id: company.id,  // Use 'id' instead of '_id'
                email: company.email, 
                userType: "company" 
            },
            process.env.JWT_SECRET || "secret key here",
            { expiresIn: "4d" }
        );

        // Remove password from response (Prisma objects are plain objects)
        const { password: companyPassword, ...userWithoutPassword } = company;

        res.status(201).json({
            message: "Company registered successfully",
            token,
            user: userWithoutPassword,
            userType: "company"
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: errorMessage });
    }
};

export default {
    companySignup
};