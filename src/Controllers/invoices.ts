import {prisma} from "../lib/prisma.js"
import type { Response } from "express";
import type { Request } from "express";
import { websocketService } from "../services/websocket.js";

const createInvoice = async (req: Request, res: Response) => {
    try {
        const { invoiceNumber, date, customerId, items } = req.body;
        const companyId = req.user?.id;

        // Validation
        if (!invoiceNumber || !date || !customerId || !companyId) {
            return res.status(400).json({ 
                error: "Invoice number, date, customer, and company are required" 
            });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ 
                error: "Invoice must have at least one item" 
            });
        }

        // Check if invoice number already exists
        const existingInvoice = await prisma.invoice.findUnique({
            where: { invoiceNumber }
        });
        if (existingInvoice) {
            return res.status(409).json({ 
                error: "Invoice number already exists" 
            });
        }

        // Verify customer exists
        const customer = await prisma.entity.findFirst({
            where: { 
                id: customerId,
                companyId 
            }
        });
        if (!customer) {
            return res.status(400).json({ 
                error: "Customer not found or doesn't belong to your company" 
            });
        }

        // Validate and calculate total for items
        let totalAmount = 0;
        const validatedItems: { itemId: string; quantity: number; price: number }[] = [];

        for (const item of items) {
            const { itemId, quantity, price } = item;
            
            if (!itemId || !quantity || quantity <= 0 || !price || price <= 0) {
                return res.status(400).json({ 
                    error: "Each item must have valid itemId, quantity (> 0), and price (> 0)" 
                });
            }

            // Verify item exists and belongs to company
            const itemExists = await prisma.item.findFirst({
                where: { 
                    id: itemId,
                    companyId 
                }
            });
            if (!itemExists) {
                return res.status(400).json({ 
                    error: `Item with ID ${itemId} not found or doesn't belong to your company` 
                });
            }

            const itemTotal = quantity * price;
            totalAmount += itemTotal;
            
            validatedItems.push({
                itemId,
                quantity,
                price
            });
        }

        // Create invoice with items in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create the invoice
            const invoice = await tx.invoice.create({
                data: {
                    invoiceNumber,
                    date: new Date(date),
                    totalAmount,
                    customerId,
                    companyId
                }
            });

            // Create invoice items
            const invoiceItems = await tx.invoiceItem.createMany({
                data: validatedItems.map(item => ({
                    ...item,
                    invoiceId: invoice.id
                }))
            });

            // Return invoice with related data
            return await tx.invoice.findUnique({
                where: { id: invoice.id },
                include: {
                    entity: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                            address: true
                        }
                    },
                    customer: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    items: {
                        include: {
                            item: {
                                select: {
                                    id: true,
                                    name: true,
                                    sku: true,
                                    unit: {
                                        select: {
                                            name: true,
                                            abbreviation: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
        });

        // Send notification
        await websocketService.createAndSendNotification({
            title: "New Invoice Created",
            message: `Invoice ${invoiceNumber} has been created for ${customer.name}`,
            type: "INVOICE_CREATED",
            priority: "NORMAL",
            companyId,
            metadata: {
                invoiceId: result?.id,
                invoiceNumber,
                totalAmount,
                customerName: customer.name,
            },
        });

        res.status(201).json({
            message: "Invoice created successfully",
            invoice: result
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: errorMessage });
    }
} 

const getAllInvoices = async (req: Request, res: Response) => {
    try {
        const companyId = req.user?.id;

        if (!companyId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const invoices = await prisma.invoice.findMany({
            where: { companyId },
            include: {
                entity: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                customer: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                items: {
                    include: {
                        item: {
                            select: {
                                name: true,
                                sku: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json({ invoices });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: errorMessage });
    }
} 

const getInvoiceById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const companyId = req.user?.id;

        if (!id) {
            return res.status(400).json({ error: "Invoice ID is required" });
        }

        if (!companyId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const invoice = await prisma.invoice.findFirst({
            where: {
                id,
                companyId
            },
            include: {
                entity: true,
                customer: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                items: {
                    include: {
                        item: {
                            include: {
                                unit: true
                            }
                        }
                    }
                }
            }
        });

        if (!invoice) {
            return res.status(404).json({ error: "Invoice not found" });
        }

        res.status(200).json(invoice);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: errorMessage });
    }
} 

const updateInvoice = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const companyId = req.user?.id;

        if (!id) {
            return res.status(400).json({ error: "Invoice ID is required" });
        }

        if (!companyId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Check if invoice exists and belongs to company
        const existingInvoice = await prisma.invoice.findFirst({
            where: {
                id,
                companyId
            }
        });

        if (!existingInvoice) {
            return res.status(404).json({ error: "Invoice not found" });
        }

        const invoice = await prisma.invoice.update({
            where: { invoiceNumber: existingInvoice.invoiceNumber },
            data: {
                ...req.body,
                updatedAt: new Date()
            },
            include: {
                entity: true,
                customer: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                items: {
                    include: {
                        item: true
                    }
                }
            }
        });

        res.status(200).json(invoice);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: errorMessage });
    }
} 

const deleteInvoice = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const companyId = req.user?.id;

        if (!id) {
            return res.status(400).json({ error: "Invoice ID is required" });
        }

        if (!companyId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Check if invoice exists and belongs to company
        const existingInvoice = await prisma.invoice.findFirst({
            where: {
                id,
                companyId
            }
        });

        if (!existingInvoice) {
            return res.status(404).json({ error: "Invoice not found" });
        }

        // Delete invoice (this will cascade delete invoice items)
        await prisma.invoice.delete({
            where: { invoiceNumber: existingInvoice.invoiceNumber }
        });

        res.status(200).json({ message: "Invoice deleted successfully" });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: errorMessage });
    }
}
export default{
    createInvoice,
    getAllInvoices,
    getInvoiceById,
    updateInvoice,
    deleteInvoice
};