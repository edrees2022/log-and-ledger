import { Router } from "express";
import { storage } from "../storage";
import { insertCompanySchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { requireAuth, requireFirebaseAuth } from "../middleware/permissions";
import { normalize } from "../utils/sanitize";
import { badRequest, notFound, serverError } from '../utils/sendError';

const router = Router();

// === COMPANIES ===

router.post("/companies", requireFirebaseAuth, async (req, res) => {
  try {
    const validatedData = insertCompanySchema.parse(req.body);
    // Add Firebase user ID to link company with Firebase user
    const companyData = {
      ...validatedData,
      firebase_user_id: (req as any).firebaseUser.uid
    };
    const company = await storage.createCompany(companyData);

    res.status(201).json(company);
  } catch (error: any) {
    if (error.name === "ZodError") {
      const validationError = fromZodError(error);
      return badRequest(res, validationError.message);
    } else {
      console.error("Error creating company:", error);
      return serverError(res, "Failed to create company");
    }
  }
});

// Debug endpoint - check database connection and companies
router.get("/companies/debug", async (req, res) => {
  try {
    const { db } = await import("../db");
    const { companies } = await import("@shared/schema");
    
    const allCompanies = await db.select().from(companies);
    const targetUid = '644dbbd3-c481-4797-a230-ea152387a36b';
    const userCompanies = allCompanies.filter((c: any) => c.firebase_user_id === targetUid);
    
    res.json({
      code_version: "2025-11-29-v2",
      total_companies: allCompanies.length,
      user_companies: userCompanies.length,
      user_companies_data: userCompanies.map((c: any) => ({ id: c.id, name: c.name, firebase_user_id: c.firebase_user_id })),
      sample_companies: allCompanies.slice(0, 3).map((c: any) => ({ id: c.id, name: c.name, firebase_user_id: c.firebase_user_id }))
    });
  } catch (error: any) {
    res.json({ error: error.message, stack: error.stack });
  }
});

// Admin endpoint - List all orphan companies (no firebase_user_id)
// Protected: Only specific admin emails can access
router.get("/companies/orphans", requireFirebaseAuth, async (req, res) => {
  try {
    const adminEmails = ['admin@green-tec.net', 'omar@tibrcode.com', 'info@tibrcode.com'];
    const userEmail = (req as any).firebaseUser?.email;
    
    if (!adminEmails.includes(userEmail)) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { db } = await import("../db");
    const { companies, users } = await import("@shared/schema");
    const { isNull, eq } = await import("drizzle-orm");
    
    // Get all orphan companies (no firebase_user_id)
    const orphanCompanies = await db.select().from(companies).where(isNull(companies.firebase_user_id));
    
    // Get all users with their emails
    const allUsers = await db.select().from(users);
    
    res.json({
      orphan_count: orphanCompanies.length,
      orphan_companies: orphanCompanies.map((c: any) => ({ 
        id: c.id, 
        name: c.name, 
        email: c.email,
        created_at: c.created_at 
      })),
      available_users: allUsers.map((u: any) => ({
        id: u.id,
        email: u.email,
        firebase_user_id: u.firebase_user_id
      }))
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin endpoint - Link orphan company to a Firebase user
router.post("/companies/:id/admin-link", requireFirebaseAuth, async (req, res) => {
  try {
    const adminEmails = ['admin@green-tec.net', 'omar@tibrcode.com', 'info@tibrcode.com'];
    const userEmail = (req as any).firebaseUser?.email;
    
    if (!adminEmails.includes(userEmail)) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { id } = req.params;
    const { firebase_user_id } = req.body;
    
    if (!firebase_user_id) {
      return res.status(400).json({ error: 'firebase_user_id is required' });
    }
    
    const { db } = await import("../db");
    const { companies } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    
    // Update the company
    const [updated] = await db.update(companies)
      .set({ firebase_user_id })
      .where(eq(companies.id, id))
      .returning();
    
    if (!updated) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.json({ 
      success: true, 
      company: { id: updated.id, name: updated.name, firebase_user_id: updated.firebase_user_id }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// REMOVED: /companies/all endpoint was a security risk
// Each user should only see their own companies via /companies

router.get("/companies", requireFirebaseAuth, async (req, res) => {
  try {
    const firebaseUid = (req as any).firebaseUser?.uid;
    console.log(`🚀 [NEW CODE] Fetching companies for Firebase UID: ${firebaseUid}`);
    
    if (!firebaseUid) {
      console.error("❌ No Firebase UID found in request");
      return res.json([]);
    }
    
    // Direct database query to ensure it works
    const { db } = await import("../db");
    const { companies } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    
    const userCompanies = await db.select().from(companies).where(eq(companies.firebase_user_id, firebaseUid));
    console.log(`✅ [NEW CODE] Found ${userCompanies.length} companies for user ${firebaseUid}`);
    
    res.json(userCompanies);
  } catch (error: any) {
    console.error("❌ Error fetching companies:", error?.message || error);
    console.error("Stack:", error?.stack);
    res.json([]);
  }
});

router.put("/companies/:id", requireFirebaseAuth, async (req, res) => {
  try {
    const { id } = req.params;
    // Use Firebase user id in Firebase-auth protected route
    const userId = (req as any).firebaseUser.uid;
    
    // Check if user has access to this company
    const userCompanies = await storage.getCompaniesByUserId(userId);
    const hasAccess = userCompanies.some(company => company.id === id);
    
    if (!hasAccess) {
      return notFound(res, "Company not found");
    }
    
    // Sanitize payload and validate
    const payload = ((): any => {
      const u = normalize(req.body || {});
      delete (u as any).id;
      delete (u as any).firebase_user_id;
      return u;
    })();
    
    // Allow parent_company_id to be updated
    if (payload.parent_company_id === "") {
      payload.parent_company_id = null;
    }

    const validatedData = insertCompanySchema.partial().parse(payload);
    const company = await storage.updateCompany(id, validatedData);
    
    if (!company) {
      return notFound(res, "Company not found");
    }
    
    res.json(company);
  } catch (error: any) {
    if (error.name === "ZodError") {
      const validationError = fromZodError(error);
      return badRequest(res, validationError.message);
    } else {
      console.error("Error updating company:", error);
      return serverError(res, "Failed to update company");
    }
  }
});

router.delete("/companies/:id", requireFirebaseAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).session?.userId || (req as any).firebaseUser?.uid;
    
    // Check if user has access to this company
    // Note: If using session, userId is internal ID. If using firebase, it's UID.
    // storage.getCompaniesByUserId handles UID. For internal ID we might need another method or ensure mapping.
    // The original code used (req as any).session.userId. 
    // But requireFirebaseAuth populates req.firebaseUser.
    // Let's stick to the original logic but adapted.
    
    // Original code: const userId = (req as any).session.userId;
    // But the route used requireFirebaseAuth.
    // Wait, in routes.ts: app.delete("/api/companies/:id", requireFirebaseAuth, ...
    // And inside: const userId = (req as any).session.userId;
    // This looks like a bug in the original code if requireFirebaseAuth doesn't set session.
    // requireFirebaseAuth sets req.firebaseUser.
    // Let's assume we should use req.firebaseUser.uid here as well.
    
    const uid = (req as any).firebaseUser.uid;
    const userCompanies = await storage.getCompaniesByUserId(uid);
    const hasAccess = userCompanies.some(company => company.id === id);
    
    if (!hasAccess) {
      return notFound(res, "Company not found");
    }
    
    // Don't allow deleting the currently active company (if session exists)
    if ((req as any).session?.companyId === id) {
      return badRequest(res, "Cannot delete the currently active company. Please switch companies first.");
    }
    
    await storage.deleteCompany(id);
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting company:", error);
    return serverError(res, "Failed to delete company");
  }
});

// REMOVED: /companies/:id/link endpoint was a security risk
// Users should only access companies already linked to their Firebase UID
// Linking companies should be done during onboarding only

// === COMPANY SETTINGS (General Settings Page) ===

// Helper function to convert fiscal year month number to name
const monthNumberToName = (num: number | string): string => {
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 
                  'july', 'august', 'september', 'october', 'november', 'december'];
  const n = typeof num === 'string' ? parseInt(num) : num;
  return months[(n - 1) % 12] || 'january';
};

// Helper function to convert fiscal year month name to number
const monthNameToNumber = (name: string): number => {
  const months: Record<string, number> = {
    january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
    july: 7, august: 8, september: 9, october: 10, november: 11, december: 12
  };
  return months[name.toLowerCase()] || 1;
};

router.get("/settings/company", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    if (!companyId) {
      return badRequest(res, "No company context");
    }
    const company = await storage.getCompanyById(companyId);
    if (!company) {
      return notFound(res, "Company not found");
    }
    
    // Get address as string if it's an object
    const addressStr = typeof company.address === 'object' && company.address 
      ? (company.address as any).street || JSON.stringify(company.address)
      : company.address || '';
    
    // Return all settings fields
    res.json({
      // Company info
      name: company.name || '',
      company_name: company.name || '',
      legal_name: company.legal_name || '',
      tax_number: company.tax_number || '',
      registration_number: company.registration_number || '',
      email: company.email || '',
      phone: company.phone || '',
      address: addressStr,
      city: company.city || '',
      zip: company.zip || company.zip_code || '',
      country: company.country || '',
      
      // Regional settings
      base_currency: company.base_currency || 'AED',
      timezone: company.timezone || 'Asia/Dubai',
      fiscal_year_start: monthNumberToName(company.fiscal_year_start || 1),
      date_format: company.date_format || 'DD/MM/YYYY',
      number_format: company.number_format || '1,234.56',
      
      // Invoice settings
      invoice_prefix: company.invoice_prefix || 'INV-',
      next_invoice_number: company.next_invoice_number || 1001,
      payment_terms_days: company.payment_terms_days || 30,
      default_tax_rate: company.default_tax_rate || '5.00',
      
      // Quotation settings
      quote_prefix: company.quote_prefix || 'QT-',
      next_quote_number: company.next_quote_number || 1001,
      quote_validity_days: company.quote_validity_days || 30,
      
      // Notification settings
      email_notifications: company.email_notifications ?? true,
      sms_notifications: company.sms_notifications ?? false,
      invoice_reminders: company.invoice_reminders ?? true,
      payment_alerts: company.payment_alerts ?? true,
      low_stock_alerts: company.low_stock_alerts ?? true,
      
      // Security settings
      two_factor_required: company.two_factor_required ?? false,
      session_timeout_minutes: company.session_timeout_minutes || 30,
      password_expiry_days: company.password_expiry_days || 90,
      ip_restriction_enabled: company.ip_restriction_enabled ?? false,
    });
  } catch (error: any) {
    console.error('Error fetching company settings:', error);
    return serverError(res, 'Failed to fetch company settings');
  }
});

router.put("/settings/company", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    if (!companyId) {
      return badRequest(res, "No company context");
    }
    
    const body = req.body || {};
    
    // Map settings to company fields
    const updateData: Record<string, any> = {};
    
    // Company info
    if (body.name !== undefined) updateData.name = body.name;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.zip !== undefined) updateData.zip = body.zip;
    if (body.country !== undefined) updateData.country = body.country;
    
    // Regional settings
    if (body.base_currency !== undefined) updateData.base_currency = body.base_currency;
    if (body.timezone !== undefined) updateData.timezone = body.timezone;
    // Convert month name to number for fiscal_year_start
    if (body.fiscal_year_start !== undefined) {
      updateData.fiscal_year_start = monthNameToNumber(body.fiscal_year_start);
    }
    if (body.date_format !== undefined) updateData.date_format = body.date_format;
    if (body.number_format !== undefined) updateData.number_format = body.number_format;
    
    // Invoice settings
    if (body.invoice_prefix !== undefined) updateData.invoice_prefix = body.invoice_prefix;
    if (body.next_invoice_number !== undefined) updateData.next_invoice_number = parseInt(body.next_invoice_number);
    if (body.payment_terms_days !== undefined) updateData.payment_terms_days = parseInt(body.payment_terms_days);
    if (body.default_tax_rate !== undefined) updateData.default_tax_rate = body.default_tax_rate;
    
    // Quotation settings
    if (body.quote_prefix !== undefined) updateData.quote_prefix = body.quote_prefix;
    if (body.next_quote_number !== undefined) updateData.next_quote_number = parseInt(body.next_quote_number);
    if (body.quote_validity_days !== undefined) updateData.quote_validity_days = parseInt(body.quote_validity_days);
    
    // Notification settings
    if (body.email_notifications !== undefined) updateData.email_notifications = Boolean(body.email_notifications);
    if (body.sms_notifications !== undefined) updateData.sms_notifications = Boolean(body.sms_notifications);
    if (body.invoice_reminders !== undefined) updateData.invoice_reminders = Boolean(body.invoice_reminders);
    if (body.payment_alerts !== undefined) updateData.payment_alerts = Boolean(body.payment_alerts);
    if (body.low_stock_alerts !== undefined) updateData.low_stock_alerts = Boolean(body.low_stock_alerts);
    
    // Security settings
    if (body.two_factor_required !== undefined) updateData.two_factor_required = Boolean(body.two_factor_required);
    if (body.session_timeout_minutes !== undefined) updateData.session_timeout_minutes = parseInt(body.session_timeout_minutes);
    if (body.password_expiry_days !== undefined) updateData.password_expiry_days = parseInt(body.password_expiry_days);
    if (body.ip_restriction_enabled !== undefined) updateData.ip_restriction_enabled = Boolean(body.ip_restriction_enabled);
    
    const company = await storage.updateCompany(companyId, updateData as any);
    
    if (!company) {
      return notFound(res, "Company not found");
    }
    
    res.json({ success: true, company });
  } catch (error: any) {
    console.error('Error updating company settings:', error);
    return serverError(res, 'Failed to update company settings');
  }
});

// === LANGUAGE SETTINGS ===

router.get("/settings/language", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).session.userId;
    const companyId = (req as any).session.companyId;
    const user = await storage.getUser(userId);
    const company = await storage.getCompanyById(companyId);

    // Provide a minimal, sensible default response
    res.json({
      selectedLanguage: user?.language || 'en',
      defaultLanguage: user?.language || 'en',
      fallbackLanguage: 'en',
      autoDetect: true,
      dateFormatByLanguage: true,
      currencyByLanguage: true,
      dateFormat: company?.date_format || 'dd/MM/yyyy',
      numberFormat: company?.number_format || '1,234.56',
    });
  } catch (error: any) {
    console.error('Error fetching language settings:', error);
    return serverError(res, 'Failed to fetch language settings');
  }
});

