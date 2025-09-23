import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import Company from "../Models/company.js";
import validator from "validator";

const companySignup = async (req: Request, res: Response) => {
    try{
        const {name, address, phone, email, GST, password} = req.body;
        if (!name || !address || !phone || !email || !GST || !password) {
            return res.status(400).json({ 
                error: "All fields are required: name, address, phone, email, GST, password" 
            });
        }
        if (!validator.isEmail(email)) { // email regex using validator
            return res.status(400).json({ 
                error: "Please provide a valid email address" 
            });
        }
        const existingCompany = await Company.findOne({ 
            $or: [{ email }, { phone }, { GST }] 
        });
        
        if (existingCompany) {
            return res.status(409).json({ 
                error: "Company with this email, phone, or GST already exists" 
            });
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const company = await Company.create({
            name,
            address,
            phone,
            email,
            GST,
            password: hashedPassword,
            employees: []
        })
        const token = jwt.sign(
            { 
                id: company._id, 
                email: company.email, 
                userType: "company" 
            },
            process.env.JWT_SECRET || "secret key here",
            { expiresIn: "4d" }
        );

        const companyResponse = company.toObject();
        const { password: companyPassword, ...userWithoutPassword } = companyResponse;

        res.status(201).json({
            message: "Company registered successfully",
            token,
            user: userWithoutPassword,
            userType: "company"
        });

    }catch(error){
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: errorMessage });
    }
}

export default {
    companySignup
}