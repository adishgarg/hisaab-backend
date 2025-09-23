import Company from "../Models/company.js";
import type { Response } from "express";
import type { Request } from "express";
import bcrypt from "bcrypt";

const createCompany = async (req: Request, res:Response)=>{
    try{
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        req.body.password = hashedPassword;
        const company = await Company.create(req.body);
        res.status(201).json(company);
    }catch(error){
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({error: errorMessage});
    }
}

const getAllCompanies = async (req: Request, res:Response)=>{
    try{
        const companies = await Company.find();
        res.status(200).json(companies);
    }catch(error){
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({error: errorMessage});
    }
}

const getCompanyById = async (req: Request, res:Response)=>{
    try{
        const company = await Company.findById(req.params.id);
        if(!company){
            return res.status(404).json({error: "Company not found"});
        }
        res.status(200).json(company);
    }catch(error){
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({error: errorMessage});
    }
}

const updateCompany = async (req: Request, res:Response)=>{
    try{
        const company = await Company.findByIdAndUpdate(req.params.id, req.body, {new: true});
        if(!company){
            return res.status(404).json({error: "Company not found"});
        }
        res.status(200).json(company);
    }catch(error){
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({error: errorMessage});
    }
}

const deleteCompany = async (req: Request, res:Response)=>{
    try{
        const company = await Company.findByIdAndDelete(req.params.id);
        if(!company){
            return res.status(404).json({error: "Company not found"});
        }
        res.status(200).json({message: "Company deleted successfully"});
    }catch(error){
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({error: errorMessage});
    }
}

export default{
    createCompany,
    getAllCompanies,
    getCompanyById,
    updateCompany,
    deleteCompany
}