router.put("/settings/language", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).session.userId;
    const companyId = (req as any).session.companyId;
    const { selectedLanguage, dateFormat, numberFormat } = req.body || {};

    // Update user language if provided
    if (selectedLanguage) {
      await storage.updateUser(userId, { language: String(selectedLanguage) });
    }

    // Optionally update company formats if provided
    if (dateFormat || numberFormat) {
      await storage.updateCompany(companyId, {
        ...(dateFormat ? { date_format: String(dateFormat) } : {}),
        ...(numberFormat ? { number_format: String(numberFormat) } : {}),
      } as any);
    }

    // Return updated settings
    const user = await storage.getUser(userId);
    const company = await storage.getCompanyById(companyId);
    res.json({
      selectedLanguage: user?.language || 'en',
      defaultLanguage: user?.language || 'en',
      fallbackLanguage: 'en',
      autoDetect: true,
      dateFormatByLanguage: true,
      currencyByLanguage: true,
      dateFormat: company?.date_format || 'dd/MM/yyyy',
      numberFormat: company?.number_format || '1,234.56',
    });
  } catch (error: any) {
    console.error('Error updating language settings:', error);
    return serverError(res, 'Failed to update language settings');
  }
});

// === TAXES ===

router.get("/taxes", requireAuth, async (req, res) => {
  try {
    // Use company from session
    const companyId = (req as any).session.companyId;
    if (!companyId) {
      // No company context yet (e.g. onboarding) — return empty list so UI doesn't crash
      return res.json([]);
    }
    const taxes = await storage.getTaxesByCompany(companyId);
    res.json(taxes);
  } catch (error: any) {
    const msg = String(error?.message || "");
    // If taxes table is missing (fresh DB), return empty list instead of 500
    if (msg.includes("relation \"taxes\" does not exist") || error?.code === '42P01') {
      return res.json([]);
    }
    // Log rich context on the server so we can diagnose root cause
    console.error("Error fetching taxes:", {
      message: msg,
      code: error?.code,
      name: error?.name,
    });
    // Production hotfix: never break the UI because of taxes read issues
    // Return an empty list and allow the rest of the page to load
    if (process.env.NODE_ENV === 'production') {
      return res.json([]);
    }
    // In non-production, surface a clear error to aid debugging
    return serverError(res, "Failed to fetch taxes");
  }
});

