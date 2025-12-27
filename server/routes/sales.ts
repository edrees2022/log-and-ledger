import { Router } from "express";
import { storage } from "../storage";
import { insertSalesInvoiceSchema, insertSalesCreditNoteSchema, insertSalesOrderSchema, insertRecurringTemplateSchema, document_lines, items, inventory_serials, inventory_batches, sales_quotes, contacts } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { requireAuth, requirePermission, requireRole } from "../middleware/permissions";
import { badRequest, notFound, serverError, unauthorized } from '../utils/sendError';
import { normalize, sanitizeUpdate } from "../utils/sanitize";
import { log, logError } from "../logger";
import { logAudit, logCreate, logUpdate, logDelete } from "../utils/auditLog";
import { getDocumentAllocations } from "../utils/paymentAllocation";
import { getNextDocumentNumber } from "../utils/documentSequence";
import { createInvoiceJournalEntry } from "../utils/journalEntry";
import { getExchangeRate, getCompanyBaseCurrency } from "../utils/currency";
import { recordStockMovement } from "../utils/inventory";
import { db } from "../db";
import { eq, and, inArray, desc } from "drizzle-orm";

const router = Router();

// === SALES INVOICES ===

/**
 * @swagger
 * /api/sales/invoices/next-number:
 *   get:
 *     summary: Get next invoice number
 *     description: Preview the next invoice number that will be assigned
 *     tags: [Invoices]
 *     security:
 *       - sessionCookie: []
 *     responses:
 *       200:
 *         description: Next invoice number
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 invoice_number:
 *                   type: string
 */
router.get("/invoices/next-number", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const invoiceNumber = await getNextDocumentNumber(companyId, 'invoice');
    res.json({ invoice_number: invoiceNumber });
  } catch (error: any) {
    console.error("Error getting next invoice number:", error);
    return serverError(res, "Failed to get next invoice number");
  }
});

