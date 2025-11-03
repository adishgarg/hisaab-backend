import Unit from "../Models/units";
import type { Response } from "express";
import type { Request } from "express";

const createUnit = async (req: Request, res:Response)=>{
    try{
        const unit = await Unit.create(req.body);
        res.status(201).json(unit);
    }catch(error){
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({error: errorMessage});
    }
}

const getAllUnits = async (req: Request, res:Response)=>{
    try{
        const units = await Unit.find();
        res.status(200).json(units);
    }catch(error){
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({error: errorMessage});
    }
}

const getUnitById = async (req: Request, res:Response)=>{
    try{
        const unit = await Unit.findById(req.params.id);
        if(!unit){
            return res.status(404).json({error: "Unit not found"});
        }
        res.status(200).json(unit);
    }catch(error){
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({error: errorMessage});
    }
}

const updateUnit = async (req: Request, res:Response)=>{
    try{
        const unit = await Unit.findByIdAndUpdate(req.params.id, req.body, {new: true});
        if(!unit){
            return res.status(404).json({error: "Unit not found"});
        }
        res.status(200).json(unit);
    }catch(error){
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({error: errorMessage});
    }
}

const deleteUnit = async (req: Request, res:Response)=>{
    try{
        const unit = await Unit.findByIdAndDelete(req.params.id);
        if(!unit){
            return res.status(404).json({error: "Unit not found"});
        }
        res.status(200).json({message: "Unit deleted successfully"});
    }catch(error){
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({error: errorMessage});
    }
}

export {
    createUnit,
    getAllUnits,
    getUnitById,
    updateUnit,
    deleteUnit
};