router.get("/taxes/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).session.companyId;
    const tax = await storage.getTaxById(id);
    if (!tax) return notFound(res, "Tax not found");
    if (companyId && (tax as any).company_id && (tax as any).company_id !== companyId) {
      return notFound(res, "Tax not found");
    }
    res.json(tax);
  } catch (error: any) {
    const msg = String(error?.message || "");
    if (msg.includes("relation \"taxes\" does not exist") || error?.code === '42P01') {
      return notFound(res, "Tax not found");
    }
    console.error("Error fetching tax:", error);
    return serverError(res, "Failed to fetch tax");
  }
});

// Create a new tax
router.post("/taxes", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    if (!companyId) {
      return badRequest(res, "No company context");
    }
    
    const { code, name, rate, tax_type, calculation_type, jurisdiction, effective_from, is_active } = req.body;
    
    if (!name || rate === undefined) {
      return badRequest(res, "Name and rate are required");
    }
    
    const taxData = {
      company_id: companyId,
      code: code || `TAX-${Date.now()}`,
      name,
      rate: String(rate),
      tax_type: tax_type || 'vat',
      calculation_type: calculation_type || 'exclusive',
      jurisdiction: jurisdiction || null,
      effective_from: effective_from ? new Date(effective_from) : new Date(),
      is_active: is_active !== false,
    };
    
    const newTax = await storage.createTax(taxData);
    res.status(201).json(newTax);
  } catch (error: any) {
    console.error("Error creating tax:", error);
    return serverError(res, "Failed to create tax");
  }
});

