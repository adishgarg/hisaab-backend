import Invoice from "../Models/invoice";
import type { Response } from "express";
import type { Request } from "express";

const createInvoice = async (req: Request, res:Response)=>{
    try{
        const invoice = await Invoice.create(req.body);
        res.status(201).json(invoice);
    }catch(error){
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({error: errorMessage});
    }
} 

const getAllInvoices = async (req: Request, res:Response)=>{
    try{
        const invoices = await Invoice.find();
        res.status(200).json(invoices);
    }catch(error){
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({error: errorMessage});
    }
} 

const getInvoiceById = async (req: Request, res:Response)=>{
    try{
        const invoice = await Invoice.findById(req.params.id);
        if(!invoice){
            return res.status(404).json({error: "Invoice not found"});
        }
        res.status(200).json(invoice);
    }catch(error){
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({error: errorMessage});
    }
} 

const updateInvoice = async (req: Request, res:Response)=>{
    try{
        const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {new: true});
        if(!invoice){
            return res.status(404).json({error: "Invoice not found"});
        }
        res.status(200).json(invoice);
    }catch(error){
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({error: errorMessage});
    }
} 

const deleteInvoice = async (req: Request, res:Response)=>{
    try{
        const invoice = await Invoice.findByIdAndDelete(req.params.id);
        if(!invoice){
            return res.status(404).json({error: "Invoice not found"});
        }
        res.status(200).json({message: "Invoice deleted successfully"});
    }catch(error){
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({error: errorMessage});
    }
}
export default{
    createInvoice,
    getAllInvoices,
    getInvoiceById,
    updateInvoice,
    deleteInvoice
};