/**
 * @swagger
 * /api/sales/invoices:
 *   get:
 *     summary: Get all invoices for company
 *     description: Retrieve list of sales invoices for the authenticated user's company
 *     tags: [Invoices]
 *     security:
 *       - sessionCookie: []
 *     responses:
 *       200:
 *         description: List of invoices
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Invoice'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/invoices", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const invoices = await storage.getSalesInvoicesByCompany(companyId);
    res.json(invoices);
  } catch (error: any) {
    console.error("Error fetching invoices:", error);
    return serverError(res, "Failed to fetch invoices");
  }
});

/**
 * @swagger
 * /api/sales/invoices:
 *   post:
 *     summary: Create new invoice
 *     description: Create a new sales invoice with line items
 *     tags: [Invoices]
 *     security:
 *       - sessionCookie: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer_id
 *               - date
 *               - due_date
 *             properties:
 *               customer_id:
 *                 type: string
 *                 format: uuid
 *               invoice_number:
 *                 type: string
 *                 description: Auto-generated if not provided
 *               date:
 *                 type: string
 *                 format: date-time
 *               due_date:
 *                 type: string
 *                 format: date-time
 *               currency:
 *                 type: string
 *                 default: USD
 *               status:
 *                 type: string
 *                 enum: [draft, sent, paid, overdue, cancelled]
 *                 default: draft
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invoice'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post("/invoices", requireAuth, requirePermission('sales', 'create'), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;

    const body = normalize(req.body);
    const now = new Date();
    if (!body.invoice_number) {
      body.invoice_number = await getNextDocumentNumber(companyId, 'invoice');
    }
    
    // Convert date strings to Date objects
    if (body.date) {
      body.date = typeof body.date === 'string' ? new Date(body.date) : body.date;
    } else {
      body.date = now;
    }
    if (body.due_date) {
      body.due_date = typeof body.due_date === 'string' ? new Date(body.due_date) : body.due_date;
    } else {
      body.due_date = new Date(now.getTime() + 30*24*60*60*1000);
    }
    
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

    const validatedData = insertSalesInvoiceSchema.parse({
      ...body,
      company_id: companyId,
      created_by: userId
    });
    const invoice = await storage.createSalesInvoice(validatedData);
    
    // Insert document lines if provided
    if (body.lines && Array.isArray(body.lines)) {
      const linesToInsert = body.lines.map((line: any, index: number) => ({
        document_type: 'invoice',
        document_id: invoice.id,
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

    // Create automatic journal entry for invoice
    try {
      await createInvoiceJournalEntry(
        companyId,
        invoice.id,
        invoice.customer_id,
        invoice.invoice_number,
        parseFloat(invoice.subtotal || '0'),
        parseFloat(invoice.tax_total || '0'),
        parseFloat(invoice.total || '0'),
        invoice.date,
        userId,
        invoice.currency,
        parseFloat(invoice.fx_rate || '1'),
        body.lines // Pass lines to journal entry creation
      );
    } catch (journalError) {
      console.error("Failed to create journal entry for invoice:", journalError);
      // Don't fail the invoice creation if journal entry fails
    }

    // Record stock movements for product items (reduce inventory on sale)
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
                transaction_type: 'sale',
                transaction_date: new Date(invoice.date),
                quantity: -Math.abs(parseFloat(line.quantity || '0')), // Negative for sales (reduces stock)
                unit_cost: parseFloat(line.unit_price || '0'),
                reference_type: 'invoice',
                reference_id: invoice.id,
                notes: `Sale - Invoice ${invoice.invoice_number}`,
                created_by: userId
              });

              // Process serial/batch tracking
              if (line.tracking_type === 'serial' && line.serial_numbers?.length) {
                // Mark serials as sold
                await db.update(inventory_serials)
                  .set({ status: 'sold' })
                  .where(and(
                    eq(inventory_serials.company_id, companyId),
                    inArray(inventory_serials.id, line.serial_numbers)
                  ));
              } else if (line.tracking_type === 'batch' && line.batch_id) {
                // Reduce batch quantity
                const [batch] = await db.select().from(inventory_batches)
                  .where(and(
                    eq(inventory_batches.id, line.batch_id),
                    eq(inventory_batches.company_id, companyId)
                  ));
                if (batch) {
                  const currentQty = parseFloat(batch.quantity || '0');
                  const soldQty = parseFloat(line.quantity || '0');
                  const newQty = Math.max(0, currentQty - soldQty);
                  await db.update(inventory_batches)
                    .set({ quantity: String(newQty) })
                    .where(eq(inventory_batches.id, line.batch_id));
                }
              }
            }
          } catch (stockError) {
            console.error("Failed to record stock movement for line:", stockError);
            // Don't fail invoice creation if stock recording fails
          }
        }
      }
    }

    // Log audit for invoice creation
    await logCreate({
      companyId,
      entityType: 'sales_invoice',
      entityId: invoice.id,
      createdData: { invoice_number: invoice.invoice_number, customer_id: invoice.customer_id, total: invoice.total, currency: invoice.currency },
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(201).json(invoice);
  } catch (error: any) {
    if (error.name === "ZodError") {
      const validationError = fromZodError(error);
      return badRequest(res, validationError.message);
    } else {
      console.error("Error creating invoice:", error);
      return serverError(res, "Failed to create invoice");
    }
  }
});

router.get("/invoices/:id", requireAuth, async (req, res) => {
  try {
    const invoice = await storage.getSalesInvoiceById(req.params.id);
    if (!invoice) return notFound(res, "Invoice not found");
    res.json(invoice);
  } catch (error: any) {
    console.error("Error fetching invoice:", error);
    return serverError(res, "Failed to fetch invoice");
  }
});

// Allocation history for a specific sales invoice
router.get("/invoices/:id/allocations", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await getDocumentAllocations("invoice", id);
    res.json(rows);
  } catch (error: any) {
    console.error("Error fetching invoice allocations:", error);
    return serverError(res, "Failed to fetch invoice allocations");
  }
});

router.put("/invoices/:id", requireAuth, requireRole(['owner','admin','accountant']), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    const oldInvoice = await storage.getSalesInvoiceById(req.params.id);
    if (!oldInvoice) return notFound(res, "Invoice not found");
    
    const { lines, ...bodyWithoutLines } = req.body;
    
    // Convert date strings to Date objects
    if (bodyWithoutLines.date && typeof bodyWithoutLines.date === 'string') {
      bodyWithoutLines.date = new Date(bodyWithoutLines.date);
    }
    if (bodyWithoutLines.due_date && typeof bodyWithoutLines.due_date === 'string') {
      bodyWithoutLines.due_date = new Date(bodyWithoutLines.due_date);
    }
    
    const update = sanitizeUpdate(bodyWithoutLines, ['company_id','created_by','id'], ['subtotal','tax_total','total','paid_amount','fx_rate']);
    
    let invoice;
    try {
      const validated = insertSalesInvoiceSchema.partial().parse(update);
      invoice = await storage.updateSalesInvoice(req.params.id, validated);
    } catch (parseError: any) {
      console.error("Invoice validation error:", parseError);
      return res.status(400).json({ error: "Validation failed", details: parseError.message });
    }
    
    if (!invoice) return notFound(res, "Invoice not found");

    // Update document lines if provided
    if (lines && Array.isArray(lines)) {
      try {
        // Delete existing lines
        await db.delete(document_lines).where(
        and(
          eq(document_lines.document_type, 'invoice'),
          eq(document_lines.document_id, req.params.id)
        )
      );
      
      // Insert new lines
      const linesToInsert = lines.map((line: any, index: number) => ({
        document_type: 'invoice' as const,
        document_id: req.params.id,
        description: line.description || 'Item',
        quantity: (line.quantity || 1).toString(),
        unit_price: (line.unit_price || 0).toString(),
        line_total: (line.amount || 0).toString(),
        tax_amount: ((line.amount || 0) * (line.tax_rate || 0) / 100).toString(),
        discount_percentage: (line.discount_percentage || 0).toString(),
        line_number: index + 1,
        project_id: line.project_id || null,
        item_id: line.item_id || null,
        warehouse_id: line.warehouse_id || null,
        tax_id: line.tax_id || null
      }));
      
      if (linesToInsert.length > 0) {
        await db.insert(document_lines).values(linesToInsert);
      }
      } catch (linesError: any) {
        console.error("Error updating lines:", linesError);
        // Continue without failing - invoice was already updated
      }
    }

    // Log audit for invoice update
    await logUpdate({
      companyId,
      entityType: 'sales_invoice',
      entityId: req.params.id,
      oldData: oldInvoice || {},
      newData: invoice,
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Return invoice with updated lines
    const updatedInvoice = await storage.getSalesInvoiceById(req.params.id);
    res.json(updatedInvoice);
  } catch (error: any) {
    console.error("Error updating invoice:", error);
    return serverError(res, "Failed to update invoice");
  }
});

// Send invoice via email
router.post("/invoices/:id/send", requireAuth, requireRole(['owner','admin','accountant']), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;

    // Get invoice with contact details
    const invoice = await storage.getSalesInvoiceById(id);
    if (!invoice) return notFound(res, "Invoice not found");

    // Get contact information
    let contactEmail = 'customer@example.com'; // Default fallback
    if (invoice.customer_id) {
      const contact = await storage.getContactById(invoice.customer_id);
      if (contact?.email) {
        contactEmail = contact.email;
      }
    }

    // TODO: Implement actual email sending service (SendGrid, AWS SES, etc.)
    // For now, we'll mark the invoice as sent and log the action
    log(`📧 Invoice ${invoice.invoice_number} would be sent to ${contactEmail}`, 
      `Amount: ${invoice.currency} ${invoice.total}`, 
      `Due Date: ${invoice.due_date}`);

    // Update invoice status to 'sent'
    const updatedInvoice = await storage.updateSalesInvoice(id, { 
      status: 'sent'
    });

    // Log the action in audit log
    await logAudit({
      companyId,
      entityType: 'sales_invoice',
      entityId: id,
      action: 'update',
      changes: {
        action: 'send_invoice',
        invoice_number: invoice.invoice_number,
        recipient: contactEmail,
        amount: invoice.total,
        currency: invoice.currency,
        status: 'sent'
      },
      actorId: userId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ 
      success: true, 
      message: 'Invoice marked as sent',
      invoice: updatedInvoice,
      note: 'Email service not configured. Please add SendGrid/AWS SES credentials to send actual emails.'
    });
  } catch (error: any) {
    logError("Error sending invoice:", error);
    return serverError(res, "Failed to send invoice");
  }
});

router.delete("/invoices/:id", requireAuth, requireRole(['owner','admin']), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    const invoice = await storage.getSalesInvoiceById(req.params.id);
    
    const success = await storage.deleteSalesInvoice(req.params.id);
    if (!success) return notFound(res, "Invoice not found");

    // Log audit for invoice deletion
    await logDelete({
      companyId,
      entityType: 'sales_invoice',
      entityId: req.params.id,
      deletedData: { invoice_number: invoice?.invoice_number, customer_id: invoice?.customer_id, total: invoice?.total },
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting invoice:", error);
    return serverError(res, "Failed to delete invoice");
  }
});

// === DOCUMENT LINES (for quotes, orders, invoices, etc.) ===
router.get("/document-lines", requireAuth, async (req, res) => {
  try {
    const { document_type, document_id } = req.query;
    
    if (!document_type || !document_id) {
      return badRequest(res, "document_type and document_id are required");
    }
    
    const lines = await db
      .select({
        id: document_lines.id,
        document_type: document_lines.document_type,
        document_id: document_lines.document_id,
        item_id: document_lines.item_id,
        item_name: items.name,
        item_sku: items.sku,
        tax_id: document_lines.tax_id,
        description: document_lines.description,
        quantity: document_lines.quantity,
        unit_price: document_lines.unit_price,
        discount_percentage: document_lines.discount_percentage,
        line_total: document_lines.line_total,
        tax_amount: document_lines.tax_amount,
        line_number: document_lines.line_number,
        project_id: document_lines.project_id,
      })
      .from(document_lines)
      .leftJoin(items, eq(document_lines.item_id, items.id))
      .where(
        and(
          eq(document_lines.document_type, document_type as string),
          eq(document_lines.document_id, document_id as string)
        )
      )
      .orderBy(document_lines.line_number);
    
    res.json(lines);
  } catch (error: any) {
    console.error("Error fetching document lines:", error);
    return serverError(res, "Failed to fetch document lines");
  }
});

// === SALES QUOTATIONS ===
router.get("/quotations", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    
    // Fetch quotations with customer name using JOIN
    const quotationsWithCustomer = await db
      .select({
        id: sales_quotes.id,
        company_id: sales_quotes.company_id,
        quote_number: sales_quotes.quote_number,
        customer_id: sales_quotes.customer_id,
        customer_name: contacts.name,
        customer_email: contacts.email,
        customer_phone: contacts.phone,
        project_id: sales_quotes.project_id,
        date: sales_quotes.date,
        valid_until: sales_quotes.valid_until,
        status: sales_quotes.status,
        currency: sales_quotes.currency,
        fx_rate: sales_quotes.fx_rate,
        subtotal: sales_quotes.subtotal,
        tax_total: sales_quotes.tax_total,
        total: sales_quotes.total,
        notes: sales_quotes.notes,
        terms: sales_quotes.terms,
        created_by: sales_quotes.created_by,
        created_at: sales_quotes.created_at,
        updated_at: sales_quotes.updated_at,
      })
      .from(sales_quotes)
      .leftJoin(contacts, eq(sales_quotes.customer_id, contacts.id))
      .where(eq(sales_quotes.company_id, companyId))
      .orderBy(desc(sales_quotes.created_at));
    
    res.json(quotationsWithCustomer);
  } catch (error: any) {
    console.error("Error fetching quotations:", error);
    return serverError(res, "Failed to fetch quotations");
  }
});

router.post("/quotations", requireAuth, requirePermission('sales', 'create'), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;

    console.log("Creating quotation - Raw body:", JSON.stringify(req.body, null, 2));

    const body = normalize(req.body);
    
    // Validate required fields
    if (!body.customer_id) {
      return badRequest(res, "Customer is required");
    }
    
    // Generate quote number using document sequence system if not provided or empty
    if (!body.quote_number || body.quote_number === null || body.quote_number === '') {
      body.quote_number = await getNextDocumentNumber(companyId, 'quote');
    }
    if (!body.date) body.date = new Date();
    else if (typeof body.date === 'string') body.date = new Date(body.date);
    
    // Handle valid_until - convert string to Date or set to null
    if (body.valid_until && typeof body.valid_until === 'string') {
      body.valid_until = new Date(body.valid_until);
    } else if (!body.valid_until) {
      body.valid_until = null;
    }
    
    if (!body.currency) body.currency = 'USD';
    if (!body.fx_rate) body.fx_rate = '1';
    
    // Calculate totals from amount if provided
    const amount = parseFloat(body.amount) || 0;
    if (body.subtotal === undefined) body.subtotal = amount.toString();
    if (body.tax_total === undefined) body.tax_total = '0';
    if (body.total === undefined) body.total = amount.toString();
    
    // Remove empty string fields that should be null
    if (body.notes === '') body.notes = null;
    if (body.terms === '') body.terms = null;
    
    // Store lines, terms and project_id BEFORE deleting
    const linesToCreate = req.body.lines;
    console.log("Raw req.body.lines:", JSON.stringify(req.body.lines, null, 2));
    console.log("linesToCreate:", JSON.stringify(linesToCreate, null, 2));
    console.log("linesToCreate is array:", Array.isArray(linesToCreate));
    console.log("linesToCreate length:", linesToCreate?.length);
    const termsValue = body.terms;
    const projectId = body.project_id && body.project_id !== '' ? body.project_id : null;
    
    // Remove fields not in sales_quotes table
    delete body.description;
    delete body.amount;
    delete body.lines;
    delete body.project_id;

    const payload: any = {
      company_id: companyId,
      created_by: userId,
      quote_number: body.quote_number,
      customer_id: body.customer_id,
      date: body.date,
      valid_until: body.valid_until,
      status: body.status || 'draft',
      currency: body.currency,
      fx_rate: body.fx_rate,
      subtotal: body.subtotal,
      tax_total: body.tax_total,
      total: body.total,
      notes: body.notes || null,
      terms: termsValue || null,
    };
    
    // Only add project_id if it has a value (to avoid FK constraint issues)
    if (projectId) {
      payload.project_id = projectId;
    }
    
    console.log("Creating quotation - Payload:", JSON.stringify(payload, null, 2));
    
    let quotation;
    try {
      quotation = await storage.createSalesQuote(payload);
      console.log("Quotation created:", quotation.id);
    } catch (dbError: any) {
      console.error("Database error creating quotation:", dbError.message);
      console.error("Full DB error:", dbError);
      return serverError(res, `Database error: ${dbError.message}`);
    }

    // Insert document lines if provided
    if (linesToCreate && Array.isArray(linesToCreate) && linesToCreate.length > 0) {
      console.log("Creating quotation lines:", JSON.stringify(linesToCreate, null, 2));
      
      try {
        const linesToInsert = linesToCreate.map((line: any, index: number) => {
          // Calculate line total with discount
          const qty = parseFloat(line.quantity) || 0;
          const price = parseFloat(line.unit_price) || 0;
          const discountPct = parseFloat(line.discount_percentage) || 0;
          const lineSubtotal = qty * price;
          const discountAmount = lineSubtotal * discountPct / 100;
          const lineTotal = lineSubtotal - discountAmount;
          
          // Use provided tax_amount or calculate from line_total
          const taxAmount = parseFloat(line.tax_amount) || 0;
          
          const lineData: any = {
            document_type: 'quote',
            document_id: quotation.id,
            description: line.description || 'Item',
            quantity: qty.toString(),
            unit_price: price.toString(),
            discount_percentage: discountPct.toString(),
            line_total: (parseFloat(line.line_total) || lineTotal).toString(),
            tax_amount: taxAmount.toString(),
            line_number: line.line_number || index + 1,
            item_id: line.item_id && line.item_id !== '' ? line.item_id : null,
            tax_id: line.tax_id && line.tax_id !== '' ? line.tax_id : null,
            project_id: line.project_id && line.project_id !== '' ? line.project_id : null
          };
          
          return lineData;
        });
        
        console.log("Lines to insert:", JSON.stringify(linesToInsert, null, 2));
        
        await db.insert(document_lines).values(linesToInsert);
        console.log("Document lines inserted successfully");
      } catch (lineError: any) {
        console.error("Error inserting document lines:", lineError);
        // Throw error to see what's happening
        throw new Error(`Failed to save quote lines: ${lineError.message}`);
      }
    }

    // Log audit for quotation creation
    await logCreate({
      companyId,
      entityType: 'sales_quote',
      entityId: quotation.id,
      createdData: { quote_number: quotation.quote_number, customer_id: quotation.customer_id, total: quotation.total },
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json(quotation);
  } catch (error: any) {
    console.error("Error creating quotation:", error);
    console.error("Error stack:", error.stack);
    return serverError(res, `Failed to create quotation: ${error.message}`);
  }
});

router.get("/quotations/:id", requireAuth, async (req, res) => {
  try {
    const quotation = await storage.getSalesQuoteById(req.params.id);
    if (!quotation) return notFound(res, "Quotation not found");
    res.json(quotation);
  } catch (error: any) {
    console.error("Error fetching quotation:", error);
    return serverError(res, "Failed to fetch quotation");
  }
});

router.put("/quotations/:id", requireAuth, requirePermission('sales', 'edit'), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    const oldQuote = await storage.getSalesQuoteById(id);
    
    // Store lines for separate handling
    const linesToUpdate = req.body.lines;
    
    const update = sanitizeUpdate(req.body, ['company_id', 'created_by', 'id', 'lines']);
    const quotation = await storage.updateSalesQuote(id, update);
    if (!quotation) return notFound(res, "Quotation not found");

    // Update document lines if provided
    if (linesToUpdate && Array.isArray(linesToUpdate) && linesToUpdate.length > 0) {
      try {
        // Delete existing lines first
        await db.delete(document_lines).where(
          and(
            eq(document_lines.document_type, 'quote'),
            eq(document_lines.document_id, id)
          )
        );
        
        // Insert new lines
        const linesToInsert = linesToUpdate.map((line: any, index: number) => {
          const qty = parseFloat(line.quantity) || 0;
          const price = parseFloat(line.unit_price) || 0;
          const discountPct = parseFloat(line.discount_percentage) || 0;
          const lineSubtotal = qty * price;
          const discountAmount = lineSubtotal * discountPct / 100;
          const lineTotal = lineSubtotal - discountAmount;
          const taxAmount = parseFloat(line.tax_amount) || 0;
          
          return {
            document_type: 'quote',
            document_id: id,
            description: line.description || 'Item',
            quantity: qty.toString(),
            unit_price: price.toString(),
            discount_percentage: discountPct.toString(),
            line_total: (parseFloat(line.line_total) || lineTotal).toString(),
            tax_amount: taxAmount.toString(),
            line_number: line.line_number || index + 1,
            item_id: line.item_id && line.item_id !== '' ? line.item_id : null,
            tax_id: line.tax_id && line.tax_id !== '' ? line.tax_id : null,
            project_id: line.project_id && line.project_id !== '' ? line.project_id : null
          };
        });
        
        await db.insert(document_lines).values(linesToInsert);
        console.log("Document lines updated successfully");
      } catch (lineError: any) {
        console.error("Error updating document lines:", lineError);
        throw new Error(`Failed to update quote lines: ${lineError.message}`);
      }
    }

    await logUpdate({
      companyId,
      entityType: 'sales_quote',
      entityId: id,
      oldData: oldQuote || {},
      newData: quotation,
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json(quotation);
  } catch (error: any) {
    console.error("Error updating quotation:", error);
    return serverError(res, "Failed to update quotation");
  }
});

router.delete("/quotations/:id", requireAuth, requirePermission('sales', 'delete'), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    const quote = await storage.getSalesQuoteById(id);
    
    const success = await storage.deleteSalesQuote(id);
    if (!success) return notFound(res, "Quotation not found");

    await logDelete({
      companyId,
      entityType: 'sales_quote',
      entityId: id,
      deletedData: { quote_number: quote?.quote_number, customer_id: quote?.customer_id, total: quote?.total },
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting quotation:", error);
    return serverError(res, "Failed to delete quotation");
  }
});

// Convert Quotation to Invoice
router.post("/quotations/:id/convert", requireAuth, requirePermission('sales', 'create'), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;

    const quote = await storage.getSalesQuoteById(id);
    if (!quote) return notFound(res, "Quotation not found");

    // Create Invoice from Quote
    const invoiceData = {
      company_id: companyId,
      created_by: userId,
      customer_id: quote.customer_id,
      invoice_number: `INV-${Date.now().toString(36).toUpperCase()}`, // Auto-generate
      date: new Date(),
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
      currency: quote.currency,
      fx_rate: quote.fx_rate,
      subtotal: quote.subtotal,
      tax_total: quote.tax_total,
      total: quote.total,
      paid_amount: '0',
      status: 'draft',
      notes: `Converted from Quote #${quote.quote_number}`,
      // Copy line items if we had them in a separate table, but for now assuming they are handled or simple
      // If line items are in a separate table, we would need to fetch and copy them too.
      // Assuming simple structure for now or that the frontend handles line items via a separate call or included in body?
      // Wait, insertSalesInvoiceSchema might require line items if they are part of the schema?
      // Let's check schema.
    };

    // Actually, usually conversion happens on frontend by pre-filling the invoice form.
    // But a backend endpoint is nice for "One Click" conversion.
    // For now, let's just update the quote status to 'accepted' and return the data for the frontend to create the invoice,
    // OR create the invoice directly.
    
    // Let's create the invoice directly.
    const validatedData = insertSalesInvoiceSchema.parse(invoiceData);
    const invoice = await storage.createSalesInvoice(validatedData);

    // Update Quote status
    await storage.updateSalesQuote(id, { status: 'invoiced' });

    res.status(201).json(invoice);
  } catch (error: any) {
    console.error("Error converting quotation:", error);
    return serverError(res, "Failed to convert quotation");
  }
});

// === SALES CREDIT NOTES ===
router.get("/credit-notes", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    if (!companyId) return res.json([]);
    const notes = await storage.getSalesCreditNotesByCompany(companyId);
    res.json(notes);
  } catch (error: any) {
    const msg = String(error?.message || "");
    if (msg.includes("relation \"sales_credit_notes\" does not exist") || error?.code === '42P01') {
      return res.json([]);
    }
    console.error("Error fetching credit notes:", error);
    return serverError(res, "Failed to fetch credit notes");
  }
});

router.post("/credit-notes", requireAuth, requirePermission('sales', 'create'), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;

    const body = normalize(req.body);
    if (!body.credit_note_number) body.credit_note_number = `CN-${Date.now().toString(36).toUpperCase()}`;
    if (!body.date) body.date = new Date();
    if (!body.currency) body.currency = 'USD';
    if (!body.fx_rate) body.fx_rate = '1';
    if (body.subtotal === undefined) body.subtotal = '0';
    if (body.tax_total === undefined) body.tax_total = '0';
    if (body.total === undefined) body.total = '0';
    if (body.remaining_amount === undefined) body.remaining_amount = body.total;
    if (!body.status) body.status = 'draft';

    const validatedData = insertSalesCreditNoteSchema.parse({
      ...body,
      company_id: companyId,
      created_by: userId
    });
    const note = await storage.createSalesCreditNote(validatedData);

    // Insert document lines if provided
    if (body.lines && Array.isArray(body.lines)) {
      const linesToInsert = body.lines.map((line: any, index: number) => ({
        document_type: 'credit_note',
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
      entityType: 'sales_credit_note',
      entityId: note.id,
      createdData: { credit_note_number: note.credit_note_number, customer_id: note.customer_id, total: note.total },
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
    } else {
      console.error("Error creating credit note:", error);
      return serverError(res, "Failed to create credit note");
    }
  }
});

router.put("/credit-notes/:id", requireAuth, requirePermission('sales', 'edit'), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    const oldNote = await storage.getSalesCreditNoteById(id);
    
    const update = sanitizeUpdate(req.body, ['company_id', 'created_by', 'id']);
    const note = await storage.updateSalesCreditNote(id, update);
    if (!note) return notFound(res, "Credit note not found");

    await logUpdate({
      companyId,
      entityType: 'sales_credit_note',
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
    console.error("Error updating credit note:", error);
    return serverError(res, "Failed to update credit note");
  }
});

router.delete("/credit-notes/:id", requireAuth, requirePermission('sales', 'delete'), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;
    const note = await storage.getSalesCreditNoteById(id);
    
    const success = await storage.deleteSalesCreditNote(companyId, id);
    if (!success) return notFound(res, "Credit note not found");

    await logDelete({
      companyId,
      entityType: 'sales_credit_note',
      entityId: id,
      deletedData: { credit_note_number: note?.credit_note_number, customer_id: note?.customer_id, total: note?.total },
      actorId: userId,
      actorName: (req as any).session?.userName || 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting credit note:", error);
    return serverError(res, "Failed to delete credit note");
  }
});

router.post("/credit-notes/:id/apply", requireAuth, requirePermission('sales', 'create'), async (req, res) => {
  try {
    const { id } = req.params;
    const { invoice_id, amount } = req.body;
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;

    if (!invoice_id || !amount) return badRequest(res, "Invoice ID and amount are required");

    const allocation = {
      company_id: companyId,
      payment_type: 'credit_note',
      payment_id: id,
      document_type: 'invoice',
      document_id: invoice_id,
      allocated_amount: amount.toString(),
      created_by: userId
    };
    
    await storage.applySalesCreditNote(allocation as any);
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error applying credit note:", error);
    return serverError(res, "Failed to apply credit note");
  }
});

// === SALES ORDERS ===
router.get("/orders", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    if (!companyId) return res.json([]);
    const orders = await storage.getSalesOrdersByCompany(companyId);
    res.json(orders);
  } catch (error: any) {
    const msg = String(error?.message || "");
    if (msg.includes("relation \"sales_orders\" does not exist") || error?.code === '42P01') {
      return res.json([]);
    }
    console.error("Error fetching sales orders:", error);
    return serverError(res, "Failed to fetch sales orders");
  }
});

router.post("/orders", requireAuth, requirePermission('sales', 'create'), async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;

    const body = normalize(req.body);
    if (!body.order_number) body.order_number = `SO-${Date.now().toString(36).toUpperCase()}`;
    if (!body.date) body.date = new Date();
    if (!body.currency) body.currency = 'USD';
    if (!body.fx_rate) body.fx_rate = '1';
    if (body.subtotal === undefined) body.subtotal = '0';
    if (body.tax_total === undefined) body.tax_total = '0';
    if (body.total === undefined) body.total = '0';
    if (!body.status) body.status = 'draft';

    const validatedData = insertSalesOrderSchema.parse({
      ...body,
      company_id: companyId,
      created_by: userId
    });
    const order = await storage.createSalesOrder(validatedData);

    // Insert document lines if provided
    if (body.lines && Array.isArray(body.lines)) {
      const linesToInsert = body.lines.map((line: any, index: number) => ({
        document_type: 'order',
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
      entityType: 'sales_order',
      entityId: order.id,
      createdData: { order_number: order.order_number, customer_id: order.customer_id, total: order.total },
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
      console.error("Error creating sales order:", error);
      return serverError(res, "Failed to create sales order");
    }
  }
});

// === SALES RECURRING INVOICES ===
router.get("/recurring-invoices", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session?.companyId || (req as any).session?.company?.id;
    if (!companyId) return unauthorized(res, "No company selected");
    const templates = await storage.getRecurringTemplatesByCompany(companyId, 'invoice');
    res.json(templates);
  } catch (error: any) {
    console.error("Error fetching recurring invoices:", error);
    return serverError(res, "Failed to fetch recurring invoices");
  }
});

router.post("/recurring-invoices", requireAuth, requirePermission('sales', 'create'), async (req, res) => {
  try {
    const companyId = (req as any).session?.companyId || (req as any).session?.company?.id;
    const userId = (req as any).session?.userId;
    if (!companyId || !userId) return unauthorized(res, "Unauthorized");

    const body = req.body || {};
    const now = new Date();
    const startDate = body.start_date ? new Date(body.start_date) : now;
    const endDate = body.end_date ? new Date(body.end_date) : undefined;

    const validated = insertRecurringTemplateSchema.parse({
      ...body,
      company_id: companyId,
      created_by: userId,
      type: 'invoice',
      start_date: startDate,
      end_date: endDate,
      last_generated: null,
      next_generation: startDate,
      is_active: body.is_active !== false
    });

    const template = await storage.createRecurringTemplate(validated);
    res.status(201).json(template);
  } catch (error: any) {
    if (error.name === "ZodError") {
      const validationError = fromZodError(error);
      return badRequest(res, validationError.message);
    }
    console.error("Error creating recurring invoice template:", error);
    return serverError(res, "Failed to create recurring invoice template");
  }
});

router.put("/recurring-invoices/:id", requireAuth, requireRole(['owner','admin','accountant']), async (req, res) => {
  try {
    const { id } = req.params;
    const update = sanitizeUpdate(req.body, ['company_id','created_by','id','type']);
    const validated = insertRecurringTemplateSchema.partial().parse(update);
    const template = await storage.updateRecurringTemplate(id, validated);
    if (!template) return notFound(res, "Template not found");
    res.json(template);
  } catch (error: any) {
    console.error("Error updating recurring invoice template:", error);
    return serverError(res, "Failed to update recurring invoice template");
  }
});

router.delete("/recurring-invoices/:id", requireAuth, requireRole(['owner','admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const success = await storage.deleteRecurringTemplate(id);
    if (!success) return notFound(res, "Template not found");
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting recurring invoice template:", error);
    return serverError(res, "Failed to delete recurring invoice template");
  }
});

// Generate invoice from recurring template
router.post("/recurring-invoices/:id/generate", requireAuth, requireRole(['owner','admin','accountant']), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).session.companyId;
    const userId = (req as any).session.userId;

    // Get the recurring template
    const templates = await storage.getRecurringTemplatesByCompany(companyId, 'invoice');
    const template = templates.find(t => t.id === id);
    
    if (!template) {
      return notFound(res, "Recurring template not found");
    }

    if (!template.is_active) {
      return badRequest(res, "Template is paused. Please activate it first.");
    }

    const templateData = template.template_data as any || {};

    // Generate invoice number
    const invoiceNumber = await getNextDocumentNumber(companyId, 'invoice');

    // Create the invoice
    const invoiceData = {
      company_id: companyId,
      invoice_number: invoiceNumber,
      customer_id: templateData.customer_id,
      date: new Date(),
      due_date: new Date(Date.now() + (parseInt(templateData.payment_terms || '30') * 24 * 60 * 60 * 1000)),
      total: String(parseFloat(templateData.amount || '0')),
      subtotal: String(parseFloat(templateData.amount || '0')),
      currency: templateData.currency || 'USD',
      status: 'draft',
      notes: templateData.notes || '',
      created_by: userId,
    };

    const invoice = await storage.createSalesInvoice(invoiceData);

    // Update template with next run date and increment counter
    const nextRunDate = calculateNextRunDate(template.frequency, new Date());
    const currentCount = parseInt(templateData.invoices_sent || '0');
    
    await storage.updateRecurringTemplate(id, {
      next_run_date: nextRunDate,
      last_run_date: new Date(),
      template_data: {
        ...templateData,
        invoices_sent: currentCount + 1,
      },
    });

    res.json({ 
      success: true, 
      invoice_id: invoice.id,
      invoice_number: invoice.invoice_number,
      message: `Invoice ${invoice.invoice_number} generated successfully`
    });
  } catch (error: any) {
    console.error("Error generating invoice from template:", error);
    return serverError(res, "Failed to generate invoice");
  }
});

// Helper function to calculate next run date
function calculateNextRunDate(frequency: string, fromDate: Date): Date {
  const date = new Date(fromDate);
  switch (frequency) {
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  return date;
}

// === SEND INVOICE EMAIL ===

/**
 * @openapi
 * /api/sales/invoices/{id}/send-email:
 *   post:
 *     summary: Send invoice via email
 *     tags: [Sales]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *             properties:
 *               to:
 *                 type: string
 *               cc:
 *                 type: string
 *               message:
 *                 type: string
 *               language:
 *                 type: string
 *                 enum: [en, ar]
 */