// Update a tax
router.put("/taxes/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).session.companyId;
    
    // Verify tax exists and belongs to company
    const existingTax = await storage.getTaxById(id);
    if (!existingTax) {
      return notFound(res, "Tax not found");
    }
    if (companyId && (existingTax as any).company_id && (existingTax as any).company_id !== companyId) {
      return notFound(res, "Tax not found");
    }
    
    // Strip sensitive fields and prepare update
    const { id: _id, company_id: _cid, created_at: _cat, ...updateData } = req.body;
    
    // Coerce rate to string if provided as number
    if (updateData.rate !== undefined && typeof updateData.rate === 'number') {
      updateData.rate = String(updateData.rate);
    }
    
    const updatedTax = await storage.updateTax(id, updateData);
    res.json(updatedTax);
  } catch (error: any) {
    console.error("Error updating tax:", error);
    return serverError(res, "Failed to update tax");
  }
});

// Delete a tax
router.delete("/taxes/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).session.companyId;
    
    // Verify tax exists and belongs to company
    const existingTax = await storage.getTaxById(id);
    if (!existingTax) {
      return notFound(res, "Tax not found");
    }
    if (companyId && (existingTax as any).company_id && (existingTax as any).company_id !== companyId) {
      return notFound(res, "Tax not found");
    }
    
    await storage.deleteTax(id);
    res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting tax:", error);
    return serverError(res, "Failed to delete tax");
  }
});

