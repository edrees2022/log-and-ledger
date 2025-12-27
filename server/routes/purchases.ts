import { Router } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { 
  insertBillSchema, 
  insertPurchaseOrderSchema, 
  insertPurchaseDebitNoteSchema, 
  insertExpenseSchema,
  document_lines,
  items
} from "@shared/schema";
import { 
  requireAuth, 
  requireRole 
} from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/permissions";
import { 
  serverError, 
  badRequest, 
  notFound 
} from "../utils/sendError";
import { normalize, sanitizeUpdate } from "../utils/sanitize";
import { fromZodError } from "zod-validation-error";
import { getDocumentAllocations } from "../utils/paymentAllocation";
import { createBillJournalEntry } from "../utils/journalEntry";
import { getExchangeRate, getCompanyBaseCurrency } from "../utils/currency";
import { logCreate, logUpdate, logDelete } from "../utils/auditLog";
import { recordStockMovement } from "../utils/inventory";

const router = Router();

// === PURCHASES ===
router.get("/bills", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const bills = await storage.getBillsByCompany(companyId);
    res.json(bills);
  } catch (error: any) {
    console.error("Error fetching bills:", error);
    return serverError(res, "Failed to fetch bills");
  }
});

router.get("/bills/:id", requireAuth, async (req, res) => {
  try {
    const bill = await storage.getBillById(req.params.id);
    if (!bill) return notFound(res, "Bill not found");
    res.json(bill);
  } catch (error: any) {
    console.error("Error fetching bill:", error);
    return serverError(res, "Failed to fetch bill");
  }
});

// Allocation history for a specific bill
router.get("/bills/:id/allocations", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await getDocumentAllocations("bill", id);
    res.json(rows);
  } catch (error: any) {
    console.error("Error fetching bill allocations:", error);
    return serverError(res, "Failed to fetch bill allocations");
  }
});

router.post("/bills", requireAuth, requirePermission('purchases', 'create'), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    const body = normalize(req.body);
    const now = new Date();
    if (!body.bill_number) body.bill_number = `BILL-${Date.now().toString(36).toUpperCase()}`;
    if (!body.date) body.date = now;
    if (!body.due_date) body.due_date = new Date(now.getTime() + 30*24*60*60*1000);
    if (!body.currency) body.currency = 'USD';
    
    // Auto-fetch exchange rate if not provided or default
    if (!body.fx_rate || body.fx_rate === '1') {
      const baseCurrency = await getCompanyBaseCurrency(companyId);
      if (body.currency !== baseCurrency) {
        const rate = await getExchangeRate(companyId, body.currency, baseCurrency, body.date);
        body.fx_rate = rate.toString();
      } else {
        body.fx_rate = '1';
      }
    }

    if (body.subtotal === undefined) body.subtotal = '0';
    if (body.tax_total === undefined) body.tax_total = '0';
    if (body.total === undefined) body.total = '0';
    if (body.paid_amount === undefined) body.paid_amount = '0';
    if (!body.status) body.status = 'draft';

    const validatedData = insertBillSchema.parse({
      ...body,
      company_id: companyId,
      created_by: userId
    });
    const bill = await storage.createBill(validatedData);
    
    // Create document line if project_id is present
    if (body.project_id) {
      await db.insert(document_lines).values({
        document_type: 'bill',
        document_id: bill.id,
        description: bill.notes || 'Bill Expense',
        quantity: '1',
        unit_price: bill.subtotal,
        line_total: bill.subtotal,
        line_number: 1,
        project_id: body.project_id
      });
    }
    
    // Create automatic journal entry for bill
    try {
      await createBillJournalEntry(
        companyId,
        bill.id,
        bill.supplier_id,
        bill.bill_number,
        parseFloat(bill.subtotal || '0'),
        parseFloat(bill.tax_total || '0'),
        parseFloat(bill.total || '0'),
        bill.date,
        userId,
        bill.currency,
        parseFloat(bill.fx_rate || '1'),
        body.project_id
      );
    } catch (journalError) {
      console.error("Failed to create journal entry for bill:", journalError);
      // Don't fail the bill creation if journal entry fails
    }

    // Record stock movements for product items (increase inventory on purchase)
    if (body.lines && Array.isArray(body.lines)) {
      for (const line of body.lines) {
        if (line.item_id && line.warehouse_id) {
          try {
            // Get item to check if it's a product (not service)
            const [item] = await db.select().from(items).where(eq(items.id, line.item_id));
            if (item && (item.type === 'product' || item.type === 'inventory')) {
              await recordStockMovement({
                company_id: companyId,
                item_id: line.item_id,
                warehouse_id: line.warehouse_id,
                transaction_type: 'purchase',
                transaction_date: new Date(bill.date),
                quantity: Math.abs(parseFloat(line.quantity || '0')), // Positive for purchases (increases stock)
                unit_cost: parseFloat(line.unit_price || '0'),
                reference_type: 'bill',
                reference_id: bill.id,
                notes: `Purchase - Bill ${bill.bill_number}`,
                created_by: userId
              });
            }
          } catch (stockError) {
            console.error("Failed to record stock movement for line:", stockError);
            // Don't fail bill creation if stock recording fails
          }
        }
      }
    }

    await logCreate({
      companyId,
      entityType: 'bill',
      entityId: bill.id,
      createdData: { bill_number: bill.bill_number, supplier_id: bill.supplier_id, total: bill.total, currency: bill.currency },
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(201).json(bill);
  } catch (error: any) {
    if (error.name === "ZodError") {
      const validationError = fromZodError(error);
      return badRequest(res, validationError.message);
    } else {
      console.error("Error creating bill:", error);
      return serverError(res, "Failed to create bill");
    }
  }
});

