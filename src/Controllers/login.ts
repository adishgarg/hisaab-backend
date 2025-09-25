import bcrypt from "bcrypt";
import Employee from "../Models/employee.js";
import Company from "../Models/company.js";
import type { Request, Response } from "express";   
import jwt from "jsonwebtoken";

const companyLogin = async (req: Request, res: Response) => {
    try{
        const {email, password} = req.body;
        if (!email || !password){
            return res.status(400).json({
                error: "Email and password are required"
            });
        }

        const company = await Company.findOne({email});
        if(!company){
            return res.status(401).json({
                error: "Invalid Credentials"
            })
        }
        const isValidPassword = await bcrypt.compare(password, company.password)
        if (!isValidPassword){
            return res.status(401).json({
                error: "Invalid Credentials"
            })
        }
        const token = jwt.sign(
            {
                id: company._id,
                email: company.email,
                userType: "company"
            },
            process.env.JWT_SECRET || "secret key here",
            {expiresIn: "4d"}
        )
        const companyResponse = company.toObject();
        const { password: companyPassword, ...userWithoutPassword } = companyResponse;

        res.json({
            message: "Company login successful",
            token,
            user: userWithoutPassword,
            userType: "company"
        });

    } catch(error){
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: errorMessage });
    }
}

const employeeLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ 
                error: "Email and password are required" 
            });
        }

        // Find employee by email
        const employee = await Employee.findOne({ email });
        if (!employee) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Compare password
        const isValidPassword = await bcrypt.compare(password, employee.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: employee._id, 
                email: employee.email, 
                userType: "employee" 
            },
            process.env.JWT_SECRET || "secret key here",
            { expiresIn: "4d" }
        );

        // Remove password from response
        const employeeResponse = employee.toObject();
        const {password: employeePassword, ...employeeWithOutPassword} = employeeResponse;

        res.json({
            message: "Employee login successful",
            token,
            user: employeeWithOutPassword,
            userType: "employee"
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: errorMessage });
    }
};


export default {
    companyLogin, 
    employeeLogin
};