// === WAREHOUSES ===

router.get("/warehouses", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    const warehouses = await storage.getWarehousesByCompany(companyId);
    res.json(warehouses);
  } catch (error: any) {
    console.error("Error fetching warehouses:", error);
    return serverError(res, "Failed to fetch warehouses");
  }
});

// === DEFAULT ACCOUNTS SETTINGS ===

router.get("/settings/default-accounts", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    if (!companyId) {
      return badRequest(res, "No company context");
    }
    
    const company = await storage.getCompanyById(companyId);
    if (!company) {
      return notFound(res, "Company not found");
    }
    
    // Return default account settings
    res.json({
      default_sales_account_id: (company as any).default_sales_account_id || null,
      default_purchase_account_id: (company as any).default_purchase_account_id || null,
      default_inventory_account_id: (company as any).default_inventory_account_id || null,
      default_receivable_account_id: (company as any).default_receivable_account_id || null,
      default_payable_account_id: (company as any).default_payable_account_id || null,
      default_bank_account_id: (company as any).default_bank_account_id || null,
      default_cash_account_id: (company as any).default_cash_account_id || null,
      default_expense_account_id: (company as any).default_expense_account_id || null,
    });
  } catch (error: any) {
    console.error('Error fetching default accounts settings:', error);
    return serverError(res, 'Failed to fetch default accounts settings');
  }
});

