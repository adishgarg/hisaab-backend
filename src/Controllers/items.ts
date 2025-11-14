import {prisma} from "../lib/prisma.js"
import type { Response } from "express";
import type { Request } from "express";

const createItem = async (req: Request, res:Response)=>{
    try{
        const item = await Item.create(req.body);
        res.status(201).json(item);
    }catch(error){
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({error: errorMessage});
    }
}

const getAllItems = async (req: Request, res:Response)=>{
    try{
        const items = await Item.find();
        res.status(200).json(items);
    }catch(error){
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({error: errorMessage});
    }
}

const getItemById = async (req: Request, res:Response)=>{
    try{
        const item = await Item.findById(req.params.id);
        if(!item){
            return res.status(404).json({error: "Item not found"});
        }
        res.status(200).json(item);
    }catch(error){
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({error: errorMessage});
    }
}

const updateItem = async (req: Request, res:Response)=>{
    try{
        const item = await Item.findByIdAndUpdate(req.params.id, req.body, {new: true});
        if(!item){
            return res.status(404).json({error: "Item not found"});
        }
        res.status(200).json(item);
    }catch(error){
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({error: errorMessage});
    }
}

const deleteItem = async (req: Request, res:Response)=>{
    try{
        const item = await Item.findByIdAndDelete(req.params.id);
        if(!item){
            return res.status(404).json({error: "Item not found"});
        }
        res.status(200).json({message: "Item deleted successfully"});
    }catch(error){
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({error: errorMessage});
    }
}

export default{
    createItem,
    getAllItems,
    getItemById,
    updateItem,
    deleteItem
};