router.delete("/bills/:id", requireAuth, requireRole(['owner','admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    const bill = await storage.getBillById(id);
    
    const deleted = await storage.deleteBill(companyId, id);
    if (!deleted) {
      return notFound(res, "Bill not found");
    }

    await logDelete({
      companyId,
      entityType: 'bill',
      entityId: id,
      deletedData: { bill_number: bill?.bill_number, supplier_id: bill?.supplier_id, total: bill?.total },
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting bill:", error);
    return serverError(res, "Failed to delete bill");
  }
});

router.get("/orders", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const orders = await storage.getPurchaseOrdersByCompany(companyId);
    res.json(orders);
  } catch (error: any) {
    console.error("Error fetching purchase orders:", error);
    return serverError(res, "Failed to fetch purchase orders");
  }
});

router.post("/orders", requireAuth, requirePermission('purchases', 'create'), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    const body = normalize(req.body);
    const now = new Date();
    if (!body.po_number) body.po_number = `PO-${Date.now().toString(36).toUpperCase()}`;
    if (!body.date) body.date = now;
    if (!body.currency) body.currency = 'USD';
    if (!body.fx_rate) body.fx_rate = '1';
    if (body.subtotal === undefined) body.subtotal = '0';
    if (body.tax_total === undefined) body.tax_total = '0';
    if (body.total === undefined) body.total = '0';

    // Validate payload
    const validatedData = insertPurchaseOrderSchema.parse({
      ...body,
      company_id: companyId,
      created_by: userId,
    });
    const order = await storage.createPurchaseOrder(validatedData);

    // Insert document lines if provided
    if (body.lines && Array.isArray(body.lines)) {
      const linesToInsert = body.lines.map((line: any, index: number) => ({
        document_type: 'purchase_order',
        document_id: order.id,
        description: line.description || 'Item',
        quantity: (line.quantity || 0).toString(),
        unit_price: (line.unit_price || 0).toString(),
        line_total: (line.amount || 0).toString(),
        tax_amount: ((line.amount || 0) * (line.tax_rate || 0) / 100).toString(),
        line_number: index + 1,
        project_id: line.project_id || null
      }));
      
      if (linesToInsert.length > 0) {
        await db.insert(document_lines).values(linesToInsert);
      }
    }

    await logCreate({
      companyId,
      entityType: 'purchase_order',
      entityId: order.id,
      createdData: { po_number: order.po_number, supplier_id: order.supplier_id, total: order.total },
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json(order);
  } catch (error: any) {
    if (error.name === "ZodError") {
      const validationError = fromZodError(error);
      return badRequest(res, validationError.message);
    } else {
      console.error("Error creating purchase order:", error);
      return serverError(res, "Failed to create purchase order");
    }
  }
});

// Fetch single purchase order
router.get("/orders/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).session.companyId;
    const order = await storage.getPurchaseOrderById(id);
    if (!order || (order as any).company_id !== companyId) {
      return notFound(res, "Purchase order not found");
    }
    res.json(order);
  } catch (error: any) {
    console.error("Error fetching purchase order:", error);
    return serverError(res, "Failed to fetch purchase order");
  }
});