router.put("/settings/default-accounts", requireAuth, async (req, res) => {
  try {
    const companyId = (req as any).session.companyId;
    if (!companyId) {
      return badRequest(res, "No company context");
    }
    
    const body = req.body || {};
    
    // Map settings to company fields
    const updateData: Record<string, any> = {};
    
    if (body.default_sales_account_id !== undefined) {
      updateData.default_sales_account_id = body.default_sales_account_id || null;
    }
    if (body.default_purchase_account_id !== undefined) {
      updateData.default_purchase_account_id = body.default_purchase_account_id || null;
    }
    if (body.default_inventory_account_id !== undefined) {
      updateData.default_inventory_account_id = body.default_inventory_account_id || null;
    }
    if (body.default_receivable_account_id !== undefined) {
      updateData.default_receivable_account_id = body.default_receivable_account_id || null;
    }
    if (body.default_payable_account_id !== undefined) {
      updateData.default_payable_account_id = body.default_payable_account_id || null;
    }
    if (body.default_bank_account_id !== undefined) {
      updateData.default_bank_account_id = body.default_bank_account_id || null;
    }
    if (body.default_cash_account_id !== undefined) {
      updateData.default_cash_account_id = body.default_cash_account_id || null;
    }
    if (body.default_expense_account_id !== undefined) {
      updateData.default_expense_account_id = body.default_expense_account_id || null;
    }
    
    const company = await storage.updateCompany(companyId, updateData as any);
    
    if (!company) {
      return notFound(res, "Company not found");
    }
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error updating default accounts settings:', error);
    return serverError(res, 'Failed to update default accounts settings');
  }
});

export default router;
// Trigger rebuild Sat Nov 29 14:58:34 +04 2025
