import {prisma} from "../lib/prisma.js"
import type { Response } from "express";
import type { Request } from "express";
import bcrypt from "bcrypt";

const createCompany = async (req: Request, res:Response)=>{
    try{
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        req.body.password = hashedPassword;
        const company = await prisma.comany.create({
            data: req.body,
            password: hashedPassword,
            gst: req.body.GST,
        });
        res.status(201).json(company);
    }catch(error){
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({error: errorMessage});
    }
}

const getAllCompanies = async (req: Request, res:Response)=>{
    try{
        const companies = await prisma.company.findMany({
            include:{
                employees:{
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        res.status(200).json(companies);
    }catch(error){
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({error: errorMessage});
    }
}

const getCompanyById = async (req: Request, res:Response)=>{
    try{
      const company = await prisma.company.findUnique({
      where: { id: req.params.id },
      include: {
        employees: true,
        roles: true,
      },
    });
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
        const company = await prisma.company.update({
            where: {id: req.params.id},
            data: req.body,
        })
        res.status(200).json(company);
    }catch(error){
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({error: errorMessage});
    }
}

const deleteCompany = async (req: Request, res:Response)=>{
    try{
        const company = await prisma.company.delete({
      where: { id: req.params.id },
    });
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