// Update purchase order
router.put("/orders/:id", requireAuth, requireRole(['owner','admin','accountant']), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    const oldOrder = await storage.getPurchaseOrderById(id);
    
    const update = sanitizeUpdate(req.body, ['company_id','created_by','id'], ['subtotal','tax_total','total','fx_rate']);
    // Validate update payload as a partial schema
    const validatedUpdate = insertPurchaseOrderSchema.partial().parse(update);
    const order = await storage.updatePurchaseOrder(id, { ...validatedUpdate, updated_at: new Date() } as any);
    if (!order) return notFound(res, "Purchase order not found");

    await logUpdate({
      companyId,
      entityType: 'purchase_order',
      entityId: id,
      oldData: oldOrder || {},
      newData: order,
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json(order);
  } catch (error: any) {
    if (error.name === "ZodError") {
      const validationError = fromZodError(error);
      return badRequest(res, validationError.message);
    } else {
      console.error("Error updating purchase order:", error);
      return serverError(res, "Failed to update purchase order");
    }
  }
});

// Convert Purchase Order to Bill
router.post("/orders/:id/convert", requireAuth, requirePermission('purchases', 'create'), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;

    const order = await storage.getPurchaseOrderById(id);
    if (!order || (order as any).company_id !== companyId) {
      return notFound(res, "Purchase order not found");
    }

    // Create Bill from PO
    const billData = {
      company_id: companyId,
      created_by: userId,
      supplier_id: order.supplier_id,
      bill_number: `BILL-${Date.now().toString(36).toUpperCase()}`, // Auto-generate
      date: new Date(),
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
      currency: order.currency,
      fx_rate: order.fx_rate,
      subtotal: order.subtotal,
      tax_total: order.tax_total,
      total: order.total,
      paid_amount: '0',
      status: 'draft',
      notes: `Converted from PO #${order.po_number}`,
    };

    const validatedData = insertBillSchema.parse(billData);
    const bill = await storage.createBill(validatedData);

    // Update PO status
    await storage.updatePurchaseOrder(id, { status: 'received' } as any);

    res.status(201).json(bill);
  } catch (error: any) {
    console.error("Error converting purchase order:", error);
    return serverError(res, "Failed to convert purchase order");
  }
});

// Delete purchase order
router.delete("/orders/:id", requireAuth, requireRole(['owner','admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    const order = await storage.getPurchaseOrderById(id);
    
    const deleted = await storage.deletePurchaseOrder(companyId, id);
    if (!deleted) return notFound(res, "Purchase order not found");

    await logDelete({
      companyId,
      entityType: 'purchase_order',
      entityId: id,
      deletedData: { po_number: order?.po_number, supplier_id: order?.supplier_id, total: order?.total },
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting purchase order:", error);
    return serverError(res, "Failed to delete purchase order");
  }
});

// === PURCHASE DEBIT NOTES ===
router.get("/debit-notes", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    if (!companyId) return res.json([]);
    const notes = await storage.getPurchaseDebitNotesByCompany(companyId);
    res.json(notes);
  } catch (error: any) {
    const msg = String(error?.message || "");
    if (msg.includes("relation \"purchase_debit_notes\" does not exist") || error?.code === '42P01') {
      return res.json([]);
    }
    console.error("Error fetching debit notes:", error);
    return serverError(res, "Failed to fetch debit notes");
  }
});

router.post("/debit-notes", requireAuth, requirePermission('purchases', 'create'), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    const body = normalize(req.body);

    const now = new Date();
    if (!body.debit_note_number) body.debit_note_number = `DN-${Date.now().toString(36).toUpperCase()}`;
    if (!body.issue_date) body.issue_date = now;
    if (!body.currency) body.currency = 'USD';
    if (body.total === undefined) body.total = '0';
    if (body.remaining_amount === undefined) body.remaining_amount = body.total;
    if (!body.status) body.status = 'draft';

    // Derive vendor_name from contacts if missing
    if (!body.vendor_name && body.vendor_id) {
      try {
        const contacts = await storage.getContactsByCompany(companyId);
        const v = contacts.find(c => c.id === body.vendor_id);
        if (v) body.vendor_name = v.name;
      } catch {}
    }

    // Derive bill_number from bills if missing
    if (!body.bill_number && body.bill_id) {
      try {
        const bills = await storage.getBillsByCompany(companyId);
        const b = bills.find(b => b.id === body.bill_id);
        if (b) body.bill_number = b.bill_number;
      } catch {}
    }

    const validated = insertPurchaseDebitNoteSchema.parse({
      ...body,
      company_id: companyId,
      created_by: userId,
    });
    const note = await storage.createPurchaseDebitNote(validated);

    // Insert document lines if provided
    if (body.lines && Array.isArray(body.lines)) {
      const linesToInsert = body.lines.map((line: any, index: number) => ({
        document_type: 'debit_note',
        document_id: note.id,
        description: line.description || 'Item',
        quantity: (line.quantity || 0).toString(),
        unit_price: (line.unit_price || 0).toString(),
        line_total: (line.amount || 0).toString(),
        tax_amount: ((line.amount || 0) * (line.tax_rate || 0) / 100).toString(),
        line_number: index + 1,
        project_id: line.project_id || null
      }));
      
      if (linesToInsert.length > 0) {
        await db.insert(document_lines).values(linesToInsert);
      }
    }

    await logCreate({
      companyId,
      entityType: 'purchase_debit_note',
      entityId: note.id,
      createdData: { debit_note_number: note.debit_note_number, vendor_id: note.vendor_id, total: note.total },
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json(note);
  } catch (error: any) {
    if (error.name === "ZodError") {
      const validationError = fromZodError(error);
      return badRequest(res, validationError.message);
    }
    console.error("Error creating debit note:", error);
    return serverError(res, "Failed to create debit note");
  }
});