router.post("/invoices/:id/send-email", requireAuth, requireRole(['owner','admin','accountant']), async (req, res) => {
  try {
    const { id } = req.params;
    const { to, cc, message, language = 'en' } = req.body;

    if (!to) {
      return badRequest(res, "Recipient email is required");
    }

    // Get invoice details
    const invoice = await storage.getSalesInvoiceById(id);
    if (!invoice) {
      return notFound(res, "Invoice not found");
    }

    // Get company details
    const company = await storage.getCompanyById(invoice.company_id);
    if (!company) {
      return notFound(res, "Company not found");
    }

    // Get contact details
    let customerName = 'Customer';
    if (invoice.customer_id) {
      const contact = await storage.getContactById(invoice.customer_id);
      if (contact) {
        customerName = contact.name;
      }
    }

    // Format currency
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
        style: 'currency',
        currency: invoice.currency || 'USD',
      }).format(amount);
    };

    // Import email service dynamically
    const { sendInvoiceEmail, isEmailServiceConfigured } = await import('../utils/email');
    
    if (!isEmailServiceConfigured()) {
      return res.status(503).json({ 
        success: false, 
        error: 'Email service not configured. Please set SMTP credentials in environment variables.'
      });
    }

    const result = await sendInvoiceEmail({
      to,
      cc,
      invoiceNumber: invoice.invoice_number || id,
      customerName,
      companyName: company.name,
      amount: formatCurrency(parseFloat(invoice.total?.toString() || '0')),
      dueDate: invoice.due_date ? new Date(invoice.due_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US') : '',
      currency: invoice.currency || 'USD',
      language: language as 'en' | 'ar',
      customMessage: message,
    });

    if (result.success) {
      // Update invoice status to 'sent' if it was 'draft'
      if (invoice.status === 'draft') {
        await storage.updateSalesInvoice(id, { status: 'sent' });
      }
      
      res.json({ success: true, messageId: result.messageId });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    console.error("Error sending invoice email:", error);
    return serverError(res, "Failed to send invoice email");
  }
});

