import Entity from "../Models/entities.js";
import type { Response } from "express";
import type { Request } from "express";

const createEntity = async (req: Request, res:Response)=>{
    try{
        const entity = await Entity.create(req.body);
        res.status(201).json(entity);
    }catch(error){
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({error: errorMessage});
    }
}

const getAllEntities = async (req: Request, res:Response)=>{
    try{
        const entities = await Entity.find();
        res.status(200).json(entities);
    }catch(error){
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({error: errorMessage});
    }
}

const getEntityById = async (req: Request, res:Response)=>{
    try{
        const entity = await Entity.findById(req.params.id);
        if(!entity){
            return res.status(404).json({error: "Entity not found"});
        }
        res.status(200).json(entity);
    }catch(error){
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({error: errorMessage});
    }
}

const updateEntity = async (req: Request, res:Response)=>{
    try{
        const entity = await Entity.findByIdAndUpdate(req.params.id, req.body, {new: true});
        if(!entity){
            return res.status(404).json({error: "Entity not found"});
        }
        res.status(200).json(entity);
    }catch(error){
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({error: errorMessage});
    }
}

const deleteEntity = async (req: Request, res:Response)=>{
    try{
        const entity = await Entity.findByIdAndDelete(req.params.id);
        if(!entity){
            return res.status(404).json({error: "Entity not found"});
        }
        res.status(200).json({message: "Entity deleted successfully"});
    }catch(error){
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({error: errorMessage});
    }
}

export default{
    createEntity,
    getAllEntities,
    getEntityById,
    updateEntity,
    deleteEntity
}