router.put("/debit-notes/:id", requireAuth, requireRole(['owner','admin','accountant']), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    const oldNote = await storage.getPurchaseDebitNoteById(id);
    
    const update = sanitizeUpdate(req.body, ['company_id','created_by','id'], ['total_amount']);
    // Validate as partial update
    const validated = insertPurchaseDebitNoteSchema.partial().parse(update);
    const note = await storage.updatePurchaseDebitNote(id, { ...validated, updated_at: new Date() } as any);
    if (!note) return notFound(res, "Debit note not found");

    await logUpdate({
      companyId,
      entityType: 'purchase_debit_note',
      entityId: id,
      oldData: oldNote || {},
      newData: note,
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json(note);
  } catch (error: any) {
    console.error("Error updating debit note:", error);
    return serverError(res, "Failed to update debit note");
  }
});

router.delete("/debit-notes/:id", requireAuth, requireRole(['owner','admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    const note = await storage.getPurchaseDebitNoteById(id);
    
    const deleted = await storage.deletePurchaseDebitNote(companyId, id);
    if (!deleted) return notFound(res, "Debit note not found");

    await logDelete({
      companyId,
      entityType: 'purchase_debit_note',
      entityId: id,
      deletedData: { debit_note_number: note?.debit_note_number, vendor_id: note?.vendor_id, total: note?.total },
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting debit note:", error);
    return serverError(res, "Failed to delete debit note");
  }
});

router.post("/debit-notes/:id/apply", requireAuth, requirePermission('purchases', 'create'), async (req, res) => {
  try {
    const { id } = req.params;
    const { bill_id, amount } = req.body;
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;

    if (!bill_id || !amount) return badRequest(res, "Bill ID and amount are required");

    const allocation = {
      company_id: companyId,
      payment_type: 'debit_note',
      payment_id: id,
      document_type: 'bill',
      document_id: bill_id,
      allocated_amount: amount.toString(),
      created_by: userId
    };
    
    await storage.applyPurchaseDebitNote(allocation as any);
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error applying debit note:", error);
    return serverError(res, "Failed to apply debit note");
  }
});

router.get("/expenses", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const expenses = await storage.getExpensesByCompany(companyId);
    res.json(expenses);
  } catch (error: any) {
    console.error("Error fetching expenses:", error);
    return serverError(res, `Failed to fetch expenses: ${error.message}`);
  }
});

router.post("/expenses", requireAuth, requirePermission('purchases', 'create'), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    const body = normalize(req.body);
    const now = new Date();
    if (!body.expense_number) body.expense_number = `EXP-${Date.now().toString(36).toUpperCase()}`;
    
    // Ensure date is a Date object
    if (body.date) {
      body.date = new Date(body.date);
    } else {
      body.date = now;
    }
    
    if (body.tax_amount === undefined) body.tax_amount = '0';
    if (!body.status) body.status = 'pending';

    const validatedData = insertExpenseSchema.parse({
      ...body,
      company_id: companyId,
      created_by: userId
    });
    const expense = await storage.createExpense(validatedData);

    await logCreate({
      companyId,
      entityType: 'expense',
      entityId: expense.id,
      createdData: { expense_number: expense.expense_number, amount: expense.amount, category: expense.category },
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json(expense);
  } catch (error: any) {
    if (error.name === "ZodError") {
      const validationError = fromZodError(error);
      return badRequest(res, validationError.message);
    } else {
      console.error("Error creating expense:", error);
      return serverError(res, "Failed to create expense");
    }
  }
});

export default router;