/**
 * @openapi
 * /api/sales/invoices/{id}/send-reminder:
 *   post:
 *     summary: Send payment reminder for invoice
 *     tags: [Sales]
 *     security:
 *       - sessionAuth: []
 */
router.post("/invoices/:id/send-reminder", requireAuth, requireRole(['owner','admin','accountant']), async (req, res) => {
  try {
    const { id } = req.params;
    const { to, language = 'en' } = req.body;

    // Get invoice details
    const invoice = await storage.getSalesInvoiceById(id);
    if (!invoice) {
      return notFound(res, "Invoice not found");
    }

    // Get company details
    const company = await storage.getCompanyById(invoice.company_id);
    if (!company) {
      return notFound(res, "Company not found");
    }

    // Get contact details
    let customerName = 'Customer';
    let customerEmail = to;
    if (invoice.customer_id) {
      const contact = await storage.getContactById(invoice.customer_id);
      if (contact) {
        customerName = contact.name;
        customerEmail = to || contact.email;
      }
    }

    if (!customerEmail) {
      return badRequest(res, "No email address provided or found for contact");
    }

    // Calculate days overdue
    const dueDate = invoice.due_date ? new Date(invoice.due_date) : new Date();
    const today = new Date();
    const daysOverdue = Math.max(0, Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Format currency
    const outstanding = parseFloat(invoice.total?.toString() || '0') - parseFloat(invoice.paid_amount?.toString() || '0');
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
        style: 'currency',
        currency: invoice.currency || 'USD',
      }).format(amount);
    };

    // Import email service dynamically
    const { sendPaymentReminder, isEmailServiceConfigured } = await import('../utils/email');
    
    if (!isEmailServiceConfigured()) {
      return res.status(503).json({ 
        success: false, 
        error: 'Email service not configured. Please set SMTP credentials in environment variables.'
      });
    }

    const result = await sendPaymentReminder({
      to: customerEmail,
      invoiceNumber: invoice.invoice_number || id,
      customerName,
      companyName: company.name,
      amount: formatCurrency(outstanding),
      dueDate: dueDate.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US'),
      daysOverdue,
      currency: invoice.currency || 'USD',
      language: language as 'en' | 'ar',
    });

    if (result.success) {
      res.json({ success: true, messageId: result.messageId });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    console.error("Error sending payment reminder:", error);
    return serverError(res, "Failed to send payment reminder");
  }
});

/**
 * @openapi
 * /api/sales/email-status:
 *   get:
 *     summary: Check if email service is configured
 *     tags: [Sales]
 */
router.get("/email-status", requireAuth, async (req, res) => {
  try {
    const { isEmailServiceConfigured } = await import('../utils/email');
    res.json({ configured: isEmailServiceConfigured() });
  } catch (error) {
    res.json({ configured: false });
  }
});

export default router;
