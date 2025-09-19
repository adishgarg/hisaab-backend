import Company from "../Models/company.js";
import type { Response } from "express";
import type { Request } from "express";

const createCompany = async (req: Request, res:Response)=>{
    try{
        const company = await Company.create(req.body);
        res.status(201).json(company);
    }catch(error){
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({error: errorMessage});
    }
}

export default{
    createCompany
}