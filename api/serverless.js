var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc26) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc26 = __getOwnPropDesc(from, key)) || desc26.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  accounts: () => accounts,
  accountsRelations: () => accountsRelations,
  aiFeedbackRelations: () => aiFeedbackRelations,
  ai_consent: () => ai_consent,
  ai_feedback: () => ai_feedback,
  ai_providers: () => ai_providers,
  api_keys: () => api_keys,
  approval_request_actions: () => approval_request_actions,
  approval_requests: () => approval_requests,
  approval_workflow_steps: () => approval_workflow_steps,
  approval_workflows: () => approval_workflows,
  asset_depreciation_entries: () => asset_depreciation_entries,
  attachments: () => attachments,
  auditLogsRelations: () => auditLogsRelations,
  audit_logs: () => audit_logs,
  bankAccountsRelations: () => bankAccountsRelations,
  bankStatementLinesRelations: () => bankStatementLinesRelations,
  bank_accounts: () => bank_accounts,
  bank_reconciliation_items: () => bank_reconciliation_items,
  bank_reconciliations: () => bank_reconciliations,
  bank_statement_lines: () => bank_statement_lines,
  batches: () => batches,
  batchesRelations: () => batchesRelations,
  bills: () => bills,
  billsRelations: () => billsRelations,
  budgets: () => budgets,
  budgetsRelations: () => budgetsRelations,
  checks: () => checks,
  companies: () => companies,
  companiesRelations: () => companiesRelations,
  contactPortalUsersRelations: () => contactPortalUsersRelations,
  contact_portal_users: () => contact_portal_users,
  contacts: () => contacts,
  contactsRelations: () => contactsRelations,
  cost_centers: () => cost_centers,
  currencies: () => currencies,
  departments: () => departments,
  documentLinesRelations: () => documentLinesRelations,
  document_lines: () => document_lines,
  document_sequences: () => document_sequences,
  employees: () => employees,
  exchange_rates: () => exchange_rates,
  expenses: () => expenses,
  expensesRelations: () => expensesRelations,
  fiscal_periods: () => fiscal_periods,
  fixed_assets: () => fixed_assets,
  insertAIConsentSchema: () => insertAIConsentSchema,
  insertAIFeedbackSchema: () => insertAIFeedbackSchema,
  insertAIProviderSchema: () => insertAIProviderSchema,
  insertAccountSchema: () => insertAccountSchema,
  insertApprovalRequestActionSchema: () => insertApprovalRequestActionSchema,
  insertApprovalRequestSchema: () => insertApprovalRequestSchema,
  insertApprovalWorkflowSchema: () => insertApprovalWorkflowSchema,
  insertApprovalWorkflowStepSchema: () => insertApprovalWorkflowStepSchema,
  insertAssetDepreciationEntrySchema: () => insertAssetDepreciationEntrySchema,
  insertBankAccountSchema: () => insertBankAccountSchema,
  insertBankStatementLineSchema: () => insertBankStatementLineSchema,
  insertBillSchema: () => insertBillSchema,
  insertBudgetSchema: () => insertBudgetSchema,
  insertCheckSchema: () => insertCheckSchema,
  insertCompanySchema: () => insertCompanySchema,
  insertContactPortalUserSchema: () => insertContactPortalUserSchema,
  insertContactSchema: () => insertContactSchema,
  insertCostCenterSchema: () => insertCostCenterSchema,
  insertCurrencySchema: () => insertCurrencySchema,
  insertDepartmentSchema: () => insertDepartmentSchema,
  insertDocumentSequenceSchema: () => insertDocumentSequenceSchema,
  insertEmployeeSchema: () => insertEmployeeSchema,
  insertExchangeRateSchema: () => insertExchangeRateSchema,
  insertExpenseSchema: () => insertExpenseSchema,
  insertFiscalPeriodSchema: () => insertFiscalPeriodSchema,
  insertFixedAssetSchema: () => insertFixedAssetSchema,
  insertInventoryBatchSchema: () => insertInventoryBatchSchema,
  insertInventorySerialSchema: () => insertInventorySerialSchema,
  insertItemSchema: () => insertItemSchema,
  insertLandedCostBillSchema: () => insertLandedCostBillSchema,
  insertLandedCostItemSchema: () => insertLandedCostItemSchema,
  insertLandedCostVoucherSchema: () => insertLandedCostVoucherSchema,
  insertLegalConsentLogSchema: () => insertLegalConsentLogSchema,
  insertManufacturingBomItemSchema: () => insertManufacturingBomItemSchema,
  insertManufacturingBomSchema: () => insertManufacturingBomSchema,
  insertPaymentAllocationSchema: () => insertPaymentAllocationSchema,
  insertPaymentSchema: () => insertPaymentSchema,
  insertPayrollRunSchema: () => insertPayrollRunSchema,
  insertPayslipSchema: () => insertPayslipSchema,
  insertProductionOrderSchema: () => insertProductionOrderSchema,
  insertProjectSchema: () => insertProjectSchema,
  insertPurchaseDebitNoteSchema: () => insertPurchaseDebitNoteSchema,
  insertPurchaseOrderSchema: () => insertPurchaseOrderSchema,
  insertReceiptSchema: () => insertReceiptSchema,
  insertRecurringTemplateSchema: () => insertRecurringTemplateSchema,
  insertRolePermissionSchema: () => insertRolePermissionSchema,
  insertSalesCreditNoteSchema: () => insertSalesCreditNoteSchema,
  insertSalesInvoiceSchema: () => insertSalesInvoiceSchema,
  insertSalesOrderSchema: () => insertSalesOrderSchema,
  insertStockMovementSchema: () => insertStockMovementSchema,
  insertTaxSchema: () => insertTaxSchema,
  insertUserPermissionSchema: () => insertUserPermissionSchema,
  insertUserSchema: () => insertUserSchema,
  insertWarehouseSchema: () => insertWarehouseSchema,
  inventory_batches: () => inventory_batches,
  inventory_serials: () => inventory_serials,
  items: () => items,
  itemsRelations: () => itemsRelations,
  journalLinesRelations: () => journalLinesRelations,
  journal_lines: () => journal_lines,
  journal_lines_archive: () => journal_lines_archive,
  journals: () => journals,
  journalsRelations: () => journalsRelations,
  journals_archive: () => journals_archive,
  landedCostBillsRelations: () => landedCostBillsRelations,
  landedCostItemsRelations: () => landedCostItemsRelations,
  landedCostVouchersRelations: () => landedCostVouchersRelations,
  landed_cost_bills: () => landed_cost_bills,
  landed_cost_items: () => landed_cost_items,
  landed_cost_vouchers: () => landed_cost_vouchers,
  legal_consent_logs: () => legal_consent_logs,
  loginSchema: () => loginSchema,
  manufacturing_bom_items: () => manufacturing_bom_items,
  manufacturing_boms: () => manufacturing_boms,
  payment_allocations: () => payment_allocations,
  payments: () => payments,
  paymentsRelations: () => paymentsRelations,
  payroll_runs: () => payroll_runs,
  payslips: () => payslips,
  production_orders: () => production_orders,
  projectPhasesRelations: () => projectPhasesRelations,
  projectTasksRelations: () => projectTasksRelations,
  projectTimeEntriesRelations: () => projectTimeEntriesRelations,
  project_phases: () => project_phases,
  project_tasks: () => project_tasks,
  project_time_entries: () => project_time_entries,
  projects: () => projects,
  projectsRelations: () => projectsRelations,
  purchaseDebitNotesRelations: () => purchaseDebitNotesRelations,
  purchaseOrdersRelations: () => purchaseOrdersRelations,
  purchase_debit_notes: () => purchase_debit_notes,
  purchase_orders: () => purchase_orders,
  receipts: () => receipts,
  receiptsRelations: () => receiptsRelations,
  recurringTemplatesRelations: () => recurringTemplatesRelations,
  recurring_templates: () => recurring_templates,
  registrationSchema: () => registrationSchema,
  role_permissions: () => role_permissions,
  salesCreditNotesRelations: () => salesCreditNotesRelations,
  salesInvoicesRelations: () => salesInvoicesRelations,
  salesOrdersRelations: () => salesOrdersRelations,
  salesQuotesRelations: () => salesQuotesRelations,
  sales_credit_notes: () => sales_credit_notes,
  sales_invoices: () => sales_invoices,
  sales_orders: () => sales_orders,
  sales_quotes: () => sales_quotes,
  session: () => session,
  stockMovementsRelations: () => stockMovementsRelations,
  stockTransferItemsRelations: () => stockTransferItemsRelations,
  stockTransfersRelations: () => stockTransfersRelations,
  stock_movements: () => stock_movements,
  stock_transfer_items: () => stock_transfer_items,
  stock_transfers: () => stock_transfers,
  taxes: () => taxes,
  taxesRelations: () => taxesRelations,
  userPermissionsRelations: () => userPermissionsRelations,
  user_permissions: () => user_permissions,
  users: () => users,
  usersRelations: () => usersRelations,
  warehouses: () => warehouses,
  warehousesRelations: () => warehousesRelations
});
import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, integer, boolean, jsonb, foreignKey, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var session, currencies, exchange_rates, companies, users, api_keys, user_permissions, accounts, taxes, contacts, contact_portal_users, items, warehouses, batches, stock_transfers, stock_transfer_items, bank_accounts, bank_statement_lines, bank_reconciliations, bank_reconciliation_items, cost_centers, journals, journal_lines, journals_archive, journal_lines_archive, sales_quotes, sales_orders, sales_invoices, document_lines, purchase_orders, bills, expenses, payments, receipts, sales_credit_notes, purchase_debit_notes, fixed_assets, asset_depreciation_entries, projects, project_phases, project_tasks, project_time_entries, attachments, audit_logs, stock_movements, payment_allocations, document_sequences, fiscal_periods, recurring_templates, budgets, ai_feedback, ai_providers, ai_consent, legal_consent_logs, role_permissions, insertRolePermissionSchema, insertFixedAssetSchema, insertAssetDepreciationEntrySchema, insertProjectSchema, insertWarehouseSchema, insertBankAccountSchema, insertBankStatementLineSchema, insertStockMovementSchema, insertPaymentAllocationSchema, insertDocumentSequenceSchema, insertFiscalPeriodSchema, insertRecurringTemplateSchema, insertBudgetSchema, insertAIFeedbackSchema, insertAIProviderSchema, insertLegalConsentLogSchema, insertAIConsentSchema, manufacturing_boms, manufacturing_bom_items, production_orders, inventory_batches, inventory_serials, landed_cost_vouchers, landed_cost_bills, landed_cost_items, departments, employees, payroll_runs, payslips, checks, approval_workflows, approval_workflow_steps, approval_requests, approval_request_actions, insertManufacturingBomSchema, insertManufacturingBomItemSchema, insertProductionOrderSchema, insertInventoryBatchSchema, insertInventorySerialSchema, insertLandedCostVoucherSchema, insertLandedCostBillSchema, insertLandedCostItemSchema, insertDepartmentSchema, insertEmployeeSchema, insertPayrollRunSchema, insertPayslipSchema, insertCheckSchema, insertCompanySchema, insertUserSchema, loginSchema, registrationSchema, insertCostCenterSchema, insertApprovalWorkflowSchema, insertApprovalWorkflowStepSchema, insertApprovalRequestSchema, insertApprovalRequestActionSchema, insertUserPermissionSchema, insertAccountSchema, insertTaxSchema, insertContactSchema, insertItemSchema, insertSalesInvoiceSchema, insertSalesOrderSchema, insertBillSchema, insertExpenseSchema, insertPaymentSchema, insertReceiptSchema, insertPurchaseOrderSchema, insertSalesCreditNoteSchema, insertPurchaseDebitNoteSchema, insertCurrencySchema, insertExchangeRateSchema, insertContactPortalUserSchema, companiesRelations, usersRelations, userPermissionsRelations, accountsRelations, taxesRelations, itemsRelations, warehousesRelations, bankAccountsRelations, bankStatementLinesRelations, salesInvoicesRelations, salesQuotesRelations, salesOrdersRelations, purchaseOrdersRelations, billsRelations, expensesRelations, paymentsRelations, receiptsRelations, salesCreditNotesRelations, purchaseDebitNotesRelations, documentLinesRelations, auditLogsRelations, recurringTemplatesRelations, aiFeedbackRelations, contactPortalUsersRelations, contactsRelations, journalsRelations, journalLinesRelations, stockTransfersRelations, batchesRelations, stockTransferItemsRelations, stockMovementsRelations, budgetsRelations, landedCostVouchersRelations, landedCostBillsRelations, landedCostItemsRelations, projectsRelations, projectPhasesRelations, projectTasksRelations, projectTimeEntriesRelations;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    session = pgTable("session", {
      sid: varchar("sid").primaryKey(),
      sess: jsonb("sess").notNull(),
      expire: timestamp("expire", { precision: 6 }).notNull()
    });
    currencies = pgTable("currencies", {
      code: varchar("code", { length: 3 }).primaryKey(),
      // USD, EUR, SAR, etc
      name: text("name").notNull(),
      symbol: text("symbol").notNull(),
      is_active: boolean("is_active").notNull().default(true)
    });
    exchange_rates = pgTable("exchange_rates", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      from_currency: varchar("from_currency", { length: 3 }).notNull().references(() => currencies.code),
      to_currency: varchar("to_currency", { length: 3 }).notNull().references(() => currencies.code),
      rate: decimal("rate", { precision: 15, scale: 6 }).notNull(),
      date: timestamp("date").notNull(),
      source: text("source"),
      // manual, api, etc
      created_by: varchar("created_by").references(() => users.id),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    companies = pgTable("companies", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      legal_name: text("legal_name"),
      tax_number: text("tax_number"),
      registration_number: text("registration_number"),
      logo_url: text("logo_url"),
      address: jsonb("address"),
      contacts: jsonb("contacts"),
      // phone, email, etc
      country: text("country").default("United Arab Emirates"),
      city: text("city"),
      zip: text("zip"),
      zip_code: text("zip_code"),
      email: text("email"),
      phone: text("phone"),
      base_currency: varchar("base_currency", { length: 3 }).notNull().default("USD"),
      fiscal_year_start: integer("fiscal_year_start").notNull().default(1),
      // 1=Jan, 4=Apr, etc
      date_format: text("date_format").notNull().default("DD/MM/YYYY"),
      timezone: text("timezone").notNull().default("Asia/Dubai"),
      number_format: text("number_format").notNull().default("1,234.56"),
      declaration_text: text("declaration_text"),
      firebase_user_id: text("firebase_user_id"),
      // Firebase UID for linking to Firebase users
      parent_company_id: varchar("parent_company_id"),
      // For multi-entity structure
      // Invoice settings
      invoice_prefix: text("invoice_prefix").default("INV-"),
      next_invoice_number: integer("next_invoice_number").default(1),
      payment_terms_days: integer("payment_terms_days").default(30),
      default_tax_rate: decimal("default_tax_rate", { precision: 5, scale: 2 }).default("5.00"),
      // Notification settings
      email_notifications: boolean("email_notifications").default(true),
      sms_notifications: boolean("sms_notifications").default(false),
      invoice_reminders: boolean("invoice_reminders").default(true),
      payment_alerts: boolean("payment_alerts").default(true),
      low_stock_alerts: boolean("low_stock_alerts").default(true),
      // Security settings
      two_factor_required: boolean("two_factor_required").default(false),
      session_timeout_minutes: integer("session_timeout_minutes").default(480),
      // 8 hours
      password_expiry_days: integer("password_expiry_days").default(365),
      ip_restriction_enabled: boolean("ip_restriction_enabled").default(false),
      allowed_ips: jsonb("allowed_ips").default([]),
      // Default accounts for accounting integration
      default_sales_account_id: varchar("default_sales_account_id"),
      default_purchase_account_id: varchar("default_purchase_account_id"),
      default_inventory_account_id: varchar("default_inventory_account_id"),
      default_receivable_account_id: varchar("default_receivable_account_id"),
      default_payable_account_id: varchar("default_payable_account_id"),
      default_bank_account_id: varchar("default_bank_account_id"),
      default_cash_account_id: varchar("default_cash_account_id"),
      default_expense_account_id: varchar("default_expense_account_id"),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    }, (table) => ({
      parentCompanyFk: foreignKey({
        columns: [table.parent_company_id],
        foreignColumns: [table.id]
      }),
      parentCompanyIdx: index("companies_parent_company_idx").on(table.parent_company_id)
    }));
    users = pgTable("users", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      username: text("username").notNull().unique(),
      email: text("email").notNull().unique(),
      password_hash: text("password_hash").notNull(),
      full_name: text("full_name").notNull(),
      role: text("role").notNull().default("viewer"),
      // owner, accountant, sales, viewer
      language: text("language").notNull().default("en"),
      timezone: text("timezone").notNull().default("UTC"),
      theme: text("theme").notNull().default("auto"),
      // light, dark, auto
      is_active: boolean("is_active").notNull().default(true),
      legal_consent_accepted: boolean("legal_consent_accepted").notNull().default(false),
      legal_consent_date: timestamp("legal_consent_date"),
      legal_consent_version: text("legal_consent_version"),
      last_login_at: timestamp("last_login_at"),
      two_factor_secret: text("two_factor_secret"),
      // Base32 secret for TOTP
      two_factor_enabled: boolean("two_factor_enabled").notNull().default(false),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    }, (table) => ({
      companyIdx: index("users_company_idx").on(table.company_id),
      emailIdx: index("users_email_idx").on(table.email),
      usernameIdx: index("users_username_idx").on(table.username)
    }));
    api_keys = pgTable("api_keys", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      name: text("name").notNull(),
      // e.g., "Zapier Integration"
      key_hash: text("key_hash").notNull(),
      // Store hashed key, never plain text
      prefix: text("prefix").notNull(),
      // Store first few chars for display
      scopes: jsonb("scopes").notNull().default([]),
      // ["read:journals", "write:invoices"]
      last_used_at: timestamp("last_used_at"),
      expires_at: timestamp("expires_at"),
      is_active: boolean("is_active").notNull().default(true),
      created_by: varchar("created_by").references(() => users.id),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    user_permissions = pgTable("user_permissions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      user_id: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      module: text("module").notNull(),
      // dashboard, sales, purchases, banking, reports, settings, accounts, contacts, items
      can_view: boolean("can_view").notNull().default(false),
      can_create: boolean("can_create").notNull().default(false),
      can_edit: boolean("can_edit").notNull().default(false),
      can_delete: boolean("can_delete").notNull().default(false),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    accounts = pgTable("accounts", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      code: text("code").notNull(),
      name: text("name").notNull(),
      name_ar: text("name_ar"),
      // Arabic name for bilingual display
      account_type: text("account_type").notNull(),
      // asset, liability, equity, revenue, expense
      account_subtype: text("account_subtype").notNull(),
      // current_asset, fixed_asset, current_liability, etc
      parent_id: varchar("parent_id"),
      is_system: boolean("is_system").notNull().default(false),
      is_active: boolean("is_active").notNull().default(true),
      description: text("description"),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    }, (table) => ({
      companyIdx: index("accounts_company_idx").on(table.company_id),
      codeIdx: index("accounts_code_idx").on(table.code),
      parentIdIdx: index("accounts_parent_id_idx").on(table.parent_id)
    }));
    taxes = pgTable("taxes", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      code: text("code").notNull(),
      name: text("name").notNull(),
      rate: decimal("rate", { precision: 10, scale: 4 }).notNull(),
      tax_type: text("tax_type").notNull(),
      // vat, sales_tax, corporate_tax, withholding, custom
      calculation_type: text("calculation_type").notNull(),
      // inclusive, exclusive
      liability_account_id: varchar("liability_account_id").references(() => accounts.id),
      jurisdiction: text("jurisdiction"),
      // Optional threshold settings (global, user-defined)
      threshold_amount: decimal("threshold_amount", { precision: 15, scale: 2 }),
      threshold_period: text("threshold_period"),
      // annual, monthly, rolling12 (free text allowed)
      threshold_applies_to: text("threshold_applies_to"),
      // turnover, income, other
      effective_from: timestamp("effective_from").notNull(),
      effective_to: timestamp("effective_to"),
      is_active: boolean("is_active").notNull().default(true),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    contacts = pgTable("contacts", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      type: text("type").notNull(),
      // customer, supplier, both
      code: text("code"),
      name: text("name").notNull(),
      display_name: text("display_name"),
      email: text("email"),
      phone: text("phone"),
      website: text("website"),
      tax_number: text("tax_number"),
      registration_number: text("registration_number"),
      billing_address: jsonb("billing_address"),
      shipping_address: jsonb("shipping_address"),
      currency: varchar("currency", { length: 3 }).notNull().default("USD"),
      payment_terms_days: integer("payment_terms_days").notNull().default(30),
      credit_limit: decimal("credit_limit", { precision: 15, scale: 2 }),
      linked_company_id: varchar("linked_company_id"),
      // For inter-company transactions
      is_active: boolean("is_active").notNull().default(true),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    }, (table) => ({
      linkedCompanyFk: foreignKey({
        columns: [table.linked_company_id],
        foreignColumns: [companies.id]
      }),
      companyIdx: index("contacts_company_idx").on(table.company_id),
      emailIdx: index("contacts_email_idx").on(table.email),
      typeIdx: index("contacts_type_idx").on(table.type)
    }));
    contact_portal_users = pgTable("contact_portal_users", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      contact_id: varchar("contact_id").notNull().references(() => contacts.id, { onDelete: "cascade" }),
      email: text("email").notNull().unique(),
      password_hash: text("password_hash").notNull(),
      status: text("status").notNull().default("active"),
      // active, inactive
      last_login_at: timestamp("last_login_at"),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    items = pgTable("items", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      type: text("type").notNull(),
      // inventory, service
      sku: text("sku").notNull(),
      name: text("name").notNull(),
      description: text("description"),
      unit_of_measure: text("unit_of_measure").notNull().default("pcs"),
      sales_price: decimal("sales_price", { precision: 15, scale: 2 }),
      cost_price: decimal("cost_price", { precision: 15, scale: 2 }),
      stock_quantity: decimal("stock_quantity", { precision: 15, scale: 4 }).notNull().default("0"),
      reorder_level: decimal("reorder_level", { precision: 15, scale: 4 }).default("0"),
      sales_account_id: varchar("sales_account_id").references(() => accounts.id),
      cost_account_id: varchar("cost_account_id").references(() => accounts.id),
      inventory_account_id: varchar("inventory_account_id").references(() => accounts.id),
      default_tax_id: varchar("default_tax_id").references(() => taxes.id),
      is_active: boolean("is_active").notNull().default(true),
      tracking_type: text("tracking_type").notNull().default("none"),
      // none, batch, serial
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    }, (table) => ({
      companyIdx: index("items_company_idx").on(table.company_id),
      skuIdx: index("items_sku_idx").on(table.sku),
      typeIdx: index("items_type_idx").on(table.type)
    }));
    warehouses = pgTable("warehouses", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      code: text("code").notNull(),
      name: text("name").notNull(),
      location: text("location"),
      address: jsonb("address"),
      is_active: boolean("is_active").notNull().default(true),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    batches = pgTable("batches", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      item_id: varchar("item_id").notNull().references(() => items.id),
      batch_number: text("batch_number").notNull(),
      manufacturing_date: timestamp("manufacturing_date"),
      expiry_date: timestamp("expiry_date"),
      quantity: decimal("quantity", { precision: 15, scale: 4 }).notNull().default("0"),
      warehouse_id: varchar("warehouse_id").references(() => warehouses.id),
      is_active: boolean("is_active").notNull().default(true),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    stock_transfers = pgTable("stock_transfers", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      transfer_number: text("transfer_number").notNull(),
      from_warehouse_id: varchar("from_warehouse_id").notNull().references(() => warehouses.id),
      to_warehouse_id: varchar("to_warehouse_id").notNull().references(() => warehouses.id),
      date: timestamp("date").notNull(),
      status: text("status").notNull().default("draft"),
      // draft, in_transit, completed, cancelled
      notes: text("notes"),
      created_by: varchar("created_by").references(() => users.id),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    stock_transfer_items = pgTable("stock_transfer_items", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      transfer_id: varchar("transfer_id").notNull().references(() => stock_transfers.id, { onDelete: "cascade" }),
      item_id: varchar("item_id").notNull().references(() => items.id),
      batch_id: varchar("batch_id").references(() => batches.id),
      // Optional: if item is batch-tracked
      quantity: decimal("quantity", { precision: 15, scale: 4 }).notNull()
    });
    bank_accounts = pgTable("bank_accounts", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      account_id: varchar("account_id").notNull().references(() => accounts.id),
      name: text("name").notNull(),
      bank_name: text("bank_name"),
      account_number: text("account_number"),
      currency: varchar("currency", { length: 3 }).notNull().default("USD"),
      opening_balance: decimal("opening_balance", { precision: 15, scale: 2 }).notNull().default("0"),
      opening_balance_date: timestamp("opening_balance_date").notNull(),
      is_active: boolean("is_active").notNull().default(true),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    bank_statement_lines = pgTable("bank_statement_lines", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      bank_account_id: varchar("bank_account_id").references(() => bank_accounts.id),
      date: timestamp("date").notNull(),
      description: text("description"),
      reference: text("reference"),
      amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
      // positive deposit, negative withdrawal
      currency: varchar("currency", { length: 3 }).notNull().default("USD"),
      matched: boolean("matched").notNull().default(false),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    bank_reconciliations = pgTable("bank_reconciliations", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      bank_account_id: varchar("bank_account_id").notNull().references(() => bank_accounts.id, { onDelete: "cascade" }),
      reconciliation_date: timestamp("reconciliation_date").notNull(),
      statement_balance: decimal("statement_balance", { precision: 15, scale: 2 }).notNull(),
      book_balance: decimal("book_balance", { precision: 15, scale: 2 }).notNull(),
      difference: decimal("difference", { precision: 15, scale: 2 }).notNull().default("0"),
      status: text("status").notNull().default("in_progress"),
      // in_progress, completed, cancelled
      notes: text("notes"),
      created_by: varchar("created_by").references(() => users.id),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    bank_reconciliation_items = pgTable("bank_reconciliation_items", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      reconciliation_id: varchar("reconciliation_id").notNull().references(() => bank_reconciliations.id, { onDelete: "cascade" }),
      transaction_type: text("transaction_type").notNull(),
      // payment, receipt, bank_charge, bank_interest, adjustment
      transaction_id: varchar("transaction_id"),
      // Reference to payment or receipt
      amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
      transaction_date: timestamp("transaction_date").notNull(),
      description: text("description"),
      cleared: boolean("cleared").notNull().default(false),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    cost_centers = pgTable("cost_centers", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      code: text("code").notNull(),
      name: text("name").notNull(),
      parent_id: varchar("parent_id"),
      // Self-referencing for hierarchy
      is_active: boolean("is_active").notNull().default(true),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    journals = pgTable("journals", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      journal_number: text("journal_number").notNull(),
      date: timestamp("date").notNull(),
      description: text("description"),
      reference: text("reference"),
      source_type: text("source_type"),
      // invoice, bill, payment, manual, etc
      source_id: varchar("source_id"),
      total_amount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
      created_by: varchar("created_by").references(() => users.id),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    }, (table) => ({
      companyIdx: index("journals_company_idx").on(table.company_id),
      dateIdx: index("journals_date_idx").on(table.date),
      journalNumberIdx: index("journals_journal_number_idx").on(table.journal_number)
    }));
    journal_lines = pgTable("journal_lines", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      journal_id: varchar("journal_id").notNull().references(() => journals.id, { onDelete: "cascade" }),
      account_id: varchar("account_id").notNull().references(() => accounts.id),
      description: text("description"),
      debit: decimal("debit", { precision: 15, scale: 2 }).notNull().default("0"),
      credit: decimal("credit", { precision: 15, scale: 2 }).notNull().default("0"),
      currency: varchar("currency", { length: 3 }).notNull().default("USD"),
      fx_rate: decimal("fx_rate", { precision: 10, scale: 6 }).notNull().default("1"),
      base_debit: decimal("base_debit", { precision: 15, scale: 2 }).notNull().default("0"),
      base_credit: decimal("base_credit", { precision: 15, scale: 2 }).notNull().default("0"),
      project_id: varchar("project_id").references(() => projects.id),
      cost_center_id: varchar("cost_center_id").references(() => cost_centers.id)
    }, (table) => ({
      journalIdx: index("journal_lines_journal_idx").on(table.journal_id),
      accountIdx: index("journal_lines_account_idx").on(table.account_id)
    }));
    journals_archive = pgTable("journals_archive", {
      id: varchar("id").primaryKey(),
      // Keep original ID
      company_id: varchar("company_id").notNull(),
      // No FK constraint to allow detaching
      journal_number: text("journal_number").notNull(),
      date: timestamp("date").notNull(),
      description: text("description"),
      reference: text("reference"),
      source_type: text("source_type"),
      source_id: varchar("source_id"),
      total_amount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
      created_by: varchar("created_by"),
      created_at: timestamp("created_at").notNull(),
      updated_at: timestamp("updated_at").notNull(),
      archived_at: timestamp("archived_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      fiscal_year: integer("fiscal_year").notNull()
    });
    journal_lines_archive = pgTable("journal_lines_archive", {
      id: varchar("id").primaryKey(),
      // Keep original ID
      journal_id: varchar("journal_id").notNull().references(() => journals_archive.id, { onDelete: "cascade" }),
      account_id: varchar("account_id").notNull(),
      // No FK to allow account deletion if needed (though unlikely)
      description: text("description"),
      debit: decimal("debit", { precision: 15, scale: 2 }).notNull().default("0"),
      credit: decimal("credit", { precision: 15, scale: 2 }).notNull().default("0"),
      currency: varchar("currency", { length: 3 }).notNull().default("USD"),
      fx_rate: decimal("fx_rate", { precision: 10, scale: 6 }).notNull().default("1"),
      base_debit: decimal("base_debit", { precision: 15, scale: 2 }).notNull().default("0"),
      base_credit: decimal("base_credit", { precision: 15, scale: 2 }).notNull().default("0"),
      project_id: varchar("project_id"),
      cost_center_id: varchar("cost_center_id")
    });
    sales_quotes = pgTable("sales_quotes", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      quote_number: text("quote_number").notNull(),
      customer_id: varchar("customer_id").notNull().references(() => contacts.id),
      date: timestamp("date").notNull(),
      valid_until: timestamp("valid_until"),
      status: text("status").notNull().default("draft"),
      // draft, sent, accepted, rejected, expired
      currency: varchar("currency", { length: 3 }).notNull(),
      fx_rate: decimal("fx_rate", { precision: 10, scale: 6 }).notNull().default("1"),
      subtotal: decimal("subtotal", { precision: 15, scale: 2 }).notNull().default("0"),
      tax_total: decimal("tax_total", { precision: 15, scale: 2 }).notNull().default("0"),
      total: decimal("total", { precision: 15, scale: 2 }).notNull().default("0"),
      notes: text("notes"),
      created_by: varchar("created_by").references(() => users.id),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    sales_orders = pgTable("sales_orders", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      order_number: text("order_number").notNull(),
      quote_id: varchar("quote_id").references(() => sales_quotes.id),
      customer_id: varchar("customer_id").notNull().references(() => contacts.id),
      date: timestamp("date").notNull(),
      delivery_date: timestamp("delivery_date"),
      status: text("status").notNull().default("pending"),
      // pending, confirmed, shipped, delivered, cancelled
      currency: varchar("currency", { length: 3 }).notNull(),
      fx_rate: decimal("fx_rate", { precision: 10, scale: 6 }).notNull().default("1"),
      subtotal: decimal("subtotal", { precision: 15, scale: 2 }).notNull().default("0"),
      tax_total: decimal("tax_total", { precision: 15, scale: 2 }).notNull().default("0"),
      total: decimal("total", { precision: 15, scale: 2 }).notNull().default("0"),
      notes: text("notes"),
      created_by: varchar("created_by").references(() => users.id),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    sales_invoices = pgTable("sales_invoices", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      invoice_number: text("invoice_number").notNull(),
      order_id: varchar("order_id").references(() => sales_orders.id),
      customer_id: varchar("customer_id").notNull().references(() => contacts.id),
      date: timestamp("date").notNull(),
      due_date: timestamp("due_date").notNull(),
      status: text("status").notNull().default("draft"),
      // draft, sent, paid, overdue, cancelled
      currency: varchar("currency", { length: 3 }).notNull(),
      fx_rate: decimal("fx_rate", { precision: 10, scale: 6 }).notNull().default("1"),
      subtotal: decimal("subtotal", { precision: 15, scale: 2 }).notNull().default("0"),
      tax_total: decimal("tax_total", { precision: 15, scale: 2 }).notNull().default("0"),
      total: decimal("total", { precision: 15, scale: 2 }).notNull().default("0"),
      paid_amount: decimal("paid_amount", { precision: 15, scale: 2 }).notNull().default("0"),
      notes: text("notes"),
      journal_id: varchar("journal_id").references(() => journals.id),
      created_by: varchar("created_by").references(() => users.id),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    }, (table) => ({
      companyIdx: index("sales_invoices_company_idx").on(table.company_id),
      customerIdx: index("sales_invoices_customer_idx").on(table.customer_id),
      dateIdx: index("sales_invoices_date_idx").on(table.date),
      statusIdx: index("sales_invoices_status_idx").on(table.status)
    }));
    document_lines = pgTable("document_lines", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      document_type: text("document_type").notNull(),
      // quote, order, invoice, bill
      document_id: varchar("document_id").notNull(),
      item_id: varchar("item_id").references(() => items.id),
      warehouse_id: varchar("warehouse_id").references(() => warehouses.id),
      // For inventory tracking
      // Prefer line-level tax when present; falls back to item's default_tax_id otherwise
      tax_id: varchar("tax_id").references(() => taxes.id),
      // Revenue/expense account for this line item (overrides item's default account)
      account_id: varchar("account_id").references(() => accounts.id),
      description: text("description").notNull(),
      quantity: decimal("quantity", { precision: 15, scale: 4 }).notNull(),
      unit_price: decimal("unit_price", { precision: 15, scale: 2 }).notNull(),
      discount_percentage: decimal("discount_percentage", { precision: 5, scale: 2 }).notNull().default("0"),
      line_total: decimal("line_total", { precision: 15, scale: 2 }).notNull(),
      tax_amount: decimal("tax_amount", { precision: 15, scale: 2 }).notNull().default("0"),
      line_number: integer("line_number").notNull(),
      project_id: varchar("project_id").references(() => projects.id)
    });
    purchase_orders = pgTable("purchase_orders", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      po_number: text("po_number").notNull(),
      supplier_id: varchar("supplier_id").notNull().references(() => contacts.id),
      date: timestamp("date").notNull(),
      delivery_date: timestamp("delivery_date"),
      status: text("status").notNull().default("pending"),
      // pending, confirmed, received, cancelled
      currency: varchar("currency", { length: 3 }).notNull(),
      fx_rate: decimal("fx_rate", { precision: 10, scale: 6 }).notNull().default("1"),
      subtotal: decimal("subtotal", { precision: 15, scale: 2 }).notNull().default("0"),
      tax_total: decimal("tax_total", { precision: 15, scale: 2 }).notNull().default("0"),
      total: decimal("total", { precision: 15, scale: 2 }).notNull().default("0"),
      notes: text("notes"),
      created_by: varchar("created_by").references(() => users.id),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    bills = pgTable("bills", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      bill_number: text("bill_number").notNull(),
      supplier_reference: text("supplier_reference"),
      po_id: varchar("po_id").references(() => purchase_orders.id),
      supplier_id: varchar("supplier_id").notNull().references(() => contacts.id),
      date: timestamp("date").notNull(),
      due_date: timestamp("due_date").notNull(),
      status: text("status").notNull().default("draft"),
      // draft, approved, paid, overdue
      currency: varchar("currency", { length: 3 }).notNull(),
      fx_rate: decimal("fx_rate", { precision: 10, scale: 6 }).notNull().default("1"),
      subtotal: decimal("subtotal", { precision: 15, scale: 2 }).notNull().default("0"),
      tax_total: decimal("tax_total", { precision: 15, scale: 2 }).notNull().default("0"),
      total: decimal("total", { precision: 15, scale: 2 }).notNull().default("0"),
      paid_amount: decimal("paid_amount", { precision: 15, scale: 2 }).notNull().default("0"),
      notes: text("notes"),
      journal_id: varchar("journal_id").references(() => journals.id),
      created_by: varchar("created_by").references(() => users.id),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    }, (table) => ({
      companyIdx: index("bills_company_idx").on(table.company_id),
      supplierIdx: index("bills_supplier_idx").on(table.supplier_id),
      dateIdx: index("bills_date_idx").on(table.date),
      statusIdx: index("bills_status_idx").on(table.status)
    }));
    expenses = pgTable("expenses", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      expense_number: text("expense_number").notNull(),
      payee: text("payee").notNull(),
      date: timestamp("date").notNull(),
      amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
      tax_amount: decimal("tax_amount", { precision: 15, scale: 2 }).notNull().default("0"),
      category: text("category"),
      // ESG Fields
      quantity: decimal("quantity", { precision: 15, scale: 4 }),
      unit: text("unit"),
      // kWh, Liters, Gallons
      carbon_factor: decimal("carbon_factor", { precision: 10, scale: 4 }),
      // kgCO2 per unit
      description: text("description"),
      paid_from_account_id: varchar("paid_from_account_id").references(() => bank_accounts.id),
      expense_account_id: varchar("expense_account_id").references(() => accounts.id),
      project_id: varchar("project_id"),
      // will be defined later
      status: text("status").notNull().default("pending"),
      // pending, approved, paid
      journal_id: varchar("journal_id").references(() => journals.id),
      created_by: varchar("created_by").references(() => users.id),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    }, (table) => ({
      companyIdx: index("expenses_company_idx").on(table.company_id),
      dateIdx: index("expenses_date_idx").on(table.date),
      statusIdx: index("expenses_status_idx").on(table.status)
    }));
    payments = pgTable("payments", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      payment_number: text("payment_number").notNull(),
      vendor_id: varchar("vendor_id").notNull().references(() => contacts.id),
      vendor_name: text("vendor_name").notNull(),
      // denormalized for performance
      date: timestamp("date").notNull(),
      amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
      payment_method: text("payment_method").notNull(),
      // bank_transfer, credit_card, check, cash, online_payment
      reference: text("reference"),
      // related bill/expense reference
      description: text("description"),
      bank_account_id: varchar("bank_account_id").references(() => bank_accounts.id),
      status: text("status").notNull().default("pending"),
      // pending, scheduled, completed, failed, cancelled
      currency: varchar("currency", { length: 3 }).notNull().default("USD"),
      fx_rate: decimal("fx_rate", { precision: 10, scale: 6 }).notNull().default("1"),
      reconciled: boolean("reconciled").notNull().default(false),
      reconciliation_id: varchar("reconciliation_id").references(() => bank_reconciliations.id),
      journal_id: varchar("journal_id").references(() => journals.id),
      created_by: varchar("created_by").references(() => users.id),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    }, (table) => ({
      companyIdx: index("payments_company_idx").on(table.company_id),
      vendorIdx: index("payments_vendor_idx").on(table.vendor_id),
      dateIdx: index("payments_date_idx").on(table.date)
    }));
    receipts = pgTable("receipts", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      receipt_number: text("receipt_number").notNull(),
      customer_id: varchar("customer_id").notNull().references(() => contacts.id),
      customer_name: text("customer_name").notNull(),
      // denormalized for performance
      date: timestamp("date").notNull(),
      amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
      payment_method: text("payment_method").notNull(),
      // bank_transfer, credit_card, check, cash, online_payment
      reference: text("reference"),
      // related invoice/sales reference
      description: text("description"),
      bank_account_id: varchar("bank_account_id").references(() => bank_accounts.id),
      status: text("status").notNull().default("received"),
      // received, pending, cleared, bounced
      currency: varchar("currency", { length: 3 }).notNull().default("USD"),
      fx_rate: decimal("fx_rate", { precision: 10, scale: 6 }).notNull().default("1"),
      reconciled: boolean("reconciled").notNull().default(false),
      reconciliation_id: varchar("reconciliation_id").references(() => bank_reconciliations.id),
      journal_id: varchar("journal_id").references(() => journals.id),
      created_by: varchar("created_by").references(() => users.id),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    }, (table) => ({
      companyIdx: index("receipts_company_idx").on(table.company_id),
      customerIdx: index("receipts_customer_idx").on(table.customer_id),
      dateIdx: index("receipts_date_idx").on(table.date)
    }));
    sales_credit_notes = pgTable("sales_credit_notes", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      credit_note_number: text("credit_note_number").notNull(),
      customer_id: varchar("customer_id").notNull().references(() => contacts.id),
      customer_name: text("customer_name").notNull(),
      invoice_id: varchar("invoice_id").references(() => sales_invoices.id),
      invoice_number: text("invoice_number"),
      issue_date: timestamp("issue_date").notNull(),
      reason: text("reason"),
      subtotal: decimal("subtotal", { precision: 15, scale: 2 }).notNull().default("0"),
      tax_total: decimal("tax_total", { precision: 15, scale: 2 }).notNull().default("0"),
      total: decimal("total", { precision: 15, scale: 2 }).notNull().default("0"),
      remaining_amount: decimal("remaining_amount", { precision: 15, scale: 2 }).notNull().default("0"),
      currency: varchar("currency", { length: 3 }).notNull().default("USD"),
      fx_rate: decimal("fx_rate", { precision: 10, scale: 6 }).notNull().default("1"),
      status: text("status").notNull().default("draft"),
      // draft, pending, applied, partially_applied, void
      notes: text("notes"),
      created_by: varchar("created_by").references(() => users.id),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    purchase_debit_notes = pgTable("purchase_debit_notes", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      debit_note_number: text("debit_note_number").notNull(),
      vendor_id: varchar("vendor_id").notNull().references(() => contacts.id),
      vendor_name: text("vendor_name").notNull(),
      bill_id: varchar("bill_id").references(() => bills.id),
      bill_number: text("bill_number"),
      issue_date: timestamp("issue_date").notNull(),
      reason: text("reason"),
      subtotal: decimal("subtotal", { precision: 15, scale: 2 }).notNull().default("0"),
      tax_total: decimal("tax_total", { precision: 15, scale: 2 }).notNull().default("0"),
      total: decimal("total", { precision: 15, scale: 2 }).notNull().default("0"),
      remaining_amount: decimal("remaining_amount", { precision: 15, scale: 2 }).notNull().default("0"),
      currency: varchar("currency", { length: 3 }).notNull().default("USD"),
      fx_rate: decimal("fx_rate", { precision: 10, scale: 6 }).notNull().default("1"),
      status: text("status").notNull().default("draft"),
      // draft, pending, applied, partially_applied, void
      notes: text("notes"),
      created_by: varchar("created_by").references(() => users.id),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    fixed_assets = pgTable("fixed_assets", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      asset_code: text("asset_code").notNull(),
      name: text("name").notNull(),
      description: text("description"),
      cost: decimal("cost", { precision: 15, scale: 2 }).notNull(),
      acquisition_date: timestamp("acquisition_date").notNull(),
      useful_life_years: integer("useful_life_years").notNull(),
      depreciation_method: text("depreciation_method").notNull().default("straight_line"),
      // straight_line, declining_balance
      salvage_value: decimal("salvage_value", { precision: 15, scale: 2 }).notNull().default("0"),
      accumulated_depreciation: decimal("accumulated_depreciation", { precision: 15, scale: 2 }).notNull().default("0"),
      asset_account_id: varchar("asset_account_id").references(() => accounts.id),
      depreciation_account_id: varchar("depreciation_account_id").references(() => accounts.id),
      expense_account_id: varchar("expense_account_id").references(() => accounts.id),
      disposal_date: timestamp("disposal_date"),
      disposal_proceeds: decimal("disposal_proceeds", { precision: 15, scale: 2 }),
      is_active: boolean("is_active").notNull().default(true),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    asset_depreciation_entries = pgTable("asset_depreciation_entries", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      asset_id: varchar("asset_id").notNull().references(() => fixed_assets.id, { onDelete: "cascade" }),
      date: timestamp("date").notNull(),
      amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
      journal_id: varchar("journal_id").references(() => journals.id),
      fiscal_year: integer("fiscal_year"),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    projects = pgTable("projects", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      code: text("code").notNull(),
      name: text("name").notNull(),
      description: text("description"),
      budget: decimal("budget", { precision: 15, scale: 2 }),
      start_date: timestamp("start_date"),
      end_date: timestamp("end_date"),
      status: text("status").notNull().default("active"),
      // active, completed, on_hold, cancelled
      is_active: boolean("is_active").notNull().default(true),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    project_phases = pgTable("project_phases", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      project_id: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
      name: text("name").notNull(),
      description: text("description"),
      order_index: integer("order_index").notNull().default(0),
      budget: decimal("budget", { precision: 15, scale: 2 }),
      start_date: timestamp("start_date"),
      end_date: timestamp("end_date"),
      status: text("status").notNull().default("pending"),
      // pending, in_progress, completed, cancelled
      progress_percent: integer("progress_percent").notNull().default(0),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    project_tasks = pgTable("project_tasks", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      project_id: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
      phase_id: varchar("phase_id").references(() => project_phases.id, { onDelete: "set null" }),
      title: text("title").notNull(),
      description: text("description"),
      priority: text("priority").notNull().default("medium"),
      // low, medium, high, urgent
      status: text("status").notNull().default("todo"),
      // todo, in_progress, review, completed, cancelled
      assigned_to: varchar("assigned_to").references(() => users.id, { onDelete: "set null" }),
      due_date: timestamp("due_date"),
      completed_at: timestamp("completed_at"),
      estimated_hours: decimal("estimated_hours", { precision: 8, scale: 2 }),
      actual_hours: decimal("actual_hours", { precision: 8, scale: 2 }),
      order_index: integer("order_index").notNull().default(0),
      created_by: varchar("created_by").references(() => users.id),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    project_time_entries = pgTable("project_time_entries", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      project_id: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
      task_id: varchar("task_id").references(() => project_tasks.id, { onDelete: "set null" }),
      user_id: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      date: timestamp("date").notNull(),
      hours: decimal("hours", { precision: 8, scale: 2 }).notNull(),
      description: text("description"),
      billable: boolean("billable").notNull().default(true),
      hourly_rate: decimal("hourly_rate", { precision: 15, scale: 2 }),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    attachments = pgTable("attachments", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      entity_type: text("entity_type").notNull(),
      // invoice, bill, expense, contact, item, etc
      entity_id: varchar("entity_id").notNull(),
      filename: text("filename").notNull(),
      original_filename: text("original_filename").notNull(),
      file_size: integer("file_size").notNull(),
      mime_type: text("mime_type").notNull(),
      file_path: text("file_path").notNull(),
      ocr_text: text("ocr_text"),
      uploaded_by: varchar("uploaded_by").references(() => users.id),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    audit_logs = pgTable("audit_logs", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      entity_type: text("entity_type").notNull(),
      entity_id: varchar("entity_id").notNull(),
      action: text("action").notNull(),
      // create, update, delete, sync_conflict
      changes: jsonb("changes"),
      actor_id: varchar("actor_id").references(() => users.id),
      actor_name: text("actor_name"),
      timestamp: timestamp("timestamp").notNull().default(sql`CURRENT_TIMESTAMP`),
      ip_address: text("ip_address"),
      user_agent: text("user_agent")
    });
    stock_movements = pgTable("stock_movements", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      item_id: varchar("item_id").notNull().references(() => items.id, { onDelete: "restrict" }),
      warehouse_id: varchar("warehouse_id").notNull().references(() => warehouses.id, { onDelete: "restrict" }),
      transaction_type: text("transaction_type").notNull(),
      // purchase, sale, adjustment, transfer_in, transfer_out
      transaction_date: timestamp("transaction_date").notNull(),
      quantity: decimal("quantity", { precision: 15, scale: 4 }).notNull(),
      unit_cost: decimal("unit_cost", { precision: 15, scale: 4 }).notNull(),
      total_cost: decimal("total_cost", { precision: 15, scale: 2 }).notNull(),
      reference_type: text("reference_type"),
      // invoice, bill, adjustment
      reference_id: varchar("reference_id"),
      batch_id: varchar("batch_id").references(() => batches.id),
      // Added for batch tracking
      notes: text("notes"),
      created_by: varchar("created_by").references(() => users.id),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    payment_allocations = pgTable("payment_allocations", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      payment_type: text("payment_type").notNull(),
      // receipt, payment
      payment_id: varchar("payment_id").notNull(),
      // references receipts.id or payments.id
      document_type: text("document_type").notNull(),
      // invoice, bill
      document_id: varchar("document_id").notNull(),
      // references sales_invoices.id or bills.id
      allocated_amount: decimal("allocated_amount", { precision: 15, scale: 2 }).notNull(),
      allocation_date: timestamp("allocation_date").notNull().default(sql`CURRENT_TIMESTAMP`),
      created_by: varchar("created_by").references(() => users.id),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    document_sequences = pgTable("document_sequences", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      document_type: text("document_type").notNull(),
      // invoice, bill, quote, order, payment, receipt, expense
      prefix: text("prefix").notNull(),
      // INV-, BILL-, QT-, etc
      next_number: integer("next_number").notNull().default(1),
      fiscal_year: integer("fiscal_year").notNull(),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    fiscal_periods = pgTable("fiscal_periods", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      period_name: text("period_name").notNull(),
      // Jan 2025, Q1 2025, FY 2025
      period_type: text("period_type").notNull(),
      // month, quarter, year
      start_date: timestamp("start_date").notNull(),
      end_date: timestamp("end_date").notNull(),
      fiscal_year: integer("fiscal_year").notNull(),
      is_closed: boolean("is_closed").notNull().default(false),
      closed_by: varchar("closed_by").references(() => users.id),
      closed_at: timestamp("closed_at"),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    recurring_templates = pgTable("recurring_templates", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      template_name: text("template_name").notNull(),
      document_type: text("document_type").notNull(),
      // invoice, bill, expense
      frequency: text("frequency").notNull(),
      // daily, weekly, monthly, quarterly, yearly
      interval: integer("interval").notNull().default(1),
      // every X frequency
      start_date: timestamp("start_date").notNull(),
      end_date: timestamp("end_date"),
      next_run_date: timestamp("next_run_date").notNull(),
      last_run_date: timestamp("last_run_date"),
      template_data: jsonb("template_data").notNull(),
      // stores document structure
      is_active: boolean("is_active").notNull().default(true),
      created_by: varchar("created_by").references(() => users.id),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    budgets = pgTable("budgets", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      budget_name: text("budget_name").notNull(),
      fiscal_year: integer("fiscal_year").notNull(),
      account_id: varchar("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
      period_type: text("period_type").notNull(),
      // monthly, quarterly, yearly
      january: decimal("january", { precision: 15, scale: 2 }).default("0"),
      february: decimal("february", { precision: 15, scale: 2 }).default("0"),
      march: decimal("march", { precision: 15, scale: 2 }).default("0"),
      april: decimal("april", { precision: 15, scale: 2 }).default("0"),
      may: decimal("may", { precision: 15, scale: 2 }).default("0"),
      june: decimal("june", { precision: 15, scale: 2 }).default("0"),
      july: decimal("july", { precision: 15, scale: 2 }).default("0"),
      august: decimal("august", { precision: 15, scale: 2 }).default("0"),
      september: decimal("september", { precision: 15, scale: 2 }).default("0"),
      october: decimal("october", { precision: 15, scale: 2 }).default("0"),
      november: decimal("november", { precision: 15, scale: 2 }).default("0"),
      december: decimal("december", { precision: 15, scale: 2 }).default("0"),
      total: decimal("total", { precision: 15, scale: 2 }).notNull(),
      created_by: varchar("created_by").references(() => users.id),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    ai_feedback = pgTable("ai_feedback", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").references(() => companies.id, { onDelete: "cascade" }),
      user_id: varchar("user_id").references(() => users.id),
      source: text("source"),
      // e.g., bank-statement, reconciliation, expenses-form, payments-form
      transaction_id: varchar("transaction_id"),
      accepted: boolean("accepted").notNull(),
      category: text("category"),
      confidence: decimal("confidence", { precision: 10, scale: 6 }),
      suggested_accounts: jsonb("suggested_accounts"),
      // { debit: string[]; credit: string[] }
      notes: text("notes"),
      description: text("description"),
      amount: decimal("amount", { precision: 15, scale: 2 }),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    ai_providers = pgTable("ai_providers", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").references(() => companies.id, { onDelete: "cascade" }).notNull(),
      provider: varchar("provider", { length: 64 }).notNull(),
      // e.g., openai, azure-openai, google, anthropic, openrouter, groq, mistral, xai, together, cohere
      label: varchar("label", { length: 128 }),
      // Friendly name shown in UI
      base_url: text("base_url"),
      // Optional custom endpoint/base URL
      api_key: text("api_key"),
      // Stored encrypted at rest at the DB/storage layer (TBD)
      organization: varchar("organization", { length: 128 }),
      // Optional org or project id
      default_model: varchar("default_model", { length: 256 }),
      embeddings_model: varchar("embeddings_model", { length: 256 }),
      vision_model: varchar("vision_model", { length: 256 }),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    ai_consent = pgTable("ai_consent", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").references(() => companies.id, { onDelete: "cascade" }).notNull(),
      user_id: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      consent_type: text("consent_type").notNull().default("ai"),
      // reserved for future types
      accepted: boolean("accepted").notNull().default(true),
      version: text("version"),
      accepted_at: timestamp("accepted_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    legal_consent_logs = pgTable("legal_consent_logs", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      user_id: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      company_id: varchar("company_id").references(() => companies.id, { onDelete: "cascade" }).notNull(),
      consent_version: text("consent_version").notNull(),
      terms_accepted: boolean("terms_accepted").notNull().default(true),
      privacy_accepted: boolean("privacy_accepted").notNull().default(true),
      disclaimer_accepted: boolean("disclaimer_accepted").notNull().default(true),
      ip_address: text("ip_address"),
      user_agent: text("user_agent"),
      accepted_at: timestamp("accepted_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    role_permissions = pgTable("role_permissions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      role: varchar("role", { length: 50 }).notNull(),
      resource: varchar("resource", { length: 100 }).notNull(),
      action: varchar("action", { length: 50 }).notNull(),
      allowed: boolean("allowed").notNull().default(true),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    insertRolePermissionSchema = createInsertSchema(role_permissions).omit({
      id: true,
      created_at: true,
      updated_at: true
    });
    insertFixedAssetSchema = createInsertSchema(fixed_assets).omit({
      id: true,
      created_at: true,
      updated_at: true
    });
    insertAssetDepreciationEntrySchema = createInsertSchema(asset_depreciation_entries).omit({
      id: true,
      created_at: true
    });
    insertProjectSchema = createInsertSchema(projects).omit({
      id: true,
      created_at: true,
      updated_at: true
    });
    insertWarehouseSchema = createInsertSchema(warehouses).omit({
      id: true,
      created_at: true,
      updated_at: true
    });
    insertBankAccountSchema = createInsertSchema(bank_accounts).omit({
      id: true,
      created_at: true,
      updated_at: true
    });
    insertBankStatementLineSchema = createInsertSchema(bank_statement_lines).omit({
      id: true,
      created_at: true,
      updated_at: true
    });
    insertStockMovementSchema = createInsertSchema(stock_movements).omit({
      id: true,
      created_at: true
    });
    insertPaymentAllocationSchema = createInsertSchema(payment_allocations).omit({
      id: true,
      created_at: true
    });
    insertDocumentSequenceSchema = createInsertSchema(document_sequences).omit({
      id: true,
      created_at: true,
      updated_at: true
    });
    insertFiscalPeriodSchema = createInsertSchema(fiscal_periods).omit({
      id: true,
      created_at: true
    });
    insertRecurringTemplateSchema = createInsertSchema(recurring_templates).omit({
      id: true,
      created_at: true,
      updated_at: true
    });
    insertBudgetSchema = createInsertSchema(budgets).omit({
      id: true,
      created_at: true,
      updated_at: true
    });
    insertAIFeedbackSchema = createInsertSchema(ai_feedback).omit({
      id: true,
      created_at: true
    });
    insertAIProviderSchema = createInsertSchema(ai_providers).omit({
      id: true,
      created_at: true,
      updated_at: true
    });
    insertLegalConsentLogSchema = createInsertSchema(legal_consent_logs).omit({
      id: true,
      accepted_at: true
    });
    insertAIConsentSchema = createInsertSchema(ai_consent).omit({
      id: true,
      accepted_at: true
    });
    manufacturing_boms = pgTable("manufacturing_boms", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      item_id: varchar("item_id").notNull().references(() => items.id),
      name: text("name").notNull(),
      version: text("version").notNull().default("1.0"),
      is_active: boolean("is_active").notNull().default(true),
      labor_cost: decimal("labor_cost", { precision: 15, scale: 2 }).default("0"),
      overhead_cost: decimal("overhead_cost", { precision: 15, scale: 2 }).default("0"),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    manufacturing_bom_items = pgTable("manufacturing_bom_items", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      bom_id: varchar("bom_id").notNull().references(() => manufacturing_boms.id, { onDelete: "cascade" }),
      item_id: varchar("item_id").notNull().references(() => items.id),
      quantity: decimal("quantity", { precision: 15, scale: 4 }).notNull(),
      wastage_percent: decimal("wastage_percent", { precision: 5, scale: 2 }).default("0")
    });
    production_orders = pgTable("production_orders", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      order_number: text("order_number").notNull(),
      bom_id: varchar("bom_id").references(() => manufacturing_boms.id),
      item_id: varchar("item_id").notNull().references(() => items.id, { onDelete: "cascade" }),
      quantity: decimal("quantity", { precision: 15, scale: 4 }).notNull(),
      start_date: timestamp("start_date").notNull(),
      due_date: timestamp("due_date"),
      status: text("status").notNull().default("planned"),
      // planned, in_progress, completed, cancelled
      warehouse_id: varchar("warehouse_id").references(() => warehouses.id),
      output_batch_number: text("output_batch_number"),
      output_expiry_date: timestamp("output_expiry_date"),
      created_by: varchar("created_by").references(() => users.id),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    inventory_batches = pgTable("inventory_batches", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      item_id: varchar("item_id").notNull().references(() => items.id),
      batch_number: text("batch_number").notNull(),
      expiry_date: timestamp("expiry_date"),
      quantity: decimal("quantity", { precision: 15, scale: 4 }).notNull().default("0"),
      warehouse_id: varchar("warehouse_id").references(() => warehouses.id),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    inventory_serials = pgTable("inventory_serials", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      item_id: varchar("item_id").notNull().references(() => items.id),
      serial_number: text("serial_number").notNull(),
      status: text("status").notNull().default("available"),
      // available, sold, returned, damaged
      warehouse_id: varchar("warehouse_id").references(() => warehouses.id),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    landed_cost_vouchers = pgTable("landed_cost_vouchers", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      voucher_number: text("voucher_number").notNull(),
      date: timestamp("date").notNull(),
      description: text("description"),
      status: text("status").notNull().default("draft"),
      // draft, posted
      allocation_method: text("allocation_method").notNull().default("value"),
      // value, quantity, weight, volume
      created_by: varchar("created_by").references(() => users.id),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    landed_cost_bills = pgTable("landed_cost_bills", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      voucher_id: varchar("voucher_id").notNull().references(() => landed_cost_vouchers.id, { onDelete: "cascade" }),
      bill_id: varchar("bill_id").notNull().references(() => bills.id),
      amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    landed_cost_items = pgTable("landed_cost_items", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      voucher_id: varchar("voucher_id").notNull().references(() => landed_cost_vouchers.id, { onDelete: "cascade" }),
      stock_movement_id: varchar("stock_movement_id").notNull().references(() => stock_movements.id),
      original_cost: decimal("original_cost", { precision: 15, scale: 2 }).notNull(),
      allocated_cost: decimal("allocated_cost", { precision: 15, scale: 2 }).notNull(),
      new_unit_cost: decimal("new_unit_cost", { precision: 15, scale: 4 }).notNull(),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    departments = pgTable("departments", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      name: text("name").notNull(),
      manager_id: varchar("manager_id"),
      // Self-reference to employees later
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    employees = pgTable("employees", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      first_name: text("first_name").notNull(),
      last_name: text("last_name").notNull(),
      email: text("email"),
      phone: text("phone"),
      department_id: varchar("department_id").references(() => departments.id),
      job_title: text("job_title"),
      hire_date: timestamp("hire_date"),
      salary: decimal("salary", { precision: 15, scale: 2 }),
      status: text("status").notNull().default("active"),
      // active, terminated, on_leave
      user_id: varchar("user_id").references(() => users.id),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    payroll_runs = pgTable("payroll_runs", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      period_start: timestamp("period_start").notNull(),
      period_end: timestamp("period_end").notNull(),
      payment_date: timestamp("payment_date").notNull(),
      status: text("status").notNull().default("draft"),
      // draft, approved, paid
      total_amount: decimal("total_amount", { precision: 15, scale: 2 }).notNull().default("0"),
      journal_id: varchar("journal_id").references(() => journals.id),
      created_by: varchar("created_by").references(() => users.id),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    payslips = pgTable("payslips", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      payroll_run_id: varchar("payroll_run_id").notNull().references(() => payroll_runs.id, { onDelete: "cascade" }),
      employee_id: varchar("employee_id").notNull().references(() => employees.id),
      basic_salary: decimal("basic_salary", { precision: 15, scale: 2 }).notNull(),
      allowances: decimal("allowances", { precision: 15, scale: 2 }).notNull().default("0"),
      deductions: decimal("deductions", { precision: 15, scale: 2 }).notNull().default("0"),
      net_salary: decimal("net_salary", { precision: 15, scale: 2 }).notNull(),
      details: jsonb("details"),
      // Breakdown of allowances/deductions
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    checks = pgTable("checks", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      check_number: text("check_number").notNull(),
      bank_account_id: varchar("bank_account_id").notNull().references(() => bank_accounts.id),
      payee: text("payee").notNull(),
      contact_id: varchar("contact_id").references(() => contacts.id),
      amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
      date: timestamp("date").notNull(),
      issue_date: timestamp("issue_date").notNull().default(sql`CURRENT_TIMESTAMP`),
      type: text("type").notNull().default("standard"),
      memo: text("memo"),
      status: text("status").notNull().default("pending"),
      // pending, printed, cleared, voided
      created_by: varchar("created_by").references(() => users.id),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    }, (table) => ({
      companyIdx: index("checks_company_idx").on(table.company_id),
      checkNumberIdx: index("checks_check_number_idx").on(table.check_number),
      dateIdx: index("checks_date_idx").on(table.date),
      contactIdx: index("checks_contact_idx").on(table.contact_id)
    }));
    approval_workflows = pgTable("approval_workflows", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      name: text("name").notNull().default("Standard Approval"),
      description: text("description"),
      entity_type: text("entity_type").notNull(),
      // expense, purchase_order, invoice
      trigger_amount: decimal("trigger_amount", { precision: 15, scale: 2 }).notNull().default("0"),
      approver_role: text("approver_role").default("admin"),
      is_active: boolean("is_active").notNull().default(true),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    approval_workflow_steps = pgTable("approval_workflow_steps", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      workflow_id: varchar("workflow_id").notNull().references(() => approval_workflows.id, { onDelete: "cascade" }),
      step_order: integer("step_order").notNull(),
      approver_role: text("approver_role").notNull(),
      // admin, manager, cfo, etc.
      approver_id: varchar("approver_id").references(() => users.id),
      // Optional specific user
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    approval_requests = pgTable("approval_requests", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
      workflow_id: varchar("workflow_id").references(() => approval_workflows.id),
      entity_type: text("entity_type").notNull(),
      entity_id: varchar("entity_id").notNull(),
      requester_id: varchar("requester_id").references(() => users.id),
      status: text("status").notNull().default("pending"),
      // pending, approved, rejected
      current_step: integer("current_step").notNull().default(1),
      approver_id: varchar("approver_id").references(() => users.id),
      // The final approver or current approver? Let's keep for backward compat
      comments: text("comments"),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
      updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    approval_request_actions = pgTable("approval_request_actions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      request_id: varchar("request_id").notNull().references(() => approval_requests.id, { onDelete: "cascade" }),
      step_order: integer("step_order").notNull(),
      approver_id: varchar("approver_id").notNull().references(() => users.id),
      action: text("action").notNull(),
      // approved, rejected
      comments: text("comments"),
      created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
    });
    insertManufacturingBomSchema = createInsertSchema(manufacturing_boms).omit({
      id: true,
      created_at: true,
      updated_at: true
    });
    insertManufacturingBomItemSchema = createInsertSchema(manufacturing_bom_items).omit({
      id: true
    });
    insertProductionOrderSchema = createInsertSchema(production_orders).omit({
      id: true,
      created_at: true,
      updated_at: true
    });
    insertInventoryBatchSchema = createInsertSchema(inventory_batches).omit({
      id: true,
      created_at: true
    });
    insertInventorySerialSchema = createInsertSchema(inventory_serials).omit({
      id: true,
      created_at: true
    });
    insertLandedCostVoucherSchema = createInsertSchema(landed_cost_vouchers);
    insertLandedCostBillSchema = createInsertSchema(landed_cost_bills);
    insertLandedCostItemSchema = createInsertSchema(landed_cost_items);
    insertDepartmentSchema = createInsertSchema(departments).omit({
      id: true,
      created_at: true
    });
    insertEmployeeSchema = createInsertSchema(employees).omit({
      id: true,
      created_at: true,
      updated_at: true
    });
    insertPayrollRunSchema = createInsertSchema(payroll_runs).omit({
      id: true,
      created_at: true
    });
    insertPayslipSchema = createInsertSchema(payslips).omit({
      id: true,
      created_at: true
    });
    insertCheckSchema = createInsertSchema(checks).omit({
      id: true,
      created_at: true,
      updated_at: true
    });
    insertCompanySchema = createInsertSchema(companies).omit({
      id: true,
      created_at: true,
      updated_at: true
    });
    insertUserSchema = createInsertSchema(users).omit({
      id: true,
      password_hash: true,
      // Will be generated server-side from password
      created_at: true,
      updated_at: true,
      last_login_at: true
    }).extend({
      password: z.string().min(8, "Password must be at least 8 characters"),
      company_id: z.string().optional()
      // Make optional - will be set server-side if not provided
    });
    loginSchema = z.object({
      email: z.string().email("Please enter a valid email address"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      code: z.string().optional()
      // 2FA code
    });
    registrationSchema = z.object({
      // Company info
      companyName: z.string().min(2, "Company name must be at least 2 characters"),
      baseCurrency: z.string().length(3, "Currency must be 3 characters").default("USD"),
      fiscalYearStart: z.number().min(1).max(12).default(1),
      // User info  
      username: z.string().min(3, "Username must be at least 3 characters"),
      email: z.string().email("Please enter a valid email address"),
      password: z.string().min(8, "Password must be at least 8 characters"),
      fullName: z.string().min(2, "Full name must be at least 2 characters")
    });
    insertCostCenterSchema = createInsertSchema(cost_centers).omit({
      id: true,
      created_at: true,
      updated_at: true
    });
    insertApprovalWorkflowSchema = createInsertSchema(approval_workflows).omit({
      id: true,
      created_at: true
    });
    insertApprovalWorkflowStepSchema = createInsertSchema(approval_workflow_steps).omit({
      id: true,
      created_at: true
    });
    insertApprovalRequestSchema = createInsertSchema(approval_requests).omit({
      id: true,
      created_at: true,
      updated_at: true
    });
    insertApprovalRequestActionSchema = createInsertSchema(approval_request_actions).omit({
      id: true,
      created_at: true
    });
    insertUserPermissionSchema = createInsertSchema(user_permissions).omit({
      id: true,
      created_at: true,
      updated_at: true
    });
    insertAccountSchema = createInsertSchema(accounts).omit({
      id: true,
      created_at: true,
      updated_at: true
    });
    insertTaxSchema = createInsertSchema(taxes).omit({
      id: true,
      created_at: true,
      updated_at: true
    });
    insertContactSchema = createInsertSchema(contacts).omit({
      id: true,
      created_at: true,
      updated_at: true
    });
    insertItemSchema = createInsertSchema(items).omit({
      id: true,
      created_at: true,
      updated_at: true
    });
    insertSalesInvoiceSchema = createInsertSchema(sales_invoices).omit({
      id: true,
      created_at: true,
      updated_at: true
    });
    insertSalesOrderSchema = createInsertSchema(sales_orders).omit({
      id: true,
      created_at: true,
      updated_at: true
    });
    insertBillSchema = createInsertSchema(bills).omit({
      id: true,
      created_at: true,
      updated_at: true
    });
    insertExpenseSchema = createInsertSchema(expenses).omit({
      id: true,
      created_at: true,
      updated_at: true
    });
    insertPaymentSchema = createInsertSchema(payments).omit({
      id: true,
      created_at: true,
      updated_at: true
    });
    insertReceiptSchema = createInsertSchema(receipts).omit({
      id: true,
      created_at: true,
      updated_at: true
    });
    insertPurchaseOrderSchema = createInsertSchema(purchase_orders).omit({
      id: true,
      created_at: true,
      updated_at: true
    });
    insertSalesCreditNoteSchema = createInsertSchema(sales_credit_notes).omit({
      id: true,
      created_at: true,
      updated_at: true
    });
    insertPurchaseDebitNoteSchema = createInsertSchema(purchase_debit_notes).omit({
      id: true,
      created_at: true,
      updated_at: true
    });
    insertCurrencySchema = createInsertSchema(currencies);
    insertExchangeRateSchema = createInsertSchema(exchange_rates).omit({
      id: true,
      created_at: true
    });
    insertContactPortalUserSchema = createInsertSchema(contact_portal_users).omit({
      id: true,
      created_at: true,
      updated_at: true,
      last_login_at: true
    });
    companiesRelations = relations(companies, ({ many }) => ({
      users: many(users),
      accounts: many(accounts),
      contacts: many(contacts),
      items: many(items),
      warehouses: many(warehouses),
      taxes: many(taxes),
      journals: many(journals),
      sales_invoices: many(sales_invoices),
      sales_quotes: many(sales_quotes),
      sales_orders: many(sales_orders),
      purchase_orders: many(purchase_orders),
      bills: many(bills),
      expenses: many(expenses),
      payments: many(payments),
      receipts: many(receipts),
      bank_accounts: many(bank_accounts),
      budgets: many(budgets),
      projects: many(projects)
    }));
    usersRelations = relations(users, ({ one, many }) => ({
      company: one(companies, {
        fields: [users.company_id],
        references: [companies.id]
      }),
      permissions: many(user_permissions),
      audit_logs: many(audit_logs),
      project_tasks: many(project_tasks),
      time_entries: many(project_time_entries)
    }));
    userPermissionsRelations = relations(user_permissions, ({ one }) => ({
      user: one(users, {
        fields: [user_permissions.user_id],
        references: [users.id]
      })
    }));
    accountsRelations = relations(accounts, ({ one, many }) => ({
      company: one(companies, {
        fields: [accounts.company_id],
        references: [companies.id]
      }),
      parent: one(accounts, {
        fields: [accounts.parent_id],
        references: [accounts.id],
        relationName: "parent_child"
      }),
      children: many(accounts, { relationName: "parent_child" }),
      journal_lines: many(journal_lines)
    }));
    taxesRelations = relations(taxes, ({ one }) => ({
      company: one(companies, {
        fields: [taxes.company_id],
        references: [companies.id]
      }),
      liability_account: one(accounts, {
        fields: [taxes.liability_account_id],
        references: [accounts.id]
      })
    }));
    itemsRelations = relations(items, ({ one, many }) => ({
      company: one(companies, {
        fields: [items.company_id],
        references: [companies.id]
      }),
      sales_account: one(accounts, {
        fields: [items.sales_account_id],
        references: [accounts.id],
        relationName: "item_sales_account"
      }),
      cost_account: one(accounts, {
        fields: [items.cost_account_id],
        references: [accounts.id],
        relationName: "item_cost_account"
      }),
      inventory_account: one(accounts, {
        fields: [items.inventory_account_id],
        references: [accounts.id],
        relationName: "item_inventory_account"
      }),
      default_tax: one(taxes, {
        fields: [items.default_tax_id],
        references: [taxes.id]
      }),
      batches: many(batches),
      stock_movements: many(stock_movements)
    }));
    warehousesRelations = relations(warehouses, ({ one, many }) => ({
      company: one(companies, {
        fields: [warehouses.company_id],
        references: [companies.id]
      }),
      batches: many(batches),
      stock_movements: many(stock_movements)
    }));
    bankAccountsRelations = relations(bank_accounts, ({ one, many }) => ({
      company: one(companies, {
        fields: [bank_accounts.company_id],
        references: [companies.id]
      }),
      ledger_account: one(accounts, {
        fields: [bank_accounts.account_id],
        references: [accounts.id]
      }),
      statement_lines: many(bank_statement_lines)
    }));
    bankStatementLinesRelations = relations(bank_statement_lines, ({ one }) => ({
      bank_account: one(bank_accounts, {
        fields: [bank_statement_lines.bank_account_id],
        references: [bank_accounts.id]
      })
    }));
    salesInvoicesRelations = relations(sales_invoices, ({ one, many }) => ({
      company: one(companies, {
        fields: [sales_invoices.company_id],
        references: [companies.id]
      }),
      customer: one(contacts, {
        fields: [sales_invoices.customer_id],
        references: [contacts.id]
      }),
      order: one(sales_orders, {
        fields: [sales_invoices.order_id],
        references: [sales_orders.id]
      }),
      journal: one(journals, {
        fields: [sales_invoices.journal_id],
        references: [journals.id]
      }),
      lines: many(document_lines)
    }));
    salesQuotesRelations = relations(sales_quotes, ({ one, many }) => ({
      company: one(companies, {
        fields: [sales_quotes.company_id],
        references: [companies.id]
      }),
      customer: one(contacts, {
        fields: [sales_quotes.customer_id],
        references: [contacts.id]
      }),
      lines: many(document_lines)
    }));
    salesOrdersRelations = relations(sales_orders, ({ one, many }) => ({
      company: one(companies, {
        fields: [sales_orders.company_id],
        references: [companies.id]
      }),
      customer: one(contacts, {
        fields: [sales_orders.customer_id],
        references: [contacts.id]
      }),
      quote: one(sales_quotes, {
        fields: [sales_orders.quote_id],
        references: [sales_quotes.id]
      }),
      lines: many(document_lines)
    }));
    purchaseOrdersRelations = relations(purchase_orders, ({ one, many }) => ({
      company: one(companies, {
        fields: [purchase_orders.company_id],
        references: [companies.id]
      }),
      supplier: one(contacts, {
        fields: [purchase_orders.supplier_id],
        references: [contacts.id]
      }),
      lines: many(document_lines)
    }));
    billsRelations = relations(bills, ({ one, many }) => ({
      company: one(companies, {
        fields: [bills.company_id],
        references: [companies.id]
      }),
      supplier: one(contacts, {
        fields: [bills.supplier_id],
        references: [contacts.id]
      }),
      purchase_order: one(purchase_orders, {
        fields: [bills.po_id],
        references: [purchase_orders.id]
      }),
      journal: one(journals, {
        fields: [bills.journal_id],
        references: [journals.id]
      }),
      lines: many(document_lines)
    }));
    expensesRelations = relations(expenses, ({ one }) => ({
      company: one(companies, {
        fields: [expenses.company_id],
        references: [companies.id]
      }),
      expense_account: one(accounts, {
        fields: [expenses.expense_account_id],
        references: [accounts.id]
      }),
      paid_from: one(bank_accounts, {
        fields: [expenses.paid_from_account_id],
        references: [bank_accounts.id]
      }),
      journal: one(journals, {
        fields: [expenses.journal_id],
        references: [journals.id]
      })
    }));
    paymentsRelations = relations(payments, ({ one }) => ({
      company: one(companies, {
        fields: [payments.company_id],
        references: [companies.id]
      }),
      vendor: one(contacts, {
        fields: [payments.vendor_id],
        references: [contacts.id]
      }),
      bank_account: one(bank_accounts, {
        fields: [payments.bank_account_id],
        references: [bank_accounts.id]
      }),
      journal: one(journals, {
        fields: [payments.journal_id],
        references: [journals.id]
      })
    }));
    receiptsRelations = relations(receipts, ({ one }) => ({
      company: one(companies, {
        fields: [receipts.company_id],
        references: [companies.id]
      }),
      customer: one(contacts, {
        fields: [receipts.customer_id],
        references: [contacts.id]
      }),
      bank_account: one(bank_accounts, {
        fields: [receipts.bank_account_id],
        references: [bank_accounts.id]
      }),
      journal: one(journals, {
        fields: [receipts.journal_id],
        references: [journals.id]
      })
    }));
    salesCreditNotesRelations = relations(sales_credit_notes, ({ one, many }) => ({
      company: one(companies, {
        fields: [sales_credit_notes.company_id],
        references: [companies.id]
      }),
      customer: one(contacts, {
        fields: [sales_credit_notes.customer_id],
        references: [contacts.id]
      }),
      original_invoice: one(sales_invoices, {
        fields: [sales_credit_notes.invoice_id],
        references: [sales_invoices.id]
      }),
      lines: many(document_lines)
    }));
    purchaseDebitNotesRelations = relations(purchase_debit_notes, ({ one, many }) => ({
      company: one(companies, {
        fields: [purchase_debit_notes.company_id],
        references: [companies.id]
      }),
      vendor: one(contacts, {
        fields: [purchase_debit_notes.vendor_id],
        references: [contacts.id]
      }),
      original_bill: one(bills, {
        fields: [purchase_debit_notes.bill_id],
        references: [bills.id]
      }),
      lines: many(document_lines)
    }));
    documentLinesRelations = relations(document_lines, ({ one }) => ({
      item: one(items, {
        fields: [document_lines.item_id],
        references: [items.id]
      }),
      tax: one(taxes, {
        fields: [document_lines.tax_id],
        references: [taxes.id]
      }),
      account: one(accounts, {
        fields: [document_lines.account_id],
        references: [accounts.id]
      })
    }));
    auditLogsRelations = relations(audit_logs, ({ one }) => ({
      actor: one(users, {
        fields: [audit_logs.actor_id],
        references: [users.id]
      }),
      company: one(companies, {
        fields: [audit_logs.company_id],
        references: [companies.id]
      })
    }));
    recurringTemplatesRelations = relations(recurring_templates, ({ one }) => ({
      company: one(companies, {
        fields: [recurring_templates.company_id],
        references: [companies.id]
      }),
      creator: one(users, {
        fields: [recurring_templates.created_by],
        references: [users.id]
      })
    }));
    aiFeedbackRelations = relations(ai_feedback, ({ one }) => ({
      company: one(companies, {
        fields: [ai_feedback.company_id],
        references: [companies.id]
      }),
      user: one(users, {
        fields: [ai_feedback.user_id],
        references: [users.id]
      })
    }));
    contactPortalUsersRelations = relations(contact_portal_users, ({ one }) => ({
      contact: one(contacts, {
        fields: [contact_portal_users.contact_id],
        references: [contacts.id]
      })
    }));
    contactsRelations = relations(contacts, ({ many }) => ({
      portalUsers: many(contact_portal_users)
    }));
    journalsRelations = relations(journals, ({ many }) => ({
      lines: many(journal_lines)
    }));
    journalLinesRelations = relations(journal_lines, ({ one }) => ({
      journal: one(journals, {
        fields: [journal_lines.journal_id],
        references: [journals.id]
      }),
      account: one(accounts, {
        fields: [journal_lines.account_id],
        references: [accounts.id]
      })
    }));
    stockTransfersRelations = relations(stock_transfers, ({ many, one }) => ({
      items: many(stock_transfer_items),
      from_warehouse: one(warehouses, {
        fields: [stock_transfers.from_warehouse_id],
        references: [warehouses.id],
        relationName: "from_warehouse"
      }),
      to_warehouse: one(warehouses, {
        fields: [stock_transfers.to_warehouse_id],
        references: [warehouses.id],
        relationName: "to_warehouse"
      })
    }));
    batchesRelations = relations(batches, ({ one }) => ({
      item: one(items, {
        fields: [batches.item_id],
        references: [items.id]
      }),
      warehouse: one(warehouses, {
        fields: [batches.warehouse_id],
        references: [warehouses.id]
      })
    }));
    stockTransferItemsRelations = relations(stock_transfer_items, ({ one }) => ({
      transfer: one(stock_transfers, {
        fields: [stock_transfer_items.transfer_id],
        references: [stock_transfers.id]
      }),
      item: one(items, {
        fields: [stock_transfer_items.item_id],
        references: [items.id]
      }),
      batch: one(batches, {
        fields: [stock_transfer_items.batch_id],
        references: [batches.id]
      })
    }));
    stockMovementsRelations = relations(stock_movements, ({ one }) => ({
      item: one(items, {
        fields: [stock_movements.item_id],
        references: [items.id]
      }),
      warehouse: one(warehouses, {
        fields: [stock_movements.warehouse_id],
        references: [warehouses.id]
      })
    }));
    budgetsRelations = relations(budgets, ({ one }) => ({
      company: one(companies, {
        fields: [budgets.company_id],
        references: [companies.id]
      }),
      account: one(accounts, {
        fields: [budgets.account_id],
        references: [accounts.id]
      }),
      creator: one(users, {
        fields: [budgets.created_by],
        references: [users.id]
      })
    }));
    landedCostVouchersRelations = relations(landed_cost_vouchers, ({ many, one }) => ({
      company: one(companies, {
        fields: [landed_cost_vouchers.company_id],
        references: [companies.id]
      }),
      creator: one(users, {
        fields: [landed_cost_vouchers.created_by],
        references: [users.id]
      }),
      bills: many(landed_cost_bills),
      items: many(landed_cost_items)
    }));
    landedCostBillsRelations = relations(landed_cost_bills, ({ one }) => ({
      voucher: one(landed_cost_vouchers, {
        fields: [landed_cost_bills.voucher_id],
        references: [landed_cost_vouchers.id]
      }),
      bill: one(bills, {
        fields: [landed_cost_bills.bill_id],
        references: [bills.id]
      })
    }));
    landedCostItemsRelations = relations(landed_cost_items, ({ one }) => ({
      voucher: one(landed_cost_vouchers, {
        fields: [landed_cost_items.voucher_id],
        references: [landed_cost_vouchers.id]
      }),
      stock_movement: one(stock_movements, {
        fields: [landed_cost_items.stock_movement_id],
        references: [stock_movements.id]
      })
    }));
    projectsRelations = relations(projects, ({ one, many }) => ({
      company: one(companies, {
        fields: [projects.company_id],
        references: [companies.id]
      }),
      phases: many(project_phases),
      tasks: many(project_tasks),
      timeEntries: many(project_time_entries)
    }));
    projectPhasesRelations = relations(project_phases, ({ one, many }) => ({
      project: one(projects, {
        fields: [project_phases.project_id],
        references: [projects.id]
      }),
      tasks: many(project_tasks)
    }));
    projectTasksRelations = relations(project_tasks, ({ one }) => ({
      project: one(projects, {
        fields: [project_tasks.project_id],
        references: [projects.id]
      }),
      phase: one(project_phases, {
        fields: [project_tasks.phase_id],
        references: [project_phases.id]
      }),
      assignee: one(users, {
        fields: [project_tasks.assigned_to],
        references: [users.id]
      }),
      creator: one(users, {
        fields: [project_tasks.created_by],
        references: [users.id]
      })
    }));
    projectTimeEntriesRelations = relations(project_time_entries, ({ one }) => ({
      project: one(projects, {
        fields: [project_time_entries.project_id],
        references: [projects.id]
      }),
      task: one(project_tasks, {
        fields: [project_time_entries.task_id],
        references: [project_tasks.id]
      }),
      user: one(users, {
        fields: [project_time_entries.user_id],
        references: [users.id]
      })
    }));
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  db: () => db,
  pool: () => pool
});
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import pg from "pg";
import ws from "ws";
var POOL_CONFIG, pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    neonConfig.webSocketConstructor = ws;
    neonConfig.pipelineConnect = "password";
    neonConfig.useSecureWebSocket = true;
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    POOL_CONFIG = {
      // Use environment variable for pool size, default to 50 for production
      max: parseInt(process.env.DB_POOL_SIZE || "50", 10),
      // Keep connections alive longer for high-traffic scenarios
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || "60000", 10),
      // Timeout for acquiring a connection from the pool
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || "15000", 10),
      // Allow queue when pool is exhausted (important for burst traffic)
      allowExitOnIdle: false
    };
    if (process.env.NODE_ENV === "test") {
      pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ...POOL_CONFIG,
        max: 20
        // Lower for tests
      });
      db = drizzlePg(pool, { schema: schema_exports });
      console.log("\u{1F4E6} Database: Using pg driver for tests");
    } else {
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ...POOL_CONFIG
      });
      db = drizzle({ client: pool, schema: schema_exports });
      console.log(`\u{1F4E6} Database: Using Neon serverless driver (pool size: ${POOL_CONFIG.max})`);
    }
    process.on("SIGTERM", async () => {
      console.log("\u{1F504} Closing database connections...");
      await pool.end?.();
      console.log("\u2705 Database connections closed");
    });
  }
});

// server/utils/sendError.ts
function sendError(res, status, error, extras) {
  const message = typeof error === "string" ? error : error?.message || "Error";
  const errText = typeof error === "string" ? error : message;
  return res.status(status).json({ error: errText, message, ...extras || {} });
}
var badRequest, unauthorized, forbidden, notFound, serverError;
var init_sendError = __esm({
  "server/utils/sendError.ts"() {
    "use strict";
    badRequest = (res, error, extras) => sendError(res, 400, error, extras);
    unauthorized = (res, error, extras) => sendError(res, 401, error, extras);
    forbidden = (res, error, extras) => sendError(res, 403, error, extras);
    notFound = (res, error, extras) => sendError(res, 404, error, extras);
    serverError = (res, error, extras) => sendError(res, 500, error, extras);
  }
});

// server/firebaseAdmin.ts
import admin from "firebase-admin";
import { createRemoteJWKSet, jwtVerify } from "jose";
var PROJECT_ID, serviceAccountJson, verifyFirebaseToken;
var init_firebaseAdmin = __esm({
  "server/firebaseAdmin.ts"() {
    "use strict";
    PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "log-and-ledger";
    serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!admin.apps.length) {
      if (!serviceAccountJson) {
        console.error("\u26A0\uFE0F FIREBASE_SERVICE_ACCOUNT_KEY env var is missing; cannot init Firebase Admin SDK");
      } else {
        try {
          const serviceAccount = JSON.parse(serviceAccountJson);
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: serviceAccount.project_id ?? PROJECT_ID
          });
          console.log("\u{1F525} Firebase Admin SDK initialized for project:", serviceAccount.project_id ?? PROJECT_ID);
        } catch (error) {
          console.error("\u26A0\uFE0F Failed to initialize Firebase Admin SDK:", error);
          throw error;
        }
      }
    }
    verifyFirebaseToken = async (token) => {
      if (admin.apps.length) {
        try {
          return await admin.auth().verifyIdToken(token, true);
        } catch (e) {
          console.warn("Admin SDK verification failed, falling back to JWKS:", e.message);
        }
      }
      const issuer = `https://securetoken.google.com/${PROJECT_ID}`;
      const audience = PROJECT_ID;
      const JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"));
      const { payload } = await jwtVerify(token, JWKS, {
        issuer,
        audience
      });
      return payload;
    };
  }
});

// server/ai/redaction.ts
var redaction_exports = {};
__export(redaction_exports, {
  redactForAI: () => redactForAI
});
function mask(value, kind) {
  const token = kind.toUpperCase();
  const suffix = value.replace(/\s|-/g, "").slice(-2);
  return `[REDACTED_${token}_${suffix}]`;
}
function redactForAI(input) {
  let text2 = input;
  const entries = [];
  if (!text2) return { text: text2, entries };
  const replace = (re, type) => {
    text2 = text2.replace(re, (match, ...args) => {
      if (type === "phone" && match.replace(/\D/g, "").length < 7) return match;
      if (type === "card") {
        const digits = match.replace(/\D/g, "");
        if (digits.length < 13 || digits.length > 19) return match;
      }
      const replacement = mask(match, type);
      entries.push({
        type,
        original: match,
        replacement,
        index: 0
        // We'll skip accurate index tracking for now as it's complex with multiple passes
      });
      return replacement;
    });
  };
  replace(EMAIL_RE, "email");
  replace(IBAN_RE, "iban");
  replace(PHONE_RE, "phone");
  replace(CARD_RE, "card");
  replace(TAX_ID_RE, "tax_id");
  return { text: text2, entries };
}
var EMAIL_RE, PHONE_RE, IBAN_RE, CARD_RE, TAX_ID_RE;
var init_redaction = __esm({
  "server/ai/redaction.ts"() {
    "use strict";
    EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
    PHONE_RE = /(?:\+\d{1,3}[\s-]?)?(?:\(\d{2,4}\)|\d{2,4})?[\s-]?\d{3,4}[\s-]?\d{3,4}(?:\s*x\d+)?/g;
    IBAN_RE = /\b([A-Z]{2}\d{2}[A-Z0-9]{11,30})\b/g;
    CARD_RE = /\b(?:\d[ -]?){13,19}\b/g;
    TAX_ID_RE = /\b(?:VAT|TAX)[\s:-]*([A-Z0-9]{6,15})\b/gi;
  }
});

// server/ai/costing.ts
var costing_exports = {};
__export(costing_exports, {
  calcCost: () => calcCost,
  estimateTokensFromText: () => estimateTokensFromText
});
function estimateTokensFromText(text2) {
  if (!text2) return 0;
  const len = text2.length;
  if (len <= 0) return 0;
  return Math.max(1, Math.ceil(len / 4));
}
function getPrice(provider, model) {
  const key = `${provider}:${model || ""}`.toLowerCase();
  return PRICING[key] || {};
}
function calcCost(provider, model, inputTokens, outputTokens = 0, imageTokenEquivalent = 0) {
  const price = getPrice(provider, model);
  const inRate = price.in ?? 0;
  const outRate = price.out ?? 0;
  const imageRate = price.image ?? 0;
  const usd = inputTokens / 1e3 * inRate + outputTokens / 1e3 * outRate + imageRate;
  const applied = !!(price.in || price.out || price.image);
  return {
    provider,
    model,
    inputTokens,
    outputTokens,
    imageTokenEquivalent: imageTokenEquivalent || void 0,
    totalUSD: usd,
    pricingApplied: applied
  };
}
var PRICING;
var init_costing = __esm({
  "server/ai/costing.ts"() {
    "use strict";
    PRICING = {
      // OpenAI GPT-4o family (example placeholders)
      "openai:gpt-4o-mini": { in: 6e-4, out: 12e-4, image: 4e-3 },
      "openai:gpt-4o": { in: 3e-3, out: 6e-3, image: 0.02 },
      // Fallback generic OpenAI entry (used when model unspecified)
      "openai:": { in: 1e-3, out: 2e-3, image: 0.01 }
    };
  }
});

// server/utils/aiProviders.ts
var aiProviders_exports = {};
__export(aiProviders_exports, {
  buildInvoiceExtractionMessages: () => buildInvoiceExtractionMessages,
  callAIProvider: () => callAIProvider
});
async function callOpenAICompatible(config, messages, providerName = "openai") {
  const baseUrl = config.baseUrl || PROVIDER_BASE_URLS[providerName] || PROVIDER_BASE_URLS.openai;
  const model = config.model || PROVIDER_DEFAULT_MODELS[providerName] || "gpt-4o-mini";
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${config.apiKey}`
  };
  if (config.organizationId && providerName === "openai") {
    headers["OpenAI-Organization"] = config.organizationId;
  }
  if (providerName === "openrouter") {
    headers["HTTP-Referer"] = "https://log-and-ledger.app";
    headers["X-Title"] = "Log & Ledger";
  }
  let endpoint = `${baseUrl}/v1/chat/completions`;
  if (providerName === "ollama") {
    endpoint = `${baseUrl}/v1/chat/completions`;
  } else if (providerName === "lmstudio") {
    endpoint = `${baseUrl}/v1/chat/completions`;
  }
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.1,
        max_tokens: 4e3
      })
    });
    if (!response.ok) {
      const error = await response.text().catch(() => response.statusText);
      throw new Error(`${providerName} API error (${response.status}): ${error}`);
    }
    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || "",
      usage: data.usage,
      model: data.model || model,
      provider: providerName
    };
  } catch (error) {
    if (providerName === "ollama" || providerName === "lmstudio" || providerName === "local") {
      throw new Error(`Failed to connect to ${providerName}. Make sure the local server is running at ${baseUrl}. Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
    throw error;
  }
}
async function callAnthropic(config, messages) {
  const baseUrl = config.baseUrl || "https://api.anthropic.com";
  const model = config.model || "claude-3-5-sonnet-20241022";
  const systemMessage = messages.find((m) => m.role === "system");
  const conversationMessages = messages.filter((m) => m.role !== "system").map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: typeof m.content === "string" ? m.content : m.content.map((c) => {
      if (c.type === "text") return { type: "text", text: c.text };
      if (c.type === "image_url") {
        const match = c.image_url?.url.match(/^data:image\/([\w]+);base64,(.+)$/);
        if (match) {
          return {
            type: "image",
            source: {
              type: "base64",
              media_type: `image/${match[1]}`,
              data: match[2]
            }
          };
        }
      }
      return { type: "text", text: "" };
    })
  }));
  const response = await fetch(`${baseUrl}/v1/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model,
      max_tokens: 4e3,
      system: systemMessage?.content || void 0,
      messages: conversationMessages
    })
  });
  if (!response.ok) {
    const error = await response.text().catch(() => response.statusText);
    throw new Error(`Anthropic API error (${response.status}): ${error}`);
  }
  const data = await response.json();
  const content = data.content[0]?.text || "";
  return {
    content,
    usage: {
      prompt_tokens: data.usage?.input_tokens || 0,
      completion_tokens: data.usage?.output_tokens || 0,
      total_tokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
    },
    model: data.model,
    provider: "anthropic"
  };
}
async function callGoogleGemini(config, messages) {
  const baseUrl = config.baseUrl || "https://generativelanguage.googleapis.com";
  const model = config.model || "gemini-1.5-flash";
  const systemMessage = messages.find((m) => m.role === "system");
  const contents = messages.filter((m) => m.role !== "system").map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: typeof m.content === "string" ? [{ text: m.content }] : m.content.map((c) => {
      if (c.type === "text") return { text: c.text };
      if (c.type === "image_url") {
        const match = c.image_url?.url.match(/^data:(image\/[\w]+);base64,(.+)$/);
        if (match) {
          return {
            inline_data: {
              mime_type: match[1],
              data: match[2]
            }
          };
        }
      }
      return { text: "" };
    })
  }));
  const response = await fetch(`${baseUrl}/v1beta/models/${model}:generateContent?key=${config.apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents,
      systemInstruction: systemMessage ? { parts: [{ text: systemMessage.content }] } : void 0,
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4e3
      }
    })
  });
  if (!response.ok) {
    const error = await response.text().catch(() => response.statusText);
    throw new Error(`Google Gemini API error (${response.status}): ${error}`);
  }
  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return {
    content,
    usage: {
      prompt_tokens: data.usageMetadata?.promptTokenCount || 0,
      completion_tokens: data.usageMetadata?.candidatesTokenCount || 0,
      total_tokens: data.usageMetadata?.totalTokenCount || 0
    },
    model,
    provider: "google"
  };
}
async function callAzureOpenAI(config, messages) {
  if (!config.baseUrl || !config.deploymentId) {
    throw new Error("Azure OpenAI requires baseUrl and deploymentId");
  }
  const url = `${config.baseUrl}/openai/deployments/${config.deploymentId}/chat/completions?api-version=2024-02-15-preview`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": config.apiKey
    },
    body: JSON.stringify({
      messages,
      temperature: 0.1,
      max_tokens: 4e3
    })
  });
  if (!response.ok) {
    const error = await response.text().catch(() => response.statusText);
    throw new Error(`Azure OpenAI API error (${response.status}): ${error}`);
  }
  const data = await response.json();
  return {
    content: data.choices[0]?.message?.content || "",
    usage: data.usage,
    model: config.deploymentId,
    provider: "azure"
  };
}
async function callAIProvider(config, messages) {
  let redactedCount = 0;
  const redactedMessages = messages.map((msg) => {
    if (msg.role === "system") return msg;
    if (typeof msg.content === "string") {
      const { text: text2, entries } = redactForAI(msg.content);
      redactedCount += entries.length;
      return { ...msg, content: text2 };
    } else if (Array.isArray(msg.content)) {
      const newContent = msg.content.map((c) => {
        if (c.type === "text" && c.text) {
          const { text: text2, entries } = redactForAI(c.text);
          redactedCount += entries.length;
          return { ...c, text: text2 };
        }
        return c;
      });
      return { ...msg, content: newContent };
    }
    return msg;
  });
  let response;
  const isOpenAICompatible = OPENAI_COMPATIBLE_PROVIDERS.includes(config.provider) || config.provider.endsWith("-compatible") || config.provider === "custom";
  switch (config.provider) {
    // Native implementations
    case "anthropic":
      response = await callAnthropic(config, redactedMessages);
      break;
    case "google":
      response = await callGoogleGemini(config, redactedMessages);
      break;
    case "azure":
      response = await callAzureOpenAI(config, redactedMessages);
      break;
    // OpenAI and OpenAI-compatible providers
    case "openai":
    case "openrouter":
    case "groq":
    case "mistral":
    case "together":
    case "xai":
    case "cohere":
    case "deepseek":
    case "ollama":
    case "lmstudio":
    case "local":
    case "custom":
      response = await callOpenAICompatible(config, redactedMessages, config.provider);
      break;
    default:
      if (config.baseUrl) {
        console.log(`Unknown provider "${config.provider}", attempting OpenAI-compatible API with custom baseUrl`);
        response = await callOpenAICompatible(config, redactedMessages, config.provider);
      } else {
        throw new Error(`Unsupported AI provider: ${config.provider}. Please provide a baseUrl for custom providers.`);
      }
  }
  if (response.usage) {
    const cost = calcCost(
      response.provider,
      response.model,
      response.usage.prompt_tokens,
      response.usage.completion_tokens
    );
    response.cost = {
      totalUSD: cost.totalUSD,
      currency: "USD"
    };
  }
  response.redaction = {
    redacted: redactedCount > 0,
    count: redactedCount
  };
  return response;
}
function buildInvoiceExtractionMessages(text2, imageBase64, mimeType, customPrompt) {
  const systemPrompt = customPrompt || `You are an expert at extracting structured data from invoices. 
Extract the following fields from the invoice and return them as a valid JSON object:
{
  "invoice_number": "string",
  "invoice_date": "YYYY-MM-DD",
  "due_date": "YYYY-MM-DD",
  "vendor_name": "string",
  "vendor_tax_id": "string",
  "subtotal": "number",
  "tax_amount": "number",
  "total": "number",
  "currency": "string (3-letter code)",
  "line_items": [
    {
      "description": "string",
      "quantity": "number",
      "unit_price": "number",
      "total": "number"
    }
  ]
}
Return ONLY the JSON object, no additional text.`;
  const messages = [
    {
      role: "system",
      content: systemPrompt
    }
  ];
  if (imageBase64 && mimeType) {
    messages.push({
      role: "user",
      content: [
        {
          type: "text",
          text: "Extract invoice data from this image:"
        },
        {
          type: "image_url",
          image_url: {
            url: `data:${mimeType};base64,${imageBase64}`
          }
        }
      ]
    });
  } else if (text2) {
    messages.push({
      role: "user",
      content: `Extract invoice data from this text:

${text2}`
    });
  }
  return messages;
}
var OPENAI_COMPATIBLE_PROVIDERS, PROVIDER_BASE_URLS, PROVIDER_DEFAULT_MODELS;
var init_aiProviders = __esm({
  "server/utils/aiProviders.ts"() {
    "use strict";
    init_redaction();
    init_costing();
    OPENAI_COMPATIBLE_PROVIDERS = [
      "openai",
      "openrouter",
      "groq",
      "mistral",
      "together",
      "xai",
      "cohere",
      "deepseek",
      "ollama",
      "lmstudio",
      "local",
      "custom"
    ];
    PROVIDER_BASE_URLS = {
      openai: "https://api.openai.com",
      openrouter: "https://openrouter.ai/api",
      groq: "https://api.groq.com/openai",
      mistral: "https://api.mistral.ai",
      together: "https://api.together.xyz",
      xai: "https://api.x.ai",
      cohere: "https://api.cohere.ai/compatibility",
      deepseek: "https://api.deepseek.com",
      anthropic: "https://api.anthropic.com",
      google: "https://generativelanguage.googleapis.com",
      ollama: "http://localhost:11434",
      lmstudio: "http://localhost:1234"
    };
    PROVIDER_DEFAULT_MODELS = {
      openai: "gpt-4o-mini",
      openrouter: "openai/gpt-4o-mini",
      groq: "llama-3.1-70b-versatile",
      mistral: "mistral-large-latest",
      together: "meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo",
      xai: "grok-beta",
      cohere: "command-r-plus",
      deepseek: "deepseek-chat",
      anthropic: "claude-3-5-sonnet-20241022",
      google: "gemini-1.5-flash",
      ollama: "llama3.2",
      lmstudio: "local-model"
    };
  }
});

// server/ai/providerStrategy.ts
var providerStrategy_exports = {};
__export(providerStrategy_exports, {
  adjustCandidatesWithFeedback: () => adjustCandidatesWithFeedback,
  estimateCostUsd: () => estimateCostUsd,
  normalizeProviders: () => normalizeProviders,
  selectPipeline: () => selectPipeline
});
function normalizeProviders(rows) {
  return (rows || []).map((r) => ({
    id: String(r.id ?? ""),
    provider: String((r.provider || "").toLowerCase() || "openai"),
    baseUrl: r.base_url || void 0,
    apiKeyMasked: !!r.api_key ? true : false,
    defaultModel: r.default_model || null,
    visionModel: r.vision_model || null,
    enabled: r.enabled ?? true
  }));
}
function adjustCandidatesWithFeedback(candidates, scores) {
  if (!scores.length) return candidates;
  const scoreMap = new Map(scores.map((s) => [s.provider.toLowerCase(), s]));
  return [...candidates].sort((a, b) => {
    const sA = scoreMap.get(a.provider.toLowerCase());
    const sB = scoreMap.get(b.provider.toLowerCase());
    const rateA = sA ? sA.acceptanceRate : 0.5;
    const rateB = sB ? sB.acceptanceRate : 0.5;
    if (Math.abs(rateA - rateB) > 0.1) return rateB - rateA;
    const countA = sA ? sA.totalFeedback : 0;
    const countB = sB ? sB.totalFeedback : 0;
    return countB - countA;
  });
}
function estimateCostUsd(plan) {
  try {
    if (!plan.provider || !plan.model) return 0;
    const { calcCost: calcCost2 } = (init_costing(), __toCommonJS(costing_exports));
    const inputTokens = plan.inputTokens || (plan.bytes ? Math.ceil((plan.bytes || 0) / 4) : 0);
    const outputTokens = plan.outputTokens || 0;
    const est = calcCost2(plan.provider.provider.toLowerCase(), plan.model, inputTokens, outputTokens, plan.mode === "vision" ? 600 : 0);
    return est.totalUSD;
  } catch {
    return 0;
  }
}
function selectPipeline(params) {
  const { mimeType, pagesCount, imageProvided, wantsVision, candidates } = params;
  const warnings = [];
  const mt = (mimeType || "").toLowerCase();
  const isPdf = /pdf/.test(mt);
  const visionCand = candidates.find((c) => (c.enabled ?? true) && c.visionModel);
  if (imageProvided && !isPdf) {
    if (visionCand) {
      const model = visionCand.visionModel || visionCand.defaultModel || "gpt-4o-mini";
      const plan = {
        mode: "vision",
        reason: "Image input and a vision-capable provider is configured",
        steps: ["vision"],
        provider: visionCand,
        model,
        warnings,
        estimated_cost_usd: 0
      };
      plan.estimated_cost_usd = estimateCostUsd(plan);
      return plan;
    }
    warnings.push("No vision-capable provider configured; vision not available.");
    return {
      mode: "ocr+llm",
      reason: "Image input but no vision provider; using OCR then optional LLM refinement",
      steps: ["ocr", "llm-extract"],
      warnings,
      estimated_cost_usd: 0
    };
  }
  if (isPdf) {
    const longDoc = (pagesCount ?? 0) > 10;
    return {
      mode: "pdf",
      reason: longDoc ? "PDF with many pages; using text extraction heuristics" : "PDF provided; using pdf-parse to extract text then heuristics",
      steps: ["pdf-parse", "text-heuristics"],
      provider: void 0,
      model: void 0,
      warnings,
      estimated_cost_usd: 0
    };
  }
  return {
    mode: "text",
    reason: "Plain text provided; using lightweight heuristics",
    steps: ["text-heuristics"],
    provider: void 0,
    model: void 0,
    warnings,
    estimated_cost_usd: 0
  };
}
var init_providerStrategy = __esm({
  "server/ai/providerStrategy.ts"() {
    "use strict";
  }
});

// server/utils/ai.ts
var ai_exports = {};
__export(ai_exports, {
  classifyTransaction: () => classifyTransaction,
  default: () => ai_default,
  textSimilarity: () => textSimilarity
});
function tokenize(text2) {
  return (text2 || "").toLowerCase().split(/[^a-z0-9]+/g).filter((t) => t.length >= 3);
}
function textSimilarity(a, b) {
  const A = new Set(tokenize(a));
  const B = new Set(tokenize(b));
  if (A.size === 0 && B.size === 0) return 0;
  let inter = 0;
  A.forEach((t) => {
    if (B.has(t)) inter++;
  });
  const union = A.size + B.size - inter;
  return union === 0 ? 0 : inter / union;
}
function classifyTransaction(input) {
  const baseText = [input.description, input.merchant, input.notes].filter(Boolean).join(" ");
  const tokens = tokenize(baseText);
  const scores = {};
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let best = 0;
    for (const k of keywords) {
      const s = textSimilarity(baseText, k);
      if (s > best) best = s;
    }
    scores[category] = best;
  }
  if (typeof input.amount === "number") {
    const amt = input.amount;
    if (amt < 0) {
      for (const c of Object.keys(scores)) {
        if (c !== "Income/Sales") scores[c] += 0.05;
      }
      scores["Income/Sales"] -= 0.05;
    } else if (amt > 0) {
      scores["Income/Sales"] += 0.05;
    }
  }
  const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [matchedCategory, rawScore] = entries[0];
  const second = entries[1]?.[1] ?? 0;
  const gap = Math.max(0, rawScore - second);
  const confidence = Math.max(0.3, Math.min(0.95, 0.5 + rawScore * 0.5 + gap * 0.4));
  const accounts5 = CATEGORY_DEFAULT_ACCOUNTS[matchedCategory] || CATEGORY_DEFAULT_ACCOUNTS["Other Expense"];
  return {
    category: matchedCategory,
    confidence: Number(confidence.toFixed(2)),
    suggestedAccounts: accounts5,
    signals: {
      matchedCategory,
      scores,
      tokens
    }
  };
}
var CATEGORY_KEYWORDS, CATEGORY_DEFAULT_ACCOUNTS, ai_default;
var init_ai = __esm({
  "server/utils/ai.ts"() {
    "use strict";
    CATEGORY_KEYWORDS = {
      "Income/Sales": ["payment", "sale", "invoice", "stripe", "paypal", "gateway", "payout", "deposit", "customer"],
      "Meals & Entertainment": ["restaurant", "cafe", "coffee", "meal", "food", "dining", "ubereats", "doordash", "takeaway"],
      "Travel": ["uber", "lyft", "taxi", "airbnb", "hotel", "flight", "airlines", "train", "metro", "transport"],
      "Office Supplies": ["stationery", "paper", "ink", "toner", "office", "staples", "office depot", "pens", "notebook"],
      "Utilities": ["electric", "electricity", "water", "gas", "internet", "isp", "wifi", "utility", "phone", "mobile", "sim"],
      "Rent": ["rent", "lease", "landlord", "office rent", "workspace", "cowork", "wework"],
      "Software": ["saas", "subscription", "software", "license", "github", "gitlab", "vercel", "aws", "gcp", "azure", "notion", "slack", "zoom"],
      "Payroll": ["salary", "payroll", "wage", "stipend", "bonus", "employee", "hr", "benefits"],
      "Taxes": ["tax", "vat", "gst", "withholding", "irs", "zakat"],
      "Transfers": ["transfer", "internal", "between accounts", "owner draw", "capital", "intercompany"],
      "Other Expense": ["misc", "general", "other"]
    };
    CATEGORY_DEFAULT_ACCOUNTS = {
      "Income/Sales": { debit: ["Accounts Receivable", "Cash"], credit: ["Sales"] },
      "Meals & Entertainment": { debit: ["Meals & Entertainment"], credit: ["Cash", "Bank"] },
      "Travel": { debit: ["Travel Expense"], credit: ["Cash", "Bank"] },
      "Office Supplies": { debit: ["Office Supplies"], credit: ["Cash", "Bank"] },
      "Utilities": { debit: ["Utilities"], credit: ["Cash", "Bank"] },
      "Rent": { debit: ["Rent Expense"], credit: ["Cash", "Bank"] },
      "Software": { debit: ["Software Subscriptions"], credit: ["Cash", "Bank"] },
      "Payroll": { debit: ["Payroll Expense"], credit: ["Cash", "Bank"] },
      "Taxes": { debit: ["Taxes & Licenses"], credit: ["Cash", "Bank"] },
      "Transfers": { debit: ["Intercompany Receivable", "Owner's Draw"], credit: ["Intercompany Payable", "Owner's Equity"] },
      "Other Expense": { debit: ["General Expenses"], credit: ["Cash", "Bank"] }
    };
    ai_default = {
      classifyTransaction,
      textSimilarity
    };
  }
});

// server/middleware/permissions.ts
var permissions_exports = {};
__export(permissions_exports, {
  checkUserPermission: () => checkUserPermission,
  clearPermissionsCache: () => clearPermissionsCache,
  getRolePermissions: () => getRolePermissions,
  requireAllPermissions: () => requireAllPermissions,
  requireAnyPermission: () => requireAnyPermission,
  requireAuth: () => requireAuth2,
  requireFirebaseAuth: () => requireFirebaseAuth2,
  requirePermission: () => requirePermission,
  requireRole: () => requireRole2
});
import { sql as sql6, eq as eq7 } from "drizzle-orm";
async function checkUserPermission(userId, userRole, module, action) {
  if (userRole === "owner") return true;
  const cacheKey = `${module}:${action}`;
  const userCache = permissionsCache.get(userId);
  if (userCache?.has(cacheKey)) {
    return userCache.get(cacheKey) || false;
  }
  try {
    const permissions = await db.query.user_permissions.findMany({
      where: eq7(user_permissions.user_id, userId)
    });
    const modulePermission = permissions.find((p) => p.module === module);
    let hasPermission = false;
    if (modulePermission) {
      switch (action) {
        case "view":
          hasPermission = modulePermission.can_view;
          break;
        case "create":
          hasPermission = modulePermission.can_create;
          break;
        case "edit":
          hasPermission = modulePermission.can_edit;
          break;
        case "delete":
          hasPermission = modulePermission.can_delete;
          break;
      }
    } else {
      hasPermission = checkRolePermission(userRole, module, action);
    }
    if (!permissionsCache.has(userId)) {
      permissionsCache.set(userId, /* @__PURE__ */ new Map());
    }
    permissionsCache.get(userId).set(cacheKey, hasPermission);
    return hasPermission;
  } catch (error) {
    console.error("Error checking permission:", error);
    return checkRolePermission(userRole, module, action);
  }
}
function checkRolePermission(role, module, action) {
  if (role === "owner") return true;
  if (role === "admin") {
    if (module === "users" && action === "delete") return false;
    if (module === "accounts" && action === "delete") return false;
    return true;
  }
  if (role === "accountant") {
    if (["sales", "purchases"].includes(module) && action === "view") return true;
    if (["banking", "accounts", "reports"].includes(module)) return true;
    return false;
  }
  if (role === "sales") {
    if (module === "sales" && action === "view") return true;
    if (module === "contacts" && ["create", "edit", "view"].includes(action)) return true;
    if (module === "items" && action === "view") return true;
    return false;
  }
  if (role === "viewer") {
    return action === "view";
  }
  return false;
}
function clearPermissionsCache(userId) {
  if (userId) {
    permissionsCache.delete(userId);
  } else {
    permissionsCache.clear();
  }
}
function requirePermission(module, action) {
  return async (req, res, next) => {
    try {
      const session3 = req.session;
      if (!session3 || !session3.userId) {
        return forbidden(res, "Authentication required");
      }
      const userId = session3.userId;
      const userRole = session3.userRole || "viewer";
      const hasPermission = await checkUserPermission(userId, userRole, module, action);
      if (!hasPermission) {
        console.warn(`Permission denied: ${userRole} attempted ${action} on ${module}`, {
          userId: session3.userId,
          role: userRole,
          module,
          action,
          ip: req.ip
        });
        return forbidden(res, `Insufficient permissions: ${userRole} cannot ${action} ${module}`);
      }
      next();
    } catch (error) {
      console.error("Error in requirePermission middleware:", error);
      return forbidden(res, "Permission check failed");
    }
  };
}
function requireAnyPermission(permissions) {
  return async (req, res, next) => {
    try {
      const session3 = req.session;
      if (!session3 || !session3.userId) {
        return forbidden(res, "Authentication required");
      }
      const userId = session3.userId;
      const userRole = session3.userRole || "viewer";
      for (const perm of permissions) {
        const hasPermission = await checkUserPermission(userId, userRole, perm.module, perm.action);
        if (hasPermission) {
          return next();
        }
      }
      console.warn(`Permission denied: ${userRole} attempted multiple permissions`, {
        userId: session3.userId,
        role: userRole,
        permissions,
        ip: req.ip
      });
      return forbidden(res, "Insufficient permissions");
    } catch (error) {
      console.error("Error in requireAnyPermission middleware:", error);
      return forbidden(res, "Permission check failed");
    }
  };
}
function requireAllPermissions(permissions) {
  return async (req, res, next) => {
    try {
      const session3 = req.session;
      if (!session3 || !session3.userId) {
        return forbidden(res, "Authentication required");
      }
      const userId = session3.userId;
      const userRole = session3.userRole || "viewer";
      for (const perm of permissions) {
        const hasPermission = await checkUserPermission(userId, userRole, perm.module, perm.action);
        if (!hasPermission) {
          return forbidden(res, `Insufficient permissions: missing ${perm.module}:${perm.action}`);
        }
      }
      next();
    } catch (error) {
      console.error("Error in requireAllPermissions middleware:", error);
      return forbidden(res, "Permission check failed");
    }
  };
}
async function getRolePermissions(role) {
  try {
    const result = await db.execute(sql6`
      SELECT resource, action, allowed 
      FROM role_permissions 
      WHERE role = ${role}
      ORDER BY resource, action
    `);
    return result.rows;
  } catch (error) {
    console.error("Error getting role permissions:", error);
    return [];
  }
}
function requireAuth2(req, res, next) {
  if (!req.session || !req.session.userId) {
    return forbidden(res, "Authentication required");
  }
  next();
}
function requireRole2(roles) {
  return (req, res, next) => {
    const userRole = req.session?.userRole;
    if (!userRole || !roles.includes(userRole)) {
      return forbidden(res, "Insufficient role permissions");
    }
    next();
  };
}
var permissionsCache, requireFirebaseAuth2;
var init_permissions = __esm({
  "server/middleware/permissions.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_sendError();
    init_firebaseAdmin();
    permissionsCache = /* @__PURE__ */ new Map();
    requireFirebaseAuth2 = async (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return unauthorized(res, "Authentication required");
        }
        const token = authHeader.split("Bearer ")[1];
        const decodedToken = await verifyFirebaseToken(token);
        req.firebaseUser = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          name: decodedToken.name || decodedToken.displayName || null,
          picture: decodedToken.picture || null
        };
        next();
      } catch (error) {
        console.error("Firebase token verification failed:", error);
        return unauthorized(res, "Authentication required");
      }
    };
  }
});

// server/utils/email.ts
var email_exports = {};
__export(email_exports, {
  isEmailServiceConfigured: () => isEmailServiceConfigured,
  sendEmail: () => sendEmail,
  sendInvoiceEmail: () => sendInvoiceEmail,
  sendPaymentReminder: () => sendPaymentReminder
});
import nodemailer from "nodemailer";
async function sendEmail(options2) {
  const transporter = createTransporter();
  if (!transporter) {
    return {
      success: false,
      error: "Email service not configured. Please set SMTP credentials in environment variables."
    };
  }
  try {
    const info = await transporter.sendMail({
      from: options2.from || `"${process.env.SMTP_FROM_NAME || "Log & Ledger"}" <${emailConfig.auth.user}>`,
      to: options2.to,
      cc: options2.cc,
      bcc: options2.bcc,
      subject: options2.subject,
      text: options2.text,
      html: options2.html,
      attachments: options2.attachments
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error: error.message || "Failed to send email" };
  }
}
async function sendInvoiceEmail(options2) {
  const isArabic = options2.language === "ar";
  const subject = isArabic ? `\u0641\u0627\u062A\u0648\u0631\u0629 \u0631\u0642\u0645 ${options2.invoiceNumber} \u0645\u0646 ${options2.companyName}` : `Invoice #${options2.invoiceNumber} from ${options2.companyName}`;
  const greeting = isArabic ? `\u0639\u0632\u064A\u0632\u064A ${options2.customerName}\u060C` : `Dear ${options2.customerName},`;
  const intro = isArabic ? `\u0645\u0631\u0641\u0642 \u0641\u0627\u062A\u0648\u0631\u062A\u0643\u0645 \u0631\u0642\u0645 ${options2.invoiceNumber} \u0628\u0642\u064A\u0645\u0629 ${options2.amount} ${options2.currency}.` : `Please find attached invoice #${options2.invoiceNumber} for ${options2.amount} ${options2.currency}.`;
  const dueInfo = isArabic ? `\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0627\u0633\u062A\u062D\u0642\u0627\u0642: ${options2.dueDate}` : `Due Date: ${options2.dueDate}`;
  const customMsg = options2.customMessage ? `<p style="margin: 20px 0;">${options2.customMessage}</p>` : "";
  const closing = isArabic ? `\u0634\u0643\u0631\u0627\u064B \u0644\u062A\u0639\u0627\u0645\u0644\u0643\u0645 \u0645\u0639\u0646\u0627.<br><br>\u0645\u0639 \u0623\u0637\u064A\u0628 \u0627\u0644\u062A\u062D\u064A\u0627\u062A\u060C<br>${options2.companyName}` : `Thank you for your business.<br><br>Best regards,<br>${options2.companyName}`;
  const html = `
    <!DOCTYPE html>
    <html dir="${isArabic ? "rtl" : "ltr"}" lang="${options2.language || "en"}">
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: ${isArabic ? "'Segoe UI', Tahoma, Arial" : "'Segoe UI', Tahoma, Arial"}, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          direction: ${isArabic ? "rtl" : "ltr"};
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 8px 8px 0 0;
          text-align: center;
        }
        .content {
          background: #f9fafb;
          padding: 30px;
          border: 1px solid #e5e7eb;
          border-top: none;
        }
        .invoice-box {
          background: white;
          border: 2px solid #667eea;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
        }
        .invoice-number {
          font-size: 24px;
          font-weight: bold;
          color: #667eea;
        }
        .amount {
          font-size: 28px;
          font-weight: bold;
          color: #1f2937;
          margin: 10px 0;
        }
        .due-date {
          color: #dc2626;
          font-weight: 600;
        }
        .footer {
          background: #1f2937;
          color: #9ca3af;
          padding: 20px;
          border-radius: 0 0 8px 8px;
          text-align: center;
          font-size: 12px;
        }
        p { margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="margin: 0;">${options2.companyName}</h1>
        <p style="margin: 5px 0; opacity: 0.9;">${isArabic ? "\u0641\u0627\u062A\u0648\u0631\u0629" : "Invoice"}</p>
      </div>
      
      <div class="content">
        <p>${greeting}</p>
        <p>${intro}</p>
        
        <div class="invoice-box">
          <div class="invoice-number">#${options2.invoiceNumber}</div>
          <div class="amount">${options2.amount} ${options2.currency}</div>
          <div class="due-date">${dueInfo}</div>
        </div>
        
        ${customMsg}
        
        <p>${closing}</p>
      </div>
      
      <div class="footer">
        <p>${isArabic ? "\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0647\u0630\u0627 \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0645\u0646 \u0646\u0638\u0627\u0645 Log & Ledger" : "This email was sent from Log & Ledger"}</p>
      </div>
    </body>
    </html>
  `;
  const text2 = `
${greeting}

${intro}

${dueInfo}

${options2.customMessage || ""}

${closing.replace(/<br>/g, "\n")}
  `.trim();
  const attachments2 = [];
  if (options2.pdfBuffer) {
    attachments2.push({
      filename: `Invoice-${options2.invoiceNumber}.pdf`,
      content: options2.pdfBuffer,
      contentType: "application/pdf"
    });
  }
  return sendEmail({
    to: options2.to,
    cc: options2.cc,
    subject,
    html,
    text: text2,
    attachments: attachments2
  });
}
async function sendPaymentReminder(options2) {
  const isArabic = options2.language === "ar";
  const subject = isArabic ? `\u062A\u0630\u0643\u064A\u0631 \u0628\u0633\u062F\u0627\u062F \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629 \u0631\u0642\u0645 ${options2.invoiceNumber}` : `Payment Reminder: Invoice #${options2.invoiceNumber}`;
  const urgencyText = options2.daysOverdue > 30 ? isArabic ? "(\u0645\u062A\u0623\u062E\u0631 \u062C\u062F\u0627\u064B)" : "(Severely Overdue)" : options2.daysOverdue > 0 ? isArabic ? "(\u0645\u062A\u0623\u062E\u0631)" : "(Overdue)" : "";
  const html = `
    <!DOCTYPE html>
    <html dir="${isArabic ? "rtl" : "ltr"}">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .alert { background: #fef2f2; border: 1px solid #dc2626; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .amount { font-size: 24px; font-weight: bold; color: #dc2626; }
      </style>
    </head>
    <body>
      <h2>${isArabic ? "\u062A\u0630\u0643\u064A\u0631 \u0628\u0627\u0644\u062F\u0641\u0639" : "Payment Reminder"} ${urgencyText}</h2>
      
      <p>${isArabic ? `\u0639\u0632\u064A\u0632\u064A ${options2.customerName}\u060C` : `Dear ${options2.customerName},`}</p>
      
      <div class="alert">
        <p><strong>${isArabic ? "\u0641\u0627\u062A\u0648\u0631\u0629 \u0631\u0642\u0645:" : "Invoice #:"}</strong> ${options2.invoiceNumber}</p>
        <p class="amount">${isArabic ? "\u0627\u0644\u0645\u0628\u0644\u063A \u0627\u0644\u0645\u0633\u062A\u062D\u0642:" : "Amount Due:"} ${options2.amount} ${options2.currency}</p>
        <p><strong>${isArabic ? "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0627\u0633\u062A\u062D\u0642\u0627\u0642:" : "Due Date:"}</strong> ${options2.dueDate}</p>
        ${options2.daysOverdue > 0 ? `<p style="color: #dc2626;"><strong>${isArabic ? "\u0623\u064A\u0627\u0645 \u0627\u0644\u062A\u0623\u062E\u064A\u0631:" : "Days Overdue:"}</strong> ${options2.daysOverdue}</p>` : ""}
      </div>
      
      <p>${isArabic ? "\u0646\u0631\u062C\u0648 \u0645\u0646\u0643\u0645 \u0633\u062F\u0627\u062F \u0627\u0644\u0645\u0628\u0644\u063A \u0627\u0644\u0645\u0633\u062A\u062D\u0642 \u0641\u064A \u0623\u0642\u0631\u0628 \u0648\u0642\u062A \u0645\u0645\u0643\u0646." : "Please arrange payment at your earliest convenience."}</p>
      
      <p>${isArabic ? "\u0645\u0639 \u0623\u0637\u064A\u0628 \u0627\u0644\u062A\u062D\u064A\u0627\u062A\u060C" : "Best regards,"}<br>${options2.companyName}</p>
    </body>
    </html>
  `;
  return sendEmail({ to: options2.to, subject, html });
}
function isEmailServiceConfigured() {
  return !!(process.env.SMTP_USER && process.env.SMTP_PASS);
}
var emailConfig, createTransporter;
var init_email = __esm({
  "server/utils/email.ts"() {
    "use strict";
    emailConfig = {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || ""
      }
    };
    createTransporter = () => {
      if (!emailConfig.auth.user || !emailConfig.auth.pass) {
        console.warn("Email service not configured. Set SMTP_USER and SMTP_PASS environment variables.");
        return null;
      }
      return nodemailer.createTransport({
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        auth: emailConfig.auth
      });
    };
  }
});

// server/utils/reports.ts
var reports_exports = {};
__export(reports_exports, {
  getAgingReport: () => getAgingReport,
  getBalanceSheet: () => getBalanceSheet,
  getConsolidatedBalanceSheet: () => getConsolidatedBalanceSheet,
  getContactStatement: () => getContactStatement,
  getGeneralLedger: () => getGeneralLedger,
  getGlobalDashboardStats: () => getGlobalDashboardStats,
  getIncomeStatement: () => getIncomeStatement,
  getProfitLossComparison: () => getProfitLossComparison,
  getPurchasesSummary: () => getPurchasesSummary,
  getSalesSummary: () => getSalesSummary,
  getTrialBalance: () => getTrialBalance
});
import { eq as eq22, and as and18, lte as lte5, gte as gte5, sql as sql12, sum as sum4, or as or3 } from "drizzle-orm";
async function getTrialBalance(companyId, startDate, endDate) {
  const allAccounts = await db.select().from(accounts).where(eq22(accounts.company_id, companyId)).orderBy(accounts.code);
  const openingBalances = await db.select({
    accountId: journal_lines.account_id,
    balance: sql12`sum(${journal_lines.base_debit} - ${journal_lines.base_credit})`
  }).from(journal_lines).innerJoin(journals, eq22(journal_lines.journal_id, journals.id)).where(and18(
    eq22(journals.company_id, companyId),
    sql12`${journals.date} < ${startDate.toISOString()}`
  )).groupBy(journal_lines.account_id);
  const openingMap = /* @__PURE__ */ new Map();
  openingBalances.forEach((r) => {
    openingMap.set(r.accountId, parseFloat(r.balance || "0"));
  });
  const periodActivity = await db.select({
    accountId: journal_lines.account_id,
    debit: sum4(journal_lines.base_debit),
    credit: sum4(journal_lines.base_credit)
  }).from(journal_lines).innerJoin(journals, eq22(journal_lines.journal_id, journals.id)).where(and18(
    eq22(journals.company_id, companyId),
    gte5(journals.date, startDate),
    lte5(journals.date, endDate)
  )).groupBy(journal_lines.account_id);
  const activityMap = /* @__PURE__ */ new Map();
  periodActivity.forEach((r) => {
    activityMap.set(r.accountId, {
      debit: parseFloat(r.debit || "0"),
      credit: parseFloat(r.credit || "0")
    });
  });
  const report = allAccounts.map((acc) => {
    const opening = openingMap.get(acc.id) || 0;
    const activity = activityMap.get(acc.id) || { debit: 0, credit: 0 };
    const netMovement = activity.debit - activity.credit;
    const closing = opening + netMovement;
    if (Math.abs(opening) < 0.01 && Math.abs(activity.debit) < 0.01 && Math.abs(activity.credit) < 0.01) {
      return null;
    }
    return {
      accountId: acc.id,
      accountCode: acc.code,
      accountName: acc.name,
      accountType: acc.account_type,
      openingBalance: opening,
      debit: activity.debit,
      credit: activity.credit,
      netMovement,
      closingBalance: closing
    };
  }).filter((line) => line !== null);
  return report;
}
async function getGeneralLedger(companyId, accountId, startDate, endDate) {
  const openingResult = await db.select({
    balance: sql12`sum(${journal_lines.base_debit} - ${journal_lines.base_credit})`
  }).from(journal_lines).innerJoin(journals, eq22(journal_lines.journal_id, journals.id)).where(and18(
    eq22(journals.company_id, companyId),
    eq22(journal_lines.account_id, accountId),
    sql12`${journals.date} < ${startDate.toISOString()}`
  ));
  const openingBalance = parseFloat(openingResult[0]?.balance || "0");
  const transactions = await db.select({
    id: journal_lines.id,
    date: journals.date,
    journalNumber: journals.journal_number,
    description: journal_lines.description,
    reference: journals.reference,
    debit: journal_lines.base_debit,
    credit: journal_lines.base_credit,
    accountName: accounts.name,
    accountCode: accounts.code
  }).from(journal_lines).innerJoin(journals, eq22(journal_lines.journal_id, journals.id)).innerJoin(accounts, eq22(journal_lines.account_id, accounts.id)).where(and18(
    eq22(journals.company_id, companyId),
    eq22(journal_lines.account_id, accountId),
    gte5(journals.date, startDate),
    lte5(journals.date, endDate)
  )).orderBy(journals.date, journals.created_at);
  let currentBalance = openingBalance;
  const lines = transactions.map((t) => {
    const debit = parseFloat(t.debit?.toString() || "0");
    const credit = parseFloat(t.credit?.toString() || "0");
    currentBalance += debit - credit;
    return {
      id: t.id,
      date: t.date,
      journalNumber: t.journalNumber,
      description: t.description,
      reference: t.reference,
      debit,
      credit,
      balance: currentBalance,
      accountName: t.accountName,
      accountCode: t.accountCode
    };
  });
  return {
    openingBalance,
    lines,
    closingBalance: currentBalance
  };
}
async function getIncomeStatement(companyId, startDate, endDate) {
  const balances = await db.select({
    accountId: accounts.id,
    accountCode: accounts.code,
    accountName: accounts.name,
    accountType: accounts.account_type,
    accountSubtype: accounts.account_subtype,
    debit: sum4(journal_lines.base_debit),
    credit: sum4(journal_lines.base_credit)
  }).from(accounts).leftJoin(journal_lines, eq22(accounts.id, journal_lines.account_id)).leftJoin(journals, eq22(journal_lines.journal_id, journals.id)).where(and18(
    eq22(accounts.company_id, companyId),
    sql12`${accounts.account_type} IN ('revenue', 'expense')`,
    gte5(journals.date, startDate),
    lte5(journals.date, endDate)
  )).groupBy(accounts.id, accounts.code, accounts.name, accounts.account_type, accounts.account_subtype).orderBy(accounts.code);
  const revenue = [];
  const expenses2 = [];
  let totalRevenue = 0;
  let totalExpenses = 0;
  balances.forEach((b) => {
    const debit = parseFloat(b.debit?.toString() || "0");
    const credit = parseFloat(b.credit?.toString() || "0");
    let balance = 0;
    if (b.accountType === "revenue") {
      balance = credit - debit;
      if (Math.abs(balance) > 0.01) {
        revenue.push({
          accountId: b.accountId,
          accountCode: b.accountCode,
          accountName: b.accountName,
          accountType: b.accountType,
          accountSubtype: b.accountSubtype,
          balance
        });
        totalRevenue += balance;
      }
    } else {
      balance = debit - credit;
      if (Math.abs(balance) > 0.01) {
        expenses2.push({
          accountId: b.accountId,
          accountCode: b.accountCode,
          accountName: b.accountName,
          accountType: b.accountType,
          accountSubtype: b.accountSubtype,
          balance
        });
        totalExpenses += balance;
      }
    }
  });
  return {
    revenue,
    expenses: expenses2,
    netIncome: totalRevenue - totalExpenses
  };
}
async function getBalanceSheet(companyId, asOfDate) {
  const balances = await db.select({
    accountId: accounts.id,
    accountCode: accounts.code,
    accountName: accounts.name,
    accountType: accounts.account_type,
    accountSubtype: accounts.account_subtype,
    debit: sum4(journal_lines.base_debit),
    credit: sum4(journal_lines.base_credit)
  }).from(accounts).leftJoin(journal_lines, eq22(accounts.id, journal_lines.account_id)).leftJoin(journals, eq22(journal_lines.journal_id, journals.id)).where(and18(
    eq22(accounts.company_id, companyId),
    sql12`${accounts.account_type} IN ('asset', 'liability', 'equity')`,
    lte5(journals.date, asOfDate)
  )).groupBy(accounts.id, accounts.code, accounts.name, accounts.account_type, accounts.account_subtype).orderBy(accounts.code);
  const assets = [];
  const liabilities = [];
  const equity = [];
  let totalAssets = 0;
  let totalLiabilities = 0;
  let totalEquity = 0;
  balances.forEach((b) => {
    const debit = parseFloat(b.debit?.toString() || "0");
    const credit = parseFloat(b.credit?.toString() || "0");
    let balance = 0;
    if (b.accountType === "asset") {
      balance = debit - credit;
      if (Math.abs(balance) > 0.01) {
        assets.push({
          accountId: b.accountId,
          accountCode: b.accountCode,
          accountName: b.accountName,
          accountType: b.accountType,
          accountSubtype: b.accountSubtype,
          balance
        });
        totalAssets += balance;
      }
    } else if (b.accountType === "liability") {
      balance = credit - debit;
      if (Math.abs(balance) > 0.01) {
        liabilities.push({
          accountId: b.accountId,
          accountCode: b.accountCode,
          accountName: b.accountName,
          accountType: b.accountType,
          accountSubtype: b.accountSubtype,
          balance
        });
        totalLiabilities += balance;
      }
    } else if (b.accountType === "equity") {
      balance = credit - debit;
      if (Math.abs(balance) > 0.01) {
        equity.push({
          accountId: b.accountId,
          accountCode: b.accountCode,
          accountName: b.accountName,
          accountType: b.accountType,
          accountSubtype: b.accountSubtype,
          balance
        });
        totalEquity += balance;
      }
    }
  });
  const incomeResult = await db.select({
    debit: sum4(journal_lines.base_debit),
    credit: sum4(journal_lines.base_credit)
  }).from(journal_lines).innerJoin(journals, eq22(journal_lines.journal_id, journals.id)).innerJoin(accounts, eq22(journal_lines.account_id, accounts.id)).where(and18(
    eq22(journals.company_id, companyId),
    sql12`${accounts.account_type} IN ('revenue', 'expense')`,
    lte5(journals.date, asOfDate)
  ));
  const incomeDebit = parseFloat(incomeResult[0]?.debit?.toString() || "0");
  const incomeCredit = parseFloat(incomeResult[0]?.credit?.toString() || "0");
  const netIncome = incomeCredit - incomeDebit;
  if (Math.abs(netIncome) > 0.01) {
    equity.push({
      accountId: "calculated-retained-earnings",
      accountCode: "RE",
      accountName: "Retained Earnings (Calculated)",
      accountType: "equity",
      accountSubtype: "retained_earnings",
      balance: netIncome
    });
    totalEquity += netIncome;
  }
  return {
    assets,
    liabilities,
    equity,
    totals: {
      assets: totalAssets,
      liabilities: totalLiabilities,
      equity: totalEquity
    }
  };
}
async function getConsolidatedBalanceSheet(parentCompanyId, asOfDate) {
  const groupCompanies = await db.select().from(companies).where(or3(
    eq22(companies.id, parentCompanyId),
    eq22(companies.parent_company_id, parentCompanyId)
  ));
  const consolidatedAssets = [];
  const consolidatedLiabilities = [];
  const consolidatedEquity = [];
  let totalAssets = 0;
  let totalLiabilities = 0;
  let totalEquity = 0;
  for (const company of groupCompanies) {
    const bs = await getBalanceSheet(company.id, asOfDate);
    bs.assets.forEach((asset) => {
      const existing = consolidatedAssets.find((a) => a.accountCode === asset.accountCode);
      if (existing) {
        existing.balance += asset.balance;
      } else {
        consolidatedAssets.push({ ...asset, accountName: `${asset.accountName} (${company.name})` });
      }
      totalAssets += asset.balance;
    });
    bs.liabilities.forEach((liability) => {
      const existing = consolidatedLiabilities.find((l) => l.accountCode === liability.accountCode);
      if (existing) {
        existing.balance += liability.balance;
      } else {
        consolidatedLiabilities.push({ ...liability, accountName: `${liability.accountName} (${company.name})` });
      }
      totalLiabilities += liability.balance;
    });
    bs.equity.forEach((eqItem) => {
      const existing = consolidatedEquity.find((e) => e.accountCode === eqItem.accountCode);
      if (existing) {
        existing.balance += eqItem.balance;
      } else {
        consolidatedEquity.push({ ...eqItem, accountName: `${eqItem.accountName} (${company.name})` });
      }
      totalEquity += eqItem.balance;
    });
  }
  return {
    assets: consolidatedAssets,
    liabilities: consolidatedLiabilities,
    equity: consolidatedEquity,
    totals: {
      assets: totalAssets,
      liabilities: totalLiabilities,
      equity: totalEquity
    },
    companies: groupCompanies.map((c) => c.name)
  };
}
async function getGlobalDashboardStats(parentCompanyId) {
  const groupCompanies = await db.select().from(companies).where(or3(
    eq22(companies.id, parentCompanyId),
    eq22(companies.parent_company_id, parentCompanyId)
  ));
  const companyStats = [];
  const totals = {
    cash: 0,
    revenue: 0,
    expenses: 0,
    netIncome: 0
  };
  const today = /* @__PURE__ */ new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  for (const company of groupCompanies) {
    const cashBalanceResult = await db.select({
      debit: sum4(journal_lines.base_debit),
      credit: sum4(journal_lines.base_credit)
    }).from(accounts).leftJoin(journal_lines, eq22(accounts.id, journal_lines.account_id)).where(and18(
      eq22(accounts.company_id, company.id),
      or3(eq22(accounts.account_subtype, "cash"), eq22(accounts.account_subtype, "bank"))
    ));
    const cash = Number(cashBalanceResult[0]?.debit || 0) - Number(cashBalanceResult[0]?.credit || 0);
    const incomeStmt = await getIncomeStatement(company.id, startOfYear, today);
    const revenue = incomeStmt.revenue.reduce((acc, curr) => acc + curr.balance, 0);
    const expenses2 = incomeStmt.expenses.reduce((acc, curr) => acc + curr.balance, 0);
    const netIncome = incomeStmt.netIncome;
    companyStats.push({
      id: company.id,
      name: company.name,
      cash,
      revenue,
      expenses: expenses2,
      netIncome
    });
    totals.cash += cash;
    totals.revenue += revenue;
    totals.expenses += expenses2;
    totals.netIncome += netIncome;
  }
  return {
    totals,
    companies: companyStats
  };
}
async function getAgingReport(companyId, type, asOfDate) {
  const { sales_invoices: sales_invoices2, bills: bills3, contacts: contacts2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const isReceivable = type === "receivable";
  const documentTable = isReceivable ? sales_invoices2 : bills3;
  const documents = await db.select({
    id: documentTable.id,
    documentNumber: isReceivable ? documentTable.invoice_number : documentTable.bill_number,
    contactId: isReceivable ? documentTable.customer_id : documentTable.supplier_id,
    date: documentTable.date,
    dueDate: documentTable.due_date,
    total: documentTable.total,
    paidAmount: documentTable.paid_amount,
    currency: documentTable.currency,
    status: documentTable.status,
    contactName: contacts2.name,
    contactEmail: contacts2.email
  }).from(documentTable).innerJoin(contacts2, eq22(
    isReceivable ? documentTable.customer_id : documentTable.supplier_id,
    contacts2.id
  )).where(and18(
    eq22(documentTable.company_id, companyId),
    // Exclude fully paid and cancelled documents
    sql12`${documentTable.status} NOT IN ('paid', 'cancelled')`,
    // Only documents with outstanding balance
    sql12`(${documentTable.total} - ${documentTable.paid_amount}) > 0`
  ));
  const summary = {
    current: 0,
    days1to30: 0,
    days31to60: 0,
    days61to90: 0,
    over90: 0,
    total: 0
  };
  const contactMap = /* @__PURE__ */ new Map();
  for (const doc of documents) {
    const total = parseFloat(doc.total?.toString() || "0");
    const paidAmount = parseFloat(doc.paidAmount?.toString() || "0");
    const balanceDue = total - paidAmount;
    if (balanceDue <= 0) continue;
    const dueDate = new Date(doc.dueDate);
    const diffTime = asOfDate.getTime() - dueDate.getTime();
    const daysOverdue = Math.floor(diffTime / (1e3 * 60 * 60 * 24));
    let bucket;
    if (daysOverdue <= 0) {
      bucket = "current";
      summary.current += balanceDue;
    } else if (daysOverdue <= 30) {
      bucket = "1-30";
      summary.days1to30 += balanceDue;
    } else if (daysOverdue <= 60) {
      bucket = "31-60";
      summary.days31to60 += balanceDue;
    } else if (daysOverdue <= 90) {
      bucket = "61-90";
      summary.days61to90 += balanceDue;
    } else {
      bucket = "over90";
      summary.over90 += balanceDue;
    }
    summary.total += balanceDue;
    const lineItem = {
      id: doc.id,
      documentNumber: doc.documentNumber,
      contactId: doc.contactId,
      contactName: doc.contactName,
      date: doc.date,
      dueDate: doc.dueDate,
      total,
      paidAmount,
      balanceDue,
      daysOverdue: Math.max(0, daysOverdue),
      bucket,
      currency: doc.currency
    };
    if (!contactMap.has(doc.contactId)) {
      contactMap.set(doc.contactId, {
        contactId: doc.contactId,
        contactName: doc.contactName,
        contactEmail: doc.contactEmail || void 0,
        current: 0,
        days1to30: 0,
        days31to60: 0,
        days61to90: 0,
        over90: 0,
        total: 0,
        items: []
      });
    }
    const contactSummary = contactMap.get(doc.contactId);
    contactSummary.items.push(lineItem);
    contactSummary.total += balanceDue;
    if (bucket === "current") contactSummary.current += balanceDue;
    else if (bucket === "1-30") contactSummary.days1to30 += balanceDue;
    else if (bucket === "31-60") contactSummary.days31to60 += balanceDue;
    else if (bucket === "61-90") contactSummary.days61to90 += balanceDue;
    else contactSummary.over90 += balanceDue;
  }
  const byContact = Array.from(contactMap.values()).sort((a, b) => b.total - a.total);
  return {
    type,
    asOfDate,
    summary,
    byContact
  };
}
async function getContactStatement(companyId, contactId, startDate, endDate) {
  const { sales_invoices: sales_invoices2, bills: bills3, payments: payments3, receipts: receipts3, contacts: contacts2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const contactResult = await db.select().from(contacts2).where(eq22(contacts2.id, contactId)).limit(1);
  if (contactResult.length === 0) {
    throw new Error("Contact not found");
  }
  const contact = contactResult[0];
  const isCustomer = contact.type === "customer" || contact.type === "both";
  let openingBalance = 0;
  if (isCustomer) {
    const invoicesBefore = await db.select({
      total: sql12`COALESCE(SUM(${sales_invoices2.total}), 0)`
    }).from(sales_invoices2).where(and18(
      eq22(sales_invoices2.company_id, companyId),
      eq22(sales_invoices2.customer_id, contactId),
      sql12`${sales_invoices2.date} < ${startDate.toISOString()}`,
      sql12`${sales_invoices2.status} != 'cancelled'`
    ));
    const receiptsBefore = await db.select({
      total: sql12`COALESCE(SUM(${receipts3.amount}), 0)`
    }).from(receipts3).where(and18(
      eq22(receipts3.company_id, companyId),
      eq22(receipts3.customer_id, contactId),
      sql12`${receipts3.date} < ${startDate.toISOString()}`
    ));
    openingBalance = parseFloat(invoicesBefore[0]?.total || "0") - parseFloat(receiptsBefore[0]?.total || "0");
  } else {
    const billsBefore = await db.select({
      total: sql12`COALESCE(SUM(${bills3.total}), 0)`
    }).from(bills3).where(and18(
      eq22(bills3.company_id, companyId),
      eq22(bills3.supplier_id, contactId),
      sql12`${bills3.date} < ${startDate.toISOString()}`,
      sql12`${bills3.status} != 'cancelled'`
    ));
    const paymentsBefore = await db.select({
      total: sql12`COALESCE(SUM(${payments3.amount}), 0)`
    }).from(payments3).where(and18(
      eq22(payments3.company_id, companyId),
      eq22(payments3.vendor_id, contactId),
      sql12`${payments3.date} < ${startDate.toISOString()}`
    ));
    openingBalance = parseFloat(billsBefore[0]?.total || "0") - parseFloat(paymentsBefore[0]?.total || "0");
  }
  const entries = [];
  let runningBalance = openingBalance;
  let totalDebits = 0;
  let totalCredits = 0;
  if (isCustomer) {
    const invoicesList = await db.select({
      id: sales_invoices2.id,
      date: sales_invoices2.date,
      number: sales_invoices2.invoice_number,
      total: sales_invoices2.total,
      notes: sales_invoices2.notes
    }).from(sales_invoices2).where(and18(
      eq22(sales_invoices2.company_id, companyId),
      eq22(sales_invoices2.customer_id, contactId),
      gte5(sales_invoices2.date, startDate),
      lte5(sales_invoices2.date, endDate),
      sql12`${sales_invoices2.status} != 'cancelled'`
    ));
    for (const inv of invoicesList) {
      const amount = parseFloat(inv.total?.toString() || "0");
      runningBalance += amount;
      totalDebits += amount;
      entries.push({
        id: inv.id,
        date: inv.date,
        documentType: "invoice",
        documentNumber: inv.number,
        description: inv.notes,
        debit: amount,
        credit: 0,
        balance: runningBalance
      });
    }
    const receiptsList = await db.select({
      id: receipts3.id,
      date: receipts3.date,
      number: receipts3.receipt_number,
      amount: receipts3.amount,
      notes: receipts3.description
    }).from(receipts3).where(and18(
      eq22(receipts3.company_id, companyId),
      eq22(receipts3.customer_id, contactId),
      gte5(receipts3.date, startDate),
      lte5(receipts3.date, endDate)
    ));
    for (const rec of receiptsList) {
      const amount = parseFloat(rec.amount?.toString() || "0");
      runningBalance -= amount;
      totalCredits += amount;
      entries.push({
        id: rec.id,
        date: rec.date,
        documentType: "receipt",
        documentNumber: rec.number || "",
        description: rec.notes,
        debit: 0,
        credit: amount,
        balance: runningBalance
      });
    }
  } else {
    const supplierBills = await db.select({
      id: bills3.id,
      date: bills3.date,
      number: bills3.bill_number,
      total: bills3.total,
      notes: bills3.notes
    }).from(bills3).where(and18(
      eq22(bills3.company_id, companyId),
      eq22(bills3.supplier_id, contactId),
      gte5(bills3.date, startDate),
      lte5(bills3.date, endDate),
      sql12`${bills3.status} != 'cancelled'`
    ));
    for (const bill of supplierBills) {
      const amount = parseFloat(bill.total?.toString() || "0");
      runningBalance += amount;
      totalDebits += amount;
      entries.push({
        id: bill.id,
        date: bill.date,
        documentType: "bill",
        documentNumber: bill.number,
        description: bill.notes,
        debit: amount,
        credit: 0,
        balance: runningBalance
      });
    }
    const supplierPayments = await db.select({
      id: payments3.id,
      date: payments3.date,
      number: payments3.payment_number,
      amount: payments3.amount,
      notes: payments3.description
    }).from(payments3).where(and18(
      eq22(payments3.company_id, companyId),
      eq22(payments3.vendor_id, contactId),
      gte5(payments3.date, startDate),
      lte5(payments3.date, endDate)
    ));
    for (const pmt of supplierPayments) {
      const amount = parseFloat(pmt.amount?.toString() || "0");
      runningBalance -= amount;
      totalCredits += amount;
      entries.push({
        id: pmt.id,
        date: pmt.date,
        documentType: "payment",
        documentNumber: pmt.number || "",
        description: pmt.notes,
        debit: 0,
        credit: amount,
        balance: runningBalance
      });
    }
  }
  entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  runningBalance = openingBalance;
  for (const entry of entries) {
    runningBalance += entry.debit - entry.credit;
    entry.balance = runningBalance;
  }
  return {
    contact: {
      id: contact.id,
      name: contact.name,
      email: contact.email || void 0,
      phone: contact.phone || void 0,
      type: contact.type
    },
    startDate,
    endDate,
    openingBalance,
    entries,
    closingBalance: runningBalance,
    totalDebits,
    totalCredits
  };
}
async function getSalesSummary(companyId, startDate, endDate) {
  const { sales_invoices: sales_invoices2, document_lines: document_lines2, items: items3, contacts: contacts2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const invoices = await db.select({
    id: sales_invoices2.id,
    customerId: sales_invoices2.customer_id,
    customerName: contacts2.name,
    total: sales_invoices2.total,
    paidAmount: sales_invoices2.paid_amount,
    status: sales_invoices2.status,
    date: sales_invoices2.date
  }).from(sales_invoices2).leftJoin(contacts2, eq22(sales_invoices2.customer_id, contacts2.id)).where(and18(
    eq22(sales_invoices2.company_id, companyId),
    gte5(sales_invoices2.date, startDate),
    lte5(sales_invoices2.date, endDate)
  ));
  let totalSales = 0;
  let totalPaid = 0;
  let paidInvoiceCount = 0;
  let unpaidInvoiceCount = 0;
  let partialInvoiceCount = 0;
  const customerTotals = {};
  for (const inv of invoices) {
    const total = parseFloat(inv.total?.toString() || "0");
    const paid = parseFloat(inv.paidAmount?.toString() || "0");
    totalSales += total;
    totalPaid += paid;
    if (inv.status === "paid") paidInvoiceCount++;
    else if (inv.status === "partially_paid") partialInvoiceCount++;
    else unpaidInvoiceCount++;
    if (inv.customerId) {
      if (!customerTotals[inv.customerId]) {
        customerTotals[inv.customerId] = {
          customerId: inv.customerId,
          customerName: inv.customerName || "Unknown",
          totalAmount: 0,
          invoiceCount: 0
        };
      }
      customerTotals[inv.customerId].totalAmount += total;
      customerTotals[inv.customerId].invoiceCount++;
    }
  }
  const invoiceIds = invoices.map((i) => i.id);
  let topItems = [];
  if (invoiceIds.length > 0) {
    const itemSales = await db.select({
      itemId: document_lines2.item_id,
      itemName: items3.name,
      quantity: sql12`sum(${document_lines2.quantity})`,
      totalAmount: sql12`sum(${document_lines2.line_total})`
    }).from(document_lines2).leftJoin(items3, eq22(document_lines2.item_id, items3.id)).where(and18(
      eq22(document_lines2.document_type, "invoice"),
      sql12`${document_lines2.document_id} IN (${sql12.join(invoiceIds.map((id) => sql12`${id}`), sql12`, `)})`
    )).groupBy(document_lines2.item_id, items3.name).orderBy(sql12`sum(${document_lines2.line_total}) DESC`).limit(10);
    topItems = itemSales.map((item) => ({
      itemId: item.itemId || "",
      itemName: item.itemName || "Unknown",
      quantity: parseFloat(item.quantity || "0"),
      totalAmount: parseFloat(item.totalAmount || "0")
    }));
  }
  const topCustomers = Object.values(customerTotals).sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 10);
  return {
    totalSales,
    totalPaid,
    totalUnpaid: totalSales - totalPaid,
    invoiceCount: invoices.length,
    paidInvoiceCount,
    unpaidInvoiceCount,
    partialInvoiceCount,
    topCustomers,
    topItems,
    byMonth: []
    // Can be implemented later
  };
}
async function getPurchasesSummary(companyId, startDate, endDate) {
  const { bills: bills3, document_lines: document_lines2, items: items3, contacts: contacts2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const allBills = await db.select({
    id: bills3.id,
    supplierId: bills3.supplier_id,
    supplierName: contacts2.name,
    total: bills3.total,
    paidAmount: bills3.paid_amount,
    status: bills3.status,
    date: bills3.date
  }).from(bills3).leftJoin(contacts2, eq22(bills3.supplier_id, contacts2.id)).where(and18(
    eq22(bills3.company_id, companyId),
    gte5(bills3.date, startDate),
    lte5(bills3.date, endDate)
  ));
  let totalPurchases = 0;
  let totalPaid = 0;
  let paidBillCount = 0;
  let unpaidBillCount = 0;
  let partialBillCount = 0;
  const supplierTotals = {};
  for (const bill of allBills) {
    const total = parseFloat(bill.total?.toString() || "0");
    const paid = parseFloat(bill.paidAmount?.toString() || "0");
    totalPurchases += total;
    totalPaid += paid;
    if (bill.status === "paid") paidBillCount++;
    else if (bill.status === "partially_paid") partialBillCount++;
    else unpaidBillCount++;
    if (bill.supplierId) {
      if (!supplierTotals[bill.supplierId]) {
        supplierTotals[bill.supplierId] = {
          supplierId: bill.supplierId,
          supplierName: bill.supplierName || "Unknown",
          totalAmount: 0,
          billCount: 0
        };
      }
      supplierTotals[bill.supplierId].totalAmount += total;
      supplierTotals[bill.supplierId].billCount++;
    }
  }
  const billIds = allBills.map((b) => b.id);
  let topItems = [];
  if (billIds.length > 0) {
    const itemPurchases = await db.select({
      itemId: document_lines2.item_id,
      itemName: items3.name,
      quantity: sql12`sum(${document_lines2.quantity})`,
      totalAmount: sql12`sum(${document_lines2.line_total})`
    }).from(document_lines2).leftJoin(items3, eq22(document_lines2.item_id, items3.id)).where(and18(
      eq22(document_lines2.document_type, "bill"),
      sql12`${document_lines2.document_id} IN (${sql12.join(billIds.map((id) => sql12`${id}`), sql12`, `)})`
    )).groupBy(document_lines2.item_id, items3.name).orderBy(sql12`sum(${document_lines2.line_total}) DESC`).limit(10);
    topItems = itemPurchases.map((item) => ({
      itemId: item.itemId || "",
      itemName: item.itemName || "Unknown",
      quantity: parseFloat(item.quantity || "0"),
      totalAmount: parseFloat(item.totalAmount || "0")
    }));
  }
  const topSuppliers = Object.values(supplierTotals).sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 10);
  return {
    totalPurchases,
    totalPaid,
    totalUnpaid: totalPurchases - totalPaid,
    billCount: allBills.length,
    paidBillCount,
    unpaidBillCount,
    partialBillCount,
    topSuppliers,
    topItems,
    byMonth: []
    // Can be implemented later
  };
}
async function getProfitLossForPeriod(companyId, startDate, endDate) {
  const movements = await db.select({
    accountId: journal_lines.account_id,
    accountCode: accounts.code,
    accountName: accounts.name,
    accountType: accounts.account_type,
    accountSubtype: accounts.account_subtype,
    debit: sql12`sum(${journal_lines.base_debit})`,
    credit: sql12`sum(${journal_lines.base_credit})`
  }).from(journal_lines).innerJoin(journals, eq22(journal_lines.journal_id, journals.id)).innerJoin(accounts, eq22(journal_lines.account_id, accounts.id)).where(and18(
    eq22(journals.company_id, companyId),
    gte5(journals.date, startDate),
    lte5(journals.date, endDate),
    or3(
      eq22(accounts.account_type, "revenue"),
      eq22(accounts.account_type, "expense"),
      eq22(accounts.account_type, "cost_of_goods_sold")
    )
  )).groupBy(journal_lines.account_id, accounts.code, accounts.name, accounts.account_type, accounts.account_subtype);
  let revenue = 0;
  let costOfSales = 0;
  let operatingExpenses = 0;
  let otherIncome = 0;
  let otherExpenses = 0;
  const revenueItems = [];
  const costItems = [];
  const expenseItems = [];
  for (const mov of movements) {
    const debit = parseFloat(mov.debit || "0");
    const credit = parseFloat(mov.credit || "0");
    if (mov.accountType === "revenue") {
      const amount = credit - debit;
      if (mov.accountSubtype === "other_income") {
        otherIncome += amount;
      } else {
        revenue += amount;
      }
      revenueItems.push({
        accountId: mov.accountId,
        accountCode: mov.accountCode || "",
        accountName: mov.accountName || "",
        accountType: mov.accountType,
        amount
      });
    } else if (mov.accountType === "cost_of_goods_sold") {
      const amount = debit - credit;
      costOfSales += amount;
      costItems.push({
        accountId: mov.accountId,
        accountCode: mov.accountCode || "",
        accountName: mov.accountName || "",
        accountType: mov.accountType,
        amount
      });
    } else if (mov.accountType === "expense") {
      const amount = debit - credit;
      if (mov.accountSubtype === "other_expense") {
        otherExpenses += amount;
      } else {
        operatingExpenses += amount;
      }
      expenseItems.push({
        accountId: mov.accountId,
        accountCode: mov.accountCode || "",
        accountName: mov.accountName || "",
        accountType: mov.accountType,
        amount
      });
    }
  }
  const grossProfit = revenue - costOfSales;
  const operatingIncome = grossProfit - operatingExpenses;
  const netIncome = operatingIncome + otherIncome - otherExpenses;
  return {
    revenue,
    costOfSales,
    grossProfit,
    operatingExpenses,
    operatingIncome,
    otherIncome,
    otherExpenses,
    netIncome,
    revenueItems: revenueItems.filter((i) => i.amount !== 0).sort((a, b) => b.amount - a.amount),
    costItems: costItems.filter((i) => i.amount !== 0).sort((a, b) => b.amount - a.amount),
    expenseItems: expenseItems.filter((i) => i.amount !== 0).sort((a, b) => b.amount - a.amount)
  };
}
function calculatePercentChange(period1, period2) {
  if (period1 === 0) return period2 === 0 ? 0 : null;
  return (period2 - period1) / Math.abs(period1) * 100;
}
async function getProfitLossComparison(companyId, period1Start, period1End, period2Start, period2End) {
  const [period1Data, period2Data] = await Promise.all([
    getProfitLossForPeriod(companyId, period1Start, period1End),
    getProfitLossForPeriod(companyId, period2Start, period2End)
  ]);
  const summaryItems = [
    { key: "revenue", label: "Total Revenue" },
    { key: "costOfSales", label: "Cost of Sales" },
    { key: "grossProfit", label: "Gross Profit" },
    { key: "operatingExpenses", label: "Operating Expenses" },
    { key: "operatingIncome", label: "Operating Income" },
    { key: "otherIncome", label: "Other Income" },
    { key: "otherExpenses", label: "Other Expenses" },
    { key: "netIncome", label: "Net Income" }
  ];
  const summary = summaryItems.map((item) => {
    const p1 = period1Data[item.key];
    const p2 = period2Data[item.key];
    return {
      category: item.label,
      period1Amount: p1,
      period2Amount: p2,
      variance: p2 - p1,
      percentChange: calculatePercentChange(p1, p2)
    };
  });
  const buildDetailComparison = (period1Items, period2Items) => {
    const allAccounts = /* @__PURE__ */ new Map();
    for (const item of period1Items) {
      allAccounts.set(item.accountId, { p1: item, p2: null });
    }
    for (const item of period2Items) {
      const existing = allAccounts.get(item.accountId);
      if (existing) {
        existing.p2 = item;
      } else {
        allAccounts.set(item.accountId, { p1: null, p2: item });
      }
    }
    const results = [];
    allAccounts.forEach((value, _key) => {
      const p1Amount = value.p1?.amount || 0;
      const p2Amount = value.p2?.amount || 0;
      const item = value.p1 || value.p2;
      results.push({
        category: item.accountName,
        accountCode: item.accountCode,
        accountName: item.accountName,
        period1Amount: p1Amount,
        period2Amount: p2Amount,
        variance: p2Amount - p1Amount,
        percentChange: calculatePercentChange(p1Amount, p2Amount)
      });
    });
    return results.sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance));
  };
  return {
    period1: {
      startDate: period1Start.toISOString(),
      endDate: period1End.toISOString(),
      data: period1Data
    },
    period2: {
      startDate: period2Start.toISOString(),
      endDate: period2End.toISOString(),
      data: period2Data
    },
    comparison: {
      summary,
      details: {
        revenue: buildDetailComparison(period1Data.revenueItems, period2Data.revenueItems),
        costOfSales: buildDetailComparison(period1Data.costItems, period2Data.costItems),
        expenses: buildDetailComparison(period1Data.expenseItems, period2Data.expenseItems)
      }
    }
  };
}
var init_reports = __esm({
  "server/utils/reports.ts"() {
    "use strict";
    init_db();
    init_schema();
  }
});

// server/swagger.ts
var swagger_exports = {};
__export(swagger_exports, {
  swaggerSpec: () => swaggerSpec
});
import swaggerJsdoc from "swagger-jsdoc";
var options, swaggerSpec;
var init_swagger = __esm({
  "server/swagger.ts"() {
    "use strict";
    options = {
      definition: {
        openapi: "3.0.0",
        info: {
          title: "Log & Ledger API",
          version: "1.0.0",
          description: `
# Log & Ledger - Complete Accounting System API

A comprehensive REST API for managing accounting operations including:
- \u{1F4CA} **Accounts & Chart of Accounts** - Full double-entry bookkeeping
- \u{1F4DD} **Invoices & Bills** - Sales and purchase documents
- \u{1F4B0} **Payments & Receipts** - Cash management
- \u{1F4C8} **Financial Reports** - Dashboard, P&L, Balance Sheet
- \u{1F916} **AI-Powered Extraction** - Invoice parsing from images/PDFs
- \u{1F3E2} **Multi-company Support** - Manage multiple entities
- \u{1F510} **Firebase Authentication** - Secure SSO login

## Authentication

Most endpoints require authentication via Firebase token:

\`\`\`
Authorization: Bearer <firebase-id-token>
\`\`\`

Obtain token from Firebase Authentication SDK, then call \`/api/auth/sso-login\` to establish session.

## Rate Limiting

- Global API: 100 requests/minute
- Authentication: 5 attempts/15 minutes
- Reports: 20 requests/minute
- Bulk operations: 10 requests/minute

## Error Handling

All errors return standard format:
\`\`\`json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
\`\`\`

Common status codes:
- 400: Bad Request (validation error)
- 401: Unauthorized (no session)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 429: Too Many Requests (rate limit)
- 500: Internal Server Error
      `,
          contact: {
            name: "API Support",
            email: "support@logledger.com"
          },
          license: {
            name: "MIT",
            url: "https://opensource.org/licenses/MIT"
          }
        },
        servers: [
          {
            url: "http://localhost:3000",
            description: "Development server"
          },
          {
            url: "https://api.logledger-pro.com",
            description: "Production server"
          }
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
              description: "Firebase ID token"
            },
            sessionCookie: {
              type: "apiKey",
              in: "cookie",
              name: "ledger.sid",
              description: "Session cookie (set after SSO login)"
            }
          },
          schemas: {
            Error: {
              type: "object",
              properties: {
                error: {
                  type: "string",
                  description: "Error message"
                },
                code: {
                  type: "string",
                  description: "Error code"
                }
              }
            },
            Account: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                company_id: { type: "string", format: "uuid" },
                code: { type: "string", example: "1010" },
                name: { type: "string", example: "Cash" },
                type: {
                  type: "string",
                  enum: ["asset", "liability", "equity", "revenue", "expense"]
                },
                subtype: { type: "string", example: "current_asset" },
                parent_id: { type: "string", format: "uuid", nullable: true },
                currency: { type: "string", example: "USD" },
                is_active: { type: "boolean" },
                created_at: { type: "string", format: "date-time" },
                updated_at: { type: "string", format: "date-time" }
              }
            },
            Tax: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                company_id: { type: "string", format: "uuid" },
                name: { type: "string", example: "VAT 15%" },
                rate: { type: "number", example: 15 },
                type: {
                  type: "string",
                  enum: ["sales_tax", "purchase_tax", "withholding_tax"]
                },
                is_active: { type: "boolean" }
              }
            },
            Invoice: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                company_id: { type: "string", format: "uuid" },
                customer_id: { type: "string", format: "uuid" },
                invoice_number: { type: "string", example: "INV-2025-001" },
                date: { type: "string", format: "date-time" },
                due_date: { type: "string", format: "date-time" },
                status: {
                  type: "string",
                  enum: ["draft", "sent", "paid", "overdue", "cancelled"]
                },
                currency: { type: "string", example: "USD" },
                subtotal: { type: "number", example: 1e3 },
                tax_total: { type: "number", example: 150 },
                total: { type: "number", example: 1150 },
                paid_amount: { type: "number", example: 0 },
                notes: { type: "string" }
              }
            }
          }
        },
        security: [
          {
            sessionCookie: []
          }
        ]
      },
      apis: ["./server/routes.ts", "./server/routes/*.ts"]
      // Path to API routes
    };
    swaggerSpec = swaggerJsdoc(options);
  }
});

// server/health.ts
var health_exports = {};
__export(health_exports, {
  healthCheck: () => healthCheck,
  livenessCheck: () => livenessCheck,
  readinessCheck: () => readinessCheck
});
async function healthCheck(req, res) {
  const startTime = Date.now();
  const checks4 = {
    status: "healthy",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024)
    },
    database: { status: "unknown", latency: 0 },
    firebase: { status: process.env.FIREBASE_SERVICE_ACCOUNT ? "configured" : "not_configured" }
  };
  try {
    const dbStart = Date.now();
    await pool.query("SELECT 1");
    checks4.database = {
      status: "healthy",
      latency: Date.now() - dbStart
    };
  } catch (error) {
    checks4.database = {
      status: "unhealthy",
      error: error?.message || "Connection failed"
    };
    checks4.status = "unhealthy";
  }
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    checks4.firebase = {
      status: "not_configured",
      warning: "FIREBASE_SERVICE_ACCOUNT not set"
    };
  }
  checks4.responseTime = Date.now() - startTime;
  const statusCode = checks4.status === "healthy" ? 200 : 503;
  res.status(statusCode).json(checks4);
}
async function readinessCheck(req, res) {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({
      status: "ready",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: "not_ready",
      error: error?.message || "Service unavailable",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
}
async function livenessCheck(req, res) {
  res.status(200).json({
    status: "alive",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    uptime: process.uptime()
  });
}
var init_health = __esm({
  "server/health.ts"() {
    "use strict";
    init_db();
  }
});

// server/ai/ocr.ts
var ocr_exports = {};
__export(ocr_exports, {
  performOCR: () => performOCR
});
async function performOCR(base64Image) {
  const started = Date.now();
  try {
    let usePlaceholder = false;
    let ocrText = null;
    const buf = Buffer.from(base64Image, "base64");
    if (buf.length > 6 * 1024 * 1024) {
      usePlaceholder = true;
    } else {
      try {
        const tesseract = await import("tesseract.js");
        const { createWorker } = tesseract;
        if (createWorker) {
          const worker = await createWorker({ logger: () => void 0 });
          await worker.loadLanguage("eng");
          await worker.initialize("eng");
          const { data } = await worker.recognize(buf);
          ocrText = data?.text || "";
          await worker.terminate();
        } else {
          usePlaceholder = true;
        }
      } catch (e) {
        usePlaceholder = true;
      }
    }
    if (usePlaceholder || !ocrText) {
      const approxChars = Math.min(2e3, Math.max(200, Math.floor(base64Image.length / 50)));
      const pseudo = `OCR_PLACEHOLDER_TEXT_START
${"X".repeat(approxChars)}
OCR_PLACEHOLDER_TEXT_END`;
      return {
        text: pseudo,
        warnings: ["OCR placeholder used", ...buf.length > 6 * 1024 * 1024 ? ["Image exceeded safe OCR size cap"] : []],
        engine: "placeholder",
        durationMs: Date.now() - started
      };
    }
    return {
      text: ocrText,
      warnings: [],
      engine: "tesseract",
      durationMs: Date.now() - started
    };
  } catch (e) {
    return {
      text: "",
      warnings: ["OCR failure: " + (e?.message || "unknown error")],
      engine: "error",
      durationMs: Date.now() - started
    };
  }
}
var init_ocr = __esm({
  "server/ai/ocr.ts"() {
    "use strict";
  }
});

// server/utils/invoiceExtraction.ts
var invoiceExtraction_exports = {};
__export(invoiceExtraction_exports, {
  extractInvoiceFromText: () => extractInvoiceFromText
});
import { eq as eq48, and as and38, ilike } from "drizzle-orm";
async function extractInvoiceFromText(text2, companyId, options2) {
  const { provider_id, provider, model, prompt, refine_llm } = options2;
  const warnings = [];
  let costInfo;
  const src = text2.replace(/\r/g, "").split("\n").map((l) => l.trim()).filter(Boolean).join("\n");
  const pick = (reList) => {
    for (const re of reList) {
      const m = src.match(re);
      if (m && m[1]) return m[1].trim();
    }
    return void 0;
  };
  const dateRegex = /(?:(?:\bdate\b|\bissued?\b)\s*[:\-]*\s*)?(\d{4}[-\/.]\d{1,2}[-\/.]\d{1,2}|\d{1,2}[-\/.]\d{1,2}[-\/.]\d{2,4})/i;
  const dueDateRegex = /(?:due\s*date|payment\s*due)\s*[:\-]*\s*(\d{4}[-\/.]\d{1,2}[-\/.]\d{1,2}|\d{1,2}[-\/.]\d{1,2}[-\/.]\d{2,4})/i;
  const invNo = pick([
    /(?:invoice\s*(?:no\.|number|#)\s*[:\-]*\s*)([A-Za-z0-9\-_/]+)\b/i,
    /\bINV[-_ ]?([A-Za-z0-9\-_/]+)/i
  ]);
  const currencySymbol = pick([
    /(SAR|AED|USD|EUR|GBP|KWD|BHD|OMR|QAR)\b/i,
    /([€$£])\s*\d+[\d,]*(?:[.][\d]+)?/
  ]);
  const toNumberStr = (s) => s ? s.replace(/[^0-9.,-]/g, "").replace(/,(?=\d{3}(\D|$))/g, "").replace(/,(?=\d{1,2}$)/, ".").trim() : void 0;
  const total = pick([/(?:\btotal\b|\bamount\s*due\b)\s*[:\-]*\s*([€$£]?[\s]*[0-9][\d,]*(?:[.][\d]+)?)/i]);
  const subtotal = pick([/\bsub\s*total\b\s*[:\-]*\s*([€$£]?[\s]*[0-9][\d,]*(?:[.][\d]+)?)/i]);
  const tax = pick([/\b(?:tax|vat)\b\s*[:\-]*\s*([€$£]?[\s]*[0-9][\d,]*(?:[.][\d]+)?)/i]);
  const firstLines = src.split("\n");
  let vendorName;
  for (let i = 0; i < Math.min(5, firstLines.length); i++) {
    const l = firstLines[i];
    if (/invoice|bill|receipt|number|date|due|total|amount|tax|vat/i.test(l)) continue;
    if (l.length >= 3) {
      vendorName = l.replace(/[^A-Za-z0-9 &.'\-]/g, "").trim();
      if (vendorName) break;
    }
  }
  const dateMatch = src.match(dateRegex);
  const dueDateMatch = src.match(dueDateRegex);
  let result = {
    vendor_name: vendorName || void 0,
    invoice_number: invNo || void 0,
    date: dateMatch?.[1] || void 0,
    due_date: dueDateMatch?.[1] || void 0,
    currency: currencySymbol?.toUpperCase?.() || void 0,
    subtotal: toNumberStr(subtotal),
    tax_total: toNumberStr(tax),
    total: toNumberStr(total),
    line_items: [],
    category: void 0,
    notes: "Parsed from plain text. OCR/vision integration pending."
  };
  if (!result.invoice_number) warnings.push("Missing invoice_number");
  if (!result.total) warnings.push("Missing total");
  if (!result.date) warnings.push("Missing date");
  if (!result.due_date) warnings.push("Missing due_date");
  let expenseCategories = "";
  try {
    const expenseAccounts = await db.select({ name: accounts.name }).from(accounts).where(and38(
      eq48(accounts.company_id, companyId),
      eq48(accounts.account_type, "expense")
    ));
    expenseCategories = expenseAccounts.map((a) => a.name).join(", ");
  } catch (e) {
    console.warn("Failed to fetch expense accounts for AI context", e);
  }
  let usedProvider = void 0;
  if (refine_llm) {
    try {
      let rowLLM;
      if (provider_id) {
        const [r] = await db.select().from(ai_providers).where(and38(eq48(ai_providers.id, provider_id), eq48(ai_providers.company_id, companyId)));
        rowLLM = r;
      } else {
        const provName = (provider || "").toString().toLowerCase();
        const rows2 = await db.select().from(ai_providers).where(eq48(ai_providers.company_id, companyId));
        rowLLM = rows2.find((r) => (r.provider || "").toLowerCase() === (provName || "openai")) || rows2.find((r) => (r.provider || "").toLowerCase() === "openai") || rows2[0];
      }
      if (rowLLM?.api_key) {
        usedProvider = rowLLM;
        const baseUrl2 = (rowLLM.base_url || "https://api.openai.com").replace(/\/$/, "");
        const useModel2 = model || rowLLM.default_model || rowLLM.vision_model || "gpt-4o-mini";
        const instructions2 = prompt || `Extract invoice fields and return strict JSON with keys: vendor_name, invoice_number, date, due_date, currency, subtotal, tax_total, total, notes, line_items, category. 
        line_items should be an array of objects with keys: description, quantity, unit_price, total.
        category should be one of the following if applicable: [${expenseCategories}]. If none match, suggest a generic category.
        Dates must be ISO (YYYY-MM-DD). Currency as code if possible. Only output the JSON.`;
        const cfgText = { provider: (rowLLM.provider || "openai").toLowerCase(), apiKey: rowLLM.api_key, baseUrl: baseUrl2, model: useModel2 };
        const msgsText = buildInvoiceExtractionMessages(src, void 0, void 0, instructions2);
        const aiText = await callAIProvider(cfgText, msgsText);
        if (aiText?.content != null) {
          const content2 = aiText.content || "";
          const tryParse = (s) => {
            try {
              return JSON.parse(s);
            } catch {
              const m = s.match(/\{[\s\S]*\}/);
              if (m) {
                try {
                  return JSON.parse(m[0]);
                } catch {
                }
              }
              return null;
            }
          };
          const json2 = typeof content2 === "string" ? tryParse(content2) : null;
          if (json2) {
            const refined = {
              vendor_name: json2.vendor_name || void 0,
              invoice_number: json2.invoice_number || void 0,
              date: json2.date || void 0,
              due_date: json2.due_date || void 0,
              currency: json2.currency || void 0,
              subtotal: json2.subtotal || void 0,
              tax_total: json2.tax_total || void 0,
              total: json2.total || void 0,
              notes: json2.notes || void 0,
              line_items: Array.isArray(json2.line_items) ? json2.line_items : [],
              category: json2.category || void 0
            };
            result = { ...refined, ...result, line_items: refined.line_items?.length ? refined.line_items : result.line_items, category: refined.category || result.category };
            if (aiText.redaction?.redacted) {
              warnings.push(`Applied redaction before LLM: ${aiText.redaction.count} items`);
            }
            if (aiText.cost?.totalUSD != null) {
              warnings.push(`Estimated LLM refine cost: $${aiText.cost.totalUSD.toFixed(4)}`);
              costInfo = {
                totalUSD: aiText.cost.totalUSD,
                inputTokens: aiText.usage?.prompt_tokens,
                outputTokens: aiText.usage?.completion_tokens
              };
            }
          } else {
            warnings.push("LLM refinement failed to parse JSON");
          }
        } else {
          warnings.push("LLM refinement upstream error");
        }
      } else {
        warnings.push("No AI provider configured for LLM refinement");
      }
    } catch (e) {
      console.error("Text LLM refine exception:", e);
      warnings.push("LLM refinement exception");
    }
  }
  if (result.vendor_name) {
    try {
      const [match] = await db.select().from(contacts).where(and38(
        eq48(contacts.company_id, companyId),
        ilike(contacts.name, result.vendor_name)
      )).limit(1);
      if (match) {
        result.vendor_id = match.id;
        result.vendor_match_type = "auto_name_match";
      }
    } catch (e) {
      console.warn("Vendor auto-match failed:", e);
    }
  }
  return {
    result,
    meta: {
      mode: "text",
      provider: usedProvider?.provider,
      model: usedProvider?.default_model || usedProvider?.vision_model,
      warnings,
      cost: costInfo
    }
  };
}
var init_invoiceExtraction = __esm({
  "server/utils/invoiceExtraction.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_aiProviders();
  }
});

// server/serverless.ts
import "dotenv/config";
import express from "express";
import session2 from "express-session";
import helmet from "helmet";
import rateLimit2 from "express-rate-limit";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
init_schema();
init_db();
import { eq, and, sql as sql2, lte, gte, or } from "drizzle-orm";
import * as bcrypt from "bcryptjs";

// server/cache.ts
import Redis from "ioredis";

// server/logger.ts
import pino from "pino";
var isDev = process.env.NODE_ENV !== "production";
var logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? "debug" : "info"),
  ...isDev && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname"
      }
    }
  },
  // Production: JSON logs to stdout
  ...!isDev && {
    formatters: {
      level: (label) => {
        return { level: label };
      }
    }
  },
  // Add timestamp
  timestamp: pino.stdTimeFunctions.isoTime,
  // Redact sensitive fields
  redact: {
    paths: ["password", "password_hash", "token", "authorization", "cookie", "set-cookie"],
    remove: true
  }
});
function log(...args) {
  if (args.length === 1 && typeof args[0] === "object") {
    logger.info(args[0]);
  } else {
    logger.info(args.join(" "));
  }
}
function logError(...args) {
  if (args.length === 1 && args[0] instanceof Error) {
    logger.error({ err: args[0] }, args[0].message);
  } else if (args.length === 1 && typeof args[0] === "object") {
    logger.error(args[0]);
  } else {
    logger.error(args.join(" "));
  }
}

// server/cache.ts
var redis = null;
var isRedisAvailable = false;
if (process.env.REDIS_URL) {
  try {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2e3);
        return delay;
      },
      lazyConnect: true
      // Don't connect immediately
    });
    redis.on("connect", () => {
      isRedisAvailable = true;
      logger.info("Redis connected successfully");
    });
    redis.on("error", (err) => {
      isRedisAvailable = false;
      logger.warn({ err }, "Redis connection error - caching disabled");
    });
    redis.connect().catch((err) => {
      logger.warn({ err }, "Failed to connect to Redis - caching disabled");
      isRedisAvailable = false;
    });
  } catch (error) {
    logger.warn({ error }, "Redis initialization failed - caching disabled");
    redis = null;
  }
} else {
  logger.info("REDIS_URL not set - caching disabled");
}
async function getCache(key) {
  if (!redis || !isRedisAvailable) return null;
  try {
    const value = await redis.get(key);
    if (!value) return null;
    return JSON.parse(value);
  } catch (error) {
    logger.debug({ error, key }, "Cache get failed");
    return null;
  }
}
async function setCache(key, value, ttlSeconds = 300) {
  if (!redis || !isRedisAvailable) return false;
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
    return true;
  } catch (error) {
    logger.debug({ error, key }, "Cache set failed");
    return false;
  }
}
async function deleteCache(key) {
  if (!redis || !isRedisAvailable) return false;
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    logger.debug({ error, key }, "Cache delete failed");
    return false;
  }
}
var CacheKeys = {
  // Accounts
  accounts: (companyId) => `company:${companyId}:accounts`,
  accountById: (companyId, accountId) => `company:${companyId}:account:${accountId}`,
  // Taxes
  taxes: (companyId) => `company:${companyId}:taxes`,
  taxById: (companyId, taxId) => `company:${companyId}:tax:${taxId}`,
  // Company
  companySettings: (companyId) => `company:${companyId}:settings`,
  companyById: (companyId) => `company:${companyId}:info`,
  // Users
  userByEmail: (email) => `user:email:${email}`,
  userById: (userId) => `user:id:${userId}`,
  userPermissions: (userId) => `user:${userId}:permissions`,
  // Dashboard
  dashboard: (companyId) => `dashboard:${companyId}`,
  globalDashboard: (companyId) => `global-dashboard:${companyId}`,
  // Reports (with date range hash)
  trialBalance: (companyId, startDate, endDate) => `report:${companyId}:trial-balance:${startDate}:${endDate}`,
  balanceSheet: (companyId, date) => `report:${companyId}:balance-sheet:${date}`,
  incomeStatement: (companyId, startDate, endDate) => `report:${companyId}:income-statement:${startDate}:${endDate}`,
  cashFlow: (companyId, startDate, endDate) => `report:${companyId}:cash-flow:${startDate}:${endDate}`,
  generalLedger: (companyId, accountId, startDate, endDate) => `report:${companyId}:general-ledger:${accountId}:${startDate}:${endDate}`,
  // Contacts & Items (frequently accessed for dropdowns)
  contacts: (companyId) => `company:${companyId}:contacts`,
  contactById: (companyId, contactId) => `company:${companyId}:contact:${contactId}`,
  items: (companyId) => `company:${companyId}:items`,
  itemById: (companyId, itemId) => `company:${companyId}:item:${itemId}`,
  // Inventory
  warehouses: (companyId) => `company:${companyId}:warehouses`,
  inventoryValuation: (companyId) => `company:${companyId}:inventory-valuation`,
  // Bank Accounts
  bankAccounts: (companyId) => `company:${companyId}:bank-accounts`,
  // Exchange Rates
  exchangeRates: (companyId) => `company:${companyId}:exchange-rates`,
  // Document Numbers (short TTL to prevent collisions)
  documentSequence: (companyId, docType, fiscalYear) => `doc-seq:${companyId}:${docType}:${fiscalYear}`
};
var CacheTTL = {
  INSTANT: 10,
  // 10 seconds - for rapidly changing data
  SHORT: 60,
  // 1 minute - for lists that change often
  MEDIUM: 300,
  // 5 minutes - for dashboard data
  LONG: 1800,
  // 30 minutes - for reports
  VERY_LONG: 7200,
  // 2 hours - for rarely changing master data
  DAY: 86400
  // 24 hours - for static data
};

// server/storage.ts
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async getUserById(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByEmail(email) {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user || void 0;
    } catch (err) {
      if (err?.code === "42703") {
        try {
          const [user2] = await db.select().from(users).where(eq(users.username, email));
          return user2 || void 0;
        } catch {
        }
      }
      throw err;
    }
  }
  async createUser(insertUser) {
    const passwordHash = await bcrypt.hash(insertUser.password, 10);
    if (!insertUser.company_id) {
      throw new Error("company_id is required to create a user");
    }
    const { password, ...userDataWithoutPassword } = insertUser;
    const userDataForDB = {
      ...userDataWithoutPassword,
      company_id: insertUser.company_id,
      // Explicitly set (TypeScript knows it's not undefined now)
      password_hash: passwordHash
    };
    const [user] = await db.insert(users).values(userDataForDB).returning();
    return user;
  }
  async createCompany(insertCompany) {
    const [company] = await db.insert(companies).values(insertCompany).returning();
    return company;
  }
  async updateUser(id, updateData) {
    if (updateData.password) {
      const passwordHash = await bcrypt.hash(updateData.password, 10);
      const { password, ...dataWithoutPassword } = updateData;
      const dataForDB = {
        ...dataWithoutPassword,
        password_hash: passwordHash,
        updated_at: /* @__PURE__ */ new Date()
      };
      const [user2] = await db.update(users).set(dataForDB).where(eq(users.id, id)).returning();
      return user2;
    }
    const [user] = await db.update(users).set({ ...updateData, updated_at: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
    return user;
  }
  async getCompanyById(id) {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company || void 0;
  }
  async updateCompany(id, updateData) {
    const [company] = await db.update(companies).set({ ...updateData, updated_at: /* @__PURE__ */ new Date() }).where(eq(companies.id, id)).returning();
    return company;
  }
  async deleteCompany(id) {
    const result = await db.delete(companies).where(eq(companies.id, id));
    return true;
  }
  async switchUserCompany(userId, companyId) {
    const company = await this.getCompanyById(companyId);
    if (!company) {
      return false;
    }
    const user = await this.updateUser(userId, { company_id: companyId });
    return !!user;
  }
  async getCompaniesByUserId(userId) {
    console.log(`\u{1F50D} getCompaniesByUserId called with: ${userId}`);
    try {
      const firebaseCompanies = await db.select().from(companies).where(eq(companies.firebase_user_id, userId));
      console.log(`\u{1F4E6} Firebase lookup found ${firebaseCompanies.length} companies`);
      if (firebaseCompanies.length > 0) {
        return firebaseCompanies;
      }
    } catch (fbError) {
      console.warn(`\u26A0\uFE0F Firebase companies lookup failed: ${fbError?.message}`);
    }
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        console.log(`\u26A0\uFE0F No user found with ID: ${userId}`);
        return [];
      }
      if (user.company_id) {
        const companyList = await db.select().from(companies).where(eq(companies.id, user.company_id));
        console.log(`\u{1F4E6} User's company lookup found ${companyList.length} companies`);
        return companyList;
      }
    } catch (userError) {
      console.warn(`\u26A0\uFE0F User lookup failed: ${userError?.message}`);
    }
    return [];
  }
  async getAllCompanies() {
    return await db.select().from(companies);
  }
  async getUsersByCompany(companyId) {
    return await db.select().from(users).where(eq(users.company_id, companyId));
  }
  // === Accounts Implementation ===
  async createAccount(insertAccount) {
    const [account] = await db.insert(accounts).values(insertAccount).returning();
    await deleteCache(CacheKeys.accounts(insertAccount.company_id));
    return account;
  }
  async getAccountsByCompany(companyId) {
    const cached = await getCache(CacheKeys.accounts(companyId));
    if (cached) return cached;
    const accountsData = await db.select().from(accounts).where(eq(accounts.company_id, companyId));
    await setCache(CacheKeys.accounts(companyId), accountsData, CacheTTL.MEDIUM);
    return accountsData;
  }
  async getAccountById(id) {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, id));
    return account || void 0;
  }
  async updateAccount(id, updateData) {
    const [account] = await db.update(accounts).set({ ...updateData, updated_at: /* @__PURE__ */ new Date() }).where(eq(accounts.id, id)).returning();
    if (account) {
      await deleteCache(CacheKeys.accounts(account.company_id));
      await deleteCache(CacheKeys.accountById(account.company_id, id));
    }
    return account;
  }
  async deleteAccount(id) {
    const account = await this.getAccountById(id);
    await db.delete(accounts).where(eq(accounts.id, id));
    if (account) {
      await deleteCache(CacheKeys.accounts(account.company_id));
      await deleteCache(CacheKeys.accountById(account.company_id, id));
    }
    return true;
  }
  async getAccountLedger(accountId, startDate, endDate) {
    const query = db.select({
      id: journal_lines.id,
      journal_id: journal_lines.journal_id,
      journal_number: journals.journal_number,
      journal_date: journals.date,
      journal_description: journals.description,
      description: journal_lines.description,
      reference: journals.reference,
      debit_amount: journal_lines.debit,
      credit_amount: journal_lines.credit,
      document_type: journals.source_type,
      document_id: journals.source_id
    }).from(journal_lines).innerJoin(journals, eq(journal_lines.journal_id, journals.id)).where(eq(journal_lines.account_id, accountId));
    let results = await query;
    if (startDate || endDate) {
      results = results.filter((entry) => {
        const entryDate = new Date(entry.journal_date);
        if (startDate && entryDate < startDate) return false;
        if (endDate && entryDate > endDate) return false;
        return true;
      });
    }
    results.sort((a, b) => {
      const dateA = new Date(a.journal_date);
      const dateB = new Date(b.journal_date);
      return dateA.getTime() - dateB.getTime();
    });
    return results;
  }
  async getAccountBalanceBeforeDate(accountId, date) {
    const entries = await db.select({
      debit_amount: journal_lines.debit,
      credit_amount: journal_lines.credit,
      journal_date: journals.date
    }).from(journal_lines).innerJoin(journals, eq(journal_lines.journal_id, journals.id)).where(eq(journal_lines.account_id, accountId));
    let balance = 0;
    for (const entry of entries) {
      const entryDate = new Date(entry.journal_date);
      if (entryDate < date) {
        const debit = parseFloat(entry.debit_amount || "0");
        const credit = parseFloat(entry.credit_amount || "0");
        balance += debit - credit;
      }
    }
    return balance;
  }
  async getJournalLinesWithAccounts(journalId) {
    const lines = await db.select({
      id: journal_lines.id,
      journal_id: journal_lines.journal_id,
      account_id: journal_lines.account_id,
      account_code: accounts.code,
      account_name: accounts.name,
      account_name_ar: accounts.name_ar,
      description: journal_lines.description,
      debit: journal_lines.debit,
      credit: journal_lines.credit,
      currency: journal_lines.currency,
      fx_rate: journal_lines.fx_rate,
      base_debit: journal_lines.base_debit,
      base_credit: journal_lines.base_credit,
      project_id: journal_lines.project_id,
      cost_center_id: journal_lines.cost_center_id
    }).from(journal_lines).innerJoin(accounts, eq(journal_lines.account_id, accounts.id)).where(eq(journal_lines.journal_id, journalId));
    return lines;
  }
  // === Contacts Implementation ===
  async createContact(insertContact) {
    const [contact] = await db.insert(contacts).values(insertContact).returning();
    return contact;
  }
  async getContactsByCompany(companyId) {
    return await db.select().from(contacts).where(eq(contacts.company_id, companyId));
  }
  async getContactById(id) {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact || void 0;
  }
  async updateContact(id, updateData) {
    const [contact] = await db.update(contacts).set({ ...updateData, updated_at: /* @__PURE__ */ new Date() }).where(eq(contacts.id, id)).returning();
    return contact;
  }
  async deleteContact(companyId, id) {
    const result = await db.delete(contacts).where(
      and(eq(contacts.id, id), eq(contacts.company_id, companyId))
    );
    return (result.rowCount ?? 0) > 0;
  }
  // === Items Implementation ===
  async createItem(insertItem) {
    const [item] = await db.insert(items).values(insertItem).returning();
    return item;
  }
  async getItemsByCompany(companyId) {
    return await db.select().from(items).where(eq(items.company_id, companyId));
  }
  async getItemById(id) {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item || void 0;
  }
  async updateItem(id, updateData) {
    const [item] = await db.update(items).set({ ...updateData, updated_at: /* @__PURE__ */ new Date() }).where(eq(items.id, id)).returning();
    return item;
  }
  async deleteItem(id) {
    await db.delete(items).where(eq(items.id, id));
    return true;
  }
  // === Taxes Implementation ===
  async createTax(insertTax) {
    const [tax] = await db.insert(taxes).values(insertTax).returning();
    await deleteCache(CacheKeys.taxes(insertTax.company_id));
    return tax;
  }
  async getTaxesByCompany(companyId) {
    const cached = await getCache(CacheKeys.taxes(companyId));
    if (cached) return cached;
    const taxesList = await db.select().from(taxes).where(eq(taxes.company_id, companyId));
    await setCache(CacheKeys.taxes(companyId), taxesList, CacheTTL.LONG);
    return taxesList;
  }
  async getTaxById(id) {
    const [tax] = await db.select().from(taxes).where(eq(taxes.id, id));
    return tax || void 0;
  }
  async updateTax(id, updateData) {
    const [tax] = await db.update(taxes).set({ ...updateData, updated_at: /* @__PURE__ */ new Date() }).where(eq(taxes.id, id)).returning();
    if (tax) {
      await deleteCache(CacheKeys.taxes(tax.company_id));
      await deleteCache(CacheKeys.taxById(tax.company_id, id));
    }
    return tax;
  }
  async deleteTax(id) {
    const tax = await this.getTaxById(id);
    await db.delete(taxes).where(eq(taxes.id, id));
    if (tax) {
      await deleteCache(CacheKeys.taxes(tax.company_id));
      await deleteCache(CacheKeys.taxById(tax.company_id, id));
    }
    return true;
  }
  // === Sales Invoices Implementation ===
  async createSalesInvoice(insertSalesInvoice) {
    const [invoice] = await db.insert(sales_invoices).values(insertSalesInvoice).returning();
    return invoice;
  }
  async getSalesInvoicesByCompany(companyId) {
    return await db.select().from(sales_invoices).where(eq(sales_invoices.company_id, companyId));
  }
  async getSalesInvoiceById(id) {
    const [invoice] = await db.select().from(sales_invoices).where(eq(sales_invoices.id, id));
    if (!invoice) return void 0;
    const lines = await db.select().from(document_lines).where(
      and(
        eq(document_lines.document_id, id),
        eq(document_lines.document_type, "invoice")
      )
    );
    let customer_name = "";
    if (invoice.customer_id) {
      const [customer] = await db.select({ name: contacts.name }).from(contacts).where(eq(contacts.id, invoice.customer_id));
      customer_name = customer?.name || "";
    }
    return { ...invoice, lines, customer_name };
  }
  async updateSalesInvoice(id, updateData) {
    const [invoice] = await db.update(sales_invoices).set({ ...updateData, updated_at: /* @__PURE__ */ new Date() }).where(eq(sales_invoices.id, id)).returning();
    return invoice;
  }
  async deleteSalesInvoice(id) {
    await db.delete(sales_invoices).where(eq(sales_invoices.id, id));
    return true;
  }
  // === Sales Quotes Implementation ===
  async createSalesQuote(insertSalesQuote) {
    const [quote] = await db.insert(sales_quotes).values(insertSalesQuote).returning();
    return quote;
  }
  async getSalesQuotesByCompany(companyId) {
    return await db.select().from(sales_quotes).where(eq(sales_quotes.company_id, companyId));
  }
  async getSalesQuoteById(id) {
    const [quote] = await db.select().from(sales_quotes).where(eq(sales_quotes.id, id));
    return quote || void 0;
  }
  async updateSalesQuote(id, updateData) {
    const [quote] = await db.update(sales_quotes).set({ ...updateData, updated_at: /* @__PURE__ */ new Date() }).where(eq(sales_quotes.id, id)).returning();
    return quote;
  }
  async deleteSalesQuote(id) {
    await db.delete(sales_quotes).where(eq(sales_quotes.id, id));
    return true;
  }
  // === Sales Orders Implementation ===
  async createSalesOrder(insertSalesOrder) {
    const [order] = await db.insert(sales_orders).values(insertSalesOrder).returning();
    return order;
  }
  async getSalesOrdersByCompany(companyId) {
    return await db.select().from(sales_orders).where(eq(sales_orders.company_id, companyId));
  }
  async getSalesOrderById(id) {
    const result = await db.select().from(sales_orders).where(eq(sales_orders.id, id)).limit(1);
    return result[0];
  }
  async updateSalesOrder(id, updateData) {
    const [order] = await db.update(sales_orders).set({ ...updateData, updated_at: /* @__PURE__ */ new Date() }).where(eq(sales_orders.id, id)).returning();
    return order;
  }
  async deleteSalesOrder(companyId, id) {
    const result = await db.delete(sales_orders).where(and(eq(sales_orders.id, id), eq(sales_orders.company_id, companyId)));
    return result.rowCount ? result.rowCount > 0 : true;
  }
  // === Bank Accounts Implementation ===
  async createBankAccount(insertBankAccount) {
    if (!insertBankAccount.account_id) {
      const accountCode = `1001-${Date.now().toString().slice(-6)}`;
      const [newAccount] = await db.insert(accounts).values({
        company_id: insertBankAccount.company_id,
        code: accountCode,
        name: insertBankAccount.name,
        account_type: "asset",
        account_subtype: "Cash",
        is_active: true
      }).returning();
      insertBankAccount.account_id = newAccount.id;
    }
    if (!insertBankAccount.opening_balance_date) {
      insertBankAccount.opening_balance_date = /* @__PURE__ */ new Date();
    }
    const [bankAccount] = await db.insert(bank_accounts).values(insertBankAccount).returning();
    return bankAccount;
  }
  async getBankAccountsByCompany(companyId) {
    return await db.select().from(bank_accounts).where(eq(bank_accounts.company_id, companyId));
  }
  async updateBankAccount(id, updateData) {
    const [bankAccount] = await db.update(bank_accounts).set({ ...updateData, updated_at: /* @__PURE__ */ new Date() }).where(eq(bank_accounts.id, id)).returning();
    return bankAccount;
  }
  async deleteBankAccount(id) {
    await db.delete(bank_accounts).where(eq(bank_accounts.id, id));
    return true;
  }
  // === Bank Statement Lines Implementation ===
  async createBankStatementLine(line) {
    const [row] = await db.insert(bank_statement_lines).values(line).returning();
    return row;
  }
  async getBankStatementLinesByCompany(companyId, bankAccountId) {
    if (bankAccountId) {
      return await db.select().from(bank_statement_lines).where(and(eq(bank_statement_lines.company_id, companyId), eq(bank_statement_lines.bank_account_id, bankAccountId)));
    }
    return await db.select().from(bank_statement_lines).where(eq(bank_statement_lines.company_id, companyId));
  }
  async updateBankStatementLine(id, data) {
    const [row] = await db.update(bank_statement_lines).set({ ...data, updated_at: /* @__PURE__ */ new Date() }).where(eq(bank_statement_lines.id, id)).returning();
    return row;
  }
  async deleteBankStatementLine(companyId, id) {
    await db.delete(bank_statement_lines).where(and(eq(bank_statement_lines.company_id, companyId), eq(bank_statement_lines.id, id)));
    return true;
  }
  // === Bills Implementation ===
  async createBill(insertBill) {
    const [bill] = await db.insert(bills).values(insertBill).returning();
    return bill;
  }
  async getBillsByCompany(companyId) {
    return await db.select().from(bills).where(eq(bills.company_id, companyId));
  }
  async getBillById(id) {
    const result = await db.select().from(bills).where(eq(bills.id, id)).limit(1);
    return result[0];
  }
  async updateBill(id, updateData) {
    const [bill] = await db.update(bills).set({ ...updateData, updated_at: /* @__PURE__ */ new Date() }).where(eq(bills.id, id)).returning();
    return bill;
  }
  async deleteBill(companyId, id) {
    const result = await db.delete(bills).where(
      and(eq(bills.id, id), eq(bills.company_id, companyId))
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }
  // === Purchase Orders Implementation ===
  async createPurchaseOrder(insertPurchaseOrder) {
    const [order] = await db.insert(purchase_orders).values(insertPurchaseOrder).returning();
    return order;
  }
  async getPurchaseOrdersByCompany(companyId) {
    return await db.select().from(purchase_orders).where(eq(purchase_orders.company_id, companyId));
  }
  async getPurchaseOrderById(id) {
    const result = await db.select().from(purchase_orders).where(eq(purchase_orders.id, id)).limit(1);
    return result[0];
  }
  async updatePurchaseOrder(id, updateData) {
    const [order] = await db.update(purchase_orders).set({ ...updateData, updated_at: /* @__PURE__ */ new Date() }).where(eq(purchase_orders.id, id)).returning();
    return order;
  }
  async deletePurchaseOrder(companyId, id) {
    const result = await db.delete(purchase_orders).where(and(eq(purchase_orders.id, id), eq(purchase_orders.company_id, companyId)));
    return result.rowCount ? result.rowCount > 0 : true;
  }
  // === Expenses Implementation ===
  async createExpense(insertExpense) {
    const [expense] = await db.insert(expenses).values(insertExpense).returning();
    return expense;
  }
  async getExpensesByCompany(companyId) {
    return await db.select().from(expenses).where(eq(expenses.company_id, companyId));
  }
  // === Payments Implementation ===
  async createPayment(insertPayment) {
    const [payment] = await db.insert(payments).values(insertPayment).returning();
    return payment;
  }
  async getPaymentsByCompany(companyId) {
    return await db.select({
      id: payments.id,
      company_id: payments.company_id,
      payment_number: payments.payment_number,
      vendor_id: payments.vendor_id,
      vendor_name: payments.vendor_name,
      date: payments.date,
      amount: payments.amount,
      payment_method: payments.payment_method,
      reference: payments.reference,
      description: payments.description,
      bank_account_id: payments.bank_account_id,
      status: payments.status,
      currency: payments.currency,
      fx_rate: payments.fx_rate,
      journal_id: payments.journal_id,
      created_by: payments.created_by,
      created_at: payments.created_at,
      updated_at: payments.updated_at
    }).from(payments).where(eq(payments.company_id, companyId));
  }
  async deletePayment(companyId, id) {
    const result = await db.delete(payments).where(and(eq(payments.id, id), eq(payments.company_id, companyId)));
    return result.rowCount > 0;
  }
  // === Receipts Implementation ===
  async createReceipt(insertReceipt) {
    const [receipt] = await db.insert(receipts).values(insertReceipt).returning();
    return receipt;
  }
  async getReceiptsByCompany(companyId) {
    return await db.select({
      id: receipts.id,
      company_id: receipts.company_id,
      receipt_number: receipts.receipt_number,
      customer_id: receipts.customer_id,
      customer_name: receipts.customer_name,
      date: receipts.date,
      amount: receipts.amount,
      payment_method: receipts.payment_method,
      reference: receipts.reference,
      description: receipts.description,
      bank_account_id: receipts.bank_account_id,
      status: receipts.status,
      currency: receipts.currency,
      fx_rate: receipts.fx_rate,
      journal_id: receipts.journal_id,
      created_by: receipts.created_by,
      created_at: receipts.created_at,
      updated_at: receipts.updated_at
    }).from(receipts).where(eq(receipts.company_id, companyId));
  }
  async deleteReceipt(companyId, id) {
    const result = await db.delete(receipts).where(and(eq(receipts.id, id), eq(receipts.company_id, companyId)));
    return result.rowCount > 0;
  }
  // === Warehouses ===
  async getWarehousesByCompany(companyId) {
    return await db.select().from(warehouses).where(eq(warehouses.company_id, companyId));
  }
  // === Sales Credit Notes Implementation ===
  async createSalesCreditNote(insertNote) {
    const [note] = await db.insert(sales_credit_notes).values(insertNote).returning();
    return note;
  }
  async getSalesCreditNotesByCompany(companyId) {
    return await db.select().from(sales_credit_notes).where(eq(sales_credit_notes.company_id, companyId));
  }
  async getSalesCreditNoteById(id) {
    const [note] = await db.select().from(sales_credit_notes).where(eq(sales_credit_notes.id, id));
    return note;
  }
  async updateSalesCreditNote(id, updateData) {
    const [note] = await db.update(sales_credit_notes).set({ ...updateData, updated_at: /* @__PURE__ */ new Date() }).where(eq(sales_credit_notes.id, id)).returning();
    return note;
  }
  async deleteSalesCreditNote(companyId, id) {
    const result = await db.delete(sales_credit_notes).where(and(eq(sales_credit_notes.id, id), eq(sales_credit_notes.company_id, companyId)));
    return result.rowCount > 0;
  }
  async applySalesCreditNote(allocation) {
    await db.insert(payment_allocations).values(allocation);
    const invoice = await this.getSalesInvoiceById(allocation.document_id);
    if (invoice) {
      const newPaid = (parseFloat(invoice.paid_amount || "0") + parseFloat(allocation.allocated_amount.toString())).toString();
      let status = invoice.status;
      if (parseFloat(newPaid) >= parseFloat(invoice.total)) {
        status = "paid";
      } else if (parseFloat(newPaid) > 0) {
        status = "partially_paid";
      }
      await this.updateSalesInvoice(invoice.id, { paid_amount: newPaid, status });
    }
    const creditNote = await this.getSalesCreditNoteById(allocation.payment_id);
    if (creditNote) {
      const newRemaining = (parseFloat(creditNote.remaining_amount || creditNote.total) - parseFloat(allocation.allocated_amount.toString())).toString();
      let status = creditNote.status;
      if (parseFloat(newRemaining) <= 0) {
        status = "applied";
      } else {
        status = "partially_applied";
      }
      await this.updateSalesCreditNote(creditNote.id, { remaining_amount: newRemaining, status });
    }
    return true;
  }
  // === Purchase Debit Notes Implementation ===
  async createPurchaseDebitNote(insertNote) {
    const [note] = await db.insert(purchase_debit_notes).values(insertNote).returning();
    return note;
  }
  async getPurchaseDebitNotesByCompany(companyId) {
    return await db.select().from(purchase_debit_notes).where(eq(purchase_debit_notes.company_id, companyId));
  }
  async getPurchaseDebitNoteById(id) {
    const [note] = await db.select().from(purchase_debit_notes).where(eq(purchase_debit_notes.id, id));
    return note;
  }
  async updatePurchaseDebitNote(id, updateData) {
    const [note] = await db.update(purchase_debit_notes).set({ ...updateData, updated_at: /* @__PURE__ */ new Date() }).where(eq(purchase_debit_notes.id, id)).returning();
    return note;
  }
  async deletePurchaseDebitNote(companyId, id) {
    const result = await db.delete(purchase_debit_notes).where(and(eq(purchase_debit_notes.id, id), eq(purchase_debit_notes.company_id, companyId)));
    return result.rowCount > 0;
  }
  async applyPurchaseDebitNote(allocation) {
    await db.insert(payment_allocations).values(allocation);
    const bill = await this.getBillById(allocation.document_id);
    if (bill) {
      const newPaid = (parseFloat(bill.paid_amount || "0") + parseFloat(allocation.allocated_amount.toString())).toString();
      let status = bill.status;
      if (parseFloat(newPaid) >= parseFloat(bill.total)) {
        status = "paid";
      } else if (parseFloat(newPaid) > 0) {
        status = "partially_paid";
      }
      await this.updateBill(bill.id, { paid_amount: newPaid, status });
    }
    const debitNote = await this.getPurchaseDebitNoteById(allocation.payment_id);
    if (debitNote) {
      const newRemaining = (parseFloat(debitNote.remaining_amount || debitNote.total) - parseFloat(allocation.allocated_amount.toString())).toString();
      let status = debitNote.status;
      if (parseFloat(newRemaining) <= 0) {
        status = "applied";
      } else {
        status = "partially_applied";
      }
      await this.updatePurchaseDebitNote(debitNote.id, { remaining_amount: newRemaining, status });
    }
    return true;
  }
  // === Recurring Templates Implementation ===
  async createRecurringTemplate(insertTemplate) {
    const [template] = await db.insert(recurring_templates).values(insertTemplate).returning();
    return template;
  }
  async getRecurringTemplatesByCompany(companyId, documentType) {
    if (documentType) {
      return await db.select().from(recurring_templates).where(
        and(
          eq(recurring_templates.company_id, companyId),
          eq(recurring_templates.document_type, documentType)
        )
      );
    }
    return await db.select().from(recurring_templates).where(eq(recurring_templates.company_id, companyId));
  }
  async updateRecurringTemplate(id, updateData) {
    const [template] = await db.update(recurring_templates).set({ ...updateData, updated_at: /* @__PURE__ */ new Date() }).where(eq(recurring_templates.id, id)).returning();
    return template;
  }
  async deleteRecurringTemplate(id) {
    const result = await db.delete(recurring_templates).where(eq(recurring_templates.id, id));
    return result.rowCount > 0;
  }
  // Reports
  async getTrialBalance(companyId, endDate) {
    try {
      let query = db.select({
        id: accounts.id,
        code: accounts.code,
        name: accounts.name,
        account_type: accounts.account_type,
        account_subtype: accounts.account_subtype,
        debit: sql2`COALESCE(SUM(${journal_lines.debit}), 0)`,
        credit: sql2`COALESCE(SUM(${journal_lines.credit}), 0)`
      }).from(accounts).leftJoin(journal_lines, eq(accounts.id, journal_lines.account_id)).leftJoin(journals, eq(journal_lines.journal_id, journals.id)).where(
        and(
          eq(accounts.company_id, companyId),
          eq(accounts.is_active, true),
          endDate ? lte(journals.date, endDate) : void 0
        )
      ).groupBy(accounts.id, accounts.code, accounts.name, accounts.account_type, accounts.account_subtype).having(sql2`COALESCE(SUM(${journal_lines.debit}), 0) + COALESCE(SUM(${journal_lines.credit}), 0) > 0`).orderBy(accounts.code, accounts.name);
      const result = await query;
      return result;
    } catch (error) {
      console.error("Error getting trial balance:", error);
      return [];
    }
  }
  async getBalanceSheet(companyId, endDate) {
    try {
      const accountsData = await db.select({
        id: accounts.id,
        code: accounts.code,
        name: accounts.name,
        account_type: accounts.account_type,
        account_subtype: accounts.account_subtype,
        debit: sql2`COALESCE(SUM(${journal_lines.debit}), 0)`,
        credit: sql2`COALESCE(SUM(${journal_lines.credit}), 0)`
      }).from(accounts).leftJoin(journal_lines, eq(accounts.id, journal_lines.account_id)).leftJoin(journals, eq(journal_lines.journal_id, journals.id)).where(
        and(
          eq(accounts.company_id, companyId),
          eq(accounts.is_active, true),
          endDate ? lte(journals.date, endDate) : void 0
        )
      ).groupBy(accounts.id, accounts.code, accounts.name, accounts.account_type, accounts.account_subtype).orderBy(accounts.code, accounts.name);
      const balancedAccounts = accountsData.map((account) => {
        let balance = 0;
        if (account.account_type === "asset" || account.account_type === "expense") {
          balance = account.debit - account.credit;
        } else {
          balance = account.credit - account.debit;
        }
        return {
          ...account,
          balance
        };
      });
      const activeAccounts = balancedAccounts.filter(
        (account) => Math.abs(account.balance) > 0.01 && ["asset", "liability", "equity"].includes(account.account_type)
      );
      const assets = {
        current: activeAccounts.filter(
          (acc) => acc.account_type === "asset" && (acc.account_subtype === "current_asset" || acc.account_subtype?.includes("current"))
        ),
        nonCurrent: activeAccounts.filter(
          (acc) => acc.account_type === "asset" && (!acc.account_subtype || !acc.account_subtype.includes("current") && acc.account_subtype !== "current_asset")
        )
      };
      const liabilities = {
        current: activeAccounts.filter(
          (acc) => acc.account_type === "liability" && (acc.account_subtype === "current_liability" || acc.account_subtype?.includes("current"))
        ),
        nonCurrent: activeAccounts.filter(
          (acc) => acc.account_type === "liability" && (!acc.account_subtype || !acc.account_subtype.includes("current") && acc.account_subtype !== "current_liability")
        )
      };
      const equity = activeAccounts.filter((acc) => acc.account_type === "equity");
      return {
        assets,
        liabilities,
        equity,
        date: endDate || /* @__PURE__ */ new Date()
      };
    } catch (error) {
      console.error("Error getting balance sheet:", error);
      return {
        assets: { current: [], nonCurrent: [] },
        liabilities: { current: [], nonCurrent: [] },
        equity: [],
        date: /* @__PURE__ */ new Date()
      };
    }
  }
  // === AI Feedback ===
  async createAIFeedback(entry) {
    const [row] = await db.insert(ai_feedback).values(entry).returning();
    return row;
  }
  async getProfitLoss(companyId, startDate, endDate) {
    try {
      const accountsData = await db.select({
        id: accounts.id,
        code: accounts.code,
        name: accounts.name,
        account_type: accounts.account_type,
        account_subtype: accounts.account_subtype,
        debit: sql2`COALESCE(SUM(${journal_lines.debit}), 0)`,
        credit: sql2`COALESCE(SUM(${journal_lines.credit}), 0)`
      }).from(accounts).leftJoin(journal_lines, eq(accounts.id, journal_lines.account_id)).leftJoin(journals, eq(journal_lines.journal_id, journals.id)).where(
        and(
          eq(accounts.company_id, companyId),
          eq(accounts.is_active, true),
          // Filter by date range if provided
          startDate ? gte(journals.date, startDate) : void 0,
          endDate ? lte(journals.date, endDate) : void 0,
          // Only include revenue and expense accounts for P&L
          or(
            eq(accounts.account_type, "revenue"),
            eq(accounts.account_type, "expense")
          )
        )
      ).groupBy(accounts.id, accounts.code, accounts.name, accounts.account_type, accounts.account_subtype).orderBy(accounts.code, accounts.name);
      const balancedAccounts = accountsData.map((account) => {
        let balance = 0;
        if (account.account_type === "revenue") {
          balance = account.credit - account.debit;
        } else if (account.account_type === "expense") {
          balance = account.debit - account.credit;
        }
        return {
          ...account,
          balance
        };
      });
      const activeAccounts = balancedAccounts.filter(
        (account) => Math.abs(account.balance) > 0.01
      );
      const revenue = {
        operating: activeAccounts.filter(
          (acc) => acc.account_type === "revenue" && (acc.account_subtype === "operating_revenue" || acc.account_subtype === "sales_revenue" || acc.account_subtype?.includes("operating") || !acc.account_subtype)
        ),
        nonOperating: activeAccounts.filter(
          (acc) => acc.account_type === "revenue" && (acc.account_subtype === "other_income" || acc.account_subtype === "non_operating_revenue" || acc.account_subtype?.includes("other"))
        )
      };
      const expenses2 = {
        costOfGoodsSold: activeAccounts.filter(
          (acc) => acc.account_type === "expense" && (acc.account_subtype === "cost_of_goods_sold" || acc.account_subtype === "cogs" || acc.account_subtype?.includes("cogs"))
        ),
        operating: activeAccounts.filter(
          (acc) => acc.account_type === "expense" && (acc.account_subtype === "operating_expense" || acc.account_subtype === "administrative" || acc.account_subtype === "selling" || acc.account_subtype?.includes("operating") || !acc.account_subtype && !acc.account_subtype?.includes("cogs") && !acc.account_subtype?.includes("other"))
        ),
        nonOperating: activeAccounts.filter(
          (acc) => acc.account_type === "expense" && (acc.account_subtype === "other_expense" || acc.account_subtype === "non_operating_expense" || acc.account_subtype === "interest_expense" || acc.account_subtype?.includes("other"))
        )
      };
      return {
        revenue,
        expenses: expenses2,
        startDate: startDate || new Date((/* @__PURE__ */ new Date()).getFullYear(), 0, 1),
        // Default to year start
        endDate: endDate || /* @__PURE__ */ new Date()
      };
    } catch (error) {
      console.error("Error getting profit loss:", error);
      return {
        revenue: { operating: [], nonOperating: [] },
        expenses: { costOfGoodsSold: [], operating: [], nonOperating: [] },
        startDate: new Date((/* @__PURE__ */ new Date()).getFullYear(), 0, 1),
        endDate: /* @__PURE__ */ new Date()
      };
    }
  }
  async getCashFlow(companyId, startDate, endDate) {
    try {
      const company = await this.getCompanyById(companyId);
      const companyCurrency = company?.base_currency || "USD";
      const companyName = company?.name || "Company";
      const beginningCashBalance = await this.calculateBeginningCashBalance(companyId, startDate || new Date((/* @__PURE__ */ new Date()).getFullYear(), 0, 1));
      const operatingActivities = await this.calculateOperatingCashFlows(companyId, startDate, endDate);
      const investingActivities = await this.calculateInvestingCashFlows(companyId, startDate, endDate);
      const financingActivities = await this.calculateFinancingCashFlows(companyId, startDate, endDate);
      const operatingCashFlow = operatingActivities.reduce((sum8, item) => sum8 + item.amount, 0);
      const investingCashFlow = investingActivities.reduce((sum8, item) => sum8 + item.amount, 0);
      const financingCashFlow = financingActivities.reduce((sum8, item) => sum8 + item.amount, 0);
      const netCashFlow = operatingCashFlow + investingCashFlow + financingCashFlow;
      const endingCash = beginningCashBalance + netCashFlow;
      return {
        period: endDate ? endDate.toISOString().substring(0, 7) : (/* @__PURE__ */ new Date()).toISOString().substring(0, 7),
        company: companyName,
        currency: companyCurrency,
        beginningCash: beginningCashBalance,
        endingCash,
        netCashFlow,
        operatingActivities,
        investingActivities,
        financingActivities,
        operatingCashFlow,
        investingCashFlow,
        financingCashFlow,
        startDate: startDate || new Date((/* @__PURE__ */ new Date()).getFullYear(), 0, 1),
        endDate: endDate || /* @__PURE__ */ new Date()
      };
    } catch (error) {
      console.error("Error getting cash flow:", error);
      return {
        period: (/* @__PURE__ */ new Date()).toISOString().substring(0, 7),
        company: "Company",
        currency: "USD",
        // Will be overridden by frontend's companyCurrency hook
        beginningCash: 0,
        endingCash: 0,
        netCashFlow: 0,
        operatingActivities: [],
        investingActivities: [],
        financingActivities: [],
        operatingCashFlow: 0,
        investingCashFlow: 0,
        financingCashFlow: 0,
        startDate: new Date((/* @__PURE__ */ new Date()).getFullYear(), 0, 1),
        endDate: /* @__PURE__ */ new Date()
      };
    }
  }
  async calculateBeginningCashBalance(companyId, startDate) {
    try {
      const receiptsBeforeStart = await db.select({ total: sql2`COALESCE(SUM(CAST(${receipts.amount} AS DECIMAL)), 0)` }).from(receipts).where(
        and(
          eq(receipts.company_id, companyId),
          lte(receipts.date, startDate)
        )
      );
      const paymentsBeforeStart = await db.select({ total: sql2`COALESCE(SUM(CAST(${payments.amount} AS DECIMAL)), 0)` }).from(payments).where(
        and(
          eq(payments.company_id, companyId),
          lte(payments.date, startDate)
        )
      );
      const totalReceipts = Number(receiptsBeforeStart[0]?.total || 0);
      const totalPayments = Number(paymentsBeforeStart[0]?.total || 0);
      return totalReceipts - totalPayments;
    } catch (error) {
      console.error("Error calculating beginning cash balance:", error);
      return 0;
    }
  }
  async calculateOperatingCashFlows(companyId, startDate, endDate) {
    try {
      const activities = [];
      const start = startDate || new Date((/* @__PURE__ */ new Date()).getFullYear(), 0, 1);
      const end = endDate || /* @__PURE__ */ new Date();
      const receiptsInPeriod = await db.select({ total: sql2`COALESCE(SUM(CAST(${receipts.amount} AS DECIMAL)), 0)` }).from(receipts).where(
        and(
          eq(receipts.company_id, companyId),
          gte(receipts.date, start),
          lte(receipts.date, end)
        )
      );
      const operatingPayments = await db.select({ total: sql2`COALESCE(SUM(CAST(${payments.amount} AS DECIMAL)), 0)` }).from(payments).where(
        and(
          eq(payments.company_id, companyId),
          gte(payments.date, start),
          lte(payments.date, end)
        )
      );
      const totalReceipts = Number(receiptsInPeriod[0]?.total || 0);
      const totalOperatingPayments = Number(operatingPayments[0]?.total || 0);
      const netIncome = totalReceipts - totalOperatingPayments;
      if (Math.abs(netIncome) > 0.01) {
        activities.push({
          item: "Net Income",
          description: "Net Income",
          amount: netIncome,
          isInflow: netIncome > 0
        });
      }
      return activities;
    } catch (error) {
      console.error("Error calculating operating cash flows:", error);
      return [];
    }
  }
  async calculateInvestingCashFlows(companyId, startDate, endDate) {
    return [];
  }
  async calculateFinancingCashFlows(companyId, startDate, endDate) {
    return [];
  }
  async getTaxReportByTaxId(companyId, taxId, startDate, endDate, filters) {
    const toNumber = (v) => {
      const n = parseFloat(v?.toString?.() || String(v || "0"));
      return Number.isFinite(n) ? n : 0;
    };
    const invConds = [
      eq(document_lines.document_type, "invoice"),
      eq(sales_invoices.company_id, companyId)
    ];
    if (startDate) invConds.push(gte(sales_invoices.date, startDate));
    if (endDate) invConds.push(lte(sales_invoices.date, endDate));
    if (filters?.customerId) invConds.push(eq(sales_invoices.customer_id, filters.customerId));
    if (filters?.currency) invConds.push(eq(sales_invoices.currency, filters.currency));
    if (filters?.warehouseId) invConds.push(
      and(
        eq(stock_movements.reference_type, "invoice"),
        eq(stock_movements.reference_id, sales_invoices.id),
        eq(stock_movements.item_id, document_lines.item_id),
        eq(stock_movements.warehouse_id, filters.warehouseId)
      )
    );
    const invoiceRows = await db.select({
      invoice_id: sales_invoices.id,
      invoice_number: sales_invoices.invoice_number,
      date: sales_invoices.date,
      line_total: document_lines.line_total,
      tax_amount: document_lines.tax_amount,
      item_id: document_lines.item_id,
      default_tax_id: items.default_tax_id,
      line_tax_id: document_lines.tax_id
    }).from(document_lines).leftJoin(sales_invoices, and(
      eq(document_lines.document_id, sales_invoices.id),
      eq(document_lines.document_type, "invoice")
    )).leftJoin(stock_movements, and(
      eq(stock_movements.reference_type, "invoice"),
      eq(stock_movements.reference_id, sales_invoices.id),
      eq(stock_movements.item_id, document_lines.item_id)
    )).leftJoin(items, eq(document_lines.item_id, items.id)).where(and(...invConds));
    const invoiceLines = invoiceRows.filter((r) => r.line_tax_id ? r.line_tax_id === taxId : r.default_tax_id === taxId);
    const salesTaxable = invoiceLines.reduce((s, r) => s + toNumber(r.line_total), 0);
    const salesTax = invoiceLines.reduce((s, r) => s + toNumber(r.tax_amount), 0);
    const billConds = [
      eq(document_lines.document_type, "bill"),
      eq(bills.company_id, companyId)
    ];
    if (startDate) billConds.push(gte(bills.date, startDate));
    if (endDate) billConds.push(lte(bills.date, endDate));
    if (filters?.vendorId) billConds.push(eq(bills.supplier_id, filters.vendorId));
    if (filters?.currency) billConds.push(eq(bills.currency, filters.currency));
    if (filters?.warehouseId) billConds.push(
      and(
        eq(stock_movements.reference_type, "bill"),
        eq(stock_movements.reference_id, bills.id),
        eq(stock_movements.item_id, document_lines.item_id),
        eq(stock_movements.warehouse_id, filters.warehouseId)
      )
    );
    const billRows = await db.select({
      bill_id: bills.id,
      bill_number: bills.bill_number,
      date: bills.date,
      line_total: document_lines.line_total,
      tax_amount: document_lines.tax_amount,
      item_id: document_lines.item_id,
      default_tax_id: items.default_tax_id,
      line_tax_id: document_lines.tax_id
    }).from(document_lines).leftJoin(bills, and(
      eq(document_lines.document_id, bills.id),
      eq(document_lines.document_type, "bill")
    )).leftJoin(stock_movements, and(
      eq(stock_movements.reference_type, "bill"),
      eq(stock_movements.reference_id, bills.id),
      eq(stock_movements.item_id, document_lines.item_id)
    )).leftJoin(items, eq(document_lines.item_id, items.id)).where(and(...billConds));
    const billLines = billRows.filter((r) => r.line_tax_id ? r.line_tax_id === taxId : r.default_tax_id === taxId);
    const purchaseTaxable = billLines.reduce((s, r) => s + toNumber(r.line_total), 0);
    const purchaseTax = billLines.reduce((s, r) => s + toNumber(r.tax_amount), 0);
    const tax = await this.getTaxById(taxId);
    const company = await this.getCompanyById(companyId);
    const period = startDate && endDate ? `${startDate.toISOString().slice(0, 10)}_${endDate.toISOString().slice(0, 10)}` : (/* @__PURE__ */ new Date()).toISOString().substring(0, 7);
    return {
      period,
      company: company?.name ?? "Company",
      currency: company?.base_currency ?? "USD",
      tax,
      sales: {
        count: invoiceLines.length,
        taxable: salesTaxable,
        tax: salesTax,
        lines: invoiceLines.map((r) => ({
          id: r.invoice_id,
          number: r.invoice_number,
          date: r.date,
          line_total: toNumber(r.line_total),
          tax_amount: toNumber(r.tax_amount)
        }))
      },
      purchases: {
        count: billLines.length,
        taxable: purchaseTaxable,
        tax: purchaseTax,
        lines: billLines.map((r) => ({
          id: r.bill_id,
          number: r.bill_number,
          date: r.date,
          line_total: toNumber(r.line_total),
          tax_amount: toNumber(r.tax_amount)
        }))
      },
      totals: {
        taxable: salesTaxable + purchaseTaxable,
        collected: salesTax,
        paid: purchaseTax,
        net: salesTax - purchaseTax
      }
    };
  }
  async getTaxReport(companyId, startDate, endDate, filters) {
    try {
      const companyTaxRates = await db.select().from(taxes).where(
        and(
          eq(taxes.company_id, companyId),
          eq(taxes.is_active, true)
        )
      );
      const salesTaxData = await this.calculateSalesTax(companyId, startDate, endDate, filters);
      const purchaseTaxData = await this.calculatePurchaseTax(companyId, startDate, endDate, filters);
      const taxFilings = await this.getTaxFilings(companyId, startDate, endDate);
      const incomeTaxData = await this.calculateIncomeTax(companyId, startDate, endDate);
      const company = await this.getCompanyById(companyId);
      const period = startDate && endDate ? `${startDate.toISOString().slice(0, 10)}_${endDate.toISOString().slice(0, 10)}` : (/* @__PURE__ */ new Date()).toISOString().substring(0, 7);
      return {
        period,
        company: company?.name ?? "Company",
        currency: company?.base_currency ?? "USD",
        salesTax: salesTaxData,
        purchaseTax: purchaseTaxData,
        incomeTax: incomeTaxData,
        payrollTax: {
          grossWages: 0,
          federalWithholding: 0,
          stateWithholding: 0,
          socialSecurity: 0,
          medicare: 0,
          employerContributions: 0,
          totalPayrollTax: 0
        },
        filings: taxFilings,
        startDate: startDate || new Date((/* @__PURE__ */ new Date()).getFullYear(), 0, 1),
        endDate: endDate || /* @__PURE__ */ new Date()
      };
    } catch (error) {
      console.error("Error getting tax report:", error);
      return {
        period: (/* @__PURE__ */ new Date()).toISOString().substring(0, 7),
        company: "Company Name",
        currency: "USD",
        salesTax: { totalSales: 0, taxableSales: 0, exemptSales: 0, collectedTax: 0, rates: [] },
        purchaseTax: { totalPurchases: 0, taxablePurchases: 0, exemptPurchases: 0, paidTax: 0, recoverable: 0 },
        incomeTax: { grossIncome: 0, deductions: 0, taxableIncome: 0, estimatedTax: 0, quarterlyPayments: [] },
        payrollTax: { grossWages: 0, federalWithholding: 0, stateWithholding: 0, socialSecurity: 0, medicare: 0, employerContributions: 0, totalPayrollTax: 0 },
        filings: [],
        startDate: new Date((/* @__PURE__ */ new Date()).getFullYear(), 0, 1),
        endDate: /* @__PURE__ */ new Date()
      };
    }
  }
  async calculateSalesTax(companyId, startDate, endDate, filters) {
    if (filters?.warehouseId) {
      const conds = [
        eq(document_lines.document_type, "invoice"),
        eq(sales_invoices.company_id, companyId),
        eq(stock_movements.reference_type, "invoice"),
        eq(stock_movements.reference_id, sales_invoices.id),
        eq(stock_movements.item_id, document_lines.item_id),
        eq(stock_movements.warehouse_id, filters.warehouseId)
      ];
      if (startDate) conds.push(gte(sales_invoices.date, startDate));
      if (endDate) conds.push(lte(sales_invoices.date, endDate));
      if (filters.customerId) conds.push(eq(sales_invoices.customer_id, filters.customerId));
      if (filters.currency) conds.push(eq(sales_invoices.currency, filters.currency));
      const rows = await db.select({
        line_total: document_lines.line_total,
        tax_amount: document_lines.tax_amount
      }).from(document_lines).leftJoin(sales_invoices, and(
        eq(document_lines.document_id, sales_invoices.id),
        eq(document_lines.document_type, "invoice")
      )).leftJoin(stock_movements, and(
        eq(stock_movements.reference_type, "invoice"),
        eq(stock_movements.reference_id, sales_invoices.id),
        eq(stock_movements.item_id, document_lines.item_id)
      )).where(and(...conds));
      const toNum = (v) => {
        const n = parseFloat(v?.toString?.() || String(v || "0"));
        return Number.isFinite(n) ? n : 0;
      };
      const lineTotals = rows.reduce((s, r) => s + toNum(r.line_total), 0);
      const taxTotals = rows.reduce((s, r) => s + toNum(r.tax_amount), 0);
      const totalSales2 = lineTotals + taxTotals;
      const collectedTax2 = taxTotals;
      const taxableSales2 = lineTotals;
      return {
        totalSales: totalSales2,
        taxableSales: taxableSales2,
        exemptSales: 0,
        collectedTax: collectedTax2,
        rates: [
          { jurisdiction: "Sales Tax", rate: 8.5, taxable: taxableSales2, tax: collectedTax2 }
        ]
      };
    }
    const conditions = [eq(sales_invoices.company_id, companyId)];
    if (startDate) conditions.push(gte(sales_invoices.date, startDate));
    if (endDate) conditions.push(lte(sales_invoices.date, endDate));
    if (filters?.customerId) conditions.push(eq(sales_invoices.customer_id, filters.customerId));
    if (filters?.currency) conditions.push(eq(sales_invoices.currency, filters.currency));
    const whereExpr = conditions.length === 1 ? conditions[0] : and(...conditions);
    const salesResults = await db.select({
      subtotal: sales_invoices.subtotal,
      tax_total: sales_invoices.tax_total,
      total: sales_invoices.total
    }).from(sales_invoices).where(whereExpr);
    const totalSales = salesResults.reduce((sum8, invoice) => sum8 + parseFloat(invoice.total || "0"), 0);
    const collectedTax = salesResults.reduce((sum8, invoice) => sum8 + parseFloat(invoice.tax_total || "0"), 0);
    const taxableSales = totalSales - collectedTax;
    return {
      totalSales,
      taxableSales,
      exemptSales: 0,
      // Would require additional logic to determine exempt sales
      collectedTax,
      rates: [
        { jurisdiction: "Sales Tax", rate: 8.5, taxable: taxableSales, tax: collectedTax }
      ]
    };
  }
  async calculatePurchaseTax(companyId, startDate, endDate, filters) {
    if (filters?.warehouseId) {
      const conds = [
        eq(document_lines.document_type, "bill"),
        eq(bills.company_id, companyId),
        eq(stock_movements.reference_type, "bill"),
        eq(stock_movements.reference_id, bills.id),
        eq(stock_movements.item_id, document_lines.item_id),
        eq(stock_movements.warehouse_id, filters.warehouseId)
      ];
      if (startDate) conds.push(gte(bills.date, startDate));
      if (endDate) conds.push(lte(bills.date, endDate));
      if (filters.vendorId) conds.push(eq(bills.supplier_id, filters.vendorId));
      if (filters.currency) conds.push(eq(bills.currency, filters.currency));
      const rows = await db.select({
        line_total: document_lines.line_total,
        tax_amount: document_lines.tax_amount
      }).from(document_lines).leftJoin(bills, and(
        eq(document_lines.document_id, bills.id),
        eq(document_lines.document_type, "bill")
      )).leftJoin(stock_movements, and(
        eq(stock_movements.reference_type, "bill"),
        eq(stock_movements.reference_id, bills.id),
        eq(stock_movements.item_id, document_lines.item_id)
      )).where(and(...conds));
      const toNum = (v) => {
        const n = parseFloat(v?.toString?.() || String(v || "0"));
        return Number.isFinite(n) ? n : 0;
      };
      const lineTotals = rows.reduce((s, r) => s + toNum(r.line_total), 0);
      const taxTotals = rows.reduce((s, r) => s + toNum(r.tax_amount), 0);
      const totalPurchases2 = lineTotals + taxTotals;
      const paidTax2 = taxTotals;
      return {
        totalPurchases: totalPurchases2,
        taxablePurchases: lineTotals,
        exemptPurchases: 0,
        paidTax: paidTax2,
        recoverable: paidTax2 * 0.8
      };
    }
    const conditions = [eq(bills.company_id, companyId)];
    if (startDate) conditions.push(gte(bills.date, startDate));
    if (endDate) conditions.push(lte(bills.date, endDate));
    if (filters?.vendorId) conditions.push(eq(bills.supplier_id, filters.vendorId));
    if (filters?.currency) conditions.push(eq(bills.currency, filters.currency));
    const whereExpr = conditions.length === 1 ? conditions[0] : and(...conditions);
    const billsResults = await db.select({
      subtotal: bills.subtotal,
      tax_total: bills.tax_total,
      total: bills.total
    }).from(bills).where(whereExpr);
    const totalPurchases = billsResults.reduce((sum8, bill) => sum8 + parseFloat(bill.total || "0"), 0);
    const paidTax = billsResults.reduce((sum8, bill) => sum8 + parseFloat(bill.tax_total || "0"), 0);
    return {
      totalPurchases,
      taxablePurchases: totalPurchases - paidTax,
      exemptPurchases: 0,
      paidTax,
      recoverable: paidTax * 0.8
      // Simplified - 80% recoverable assumption
    };
  }
  async calculateIncomeTax(companyId, startDate, endDate) {
    const profitLossData = await this.getProfitLoss(companyId, startDate, endDate);
    const revenue = profitLossData.revenue || { operating: [], nonOperating: [] };
    const expenses2 = profitLossData.expenses || { costOfGoodsSold: [], operating: [], nonOperating: [] };
    const totalRevenue = [...revenue.operating, ...revenue.nonOperating].reduce((sum8, account) => sum8 + account.balance, 0);
    const totalExpenses = [...expenses2.costOfGoodsSold, ...expenses2.operating, ...expenses2.nonOperating].reduce((sum8, account) => sum8 + account.balance, 0);
    const taxableIncome = Math.max(0, totalRevenue - totalExpenses);
    const estimatedTax = taxableIncome * 0.25;
    return {
      grossIncome: totalRevenue,
      deductions: totalExpenses,
      taxableIncome,
      estimatedTax,
      quarterlyPayments: [
        { quarter: "Q1", dueDate: "2024-04-15", amount: estimatedTax / 4, status: "pending" },
        { quarter: "Q2", dueDate: "2024-06-15", amount: estimatedTax / 4, status: "pending" },
        { quarter: "Q3", dueDate: "2024-09-15", amount: estimatedTax / 4, status: "pending" },
        { quarter: "Q4", dueDate: "2025-01-15", amount: estimatedTax / 4, status: "pending" }
      ]
    };
  }
  async getTaxFilings(companyId, startDate, endDate) {
    return [
      { form: "Sales Tax Return", period: "Q1 2024", dueDate: "2024-04-20", status: "pending", amount: 4e3 },
      { form: "Corporate Tax Return", period: "Q1 2024", dueDate: "2024-04-15", status: "filed", amount: 2812.5 }
    ];
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
init_db();
init_schema();
init_schema();
import { fromZodError as fromZodError13 } from "zod-validation-error";
import bcrypt5 from "bcryptjs";

// server/middleware/rateLimiter.ts
import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";

// server/redis.ts
import { Redis as Redis2 } from "@upstash/redis";
var redis2 = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redis2 = new Redis2({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN
    });
    console.log("\u2705 Redis cache initialized (Upstash)");
  } catch (error) {
    console.warn("\u26A0\uFE0F Redis initialization failed, continuing without cache:", error);
  }
} else {
  console.log("\u2139\uFE0F Redis not configured - running without cache layer");
}
async function getCache2(key) {
  if (!redis2) return null;
  try {
    const data = await redis2.get(key);
    return data;
  } catch (error) {
    console.warn(`Cache read error for key ${key}:`, error);
    return null;
  }
}
async function setCache2(key, value, ttl = 3600) {
  if (!redis2) return false;
  try {
    await redis2.set(key, value, { ex: ttl });
    return true;
  } catch (error) {
    console.warn(`Cache write error for key ${key}:`, error);
    return false;
  }
}
async function deleteCache2(key) {
  if (!redis2) return false;
  try {
    await redis2.del(key);
    return true;
  } catch (error) {
    console.warn(`Cache delete error for key ${key}:`, error);
    return false;
  }
}
async function deleteCachePattern2(pattern) {
  if (!redis2) return false;
  try {
    const keys = await redis2.keys(pattern);
    if (keys.length > 0) {
      await redis2.del(...keys);
    }
    return true;
  } catch (error) {
    console.warn(`Cache pattern delete error for ${pattern}:`, error);
    return false;
  }
}
function isRedisAvailable2() {
  return redis2 !== null;
}

// server/middleware/rateLimiter.ts
var rateLimitHandler = (req, res) => {
  logger.warn(
    {
      ip: req.ip,
      path: req.path,
      method: req.method,
      userAgent: req.get("user-agent")
    },
    "Rate limit exceeded"
  );
  res.status(429).json({
    error: "Too many requests, please try again later",
    code: "RATE_LIMIT_EXCEEDED"
  });
};
function createStore() {
  if (isRedisAvailable2() && redis2) {
    console.log("\u2705 Using Redis-backed rate limiting (distributed)");
    return new RedisStore({
      // @ts-expect-error - Upstash Redis is compatible
      sendCommand: (...args) => redis2.call(...args)
    });
  }
  console.log("\u2139\uFE0F Using in-memory rate limiting (single instance)");
  return void 0;
}
var loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 دقيقة
  max: 5,
  // 5 محاولات فقط
  message: {
    error: "Too many login attempts from this IP, please try again after 15 minutes",
    retryAfter: "15 minutes"
  },
  standardHeaders: true,
  // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,
  // Disable the `X-RateLimit-*` headers
  handler: rateLimitHandler,
  store: createStore()
});
var registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1e3,
  // ساعة واحدة
  max: 3,
  // 3 حسابات فقط
  message: {
    error: "Too many accounts created from this IP, please try again later",
    retryAfter: "1 hour"
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  store: createStore()
});
var apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1e3,
  // دقيقة واحدة
  max: 100,
  // 100 طلب/دقيقة
  message: {
    error: "Too many requests from this IP, please slow down",
    retryAfter: "1 minute"
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  // Skip rate limit for health checks
  skip: (req) => req.path.startsWith("/api/health"),
  store: createStore()
});
var sensitiveLimiter = rateLimit({
  windowMs: 1 * 60 * 1e3,
  // دقيقة واحدة
  max: 30,
  // 30 طلب/دقيقة
  message: {
    error: "Too many sensitive operations, please slow down",
    retryAfter: "1 minute"
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  store: createStore()
});
var passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1e3,
  // ساعة واحدة
  max: 3,
  // 3 محاولات فقط
  message: {
    error: "Too many password reset attempts, please try again later",
    retryAfter: "1 hour"
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  store: createStore()
});
var logsLimiter = rateLimit({
  windowMs: 1 * 60 * 1e3,
  // دقيقة واحدة
  max: 20,
  message: {
    error: "Too many error reports, please slow down",
    retryAfter: "1 minute"
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  store: createStore()
});
var reportsLimiter = rateLimit({
  windowMs: 1 * 60 * 1e3,
  // دقيقة واحدة
  max: 20,
  message: {
    error: "Too many report requests, please slow down",
    retryAfter: "1 minute"
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  store: createStore()
});
var bulkOperationsLimiter = rateLimit({
  windowMs: 1 * 60 * 1e3,
  // دقيقة واحدة
  max: 10,
  message: {
    error: "Too many bulk operations, please slow down",
    retryAfter: "1 minute"
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  store: createStore()
});
var aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1e3,
  // 1 minute
  max: 10,
  message: {
    error: "Too many AI requests, please slow down",
    retryAfter: "1 minute"
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  store: createStore()
});

// server/middleware/aiLimits.ts
init_db();
import { sql as sql3 } from "drizzle-orm";
var DAILY_COST_LIMIT_USD = 5;
async function checkCompanyAICap(req, res, next) {
  try {
    const companyId = req.session?.companyId;
    if (!companyId) return next();
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const result = await db.execute(sql3`
      SELECT COALESCE(SUM((changes->>'estimated_cost_usd')::numeric), 0) as total_cost
      FROM audit_logs
      WHERE company_id = ${companyId}
        AND entity_type = 'ai_invoice_extract'
        AND created_at >= ${today.toISOString()}
    `);
    const totalCost = Number(result.rows?.[0]?.total_cost || 0);
    if (totalCost >= DAILY_COST_LIMIT_USD) {
      logger.warn({ companyId, totalCost }, "Daily AI cost limit exceeded");
      return res.status(429).json({
        error: "Daily AI usage limit exceeded for your company",
        code: "AI_DAILY_LIMIT_EXCEEDED"
      });
    }
    next();
  } catch (error) {
    logger.error({ err: error }, "Error checking AI limits");
    next();
  }
}

// server/utils/auditLog.ts
init_db();
init_schema();
async function logAudit(params) {
  try {
    await db.insert(audit_logs).values({
      company_id: params.companyId,
      entity_type: params.entityType,
      entity_id: params.entityId,
      action: params.action,
      changes: params.changes ? JSON.stringify(params.changes) : null,
      actor_id: params.actorId || null,
      actor_name: params.actorName || "System",
      ip_address: params.ipAddress || null,
      user_agent: params.userAgent || null,
      timestamp: /* @__PURE__ */ new Date()
    });
    console.log(`[AUDIT] ${params.action} ${params.entityType} ${params.entityId} by ${params.actorName || "System"}`);
  } catch (error) {
    console.error("[AUDIT ERROR] Failed to log audit:", error);
  }
}
async function logLogin(params) {
  await logAudit({
    companyId: params.companyId,
    entityType: "user",
    entityId: params.userId,
    action: "login",
    actorId: params.userId,
    actorName: params.userName,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent
  });
}
async function logLogout(params) {
  await logAudit({
    companyId: params.companyId,
    entityType: "user",
    entityId: params.userId,
    action: "logout",
    actorId: params.userId,
    actorName: params.userName,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent
  });
}
async function logDelete(params) {
  await logAudit({
    companyId: params.companyId,
    entityType: params.entityType,
    entityId: params.entityId,
    action: "delete",
    changes: params.deletedData,
    actorId: params.actorId,
    actorName: params.actorName,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent
  });
}
async function logUpdate(params) {
  const changes = {};
  for (const key in params.newData) {
    if (params.oldData[key] !== params.newData[key]) {
      changes[key] = {
        old: params.oldData[key],
        new: params.newData[key]
      };
    }
  }
  await logAudit({
    companyId: params.companyId,
    entityType: params.entityType,
    entityId: params.entityId,
    action: "update",
    changes,
    actorId: params.actorId,
    actorName: params.actorName,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent
  });
}
async function logCreate(params) {
  await logAudit({
    companyId: params.companyId,
    entityType: params.entityType,
    entityId: params.entityId,
    action: "create",
    changes: params.createdData,
    actorId: params.actorId,
    actorName: params.actorName,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent
  });
}

// server/middleware/redact.ts
function redactSensitive(input, seen = /* @__PURE__ */ new WeakSet()) {
  try {
    if (input === null || input === void 0) return input;
    if (typeof input !== "object") return input;
    if (seen.has(input)) return "[Circular]";
    seen.add(input);
    const SENSITIVE_KEYS = /* @__PURE__ */ new Set([
      "password",
      "password_hash",
      "token",
      "idToken",
      "access_token",
      "refresh_token",
      "authorization",
      "Authorization",
      "auth",
      "client_secret",
      "firebaseToken"
    ]);
    if (Array.isArray(input)) {
      return input.map((v) => redactSensitive(v, seen));
    }
    const out = {};
    for (const [k, v] of Object.entries(input)) {
      if (SENSITIVE_KEYS.has(k)) {
        out[k] = "[REDACTED]";
      } else if (typeof v === "object" && v !== null) {
        out[k] = redactSensitive(v, seen);
      } else {
        out[k] = v;
      }
    }
    return out;
  } catch {
    return "[UNREDACTABLE]";
  }
}

// server/utils/sanitize.ts
function normalize(obj) {
  const out = Array.isArray(obj) ? [] : {};
  for (const [k, v] of Object.entries(obj || {})) {
    if (v === null || v === "") {
      continue;
    }
    if (v instanceof Date) {
      out[k] = v;
    } else if (typeof v === "object" && !Array.isArray(v)) {
      out[k] = normalize(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}
function sanitizeUpdate(input, stripKeys = ["company_id", "created_by", "id"], numericKeys = []) {
  const u = normalize(input || {});
  for (const k of stripKeys) {
    if (k in u) delete u[k];
  }
  for (const k of numericKeys) {
    if (u[k] !== void 0 && typeof u[k] === "number") {
      u[k] = String(u[k]);
    }
  }
  return u;
}

// server/routes.ts
init_sendError();

// server/utils/inventory.ts
init_db();
init_schema();
import { eq as eq3, and as and3, sum, sql as sql4 } from "drizzle-orm";
async function recordStockMovement(movement, tx) {
  const dbConnection = tx || db;
  const quantityChange = ["purchase", "transfer_in", "adjustment", "manufacturing_in"].includes(movement.transaction_type) ? movement.quantity : -movement.quantity;
  const totalCost = movement.quantity * movement.unit_cost;
  await dbConnection.insert(stock_movements).values({
    company_id: movement.company_id,
    item_id: movement.item_id,
    warehouse_id: movement.warehouse_id,
    transaction_type: movement.transaction_type,
    transaction_date: movement.transaction_date,
    quantity: movement.quantity.toString(),
    unit_cost: movement.unit_cost.toString(),
    total_cost: totalCost.toString(),
    reference_type: movement.reference_type,
    reference_id: movement.reference_id,
    batch_id: movement.batch_id,
    notes: movement.notes,
    created_by: movement.created_by
  });
  const [currentItem] = await dbConnection.select().from(items).where(eq3(items.id, movement.item_id)).limit(1);
  if (currentItem) {
    const currentQty = parseFloat(currentItem.stock_quantity?.toString() || "0");
    const newQty = currentQty + quantityChange;
    await dbConnection.update(items).set({
      stock_quantity: newQty.toString(),
      updated_at: /* @__PURE__ */ new Date()
    }).where(eq3(items.id, movement.item_id));
  }
}
async function calculateStockValue(companyId, itemId, warehouseId) {
  const conditions = warehouseId ? and3(
    eq3(stock_movements.company_id, companyId),
    eq3(stock_movements.item_id, itemId),
    eq3(stock_movements.warehouse_id, warehouseId)
  ) : and3(
    eq3(stock_movements.company_id, companyId),
    eq3(stock_movements.item_id, itemId)
  );
  const movements = await db.select({
    quantity: stock_movements.quantity,
    total_cost: stock_movements.total_cost,
    transaction_type: stock_movements.transaction_type
  }).from(stock_movements).where(conditions).orderBy(stock_movements.transaction_date);
  let totalQuantity = 0;
  let totalValue = 0;
  for (const movement of movements) {
    const qty = parseFloat(movement.quantity.toString());
    const cost = parseFloat(movement.total_cost.toString());
    if (["purchase", "transfer_in", "adjustment"].includes(movement.transaction_type)) {
      totalQuantity += qty;
      totalValue += cost;
    } else {
      totalQuantity -= qty;
      const avgCost = totalValue / (totalQuantity + qty);
      totalValue -= qty * avgCost;
    }
  }
  const averageCost = totalQuantity > 0 ? totalValue / totalQuantity : 0;
  return {
    quantity: totalQuantity,
    value: totalValue,
    average_cost: averageCost
  };
}
async function getItemStockHistory(companyId, itemId, startDate, endDate) {
  let conditions = and3(
    eq3(stock_movements.company_id, companyId),
    eq3(stock_movements.item_id, itemId)
  );
  return await db.select().from(stock_movements).where(conditions).orderBy(sql4`${stock_movements.transaction_date} DESC`);
}
async function getStockLevels(companyId) {
  return await db.select({
    item_id: stock_movements.item_id,
    warehouse_id: stock_movements.warehouse_id,
    total_in: sum(
      sql4`CASE WHEN ${stock_movements.transaction_type} IN ('purchase', 'transfer_in', 'adjustment') 
            THEN ${stock_movements.quantity} 
            ELSE 0 END`
    ),
    total_out: sum(
      sql4`CASE WHEN ${stock_movements.transaction_type} IN ('sale', 'transfer_out') 
            THEN ${stock_movements.quantity} 
            ELSE 0 END`
    )
  }).from(stock_movements).where(eq3(stock_movements.company_id, companyId)).groupBy(stock_movements.item_id, stock_movements.warehouse_id);
}

// server/routes.ts
import { and as and39, eq as eq49, gte as gte11, lte as lte11, desc as desc25, asc as asc4, count as count2, sql as sql23 } from "drizzle-orm";

// server/routes/ai.ts
init_db();
import { Router } from "express";
import { z as z2 } from "zod";
import { fromZodError } from "zod-validation-error";
import { eq as eq6, and as and4, gte as gte3, lte as lte2, desc, sql as sql5 } from "drizzle-orm";
init_schema();

// server/middleware/authMiddleware.ts
init_firebaseAdmin();
init_sendError();
var requireFirebaseAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return unauthorized(res, "Authentication required");
    }
    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await verifyFirebaseToken(token);
    req.firebaseUser = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.displayName || null,
      picture: decodedToken.picture || null
    };
    next();
  } catch (error) {
    console.error("Firebase token verification failed:", error);
    return unauthorized(res, "Authentication required");
  }
};
var requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split("Bearer ")[1];
      const decodedToken = await verifyFirebaseToken(token);
      console.log(`\u2705 Firebase auth successful for ${decodedToken.email}`);
      req.firebaseUser = {
        uid: decodedToken.uid,
        email: decodedToken.email
      };
      const userCompanies = await storage.getCompaniesByUserId(decodedToken.uid);
      console.log(`\u{1F4E6} Found ${userCompanies.length} companies for user ${decodedToken.email}`);
      let userRecord = decodedToken.email ? await storage.getUserByEmail(decodedToken.email) : void 0;
      if (userRecord) {
        const companyId = userRecord.company_id;
        if (!req.session) req.session = {};
        req.session.userId = userRecord.id;
        req.session.companyId = companyId;
        req.session.userRole = userRecord.role || "owner";
        console.log(`\u{1F3E2} Set company context from user record: ${companyId}, userId: ${userRecord.id}, role: ${userRecord.role}`);
        return next();
      }
      if (userCompanies.length > 0) {
        const companyId = userCompanies[0].id;
        try {
          const base = decodedToken.email?.split("@")[0] || "user";
          const fullName = decodedToken.name || decodedToken.displayName || base;
          let username = base;
          try {
            const existing = await storage.getUserByUsername?.(username);
            if (existing) username = `${base}${Math.floor(Math.random() * 1e4)}`;
          } catch {
          }
          userRecord = await storage.createUser({
            company_id: companyId,
            username,
            email: decodedToken.email || `${decodedToken.uid}@autogen.local`,
            full_name: fullName,
            password: decodedToken.uid,
            role: "owner",
            language: "en",
            timezone: "UTC",
            theme: "auto",
            is_active: true
          });
          console.log(`\u{1F464} Auto-provisioned user ${userRecord.id} (${fullName}) for ${decodedToken.email}`);
          if (!req.session) req.session = {};
          req.session.userId = userRecord.id;
          req.session.companyId = companyId;
          req.session.userRole = userRecord.role || "owner";
          console.log(`\u{1F3E2} Set company context for new user: ${companyId}, userId: ${userRecord.id}`);
          return next();
        } catch (provisionErr) {
          console.error("\u274C Auto-provision user failed:", provisionErr);
          return unauthorized(res, "User not found");
        }
      } else {
        console.warn(`\u26A0\uFE0F No companies found for user ${decodedToken.email}`);
        return forbidden(res, "User authenticated but no company found. Please complete onboarding.", { needsOnboarding: true });
      }
    } catch (error) {
      console.error("\u274C Firebase token verification failed:", error);
      return unauthorized(res, "Invalid authentication token");
    }
  }
  console.log("DEBUG: requireAuth session check:", {
    hasSession: !!req.session,
    userId: req.session?.userId,
    companyId: req.session?.companyId
  });
  if (req.session?.userId && req.session?.companyId) {
    return next();
  }
  console.warn(`\u26A0\uFE0F Authentication failed for ${req.method} ${req.path}:`, {
    hasAuthHeader: !!authHeader,
    hasSession: !!req.session,
    hasUserId: !!req.session?.userId,
    hasCompanyId: !!req.session?.companyId
  });
  return unauthorized(res, "Authentication required");
};
var requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      const userId = req.session?.userId;
      if (!userId) return unauthorized(res, "Authentication required");
      const user = await storage.getUserById(userId);
      if (!user) return unauthorized(res, "User not found");
      if (!roles.includes(user.role)) {
        return forbidden(res, "Insufficient permissions");
      }
      next();
    } catch (e) {
      console.error("RBAC error:", e);
      return serverError(res, "Authorization error");
    }
  };
};

// server/routes/ai.ts
init_sendError();

// server/utils/checkExtraction.ts
init_db();
init_schema();
init_aiProviders();
import { eq as eq4 } from "drizzle-orm";
async function extractCheckFromImage(companyId, imageBase64) {
  try {
    const providers = await db.select().from(ai_providers).where(eq4(ai_providers.company_id, companyId));
    const activeProvider = providers[0];
    if (!activeProvider || !activeProvider.api_key) {
      throw new Error("No AI provider configured");
    }
    const prompt = `
      Analyze this image of a bank check. Extract the following details into a strict JSON format:
      - check_number: The check number (usually at top right or bottom MICR).
      - bank_name: Name of the bank.
      - amount: The numerical amount.
      - currency: The currency code (e.g., USD, SAR, EUR). Infer from symbol if needed.
      - date: The date on the check (YYYY-MM-DD format).
      - payee: The name of the person or entity being paid (Pay to the order of).
      - memo: Any notes or memo written on the check.
      
      If a field is illegible or missing, return null for that field.
      Handle handwritten text carefully.
    `;
    const messages = [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageBase64 } }
        ]
      }
    ];
    const response = await callAIProvider({
      provider: (activeProvider.provider || "openai").toLowerCase(),
      model: activeProvider.vision_model || activeProvider.default_model || "gpt-4o",
      apiKey: activeProvider.api_key,
      baseUrl: activeProvider.base_url || void 0
    }, messages);
    if (response.content) {
      try {
        const json = JSON.parse(response.content.replace(/```json|```/g, "").trim());
        return json;
      } catch (e) {
        console.warn("Failed to parse AI check extraction", e);
        throw new Error("Failed to parse AI response");
      }
    }
  } catch (e) {
    console.error("AI check extraction failed", e);
    throw e;
  }
  return null;
}

// server/utils/documentExtraction.ts
init_db();
init_schema();
init_aiProviders();
import { eq as eq5 } from "drizzle-orm";
async function extractDocumentData(companyId, imageBase64, type) {
  try {
    const providers = await db.select().from(ai_providers).where(eq5(ai_providers.company_id, companyId));
    const activeProvider = providers[0];
    if (!activeProvider || !activeProvider.api_key) {
      throw new Error("No AI provider configured");
    }
    let prompt = "";
    switch (type) {
      case "invoice":
      case "bill":
      case "receipt":
        prompt = `
          Analyze this ${type} image. Extract the following details into a strict JSON format:
          - invoice_number: The invoice/bill number.
          - date: The date (YYYY-MM-DD).
          - due_date: The due date (YYYY-MM-DD).
          - contact_name: The name of the vendor/customer.
          - subtotal: The subtotal amount.
          - tax_total: The total tax amount.
          - total: The final total amount.
          - currency: The currency code (e.g., USD, SAR).
          - items: An array of objects with { description, quantity, unit_price, total }.
          
          If a field is missing, return null. Handle handwritten text carefully.
        `;
        break;
      case "contact":
        prompt = `
          Analyze this business card or contact document. Extract details into JSON:
          - name: Full name or Company name.
          - email: Email address.
          - phone: Phone number.
          - address: Physical address.
          - tax_number: Tax ID or VAT number.
          - website: Website URL.
        `;
        break;
      case "item":
        prompt = `
          Analyze this product image or spec sheet. Extract details into JSON:
          - name: Product name.
          - sku: SKU or barcode number.
          - description: Short description.
          - price: Retail price (if visible).
          - cost: Cost price (if visible).
          - category: Suggested category.
        `;
        break;
      case "check":
        prompt = `
          Analyze this bank check. Extract into JSON:
          - check_number
          - bank_name
          - amount
          - currency
          - date
          - payee
          - memo
        `;
        break;
      default:
        throw new Error(`Unsupported document type: ${type}`);
    }
    const messages = [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageBase64 } }
        ]
      }
    ];
    const response = await callAIProvider({
      provider: (activeProvider.provider || "openai").toLowerCase(),
      model: activeProvider.vision_model || activeProvider.default_model || "gpt-4o",
      apiKey: activeProvider.api_key,
      baseUrl: activeProvider.base_url || void 0
    }, messages);
    if (response.content) {
      try {
        const json = JSON.parse(response.content.replace(/```json|```/g, "").trim());
        return json;
      } catch (e) {
        console.warn("Failed to parse AI extraction", e);
        throw new Error("Failed to parse AI response");
      }
    }
  } catch (e) {
    console.error("AI document extraction failed", e);
    throw e;
  }
  return null;
}

// server/routes/ai.ts
var router = Router();
router.get("/metrics/pipeline-summary", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { from, to, source, provider, mode } = req.query;
    let fromDate = null;
    let toDate = null;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (from && dateRegex.test(from)) {
      fromDate = /* @__PURE__ */ new Date(from + "T00:00:00Z");
      if (isNaN(fromDate.getTime())) fromDate = null;
    }
    if (to && dateRegex.test(to)) {
      toDate = /* @__PURE__ */ new Date(to + "T23:59:59Z");
      if (isNaN(toDate.getTime())) toDate = null;
    }
    const rows = await db.execute(sql5`SELECT 
        (changes->>'mode') AS mode,
        COUNT(*)::int AS count,
        COALESCE(SUM( (changes->>'estimated_cost_usd')::numeric ), 0)::float AS total_cost_usd,
        COALESCE(SUM( (changes->>'estimated_tokens_in')::numeric ), 0)::float AS total_tokens_in
      FROM audit_logs
      WHERE company_id = ${companyId}
        AND entity_type = 'ai_invoice_extract'
        ${fromDate ? sql5`AND created_at >= ${fromDate.toISOString()}` : sql5``}
        ${toDate ? sql5`AND created_at <= ${toDate.toISOString()}` : sql5``}
        ${source ? sql5`AND (changes->>'source') = ${source}` : sql5``}
        ${provider ? sql5`AND (changes->>'provider') = ${provider}` : sql5``}
        ${mode ? sql5`AND (changes->>'mode') = ${mode}` : sql5``}
      GROUP BY (changes->>'mode')`);
    const data = rows.rows || rows || [];
    return res.json({ ok: true, modes: data });
  } catch (error) {
    console.error("Pipeline summary metrics error:", error);
    return serverError(res, "Failed to load pipeline summary");
  }
});
router.post("/providers/pipeline-simulate", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { mime_type, size_bytes, pages_count, image_provided, wants_vision, locale } = req.body || {};
    const { selectPipeline: selectPipeline2, normalizeProviders: normalizeProviders2 } = await Promise.resolve().then(() => (init_providerStrategy(), providerStrategy_exports));
    const rows = await db.select().from(ai_providers).where(eq6(ai_providers.company_id, companyId));
    const candidates = normalizeProviders2(rows);
    const plan = selectPipeline2({
      mimeType: mime_type,
      sizeBytes: typeof size_bytes === "number" ? size_bytes : void 0,
      pagesCount: typeof pages_count === "number" ? pages_count : void 0,
      imageProvided: !!image_provided,
      wantsVision: !!wants_vision,
      locale: locale || req.headers["accept-language"] || "en",
      candidates
    });
    return res.json({ ok: true, plan });
  } catch (error) {
    console.error("Pipeline simulate failed:", error);
    return serverError(res, "Failed to simulate provider pipeline");
  }
});
router.post("/redact-preview", requireAuth, async (req, res) => {
  try {
    const { text: text2 } = req.body;
    if (!text2) return badRequest(res, "Text is required");
    const { redactForAI: redactForAI2 } = await Promise.resolve().then(() => (init_redaction(), redaction_exports));
    const result = redactForAI2(text2);
    const stats = {
      emails: result.entries.filter((e) => e.type === "email").length,
      phones: result.entries.filter((e) => e.type === "phone").length,
      creditCards: result.entries.filter((e) => e.type === "card").length,
      ibans: result.entries.filter((e) => e.type === "iban").length,
      taxIds: result.entries.filter((e) => e.type === "tax_id").length
    };
    res.json({
      original: text2,
      redacted: result.text,
      stats
    });
  } catch (error) {
    console.error("Redaction preview failed:", error);
    return serverError(res, "Failed to redact text");
  }
});
router.post("/classify-transaction", requireAuth, async (req, res) => {
  try {
    const schema = z2.object({
      description: z2.string().min(1),
      amount: z2.number().optional(),
      merchant: z2.string().optional(),
      notes: z2.string().optional(),
      currency: z2.string().optional()
    });
    const payload = schema.parse(req.body || {});
    const ai = await Promise.resolve().then(() => (init_ai(), ai_exports));
    const result = ai.classifyTransaction(payload);
    return res.json(result);
  } catch (error) {
    if (error?.name === "ZodError") {
      const validationError = fromZodError(error);
      return badRequest(res, validationError.message);
    }
    console.error("AI classify error:", error?.message || error);
    return serverError(res, "Failed to classify transaction");
  }
});
router.post("/classify-transaction/batch", requireAuth, bulkOperationsLimiter, async (req, res) => {
  try {
    const schema = z2.object({
      items: z2.array(z2.object({
        description: z2.string().min(1),
        amount: z2.number().optional(),
        merchant: z2.string().optional(),
        notes: z2.string().optional(),
        currency: z2.string().optional()
      })).min(1)
    });
    const { items: items3 } = schema.parse(req.body || {});
    const ai = await Promise.resolve().then(() => (init_ai(), ai_exports));
    const results = items3.map((it) => ai.classifyTransaction(it));
    return res.json({ items: results });
  } catch (error) {
    if (error?.name === "ZodError") {
      const validationError = fromZodError(error);
      return badRequest(res, validationError.message);
    }
    console.error("AI batch classify error:", error?.message || error);
    return serverError(res, "Failed to classify transactions");
  }
});
router.post("/feedback", requireAuth, async (req, res) => {
  try {
    const schema = z2.object({
      transactionId: z2.string().optional(),
      source: z2.string().default("bank-statement"),
      accepted: z2.boolean(),
      category: z2.string(),
      confidence: z2.number().min(0).max(1).optional(),
      suggestedAccounts: z2.object({ debit: z2.array(z2.string()), credit: z2.array(z2.string()) }).partial().optional(),
      notes: z2.string().optional(),
      description: z2.string().optional(),
      amount: z2.number().optional()
    });
    const payload = schema.parse(req.body || {});
    const userId = req.session?.userId || req.firebaseUser?.uid || "anonymous";
    const companyId = req.session?.companyId || req.session?.company?.id || void 0;
    try {
      const row = await storage.createAIFeedback({
        company_id: companyId,
        user_id: userId,
        source: payload.source,
        transaction_id: payload.transactionId,
        accepted: payload.accepted,
        category: payload.category,
        confidence: payload.confidence !== void 0 ? String(payload.confidence) : void 0,
        suggested_accounts: payload.suggestedAccounts,
        notes: payload.notes,
        description: payload.description,
        amount: payload.amount !== void 0 ? String(payload.amount) : void 0
      });
      return res.json({ success: true, id: row.id });
    } catch (e) {
      const entry = {
        ts: (/* @__PURE__ */ new Date()).toISOString(),
        userId,
        companyId,
        ...payload
      };
      console.log("[AI_FEEDBACK:FALLBACK_LOG]", JSON.stringify(entry));
      return res.json({ success: true, persisted: false });
    }
  } catch (error) {
    if (error?.name === "ZodError") {
      const validationError = fromZodError(error);
      return badRequest(res, validationError.message);
    }
    console.error("AI feedback error:", error?.message || error);
    return serverError(res, "Failed to record feedback");
  }
});
router.get("/feedback/recent", requireAuth, async (req, res) => {
  try {
    const companyId = req.session?.companyId || req.session?.company?.id;
    if (!companyId) return res.json([]);
    const fromParam = req.query.from;
    const toParam = req.query.to;
    const sourceParam = req.query.source;
    const limitParam = req.query.limit;
    const fromDate = fromParam && !isNaN(Date.parse(fromParam)) ? new Date(fromParam) : void 0;
    const toDate = toParam && !isNaN(Date.parse(toParam)) ? new Date(toParam) : void 0;
    const limit = limitParam ? Math.max(1, Math.min(500, parseInt(limitParam, 10) || 50)) : 50;
    const conditions = [eq6(ai_feedback.company_id, companyId)];
    if (fromDate) conditions.push(gte3(ai_feedback.created_at, fromDate));
    if (toDate) conditions.push(lte2(ai_feedback.created_at, toDate));
    if (sourceParam && sourceParam.trim()) conditions.push(eq6(ai_feedback.source, sourceParam.trim()));
    const rows = await db.select().from(ai_feedback).where(conditions.length > 1 ? and4(...conditions) : conditions[0]).orderBy(desc(ai_feedback.created_at)).limit(limit);
    return res.json(rows);
  } catch (error) {
    const msg = String(error?.message || "");
    if (msg.includes('relation "ai_feedback" does not exist') || error?.code === "42P01") {
      return res.json([]);
    }
    console.error("AI feedback recent error:", error?.message || error);
    return serverError(res, "Failed to fetch AI feedback");
  }
});
router.get("/feedback/summary", requireAuth, async (req, res) => {
  try {
    const companyId = req.session?.companyId || req.session?.company?.id;
    if (!companyId) return res.json({ total: 0, categories: [] });
    const fromParam = req.query.from;
    const toParam = req.query.to;
    const sourceParam = req.query.source;
    const fromDate = fromParam && !isNaN(Date.parse(fromParam)) ? new Date(fromParam) : void 0;
    const toDate = toParam && !isNaN(Date.parse(toParam)) ? new Date(toParam) : void 0;
    const conditions = [eq6(ai_feedback.company_id, companyId)];
    if (fromDate) conditions.push(gte3(ai_feedback.created_at, fromDate));
    if (toDate) conditions.push(lte2(ai_feedback.created_at, toDate));
    if (sourceParam && sourceParam.trim()) conditions.push(eq6(ai_feedback.source, sourceParam.trim()));
    const rows = await db.select().from(ai_feedback).where(conditions.length > 1 ? and4(...conditions) : conditions[0]);
    const byCategory = {};
    for (const r of rows) {
      const cat = r.category || "uncategorized";
      if (!byCategory[cat]) byCategory[cat] = { total: 0, accepted: 0 };
      byCategory[cat].total += 1;
      if (r.accepted) byCategory[cat].accepted += 1;
    }
    const categories = Object.entries(byCategory).map(([category, s]) => ({ category, total: s.total, accepted: s.accepted, acceptanceRate: s.total ? s.accepted / s.total : 0 })).sort((a, b) => b.total - a.total);
    return res.json({ total: rows.length, categories });
  } catch (error) {
    const msg = String(error?.message || "");
    if (msg.includes('relation "ai_feedback" does not exist') || error?.code === "42P01") {
      return res.json({ total: 0, categories: [] });
    }
    console.error("AI feedback summary error:", error?.message || error);
    return serverError(res, "Failed to summarize AI feedback");
  }
});
router.get("/feedback/trend", requireAuth, async (req, res) => {
  try {
    const companyId = req.session?.companyId || req.session?.company?.id;
    if (!companyId) return res.json([]);
    const fromParam = req.query.from;
    const toParam = req.query.to;
    const sourceParam = req.query.source;
    const fromDate = fromParam && !isNaN(Date.parse(fromParam)) ? new Date(fromParam) : void 0;
    const toDate = toParam && !isNaN(Date.parse(toParam)) ? new Date(toParam) : void 0;
    const conditions = ["company_id = $1"];
    const values = [companyId];
    let idx = 2;
    if (fromDate) {
      conditions.push(`created_at >= $${idx++}`);
      values.push(fromDate);
    }
    if (toDate) {
      conditions.push(`created_at <= $${idx++}`);
      values.push(toDate);
    }
    if (sourceParam && sourceParam.trim()) {
      conditions.push(`source = $${idx++}`);
      values.push(sourceParam.trim());
    }
    const sql24 = `
      SELECT 
        to_char(created_at::date, 'YYYY-MM-DD') as day,
        COUNT(*)::int as total,
        SUM(CASE WHEN accepted THEN 1 ELSE 0 END)::int as accepted
      FROM ai_feedback
      WHERE ${conditions.join(" AND ")}
      GROUP BY created_at::date
      ORDER BY day ASC
    `;
    const rows = await pool.query(sql24, values).then((r) => r.rows);
    return res.json(rows);
  } catch (error) {
    const msg = String(error?.message || "");
    if (msg.includes('relation "ai_feedback" does not exist') || error?.code === "42P01") {
      return res.json([]);
    }
    console.error("AI feedback trend error:", error?.message || error);
    return serverError(res, "Failed to fetch AI feedback trend");
  }
});
router.get("/metrics/pipeline-trend", requireAuth, async (req, res) => {
  try {
    const companyId = req.session?.companyId || req.session?.company?.id;
    if (!companyId) return res.json([]);
    const fromParam = req.query.from;
    const toParam = req.query.to;
    const sourceParam = req.query.source;
    const providerParam = req.query.provider;
    const modeParam = req.query.mode;
    const fromDate = fromParam && !isNaN(Date.parse(fromParam)) ? new Date(fromParam) : void 0;
    const toDate = toParam && !isNaN(Date.parse(toParam)) ? new Date(toParam) : void 0;
    const conditions = ["company_id = $1", "entity_type = 'ai_invoice_extract'"];
    const values = [companyId];
    let idx = 2;
    if (fromDate) {
      conditions.push(`timestamp >= $${idx++}`);
      values.push(fromDate);
    }
    if (toDate) {
      conditions.push(`timestamp <= $${idx++}`);
      values.push(toDate);
    }
    if (sourceParam && sourceParam.trim()) {
      conditions.push(`(changes->>'source') = $${idx++}`);
      values.push(sourceParam.trim());
    }
    if (providerParam && providerParam.trim()) {
      conditions.push(`(changes->>'provider') = $${idx++}`);
      values.push(providerParam.trim());
    }
    if (modeParam && modeParam.trim()) {
      conditions.push(`(changes->>'mode') = $${idx++}`);
      values.push(modeParam.trim());
    }
    const sql24 = `
      SELECT 
        to_char(timestamp::date, 'YYYY-MM-DD') as day,
        COUNT(*)::int as extractions,
        COALESCE(SUM( (changes->>'estimated_cost_usd')::numeric ), 0)::float AS total_cost_usd,
        COALESCE(SUM( (changes->>'estimated_tokens_in')::numeric ), 0)::float AS total_tokens_in,
        CASE WHEN COUNT(*) > 0 THEN COALESCE(SUM( (changes->>'estimated_cost_usd')::numeric ),0)::float / COUNT(*) ELSE 0 END AS avg_cost_usd
      FROM audit_logs
      WHERE ${conditions.join(" AND ")}
      GROUP BY timestamp::date
      ORDER BY day ASC
    `;
    const rows = await pool.query(sql24, values).then((r) => r.rows);
    return res.json(rows);
  } catch (error) {
    console.error("AI pipeline trend error:", error?.message || error);
    return serverError(res, "Failed to fetch AI pipeline trend");
  }
});
router.get("/metrics/facets", requireAuth, async (req, res) => {
  try {
    const companyId = req.session?.companyId || req.session?.company?.id;
    if (!companyId) return res.json({ providers: [], modes: [] });
    const fromParam = req.query.from;
    const toParam = req.query.to;
    const sourceParam = req.query.source;
    const fromDate = fromParam && !isNaN(Date.parse(fromParam)) ? new Date(fromParam) : void 0;
    const toDate = toParam && !isNaN(Date.parse(toParam)) ? new Date(toParam) : void 0;
    const conditions = ["company_id = $1", "entity_type = 'ai_invoice_extract'"];
    const values = [companyId];
    let idx = 2;
    if (fromDate) {
      conditions.push(`timestamp >= $${idx++}`);
      values.push(fromDate);
    }
    if (toDate) {
      conditions.push(`timestamp <= $${idx++}`);
      values.push(toDate);
    }
    if (sourceParam && sourceParam.trim()) {
      conditions.push(`(changes->>'source') = $${idx++}`);
      values.push(sourceParam.trim());
    }
    const whereClause = conditions.join(" AND ");
    const providersSql = `SELECT DISTINCT (changes->>'provider') AS provider FROM audit_logs WHERE ${whereClause} AND (changes->>'provider') IS NOT NULL`;
    const modesSql = `SELECT DISTINCT (changes->>'mode') AS mode FROM audit_logs WHERE ${whereClause} AND (changes->>'mode') IS NOT NULL`;
    const [pRes, mRes] = await Promise.all([
      pool.query(providersSql, values),
      pool.query(modesSql, values)
    ]);
    return res.json({
      providers: pRes.rows.map((r) => r.provider).sort(),
      modes: mRes.rows.map((r) => r.mode).sort()
    });
  } catch (error) {
    console.error("AI metrics facets error:", error?.message || error);
    return serverError(res, "Failed to fetch AI metrics facets");
  }
});
router.get("/providers", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const rows = await db.select().from(ai_providers).where(eq6(ai_providers.company_id, companyId));
    const sanitized = rows.map((r) => ({
      ...r,
      api_key: r.api_key ? `${String(r.api_key).slice(0, 3)}********${String(r.api_key).slice(-2)}` : null
    }));
    res.json(sanitized);
  } catch (error) {
    console.error("Error listing AI providers:", error);
    return serverError(res, "Failed to list AI providers");
  }
});
router.post("/providers", requireAuth, requireRole(["owner", "admin"]), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const payload = { ...req.body || {}, company_id: companyId };
    const id = payload.id;
    const data = id ? insertAIProviderSchema.partial().parse(payload) : insertAIProviderSchema.parse(payload);
    let row;
    if (id) {
      const [updated] = await db.update(ai_providers).set({ ...data, updated_at: /* @__PURE__ */ new Date() }).where(and4(eq6(ai_providers.id, id), eq6(ai_providers.company_id, companyId))).returning();
      if (!updated) return notFound(res, "AI provider not found");
      row = updated;
    } else {
      const [created] = await db.insert(ai_providers).values(data).returning();
      row = created;
    }
    const sanitized = {
      ...row,
      api_key: row.api_key ? `${String(row.api_key).slice(0, 3)}********${String(row.api_key).slice(-2)}` : null
    };
    res.json(sanitized);
  } catch (error) {
    console.error("Error saving AI provider:", error);
    return serverError(res, "Failed to save AI provider");
  }
});
router.delete("/providers/:id", requireAuth, requireRole(["owner", "admin"]), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const id = req.params.id;
    const [deleted] = await db.delete(ai_providers).where(and4(eq6(ai_providers.id, id), eq6(ai_providers.company_id, companyId))).returning();
    if (!deleted) return notFound(res, "AI provider not found");
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting AI provider:", error);
    return serverError(res, "Failed to delete AI provider");
  }
});
var modelCatalogCache = {};
router.get("/models", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const providerId = req.query.providerId || void 0;
    const wantedProvider = (req.query.provider || "").toLowerCase();
    const forceLive = String(req.query.live || "").toLowerCase() === "true";
    let provider;
    if (providerId) {
      const [row] = await db.select().from(ai_providers).where(and4(eq6(ai_providers.id, providerId), eq6(ai_providers.company_id, companyId)));
      provider = row;
    }
    const p = (provider?.provider || wantedProvider || "").toLowerCase();
    if (p === "openai") {
      if (!provider) {
        const rows = await db.select().from(ai_providers).where(eq6(ai_providers.company_id, companyId));
        provider = rows.find((r) => (r.provider || "").toLowerCase() === "openai") || rows[0];
      }
      if (provider?.api_key) {
        const cacheKey = `${companyId}:openai:${provider.base_url || "https://api.openai.com"}`;
        const cached = modelCatalogCache[cacheKey];
        const now = Date.now();
        if (!forceLive && cached && now - cached.ts < 10 * 60 * 1e3) {
          return res.json(cached.models);
        }
        try {
          const baseUrl = (provider.base_url || "https://api.openai.com").replace(/\/$/, "");
          const resp = await fetch(`${baseUrl}/v1/models`, {
            headers: { "Authorization": `Bearer ${provider.api_key}` }
          });
          if (resp.ok) {
            const payload = await resp.json();
            const data = Array.isArray(payload?.data) ? payload.data : [];
            const models = data.map((m) => ({ id: m?.id })).filter((m) => typeof m.id === "string" && m.id.length > 0);
            if (models.length) {
              modelCatalogCache[cacheKey] = { ts: now, models };
              return res.json(models);
            }
          }
        } catch (e) {
          console.warn("Live OpenAI model list failed, using curated fallback:", e);
        }
      }
    }
    const catalogs = {
      "openai": ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini", "gpt-4.1", "o3-mini", "text-embedding-3-small", "text-embedding-3-large"],
      "openrouter": ["openai/gpt-4o", "anthropic/claude-3.5-sonnet", "google/gemini-1.5-pro", "google/gemini-1.5-flash"],
      "google": ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-2.0-flash-exp"],
      "anthropic": ["claude-3.5-sonnet", "claude-3.5-haiku", "claude-3-opus"],
      "groq": ["llama-3.1-70b-versatile", "mixtral-8x7b-32768"],
      "mistral": ["mistral-large-latest", "mistral-medium-latest", "ministral-8b-latest"],
      "azure": ["gpt-4o", "gpt-35-turbo"]
    };
    const list = catalogs[p] || catalogs["openai"];
    return res.json(list.map((id) => ({ id })));
  } catch (error) {
    console.error("Error listing AI models:", error);
    return serverError(res, "Failed to list AI models");
  }
});
router.get("/providers/health", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const providerId = req.query.providerId || void 0;
    const wantedProvider = (req.query.provider || "").toLowerCase();
    let row;
    if (providerId) {
      const [r] = await db.select().from(ai_providers).where(and4(eq6(ai_providers.id, providerId), eq6(ai_providers.company_id, companyId)));
      row = r;
    } else {
      const rows = await db.select().from(ai_providers).where(eq6(ai_providers.company_id, companyId));
      row = rows.find((r) => (r.provider || "").toLowerCase() === wantedProvider) || rows.find((r) => (r.provider || "").toLowerCase() === "openai") || rows[0];
    }
    if (!row) {
      return res.json({ ok: false, reason: "No AI provider configured for this company" });
    }
    const p = (row.provider || "").toLowerCase();
    if (!row.api_key) {
      return res.json({ ok: false, provider: p, reason: "Missing API key" });
    }
    if (p === "openai") {
      try {
        const baseUrl = (row.base_url || "https://api.openai.com").replace(/\/$/, "");
        const r = await fetch(`${baseUrl}/v1/models`, {
          headers: { "Authorization": `Bearer ${row.api_key}` },
          method: "GET"
        });
        if (!r.ok) {
          const body = await r.text();
          return res.json({ ok: false, provider: p, upstream_status: r.status, reason: "Upstream returned error", detail: body.slice(0, 500) });
        }
        return res.json({ ok: true, provider: p, reachable: true });
      } catch (e) {
        return res.json({ ok: false, provider: p, reason: "Network or DNS failure", detail: e?.message || String(e) });
      }
    }
    return res.json({ ok: true, provider: p, reachable: false, note: "Health check not implemented for this provider" });
  } catch (error) {
    console.error("AI provider health check failed:", error);
    return serverError(res, "Failed to perform provider health check");
  }
});
router.post("/extract/check", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { image } = req.body;
    if (!image) {
      return badRequest(res, "Image data is required");
    }
    const result = await extractCheckFromImage(companyId, image);
    await db.insert(audit_logs).values({
      company_id: companyId,
      actor_id: req.user.id,
      action: "ai_extract_check",
      entity_type: "check",
      entity_id: "temp",
      changes: {
        provider: "ai",
        success: !!result
      }
    });
    res.json({ ok: true, data: result });
  } catch (error) {
    logError("AI Check Extraction Error", error);
    serverError(res, "Failed to extract check data");
  }
});
router.post("/extract/document", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { image, type } = req.body;
    if (!image || !type) {
      return badRequest(res, "Image data and document type are required");
    }
    const result = await extractDocumentData(companyId, image, type);
    await db.insert(audit_logs).values({
      company_id: companyId,
      actor_id: req.user.id,
      action: `ai_extract_${type}`,
      entity_type: type,
      entity_id: "temp",
      changes: {
        provider: "ai",
        success: !!result
      }
    });
    res.json({ ok: true, data: result });
  } catch (error) {
    logError(`AI ${req.body.type} Extraction Error`, error);
    serverError(res, "Failed to extract document data");
  }
});
var ai_default2 = router;

// server/routes/auth.ts
import { Router as Router2 } from "express";
import { fromZodError as fromZodError2 } from "zod-validation-error";
import bcrypt2 from "bcryptjs";
import speakeasy from "speakeasy";
init_schema();
init_permissions();
init_firebaseAdmin();
init_sendError();
var router2 = Router2();
function sanitizeUser(user) {
  const { password_hash, ...sanitized } = user;
  return sanitized;
}
var requireFirebaseAuth3 = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return unauthorized(res, "Authentication required");
    }
    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await verifyFirebaseToken(token);
    req.firebaseUser = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.displayName || null,
      picture: decodedToken.picture || null
    };
    next();
  } catch (error) {
    console.error("Firebase token verification failed:", error);
    return unauthorized(res, "Invalid authentication token");
  }
};
router2.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password, code } = loginSchema.parse(req.body);
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return unauthorized(res, "Invalid credentials");
    }
    const isValidPassword = await bcrypt2.compare(password, user.password_hash);
    if (!isValidPassword) {
      return unauthorized(res, "Invalid credentials");
    }
    if (!user.is_active) {
      return forbidden(res, "Account is inactive");
    }
    if (user.two_factor_enabled) {
      if (!code) {
        return res.status(403).json({ error: "2FA required", require2fa: true });
      }
      const verified = speakeasy.totp.verify({
        secret: user.two_factor_secret,
        encoding: "base32",
        token: code
      });
      if (!verified) {
        return unauthorized(res, "Invalid 2FA code");
      }
    }
    req.session.userId = user.id;
    req.session.companyId = user.company_id;
    req.session.userRole = user.role;
    req.session.userName = user.full_name;
    await logLogin({
      userId: user.id,
      companyId: user.company_id,
      userName: user.full_name,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return serverError(res, "Session error");
      }
      res.json(sanitizeUser(user));
    });
  } catch (error) {
    if (error.name === "ZodError") {
      const validationError = fromZodError2(error);
      return badRequest(res, validationError.message);
    } else {
      console.error("Error during login:", error);
      return serverError(res, "Failed to login");
    }
  }
});
router2.post("/sso-login", requireFirebaseAuth3, async (req, res) => {
  try {
    const firebaseUser = req.firebaseUser;
    let user = await storage.getUserByEmail(firebaseUser.email);
    if (!user) {
      const companies3 = await storage.getCompaniesByUserId(firebaseUser.uid);
      if (companies3.length > 0) {
        const company = companies3[0];
        const randomPassword = Math.random().toString(36).slice(-10);
        user = await storage.createUser({
          company_id: company.id,
          username: firebaseUser.email.split("@")[0],
          email: firebaseUser.email,
          password: randomPassword,
          full_name: firebaseUser.name || firebaseUser.email.split("@")[0],
          role: "owner",
          language: "en",
          timezone: "UTC",
          theme: "auto",
          is_active: true
        });
      } else {
        return res.status(404).json({
          message: "User not found",
          requiresRegistration: true,
          email: firebaseUser.email,
          name: firebaseUser.name
        });
      }
    }
    if (!user.is_active) {
      return forbidden(res, "Account is inactive");
    }
    req.session.userId = user.id;
    req.session.companyId = user.company_id;
    req.session.userRole = user.role;
    req.session.userName = user.full_name;
    await logLogin({
      userId: user.id,
      companyId: user.company_id,
      userName: user.full_name,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return serverError(res, "Session error");
      }
      res.json(sanitizeUser(user));
    });
  } catch (error) {
    console.error("Error during SSO login:", error);
    return serverError(res, "Failed to login with SSO");
  }
});
router2.post("/logout", async (req, res) => {
  if (req.session.userId) {
    await logLogout({
      userId: req.session.userId,
      companyId: req.session.companyId,
      userName: req.session.userName || "Unknown",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
  }
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error:", err);
      return serverError(res, "Logout failed");
    }
    res.json({ message: "Logged out successfully" });
  });
});
router2.post("/register", registerLimiter, async (req, res) => {
  try {
    const validatedData = registrationSchema.parse(req.body);
    const existingUserByEmail = await storage.getUserByEmail(validatedData.email);
    if (existingUserByEmail) {
      return badRequest(res, "Email already registered");
    }
    const existingUserByUsername = await storage.getUserByUsername(validatedData.username);
    if (existingUserByUsername) {
      return badRequest(res, "Username already taken");
    }
    const company = await storage.createCompany({
      name: validatedData.companyName,
      base_currency: validatedData.baseCurrency,
      fiscal_year_start: validatedData.fiscalYearStart,
      date_format: "dd/MM/yyyy",
      number_format: "1,234.56"
    });
    const user = await storage.createUser({
      company_id: company.id,
      username: validatedData.username,
      email: validatedData.email,
      password: validatedData.password,
      full_name: validatedData.fullName,
      role: "owner",
      // First user is owner
      language: "en",
      timezone: "UTC",
      theme: "auto",
      is_active: true
    });
    req.session.userId = user.id;
    req.session.companyId = company.id;
    req.session.userRole = user.role;
    req.session.userName = user.full_name;
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return serverError(res, "Session error");
      }
      res.status(201).json({
        user: sanitizeUser(user),
        company
      });
    });
  } catch (error) {
    if (error.name === "ZodError") {
      const validationError = fromZodError2(error);
      return badRequest(res, validationError.message);
    } else {
      console.error("Error during registration:", error);
      return serverError(res, "Failed to register");
    }
  }
});
router2.post("/switch-company", requireAuth2, async (req, res) => {
  try {
    const { companyId } = req.body;
    const userId = req.session?.userId;
    console.log("Switch company request:", { companyId, userId, sessionExists: !!req.session });
    if (!companyId) {
      return badRequest(res, "Company ID required");
    }
    if (!userId) {
      console.error("Switch company: No userId in session");
      return badRequest(res, "User session invalid");
    }
    const company = await storage.getCompanyById(companyId);
    if (!company) {
      return notFound(res, "Company not found");
    }
    req.session.companyId = companyId;
    try {
      await storage.updateUser(userId, { company_id: companyId });
    } catch (updateError) {
      console.error("Failed to update user company_id:", updateError);
    }
    const updatedUser = await storage.getUserById(userId);
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return serverError(res, "Session error");
      }
      res.json({
        message: "Company switched successfully",
        company,
        user: updatedUser ? {
          id: updatedUser.id,
          email: updatedUser.email,
          username: updatedUser.username,
          full_name: updatedUser.full_name,
          role: updatedUser.role,
          company_id: companyId,
          legal_consent_accepted: updatedUser.legal_consent_accepted,
          legal_consent_date: updatedUser.legal_consent_date,
          legal_consent_version: updatedUser.legal_consent_version
        } : null
      });
    });
  } catch (error) {
    console.error("Switch company error:", error?.message || error);
    return serverError(res, "Failed to switch company");
  }
});
var auth_default = router2;

// server/routes/users.ts
import { Router as Router3 } from "express";
init_db();
init_firebaseAdmin();
init_schema();
import { fromZodError as fromZodError3 } from "zod-validation-error";
import bcrypt3 from "bcryptjs";
init_sendError();
init_permissions();
import { eq as eq8 } from "drizzle-orm";
var router3 = Router3();
function sanitizeUser2(user) {
  const { password_hash, ...sanitized } = user;
  return sanitized;
}
var requireFirebaseAuth4 = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return unauthorized(res, "Authentication required");
    }
    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await verifyFirebaseToken(token);
    req.firebaseUser = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.displayName || null,
      picture: decodedToken.picture || null
    };
    next();
  } catch (error) {
    console.error("Firebase token verification failed:", error);
    return unauthorized(res, "Authentication required");
  }
};
var requireAuthWithFallback = async (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split("Bearer ")[1];
      const decodedToken = await verifyFirebaseToken(token);
      if (!decodedToken.email) {
        return unauthorized(res, "Invalid token: email missing");
      }
      const user = await storage.getUserByEmail(decodedToken.email);
      if (!user) {
        return unauthorized(res, "User not found");
      }
      req.user = {
        id: user.id,
        userId: user.id,
        companyId: user.company_id,
        userRole: user.role,
        role: user.role,
        email: user.email,
        full_name: user.full_name
      };
      return next();
    } catch (error) {
      console.error("Firebase token verification failed in fallback:", error);
    }
  }
  return forbidden(res, "Authentication required");
};
router3.get("/", requireAuthWithFallback, async (req, res) => {
  try {
    const companyId = req.session?.companyId || req.user?.companyId;
    if (!companyId) {
      return badRequest(res, "Company ID required");
    }
    const cacheKey = `users:${companyId}`;
    const cached = await getCache2(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    const users3 = await storage.getUsersByCompany(companyId);
    const sanitizedUsers = users3.map((u) => sanitizeUser2(u));
    await setCache2(cacheKey, sanitizedUsers, 120);
    res.json(sanitizedUsers);
  } catch (error) {
    console.error("Error listing users:", error);
    return serverError(res, "Failed to list users");
  }
});
router3.post("/", requireAuthWithFallback, async (req, res) => {
  try {
    console.log("\u{1F4DD} Creating new user - Session:", {
      userId: req.session?.userId,
      companyId: req.session?.companyId,
      hasSession: !!req.session,
      firebaseUser: req.firebaseUser?.email
    });
    const currentUserId = req.session?.userId || req.user?.userId;
    if (!currentUserId) {
      return unauthorized(res, "Authentication required");
    }
    const currentUser = await storage.getUserById(currentUserId);
    if (!currentUser || currentUser.role !== "owner") {
      return forbidden(res, "Only owners can create new users");
    }
    const validatedData = insertUserSchema.parse(req.body);
    let companyId = req.session?.companyId || req.user?.companyId;
    if (!companyId && req.firebaseUser) {
      const firebaseUser = req.firebaseUser;
      const userCompanies = await storage.getCompaniesByUserId(firebaseUser.uid);
      if (userCompanies.length > 0) {
        companyId = userCompanies[0].id;
        console.log(`\u{1F3E2} Got companyId from Firebase user's companies: ${companyId}`);
      }
    }
    if (!companyId) {
      console.error("\u274C No companyId found!", {
        session: req.session,
        firebaseUser: req.firebaseUser
      });
      return badRequest(res, "Company context not found. Please refresh and try again.");
    }
    const userData = {
      ...validatedData,
      company_id: companyId,
      role: validatedData.role || "viewer"
      // Default to viewer for new users
    };
    console.log("\u2705 Creating user with data:", {
      email: userData.email,
      role: userData.role,
      company_id: userData.company_id
    });
    const user = await storage.createUser(userData);
    await logCreate({
      companyId,
      // Use the resolved companyId
      entityType: "users",
      entityId: user.id,
      createdData: sanitizeUser2(user),
      actorId: req.session?.userId || user.id,
      actorName: req.session?.userName || "System",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    await deleteCache2(`users:${companyId}`);
    res.status(201).json(sanitizeUser2(user));
  } catch (error) {
    console.error("\u274C Error creating user:", error);
    if (error.name === "ZodError") {
      const validationError = fromZodError3(error);
      return badRequest(res, validationError.message);
    } else if (error.message?.includes("company_id")) {
      return badRequest(res, "Company context is required. Please refresh and try again.");
    } else if (error.code === "23505") {
      if (error.constraint === "users_email_unique") {
        return badRequest(res, "This email address is already registered. Please use a different email.");
      } else if (error.constraint === "users_username_unique") {
        return badRequest(res, "This username is already taken. Please try again.");
      } else {
        return badRequest(res, "A user with this information already exists.");
      }
    } else {
      return serverError(res, `Failed to create user: ${error.message}`);
    }
  }
});
router3.post("/accept-legal-consent", requireAuth2, async (req, res) => {
  try {
    const userId = req.session.userId;
    const companyId = req.session.companyId;
    console.log("\u{1F4E8} Legal consent request received:", {
      userId,
      companyId,
      hasSession: !!req.session,
      firebaseUser: req.firebaseUser?.email,
      authHeader: req.headers.authorization ? "present" : "missing"
    });
    if (!userId) {
      console.error("\u274C No userId in session:", {
        session: req.session,
        firebaseUser: req.firebaseUser
      });
      return unauthorized(res, "User ID not found in session");
    }
    const user = await storage.getUser(userId);
    if (!user) {
      console.error("\u274C User not found in database:", userId);
      return notFound(res, "User not found");
    }
    console.log("\u{1F464} Current user:", {
      id: user.id,
      email: user.email,
      legal_consent_accepted: user.legal_consent_accepted
    });
    const consentVersion = process.env.LEGAL_CONSENT_VERSION || "2025-11-01";
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"];
    const updatedUser = await storage.updateUser(userId, {
      legal_consent_accepted: true,
      legal_consent_date: /* @__PURE__ */ new Date(),
      legal_consent_version: consentVersion
    });
    if (!updatedUser) {
      console.error("\u274C Failed to update user:", userId);
      return serverError(res, "Failed to update user");
    }
    console.log("\u2705 User updated:", {
      id: updatedUser.id,
      legal_consent_accepted: updatedUser.legal_consent_accepted,
      legal_consent_date: updatedUser.legal_consent_date
    });
    try {
      await db.insert(legal_consent_logs).values({
        user_id: userId,
        company_id: companyId,
        consent_version: consentVersion,
        terms_accepted: true,
        privacy_accepted: true,
        disclaimer_accepted: true,
        ip_address: typeof ipAddress === "string" ? ipAddress : Array.isArray(ipAddress) ? ipAddress[0] : null,
        user_agent: userAgent || null
      });
      console.log("\u{1F4DD} Audit log created successfully");
    } catch (auditError) {
      console.error("\u26A0\uFE0F Failed to create audit log (non-critical):", auditError.message);
    }
    try {
      await logUpdate({
        companyId,
        entityType: "users",
        entityId: userId,
        oldData: { legal_consent_accepted: false },
        newData: {
          legal_consent_accepted: true,
          legal_consent_date: /* @__PURE__ */ new Date(),
          legal_consent_version: consentVersion,
          ip_address: ipAddress
        },
        actorId: userId,
        actorName: user.full_name,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
      });
      console.log("\u{1F4CB} Update logged successfully");
    } catch (logError2) {
      console.error("\u26A0\uFE0F Failed to log update (non-critical):", logError2.message);
    }
    const sanitizedUser = sanitizeUser2(updatedUser);
    console.log("\u{1F4E4} Sending response:", {
      success: true,
      user_legal_consent_accepted: sanitizedUser.legal_consent_accepted
    });
    res.json({ success: true, message: "Legal consent accepted", user: sanitizedUser });
  } catch (error) {
    console.error("\u274C Error accepting legal consent:", error);
    return serverError(res, "Failed to accept legal consent");
  }
});
router3.get("/consent-history", requireAuth2, async (req, res) => {
  try {
    const userId = req.session.userId;
    const companyId = req.session.companyId;
    console.log("\u{1F4CB} Fetching consent history for user:", userId);
    const consentRecords = await db.query.legal_consent_logs.findMany({
      where: (legal_consent_logs2, { eq: eq50, and: and40 }) => and40(
        eq50(legal_consent_logs2.user_id, userId),
        eq50(legal_consent_logs2.company_id, companyId)
      ),
      orderBy: (legal_consent_logs2, { desc: desc26 }) => [desc26(legal_consent_logs2.accepted_at)],
      limit: 10
      // Last 10 records
    });
    console.log(`\u2705 Found ${consentRecords.length} consent records`);
    res.json({
      success: true,
      records: consentRecords,
      count: consentRecords.length
    });
  } catch (error) {
    console.error("\u274C Error fetching consent history:", error);
    return serverError(res, "Failed to fetch consent history");
  }
});
router3.get("/consent", requireAuth2, async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await storage.getUser(userId);
    if (!user) {
      return notFound(res, "User not found");
    }
    res.json({
      accepted: user.legal_consent_accepted,
      date: user.legal_consent_date,
      version: user.legal_consent_version
    });
  } catch (error) {
    console.error("Error fetching consent status:", error);
    return serverError(res, "Failed to fetch consent status");
  }
});
router3.post("/sync-from-firebase", requireFirebaseAuth4, async (req, res) => {
  try {
    const { uid, email, name } = req.firebaseUser;
    console.log("\u{1F504} Syncing user data from Firebase:", {
      uid,
      email,
      name
    });
    let user = await storage.getUserByEmail(email);
    if (!user) {
      const companies3 = await storage.getCompaniesByUserId(uid);
      if (companies3.length > 0) {
        const companyUsers = await db.query.users.findMany({
          where: (users3, { eq: eq50 }) => eq50(users3.company_id, companies3[0].id)
        });
        user = companyUsers.find((u) => u.email === email);
      }
    }
    if (!user) {
      return notFound(res, "User not found. Please sign in again.");
    }
    console.log("\u{1F464} Found user:", { id: user.id, current_name: user.full_name, current_email: user.email });
    const updates = {};
    if (email && email !== user.email) {
      updates.email = email;
    }
    if (name && name !== user.full_name) {
      updates.full_name = name;
    }
    if (Object.keys(updates).length > 0) {
      console.log("\u270F\uFE0F Updating user with:", updates);
      const updatedUser = await storage.updateUser(user.id, updates);
      if (updatedUser) {
        console.log("\u2705 User updated successfully");
        const userResponse = {
          id: updatedUser.id,
          company_id: updatedUser.company_id,
          username: updatedUser.username,
          email: updatedUser.email,
          full_name: updatedUser.full_name,
          role: updatedUser.role,
          language: updatedUser.language,
          timezone: updatedUser.timezone,
          theme: updatedUser.theme,
          is_active: updatedUser.is_active,
          legal_consent_accepted: updatedUser.legal_consent_accepted,
          legal_consent_date: updatedUser.legal_consent_date,
          legal_consent_version: updatedUser.legal_consent_version,
          last_login_at: updatedUser.last_login_at,
          created_at: updatedUser.created_at,
          updated_at: updatedUser.updated_at
        };
        res.json({ success: true, user: userResponse });
      } else {
        return serverError(res, "Failed to update user");
      }
    } else {
      console.log("\u2139\uFE0F No updates needed");
      const userResponse = {
        id: user.id,
        company_id: user.company_id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        language: user.language,
        timezone: user.timezone,
        theme: user.theme,
        is_active: user.is_active,
        legal_consent_accepted: user.legal_consent_accepted,
        legal_consent_date: user.legal_consent_date,
        legal_consent_version: user.legal_consent_version,
        last_login_at: user.last_login_at,
        created_at: user.created_at,
        updated_at: user.updated_at
      };
      res.json({ success: true, user: userResponse });
    }
  } catch (error) {
    console.error("\u274C Error syncing user data:", error);
    return serverError(res, "Failed to sync user data");
  }
});
router3.get("/:id/permissions", requireAuthWithFallback, async (req, res) => {
  try {
    const session3 = req.session;
    const sessionUser = session3 && session3.userId ? session3 : null;
    const tokenUser = req.user;
    const currentUser = sessionUser || tokenUser;
    if (!currentUser) {
      return unauthorized(res, "Authentication required");
    }
    const userId = req.params.id;
    const userRole = currentUser.userRole || currentUser.role;
    const currentUserId = currentUser.userId || currentUser.id;
    const isSelf = String(userId) === String(currentUserId);
    if (userRole !== "owner" && !isSelf) {
      console.log("[Permissions] Access denied - user role:", userRole, "target:", userId, "current:", currentUserId);
      return forbidden(res, "Only owners can view user permissions");
    }
    const companyId = currentUser.companyId || currentUser.company_id;
    const user = await storage.getUser(userId);
    if (!user) {
      return notFound(res, "User not found");
    }
    if (user.company_id !== companyId) {
      return forbidden(res, "Cannot access permissions for user from different company");
    }
    console.log("[Permissions] Returning empty permissions array (table not yet active)");
    return res.json([]);
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    console.error("Error stack:", error.stack);
    return serverError(res, "Failed to fetch user permissions");
  }
});
router3.put("/:id/permissions", requireAuthWithFallback, async (req, res) => {
  try {
    const session3 = req.session;
    const sessionUser = session3 && session3.userId ? session3 : null;
    const tokenUser = req.user;
    const currentUser = sessionUser || tokenUser;
    if (!currentUser) {
      return unauthorized(res, "Authentication required");
    }
    if (currentUser.userRole !== "owner") {
      return forbidden(res, "Only owners can manage user permissions");
    }
    const userId = req.params.id;
    const companyId = currentUser.companyId;
    const { permissions } = req.body;
    console.log("Updating permissions for user:", userId);
    console.log("Permissions received:", JSON.stringify(permissions, null, 2));
    const user = await storage.getUser(userId);
    if (!user) {
      return notFound(res, "User not found");
    }
    if (user.company_id !== companyId) {
      return forbidden(res, "Cannot update permissions for user from different company");
    }
    await db.delete(user_permissions).where(eq8(user_permissions.user_id, userId));
    if (permissions && permissions.length > 0) {
      const permissionsToInsert = permissions.filter(
        (perm) => perm.can_view || perm.can_create || perm.can_edit || perm.can_delete
      ).map((perm) => ({
        user_id: userId,
        module: perm.module,
        can_view: Boolean(perm.can_view),
        can_create: Boolean(perm.can_create),
        can_edit: Boolean(perm.can_edit),
        can_delete: Boolean(perm.can_delete)
      }));
      if (permissionsToInsert.length > 0) {
        await db.insert(user_permissions).values(permissionsToInsert);
      }
    }
    await logUpdate({
      companyId,
      entityType: "user_permissions",
      entityId: userId,
      oldData: { permissions: "previous" },
      newData: { permissions },
      actorId: req.session.userId,
      actorName: req.session.userName || "Unknown",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    await deleteCachePattern2(`permissions:${userId}:*`);
    const { clearPermissionsCache: clearPermissionsCache2 } = await Promise.resolve().then(() => (init_permissions(), permissions_exports));
    clearPermissionsCache2(userId);
    console.log("Permissions updated successfully");
    res.json({ success: true, message: "Permissions updated successfully" });
  } catch (error) {
    console.error("Error updating user permissions:", error);
    console.error("Error stack:", error.stack);
    return serverError(res, `Failed to update user permissions: ${error.message}`);
  }
});
router3.get("/:id", requireAuthWithFallback, async (req, res) => {
  try {
    const currentUserId = req.session?.userId || req.user?.userId;
    let companyId = req.session?.companyId || req.user?.companyId;
    const userId = req.params.id;
    console.log(`[GET /users/${userId}] Requesting user details. CurrentUser: ${currentUserId}, SessionCompany: ${companyId}`);
    if (!companyId && currentUserId) {
      console.log(`[GET /users/${userId}] Company ID missing in session, fetching from DB for user ${currentUserId}`);
      const currentUser = await storage.getUser(currentUserId);
      if (currentUser) {
        companyId = currentUser.company_id;
        console.log(`[GET /users/${userId}] Found company ID: ${companyId}`);
      }
    }
    const user = await storage.getUser(userId);
    if (!user) {
      return notFound(res, "User not found");
    }
    const isSelf = String(currentUserId) === String(userId);
    if (isSelf) {
      const userResponse2 = {
        id: user.id,
        company_id: user.company_id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        language: user.language,
        timezone: user.timezone,
        theme: user.theme,
        is_active: user.is_active,
        legal_consent_accepted: user.legal_consent_accepted,
        legal_consent_date: user.legal_consent_date,
        legal_consent_version: user.legal_consent_version,
        last_login_at: user.last_login_at,
        created_at: user.created_at,
        updated_at: user.updated_at
      };
      return res.json(userResponse2);
    }
    if (!companyId) {
      console.error(`[GET /users/${userId}] No company ID context available for authorization`);
      return forbidden(res, "Company context required");
    }
    if (user.company_id !== companyId) {
      console.warn(`[GET /users/${userId}] Company mismatch. User: ${user.company_id}, Session: ${companyId}`);
      return forbidden(res, "Cannot view user from different company");
    }
    const userResponse = {
      id: user.id,
      company_id: user.company_id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      language: user.language,
      timezone: user.timezone,
      theme: user.theme,
      is_active: user.is_active,
      legal_consent_accepted: user.legal_consent_accepted,
      legal_consent_date: user.legal_consent_date,
      legal_consent_version: user.legal_consent_version,
      last_login_at: user.last_login_at,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
    res.json(userResponse);
  } catch (error) {
    console.error("Error fetching user:", error);
    return serverError(res, "Failed to fetch user");
  }
});
router3.put("/:id", requireAuthWithFallback, async (req, res) => {
  try {
    const currentUserId = req.session?.userId || req.user?.userId;
    const userId = req.params.id;
    const companyId = req.session?.companyId || req.user?.companyId;
    if (userId !== currentUserId) {
      const currentUser = await storage.getUserById(currentUserId);
      if (!currentUser || currentUser.role !== "owner") {
        return forbidden(res, "Only owners can update other users");
      }
    }
    const existingUser = await storage.getUser(userId);
    if (!existingUser) {
      return notFound(res, "User not found");
    }
    if (existingUser.company_id !== companyId) {
      return forbidden(res, "Cannot update user from different company");
    }
    const updateData = { ...req.body };
    if (updateData.password_hash) {
      updateData.password_hash = await bcrypt3.hash(updateData.password_hash, 10);
    }
    const updatedUser = await storage.updateUser(userId, updateData);
    if (!updatedUser) {
      return notFound(res, "User not found");
    }
    await logUpdate({
      companyId,
      entityType: "users",
      entityId: userId,
      oldData: sanitizeUser2(existingUser),
      newData: sanitizeUser2(updatedUser),
      actorId: req.session.userId,
      actorName: req.session.userName || "Unknown",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    const userResponse = {
      id: updatedUser.id,
      company_id: updatedUser.company_id,
      username: updatedUser.username,
      email: updatedUser.email,
      full_name: updatedUser.full_name,
      role: updatedUser.role,
      language: updatedUser.language,
      timezone: updatedUser.timezone,
      theme: updatedUser.theme,
      is_active: updatedUser.is_active,
      legal_consent_accepted: updatedUser.legal_consent_accepted,
      legal_consent_date: updatedUser.legal_consent_date,
      legal_consent_version: updatedUser.legal_consent_version,
      last_login_at: updatedUser.last_login_at,
      created_at: updatedUser.created_at,
      updated_at: updatedUser.updated_at
    };
    res.json(userResponse);
  } catch (error) {
    console.error("Error updating user:", error);
    return serverError(res, "Failed to update user");
  }
});
router3.delete("/:id", requireAuthWithFallback, async (req, res) => {
  try {
    const currentUserId = req.session?.userId || req.user?.userId;
    const companyId = req.session?.companyId || req.user?.companyId;
    const user = await storage.getUserById(currentUserId);
    if (!user || user.role !== "owner") {
      return forbidden(res, "Only owners can delete users");
    }
    const userId = req.params.id;
    const existingUser = await storage.getUser(userId);
    if (!existingUser) {
      return notFound(res, "User not found");
    }
    if (existingUser.company_id !== companyId) {
      return forbidden(res, "Cannot delete user from different company");
    }
    if (userId === currentUserId) {
      return badRequest(res, "Cannot delete your own account");
    }
    const deletedUser = await storage.updateUser(userId, { is_active: false });
    await logDelete({
      companyId,
      entityType: "users",
      entityId: userId,
      deletedData: sanitizeUser2(existingUser),
      actorId: req.session.userId,
      actorName: req.session.userName || "Unknown",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return serverError(res, "Failed to delete user");
  }
});
var users_default = router3;

// server/routes/settings.ts
import { Router as Router4 } from "express";
init_schema();
init_permissions();
import { fromZodError as fromZodError4 } from "zod-validation-error";
init_sendError();
var router4 = Router4();
router4.post("/companies", requireFirebaseAuth2, async (req, res) => {
  try {
    const validatedData = insertCompanySchema.parse(req.body);
    const companyData = {
      ...validatedData,
      firebase_user_id: req.firebaseUser.uid
    };
    const company = await storage.createCompany(companyData);
    res.status(201).json(company);
  } catch (error) {
    if (error.name === "ZodError") {
      const validationError = fromZodError4(error);
      return badRequest(res, validationError.message);
    } else {
      console.error("Error creating company:", error);
      return serverError(res, "Failed to create company");
    }
  }
});
router4.get("/companies/all", requireFirebaseAuth2, async (req, res) => {
  try {
    console.log("\u{1F50D} Fetching all companies using storage...");
    const allCompanies = await storage.getAllCompanies();
    console.log(`\u{1F4E6} Found ${allCompanies.length} total companies`);
    res.json(allCompanies);
  } catch (error) {
    console.error("\u274C Error fetching all companies:", error?.message || error);
    console.error("Stack:", error?.stack);
    res.json([]);
  }
});
router4.get("/companies", requireFirebaseAuth2, async (req, res) => {
  try {
    const firebaseUid = req.firebaseUser?.uid;
    console.log(`\u{1F4E6} Fetching companies for Firebase UID: ${firebaseUid}`);
    if (!firebaseUid) {
      console.error("\u274C No Firebase UID found in request");
      return serverError(res, "Firebase user ID not found");
    }
    let companies3 = await storage.getCompaniesByUserId(firebaseUid);
    if (companies3.length === 0) {
      console.log("\u{1F517} No companies found, checking for unlinked companies...");
      const allCompanies = await storage.getAllCompanies();
      const unlinkedCompanies = allCompanies.filter((c) => !c.firebase_user_id);
      if (unlinkedCompanies.length > 0) {
        console.log(`\u{1F517} Found ${unlinkedCompanies.length} unlinked companies, linking first one...`);
        const companyToLink = unlinkedCompanies[0];
        await storage.updateCompany(companyToLink.id, { firebase_user_id: firebaseUid });
        console.log(`\u2705 Auto-linked company ${companyToLink.id} to Firebase user ${firebaseUid}`);
        companies3 = await storage.getCompaniesByUserId(firebaseUid);
      }
    }
    console.log(`\u2705 Found ${companies3.length} companies for user`);
    res.json(companies3);
  } catch (error) {
    console.error("\u274C Error fetching companies:", error?.message || error);
    console.error("Stack:", error?.stack);
    return serverError(res, "Failed to fetch companies: " + (error?.message || "Unknown error"));
  }
});
router4.put("/companies/:id", requireFirebaseAuth2, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.firebaseUser.uid;
    const userCompanies = await storage.getCompaniesByUserId(userId);
    const hasAccess = userCompanies.some((company2) => company2.id === id);
    if (!hasAccess) {
      return notFound(res, "Company not found");
    }
    const payload = (() => {
      const u = normalize(req.body || {});
      delete u.id;
      delete u.firebase_user_id;
      return u;
    })();
    if (payload.parent_company_id === "") {
      payload.parent_company_id = null;
    }
    const validatedData = insertCompanySchema.partial().parse(payload);
    const company = await storage.updateCompany(id, validatedData);
    if (!company) {
      return notFound(res, "Company not found");
    }
    res.json(company);
  } catch (error) {
    if (error.name === "ZodError") {
      const validationError = fromZodError4(error);
      return badRequest(res, validationError.message);
    } else {
      console.error("Error updating company:", error);
      return serverError(res, "Failed to update company");
    }
  }
});
router4.delete("/companies/:id", requireFirebaseAuth2, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session?.userId || req.firebaseUser?.uid;
    const uid = req.firebaseUser.uid;
    const userCompanies = await storage.getCompaniesByUserId(uid);
    const hasAccess = userCompanies.some((company) => company.id === id);
    if (!hasAccess) {
      return notFound(res, "Company not found");
    }
    if (req.session?.companyId === id) {
      return badRequest(res, "Cannot delete the currently active company. Please switch companies first.");
    }
    await storage.deleteCompany(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting company:", error);
    return serverError(res, "Failed to delete company");
  }
});
router4.post("/companies/:id/link", requireFirebaseAuth2, async (req, res) => {
  try {
    const { id } = req.params;
    const firebaseUid = req.firebaseUser.uid;
    const company = await storage.getCompanyById(id);
    if (!company) {
      return notFound(res, "Company not found");
    }
    const updated = await storage.updateCompany(id, {
      firebase_user_id: firebaseUid
    });
    if (!updated) {
      return serverError(res, "Failed to link company");
    }
    console.log(`\u2705 Linked company ${id} to Firebase user ${firebaseUid}`);
    res.json(updated);
  } catch (error) {
    console.error("Error linking company:", error);
    return serverError(res, "Failed to link company");
  }
});
var monthNumberToName = (num) => {
  const months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december"
  ];
  const n = typeof num === "string" ? parseInt(num) : num;
  return months[(n - 1) % 12] || "january";
};
var monthNameToNumber = (name) => {
  const months = {
    january: 1,
    february: 2,
    march: 3,
    april: 4,
    may: 5,
    june: 6,
    july: 7,
    august: 8,
    september: 9,
    october: 10,
    november: 11,
    december: 12
  };
  return months[name.toLowerCase()] || 1;
};
router4.get("/settings/company", requireAuth2, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    if (!companyId) {
      return badRequest(res, "No company context");
    }
    const company = await storage.getCompanyById(companyId);
    if (!company) {
      return notFound(res, "Company not found");
    }
    const addressStr = typeof company.address === "object" && company.address ? company.address.street || JSON.stringify(company.address) : company.address || "";
    res.json({
      // Company info
      name: company.name || "",
      company_name: company.name || "",
      legal_name: company.legal_name || "",
      tax_number: company.tax_number || "",
      registration_number: company.registration_number || "",
      email: company.email || "",
      phone: company.phone || "",
      address: addressStr,
      city: company.city || "",
      zip: company.zip || company.zip_code || "",
      country: company.country || "",
      // Regional settings
      base_currency: company.base_currency || "AED",
      timezone: company.timezone || "Asia/Dubai",
      fiscal_year_start: monthNumberToName(company.fiscal_year_start || 1),
      date_format: company.date_format || "DD/MM/YYYY",
      number_format: company.number_format || "1,234.56",
      // Invoice settings
      invoice_prefix: company.invoice_prefix || "INV-",
      next_invoice_number: company.next_invoice_number || 1001,
      payment_terms_days: company.payment_terms_days || 30,
      default_tax_rate: company.default_tax_rate || "5.00",
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
      ip_restriction_enabled: company.ip_restriction_enabled ?? false
    });
  } catch (error) {
    console.error("Error fetching company settings:", error);
    return serverError(res, "Failed to fetch company settings");
  }
});
router4.put("/settings/company", requireAuth2, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    if (!companyId) {
      return badRequest(res, "No company context");
    }
    const body = req.body || {};
    const updateData = {};
    if (body.name !== void 0) updateData.name = body.name;
    if (body.email !== void 0) updateData.email = body.email;
    if (body.phone !== void 0) updateData.phone = body.phone;
    if (body.address !== void 0) updateData.address = body.address;
    if (body.city !== void 0) updateData.city = body.city;
    if (body.zip !== void 0) updateData.zip = body.zip;
    if (body.country !== void 0) updateData.country = body.country;
    if (body.base_currency !== void 0) updateData.base_currency = body.base_currency;
    if (body.timezone !== void 0) updateData.timezone = body.timezone;
    if (body.fiscal_year_start !== void 0) {
      updateData.fiscal_year_start = monthNameToNumber(body.fiscal_year_start);
    }
    if (body.date_format !== void 0) updateData.date_format = body.date_format;
    if (body.number_format !== void 0) updateData.number_format = body.number_format;
    if (body.invoice_prefix !== void 0) updateData.invoice_prefix = body.invoice_prefix;
    if (body.next_invoice_number !== void 0) updateData.next_invoice_number = parseInt(body.next_invoice_number);
    if (body.payment_terms_days !== void 0) updateData.payment_terms_days = parseInt(body.payment_terms_days);
    if (body.default_tax_rate !== void 0) updateData.default_tax_rate = body.default_tax_rate;
    if (body.email_notifications !== void 0) updateData.email_notifications = Boolean(body.email_notifications);
    if (body.sms_notifications !== void 0) updateData.sms_notifications = Boolean(body.sms_notifications);
    if (body.invoice_reminders !== void 0) updateData.invoice_reminders = Boolean(body.invoice_reminders);
    if (body.payment_alerts !== void 0) updateData.payment_alerts = Boolean(body.payment_alerts);
    if (body.low_stock_alerts !== void 0) updateData.low_stock_alerts = Boolean(body.low_stock_alerts);
    if (body.two_factor_required !== void 0) updateData.two_factor_required = Boolean(body.two_factor_required);
    if (body.session_timeout_minutes !== void 0) updateData.session_timeout_minutes = parseInt(body.session_timeout_minutes);
    if (body.password_expiry_days !== void 0) updateData.password_expiry_days = parseInt(body.password_expiry_days);
    if (body.ip_restriction_enabled !== void 0) updateData.ip_restriction_enabled = Boolean(body.ip_restriction_enabled);
    const company = await storage.updateCompany(companyId, updateData);
    if (!company) {
      return notFound(res, "Company not found");
    }
    res.json({ success: true, company });
  } catch (error) {
    console.error("Error updating company settings:", error);
    return serverError(res, "Failed to update company settings");
  }
});
router4.get("/settings/language", requireAuth2, async (req, res) => {
  try {
    const userId = req.session.userId;
    const companyId = req.session.companyId;
    const user = await storage.getUser(userId);
    const company = await storage.getCompanyById(companyId);
    res.json({
      selectedLanguage: user?.language || "en",
      defaultLanguage: user?.language || "en",
      fallbackLanguage: "en",
      autoDetect: true,
      dateFormatByLanguage: true,
      currencyByLanguage: true,
      dateFormat: company?.date_format || "dd/MM/yyyy",
      numberFormat: company?.number_format || "1,234.56"
    });
  } catch (error) {
    console.error("Error fetching language settings:", error);
    return serverError(res, "Failed to fetch language settings");
  }
});
router4.put("/settings/language", requireAuth2, async (req, res) => {
  try {
    const userId = req.session.userId;
    const companyId = req.session.companyId;
    const { selectedLanguage, dateFormat, numberFormat } = req.body || {};
    if (selectedLanguage) {
      await storage.updateUser(userId, { language: String(selectedLanguage) });
    }
    if (dateFormat || numberFormat) {
      await storage.updateCompany(companyId, {
        ...dateFormat ? { date_format: String(dateFormat) } : {},
        ...numberFormat ? { number_format: String(numberFormat) } : {}
      });
    }
    const user = await storage.getUser(userId);
    const company = await storage.getCompanyById(companyId);
    res.json({
      selectedLanguage: user?.language || "en",
      defaultLanguage: user?.language || "en",
      fallbackLanguage: "en",
      autoDetect: true,
      dateFormatByLanguage: true,
      currencyByLanguage: true,
      dateFormat: company?.date_format || "dd/MM/yyyy",
      numberFormat: company?.number_format || "1,234.56"
    });
  } catch (error) {
    console.error("Error updating language settings:", error);
    return serverError(res, "Failed to update language settings");
  }
});
router4.get("/taxes", requireAuth2, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    if (!companyId) {
      return res.json([]);
    }
    const taxes3 = await storage.getTaxesByCompany(companyId);
    res.json(taxes3);
  } catch (error) {
    const msg = String(error?.message || "");
    if (msg.includes('relation "taxes" does not exist') || error?.code === "42P01") {
      return res.json([]);
    }
    console.error("Error fetching taxes:", {
      message: msg,
      code: error?.code,
      name: error?.name
    });
    if (process.env.NODE_ENV === "production") {
      return res.json([]);
    }
    return serverError(res, "Failed to fetch taxes");
  }
});
router4.get("/taxes/:id", requireAuth2, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.session.companyId;
    const tax = await storage.getTaxById(id);
    if (!tax) return notFound(res, "Tax not found");
    if (companyId && tax.company_id && tax.company_id !== companyId) {
      return notFound(res, "Tax not found");
    }
    res.json(tax);
  } catch (error) {
    const msg = String(error?.message || "");
    if (msg.includes('relation "taxes" does not exist') || error?.code === "42P01") {
      return notFound(res, "Tax not found");
    }
    console.error("Error fetching tax:", error);
    return serverError(res, "Failed to fetch tax");
  }
});
router4.post("/taxes", requireAuth2, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    if (!companyId) {
      return badRequest(res, "No company context");
    }
    const { code, name, rate, tax_type, calculation_type, jurisdiction, effective_from, is_active } = req.body;
    if (!name || rate === void 0) {
      return badRequest(res, "Name and rate are required");
    }
    const taxData = {
      company_id: companyId,
      code: code || `TAX-${Date.now()}`,
      name,
      rate: String(rate),
      tax_type: tax_type || "vat",
      calculation_type: calculation_type || "exclusive",
      jurisdiction: jurisdiction || null,
      effective_from: effective_from ? new Date(effective_from) : /* @__PURE__ */ new Date(),
      is_active: is_active !== false
    };
    const newTax = await storage.createTax(taxData);
    res.status(201).json(newTax);
  } catch (error) {
    console.error("Error creating tax:", error);
    return serverError(res, "Failed to create tax");
  }
});
router4.put("/taxes/:id", requireAuth2, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.session.companyId;
    const existingTax = await storage.getTaxById(id);
    if (!existingTax) {
      return notFound(res, "Tax not found");
    }
    if (companyId && existingTax.company_id && existingTax.company_id !== companyId) {
      return notFound(res, "Tax not found");
    }
    const { id: _id, company_id: _cid, created_at: _cat, ...updateData } = req.body;
    if (updateData.rate !== void 0 && typeof updateData.rate === "number") {
      updateData.rate = String(updateData.rate);
    }
    const updatedTax = await storage.updateTax(id, updateData);
    res.json(updatedTax);
  } catch (error) {
    console.error("Error updating tax:", error);
    return serverError(res, "Failed to update tax");
  }
});
router4.delete("/taxes/:id", requireAuth2, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.session.companyId;
    const existingTax = await storage.getTaxById(id);
    if (!existingTax) {
      return notFound(res, "Tax not found");
    }
    if (companyId && existingTax.company_id && existingTax.company_id !== companyId) {
      return notFound(res, "Tax not found");
    }
    await storage.deleteTax(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting tax:", error);
    return serverError(res, "Failed to delete tax");
  }
});
router4.get("/warehouses", requireAuth2, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const warehouses2 = await storage.getWarehousesByCompany(companyId);
    res.json(warehouses2);
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    return serverError(res, "Failed to fetch warehouses");
  }
});
router4.get("/settings/default-accounts", requireAuth2, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    if (!companyId) {
      return badRequest(res, "No company context");
    }
    const company = await storage.getCompanyById(companyId);
    if (!company) {
      return notFound(res, "Company not found");
    }
    res.json({
      default_sales_account_id: company.default_sales_account_id || null,
      default_purchase_account_id: company.default_purchase_account_id || null,
      default_inventory_account_id: company.default_inventory_account_id || null,
      default_receivable_account_id: company.default_receivable_account_id || null,
      default_payable_account_id: company.default_payable_account_id || null,
      default_bank_account_id: company.default_bank_account_id || null,
      default_cash_account_id: company.default_cash_account_id || null,
      default_expense_account_id: company.default_expense_account_id || null
    });
  } catch (error) {
    console.error("Error fetching default accounts settings:", error);
    return serverError(res, "Failed to fetch default accounts settings");
  }
});
router4.put("/settings/default-accounts", requireAuth2, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    if (!companyId) {
      return badRequest(res, "No company context");
    }
    const body = req.body || {};
    const updateData = {};
    if (body.default_sales_account_id !== void 0) {
      updateData.default_sales_account_id = body.default_sales_account_id || null;
    }
    if (body.default_purchase_account_id !== void 0) {
      updateData.default_purchase_account_id = body.default_purchase_account_id || null;
    }
    if (body.default_inventory_account_id !== void 0) {
      updateData.default_inventory_account_id = body.default_inventory_account_id || null;
    }
    if (body.default_receivable_account_id !== void 0) {
      updateData.default_receivable_account_id = body.default_receivable_account_id || null;
    }
    if (body.default_payable_account_id !== void 0) {
      updateData.default_payable_account_id = body.default_payable_account_id || null;
    }
    if (body.default_bank_account_id !== void 0) {
      updateData.default_bank_account_id = body.default_bank_account_id || null;
    }
    if (body.default_cash_account_id !== void 0) {
      updateData.default_cash_account_id = body.default_cash_account_id || null;
    }
    if (body.default_expense_account_id !== void 0) {
      updateData.default_expense_account_id = body.default_expense_account_id || null;
    }
    const company = await storage.updateCompany(companyId, updateData);
    if (!company) {
      return notFound(res, "Company not found");
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating default accounts settings:", error);
    return serverError(res, "Failed to update default accounts settings");
  }
});
var settings_default = router4;

// server/routes/accounting.ts
import { Router as Router5 } from "express";
init_schema();
init_permissions();
init_sendError();
import { fromZodError as fromZodError5 } from "zod-validation-error";

// server/utils/accountingInsights.ts
init_db();
init_schema();
init_aiProviders();
import { eq as eq9, and as and6, sql as sql7, lt, isNull, gte as gte4, lte as lte3, sum as sum2 } from "drizzle-orm";
async function getFinancialInsights(companyId, enableAI = false) {
  const insights = [];
  const duplicates = await db.execute(sql7`
    SELECT t1.invoice_number, t1.total as amount, t1.customer_id, t1.date
    FROM sales_invoices t1
    JOIN sales_invoices t2 ON t1.customer_id = t2.customer_id 
      AND t1.total = t2.total 
      AND t1.id != t2.id
      AND t1.company_id = ${companyId}
      AND t2.company_id = ${companyId}
      AND ABS(EXTRACT(EPOCH FROM (t1.date - t2.date))) < 86400
    WHERE t1.date > NOW() - INTERVAL '30 days'
    LIMIT 5
  `);
  if (duplicates.rows.length > 0) {
    insights.push({
      type: "warning",
      title: "Potential Duplicate Invoices",
      description: `Found ${duplicates.rows.length} invoices with same amount and customer within 24 hours.`,
      action: "Review these invoices to avoid double billing.",
      data: duplicates.rows
    });
  }
  const avgExpense = await db.execute(sql7`
    SELECT AVG(amount) as avg_amount FROM expenses WHERE company_id = ${companyId}
  `);
  const threshold = avgExpense.rows[0]?.avg_amount * 3;
  if (threshold) {
    const highValue = await db.select().from(expenses).where(and6(
      eq9(expenses.company_id, companyId),
      sql7`amount > ${threshold}`
    )).limit(5);
    if (highValue.length > 0) {
      insights.push({
        type: "info",
        title: "Unusual High Expenses",
        description: `Found ${highValue.length} expenses significantly higher than your average (${Number(threshold).toFixed(2)}).`,
        action: "Verify these large transactions are authorized.",
        data: highValue
      });
    }
  }
  const overdue = await db.select().from(sales_invoices).where(and6(
    eq9(sales_invoices.company_id, companyId),
    eq9(sales_invoices.status, "sent"),
    lt(sales_invoices.due_date, /* @__PURE__ */ new Date())
  )).limit(5);
  if (overdue.length > 0) {
    insights.push({
      type: "critical",
      title: "Overdue Invoices Detected",
      description: `You have ${overdue.length} overdue invoices that need attention.`,
      action: "Send reminders to these customers immediately.",
      data: overdue
    });
  }
  const uncategorized = await db.select().from(expenses).where(and6(
    eq9(expenses.company_id, companyId),
    isNull(expenses.category)
  )).limit(5);
  if (uncategorized.length > 0) {
    insights.push({
      type: "warning",
      title: "Uncategorized Expenses",
      description: `Found ${uncategorized.length} expenses without a category.`,
      action: "Categorize these to ensure accurate tax reporting.",
      data: uncategorized
    });
  }
  const anomalies = await db.execute(sql7`
    WITH monthly_stats AS (
      SELECT 
        category, 
        to_char(date, 'YYYY-MM') as month,
        SUM(amount) as total
      FROM expenses 
      WHERE company_id = ${companyId} 
        AND date >= NOW() - INTERVAL '4 months'
        AND category IS NOT NULL
      GROUP BY category, to_char(date, 'YYYY-MM')
    ),
    averages AS (
      SELECT 
        category, 
        AVG(total) as avg_amount
      FROM monthly_stats
      WHERE month < to_char(NOW(), 'YYYY-MM')
      GROUP BY category
    )
    SELECT 
      m.category, 
      m.total as current_amount, 
      a.avg_amount
    FROM monthly_stats m
    JOIN averages a ON m.category = a.category
    WHERE m.month = to_char(NOW(), 'YYYY-MM')
      AND m.total > a.avg_amount * 1.4
  `);
  if (anomalies.rows.length > 0) {
    for (const row of anomalies.rows) {
      const percent = Math.round((row.current_amount - row.avg_amount) / row.avg_amount * 100);
      insights.push({
        type: "warning",
        title: "Spending Anomaly Detected",
        description: `Spending on ${row.category} is ${percent}% higher than the 3-month average.`,
        action: "Investigate if this increase is justified.",
        data: [row]
      });
    }
  }
  const fragmentation = await db.execute(sql7`
    SELECT 
      category, 
      COUNT(DISTINCT payee) as vendor_count,
      SUM(amount) as total_spend
    FROM expenses
    WHERE company_id = ${companyId}
      AND date >= NOW() - INTERVAL '3 months'
      AND category IS NOT NULL
    GROUP BY category
    HAVING COUNT(DISTINCT payee) > 2
  `);
  if (fragmentation.rows.length > 0) {
    for (const row of fragmentation.rows) {
      insights.push({
        type: "info",
        title: "Vendor Consolidation Opportunity",
        description: `You have ${row.vendor_count} different vendors for '${row.category}'.`,
        action: "Consolidating vendors could save ~10-15% in negotiated rates.",
        data: [row]
      });
    }
  }
  const newVendorPayments = await db.execute(sql7`
    SELECT p.payment_number, p.amount, c.name as vendor_name, c.created_at as vendor_created_at
    FROM payments p
    JOIN contacts c ON p.vendor_id = c.id
    WHERE p.company_id = ${companyId}
      AND p.date > NOW() - INTERVAL '30 days'
      AND c.created_at > p.date - INTERVAL '48 hours'
    LIMIT 5
  `);
  if (newVendorPayments.rows.length > 0) {
    insights.push({
      type: "critical",
      title: "Potential Fraud: New Vendor Payment",
      description: `Found ${newVendorPayments.rows.length} payments to vendors created less than 48 hours before payment.`,
      action: "Verify legitimacy of these vendors immediately.",
      data: newVendorPayments.rows
    });
  }
  const digitStats = await db.execute(sql7`
    SELECT 
      SUBSTRING(amount::text, 1, 1) as first_digit,
      COUNT(*) as count
    FROM expenses
    WHERE company_id = ${companyId}
      AND amount >= 10
    GROUP BY SUBSTRING(amount::text, 1, 1)
  `);
  const totalExpenses = digitStats.rows.reduce((sum8, row) => sum8 + parseInt(row.count), 0);
  if (totalExpenses > 30) {
    const benford = { "1": 0.301, "2": 0.176, "3": 0.125, "4": 0.097, "5": 0.079, "6": 0.067, "7": 0.058, "8": 0.051, "9": 0.046 };
    let maxDeviation = 0;
    let suspiciousDigit = "";
    for (const row of digitStats.rows) {
      const digit = row.first_digit;
      if (digit === "0" || !benford[digit]) continue;
      const actualFreq = parseInt(row.count) / totalExpenses;
      const expectedFreq = benford[digit];
      const deviation = Math.abs(actualFreq - expectedFreq);
      if (deviation > 0.1) {
        if (deviation > maxDeviation) {
          maxDeviation = deviation;
          suspiciousDigit = digit;
        }
      }
    }
    if (suspiciousDigit) {
      insights.push({
        type: "warning",
        title: "Statistical Anomaly (Benford's Law)",
        description: `Expense amounts starting with '${suspiciousDigit}' appear ${Math.round(maxDeviation * 100)}% more/less often than expected naturally.`,
        action: "Audit expenses for fabricated numbers.",
        data: []
      });
    }
  }
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const currentMonth = (/* @__PURE__ */ new Date()).getMonth();
  const budgetRecords = await db.select().from(budgets).innerJoin(accounts, eq9(budgets.account_id, accounts.id)).where(and6(
    eq9(budgets.company_id, companyId),
    eq9(budgets.fiscal_year, currentYear),
    eq9(accounts.account_type, "expense")
  ));
  if (budgetRecords.length > 0) {
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);
    const actuals = await db.select({
      accountId: journal_lines.account_id,
      debitSum: sum2(journal_lines.base_debit),
      creditSum: sum2(journal_lines.base_credit)
    }).from(journal_lines).innerJoin(journals, eq9(journal_lines.journal_id, journals.id)).where(and6(
      eq9(journals.company_id, companyId),
      gte4(journals.date, startDate),
      lte3(journals.date, endDate)
    )).groupBy(journal_lines.account_id);
    const actualMap = /* @__PURE__ */ new Map();
    actuals.forEach((a) => {
      const debit = parseFloat(a.debitSum || "0");
      const credit = parseFloat(a.creditSum || "0");
      actualMap.set(a.accountId, debit - credit);
    });
    const overspentAccounts = [];
    const nearLimitAccounts = [];
    for (const record of budgetRecords) {
      const b = record.budgets;
      const acc = record.accounts;
      const budgetTotal = parseFloat(b.total?.toString() || "0");
      const actualAmount = actualMap.get(acc.id) || 0;
      if (budgetTotal > 0) {
        const percentage = actualAmount / budgetTotal * 100;
        if (percentage > 100) {
          overspentAccounts.push({
            accountName: acc.name,
            accountCode: acc.code,
            budget: budgetTotal,
            actual: actualAmount,
            overBy: actualAmount - budgetTotal,
            percentage: percentage.toFixed(1)
          });
        } else if (percentage >= 85) {
          nearLimitAccounts.push({
            accountName: acc.name,
            accountCode: acc.code,
            budget: budgetTotal,
            actual: actualAmount,
            remaining: budgetTotal - actualAmount,
            percentage: percentage.toFixed(1)
          });
        }
      }
    }
    if (overspentAccounts.length > 0) {
      insights.push({
        type: "critical",
        title: "Budget Exceeded",
        description: `${overspentAccounts.length} expense account(s) have exceeded their annual budget.`,
        action: "Review spending immediately and consider budget adjustments.",
        data: overspentAccounts.slice(0, 5)
      });
    }
    if (nearLimitAccounts.length > 0) {
      insights.push({
        type: "warning",
        title: "Approaching Budget Limit",
        description: `${nearLimitAccounts.length} expense account(s) are at 85%+ of their annual budget.`,
        action: "Monitor spending closely to stay within budget.",
        data: nearLimitAccounts.slice(0, 5)
      });
    }
  }
  let aiAdvice = null;
  if (enableAI && insights.length > 0) {
    try {
      const providers = await db.select().from(ai_providers).where(eq9(ai_providers.company_id, companyId));
      const activeProvider = providers[0];
      if (activeProvider && activeProvider.api_key) {
        const prompt = `
          You are an expert CFO and Accountant. Review these financial alerts for a company and provide a brief, professional summary and 1 strategic recommendation.
          
          Alerts:
          ${JSON.stringify(insights.map((i) => ({ title: i.title, description: i.description })))}
          
          Format:
          Summary: [One sentence summary]
          Recommendation: [One strategic action]
        `;
        const response = await callAIProvider({
          provider: (activeProvider.provider || "openai").toLowerCase(),
          model: activeProvider.default_model || "gpt-4o",
          apiKey: activeProvider.api_key,
          baseUrl: activeProvider.base_url || void 0
        }, [{ role: "user", content: prompt }]);
        aiAdvice = response.content;
      }
    } catch (e) {
      console.error("AI Accountant failed to generate advice", e);
    }
  }
  return {
    alerts: insights,
    ai_advice: aiAdvice
  };
}

// server/utils/defaultAccounts.ts
var DEFAULT_ACCOUNTS = [
  // ================== ASSETS (الأصول) ==================
  // Current Assets (الأصول المتداولة)
  { code: "1000", name: "Current Assets", name_ar: "\u0627\u0644\u0623\u0635\u0648\u0644 \u0627\u0644\u0645\u062A\u062F\u0627\u0648\u0644\u0629", account_type: "asset", account_subtype: "current_asset", is_system: true },
  { code: "1010", name: "Cash on Hand", name_ar: "\u0627\u0644\u0646\u0642\u062F \u0641\u064A \u0627\u0644\u0635\u0646\u062F\u0648\u0642", account_type: "asset", account_subtype: "cash", parent_code: "1000", is_system: true },
  { code: "1020", name: "Cash in Bank", name_ar: "\u0627\u0644\u0646\u0642\u062F \u0641\u064A \u0627\u0644\u0628\u0646\u0643", account_type: "asset", account_subtype: "cash", parent_code: "1000", is_system: true },
  { code: "1030", name: "Petty Cash", name_ar: "\u0635\u0646\u062F\u0648\u0642 \u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0627\u0644\u0646\u062B\u0631\u064A\u0629", account_type: "asset", account_subtype: "cash", parent_code: "1000", is_system: true },
  { code: "1040", name: "Foreign Currency Cash", name_ar: "\u0627\u0644\u0646\u0642\u062F \u0628\u0627\u0644\u0639\u0645\u0644\u0627\u062A \u0627\u0644\u0623\u062C\u0646\u0628\u064A\u0629", account_type: "asset", account_subtype: "cash", parent_code: "1000", is_system: false },
  { code: "1050", name: "Foreign Currency Bank Accounts", name_ar: "\u062D\u0633\u0627\u0628\u0627\u062A \u0628\u0646\u0643\u064A\u0629 \u0628\u0627\u0644\u0639\u0645\u0644\u0627\u062A \u0627\u0644\u0623\u062C\u0646\u0628\u064A\u0629", account_type: "asset", account_subtype: "cash", parent_code: "1000", is_system: false },
  { code: "1100", name: "Accounts Receivable", name_ar: "\u0627\u0644\u0630\u0645\u0645 \u0627\u0644\u0645\u062F\u064A\u0646\u0629", account_type: "asset", account_subtype: "accounts_receivable", parent_code: "1000", is_system: true },
  { code: "1110", name: "Trade Receivables", name_ar: "\u0630\u0645\u0645 \u062A\u062C\u0627\u0631\u064A\u0629 \u0645\u062F\u064A\u0646\u0629", account_type: "asset", account_subtype: "accounts_receivable", parent_code: "1100", is_system: false },
  { code: "1120", name: "Notes Receivable", name_ar: "\u0623\u0648\u0631\u0627\u0642 \u0627\u0644\u0642\u0628\u0636", account_type: "asset", account_subtype: "accounts_receivable", parent_code: "1100", is_system: false },
  { code: "1130", name: "Employee Advances", name_ar: "\u0633\u0644\u0641 \u0627\u0644\u0645\u0648\u0638\u0641\u064A\u0646", account_type: "asset", account_subtype: "accounts_receivable", parent_code: "1100", is_system: false },
  { code: "1140", name: "Allowance for Doubtful Accounts", name_ar: "\u0645\u062E\u0635\u0635 \u0627\u0644\u062F\u064A\u0648\u0646 \u0627\u0644\u0645\u0634\u0643\u0648\u0643 \u0641\u064A\u0647\u0627", account_type: "asset", account_subtype: "accounts_receivable", parent_code: "1100", is_system: true },
  { code: "1200", name: "Inventory", name_ar: "\u0627\u0644\u0645\u062E\u0632\u0648\u0646", account_type: "asset", account_subtype: "inventory", parent_code: "1000", is_system: true },
  { code: "1210", name: "Raw Materials", name_ar: "\u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u062E\u0627\u0645", account_type: "asset", account_subtype: "inventory", parent_code: "1200", is_system: false },
  { code: "1220", name: "Work in Progress", name_ar: "\u0627\u0644\u0625\u0646\u062A\u0627\u062C \u062A\u062D\u062A \u0627\u0644\u062A\u0634\u063A\u064A\u0644", account_type: "asset", account_subtype: "inventory", parent_code: "1200", is_system: false },
  { code: "1230", name: "Finished Goods", name_ar: "\u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0627\u0644\u062C\u0627\u0647\u0632\u0629", account_type: "asset", account_subtype: "inventory", parent_code: "1200", is_system: false },
  { code: "1300", name: "Prepaid Expenses", name_ar: "\u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0627\u0644\u0645\u062F\u0641\u0648\u0639\u0629 \u0645\u0642\u062F\u0645\u0627\u064B", account_type: "asset", account_subtype: "other_asset", parent_code: "1000", is_system: true },
  { code: "1310", name: "Prepaid Rent", name_ar: "\u0625\u064A\u062C\u0627\u0631 \u0645\u062F\u0641\u0648\u0639 \u0645\u0642\u062F\u0645\u0627\u064B", account_type: "asset", account_subtype: "other_asset", parent_code: "1300", is_system: false },
  { code: "1320", name: "Prepaid Insurance", name_ar: "\u062A\u0623\u0645\u064A\u0646 \u0645\u062F\u0641\u0648\u0639 \u0645\u0642\u062F\u0645\u0627\u064B", account_type: "asset", account_subtype: "other_asset", parent_code: "1300", is_system: false },
  { code: "1400", name: "VAT Receivable", name_ar: "\u0636\u0631\u064A\u0628\u0629 \u0627\u0644\u0642\u064A\u0645\u0629 \u0627\u0644\u0645\u0636\u0627\u0641\u0629 \u0627\u0644\u0645\u0633\u062A\u0631\u062F\u0629", account_type: "asset", account_subtype: "other_asset", parent_code: "1000", is_system: true },
  // Fixed Assets (الأصول الثابتة)
  { code: "1500", name: "Fixed Assets", name_ar: "\u0627\u0644\u0623\u0635\u0648\u0644 \u0627\u0644\u062B\u0627\u0628\u062A\u0629", account_type: "asset", account_subtype: "fixed_asset", is_system: true },
  { code: "1510", name: "Land", name_ar: "\u0627\u0644\u0623\u0631\u0627\u0636\u064A", account_type: "asset", account_subtype: "fixed_asset", parent_code: "1500", is_system: false },
  { code: "1520", name: "Buildings", name_ar: "\u0627\u0644\u0645\u0628\u0627\u0646\u064A", account_type: "asset", account_subtype: "fixed_asset", parent_code: "1500", is_system: false },
  { code: "1530", name: "Machinery & Equipment", name_ar: "\u0627\u0644\u0622\u0644\u0627\u062A \u0648\u0627\u0644\u0645\u0639\u062F\u0627\u062A", account_type: "asset", account_subtype: "fixed_asset", parent_code: "1500", is_system: false },
  { code: "1540", name: "Furniture & Fixtures", name_ar: "\u0627\u0644\u0623\u062B\u0627\u062B \u0648\u0627\u0644\u062A\u062C\u0647\u064A\u0632\u0627\u062A", account_type: "asset", account_subtype: "fixed_asset", parent_code: "1500", is_system: false },
  { code: "1550", name: "Vehicles", name_ar: "\u0627\u0644\u0645\u0631\u0643\u0628\u0627\u062A", account_type: "asset", account_subtype: "fixed_asset", parent_code: "1500", is_system: false },
  { code: "1560", name: "Computer Equipment", name_ar: "\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u062D\u0627\u0633\u0648\u0628", account_type: "asset", account_subtype: "fixed_asset", parent_code: "1500", is_system: false },
  { code: "1600", name: "Accumulated Depreciation", name_ar: "\u0645\u062C\u0645\u0639 \u0627\u0644\u0625\u0647\u0644\u0627\u0643", account_type: "asset", account_subtype: "fixed_asset", parent_code: "1500", is_system: true },
  { code: "1610", name: "Accum. Dep. - Buildings", name_ar: "\u0645\u062C\u0645\u0639 \u0625\u0647\u0644\u0627\u0643 \u0627\u0644\u0645\u0628\u0627\u0646\u064A", account_type: "asset", account_subtype: "fixed_asset", parent_code: "1600", is_system: false },
  { code: "1620", name: "Accum. Dep. - Equipment", name_ar: "\u0645\u062C\u0645\u0639 \u0625\u0647\u0644\u0627\u0643 \u0627\u0644\u0645\u0639\u062F\u0627\u062A", account_type: "asset", account_subtype: "fixed_asset", parent_code: "1600", is_system: false },
  { code: "1630", name: "Accum. Dep. - Vehicles", name_ar: "\u0645\u062C\u0645\u0639 \u0625\u0647\u0644\u0627\u0643 \u0627\u0644\u0645\u0631\u0643\u0628\u0627\u062A", account_type: "asset", account_subtype: "fixed_asset", parent_code: "1600", is_system: false },
  // Intangible Assets (الأصول غير الملموسة)
  { code: "1700", name: "Intangible Assets", name_ar: "\u0627\u0644\u0623\u0635\u0648\u0644 \u063A\u064A\u0631 \u0627\u0644\u0645\u0644\u0645\u0648\u0633\u0629", account_type: "asset", account_subtype: "other_asset", is_system: true },
  { code: "1710", name: "Goodwill", name_ar: "\u0627\u0644\u0634\u0647\u0631\u0629", account_type: "asset", account_subtype: "other_asset", parent_code: "1700", is_system: false },
  { code: "1720", name: "Patents & Trademarks", name_ar: "\u0628\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u0627\u062E\u062A\u0631\u0627\u0639 \u0648\u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062A \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629", account_type: "asset", account_subtype: "other_asset", parent_code: "1700", is_system: false },
  // ================== LIABILITIES (الالتزامات) ==================
  // Current Liabilities (الالتزامات المتداولة)
  { code: "2000", name: "Current Liabilities", name_ar: "\u0627\u0644\u0627\u0644\u062A\u0632\u0627\u0645\u0627\u062A \u0627\u0644\u0645\u062A\u062F\u0627\u0648\u0644\u0629", account_type: "liability", account_subtype: "current_liability", is_system: true },
  { code: "2100", name: "Accounts Payable", name_ar: "\u0627\u0644\u0630\u0645\u0645 \u0627\u0644\u062F\u0627\u0626\u0646\u0629", account_type: "liability", account_subtype: "accounts_payable", parent_code: "2000", is_system: true },
  { code: "2110", name: "Trade Payables", name_ar: "\u0630\u0645\u0645 \u062A\u062C\u0627\u0631\u064A\u0629 \u062F\u0627\u0626\u0646\u0629", account_type: "liability", account_subtype: "accounts_payable", parent_code: "2100", is_system: false },
  { code: "2120", name: "Notes Payable", name_ar: "\u0623\u0648\u0631\u0627\u0642 \u0627\u0644\u062F\u0641\u0639", account_type: "liability", account_subtype: "accounts_payable", parent_code: "2100", is_system: false },
  { code: "2200", name: "Accrued Expenses", name_ar: "\u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u062D\u0642\u0629", account_type: "liability", account_subtype: "current_liability", parent_code: "2000", is_system: true },
  { code: "2210", name: "Accrued Salaries", name_ar: "\u0631\u0648\u0627\u062A\u0628 \u0645\u0633\u062A\u062D\u0642\u0629", account_type: "liability", account_subtype: "current_liability", parent_code: "2200", is_system: false },
  { code: "2220", name: "Accrued Utilities", name_ar: "\u062E\u062F\u0645\u0627\u062A \u0645\u0633\u062A\u062D\u0642\u0629", account_type: "liability", account_subtype: "current_liability", parent_code: "2200", is_system: false },
  { code: "2300", name: "VAT Payable", name_ar: "\u0636\u0631\u064A\u0628\u0629 \u0627\u0644\u0642\u064A\u0645\u0629 \u0627\u0644\u0645\u0636\u0627\u0641\u0629 \u0627\u0644\u0645\u0633\u062A\u062D\u0642\u0629", account_type: "liability", account_subtype: "current_liability", parent_code: "2000", is_system: true },
  { code: "2310", name: "Output VAT", name_ar: "\u0636\u0631\u064A\u0628\u0629 \u0627\u0644\u0645\u062E\u0631\u062C\u0627\u062A", account_type: "liability", account_subtype: "current_liability", parent_code: "2300", is_system: true },
  { code: "2320", name: "Input VAT", name_ar: "\u0636\u0631\u064A\u0628\u0629 \u0627\u0644\u0645\u062F\u062E\u0644\u0627\u062A", account_type: "liability", account_subtype: "current_liability", parent_code: "2300", is_system: true },
  { code: "2400", name: "Unearned Revenue", name_ar: "\u0627\u0644\u0625\u064A\u0631\u0627\u062F\u0627\u062A \u063A\u064A\u0631 \u0627\u0644\u0645\u0643\u062A\u0633\u0628\u0629", account_type: "liability", account_subtype: "current_liability", parent_code: "2000", is_system: true },
  { code: "2500", name: "Short-term Loans", name_ar: "\u0642\u0631\u0648\u0636 \u0642\u0635\u064A\u0631\u0629 \u0627\u0644\u0623\u062C\u0644", account_type: "liability", account_subtype: "current_liability", parent_code: "2000", is_system: false },
  { code: "2600", name: "Credit Cards Payable", name_ar: "\u0628\u0637\u0627\u0642\u0627\u062A \u0627\u0626\u062A\u0645\u0627\u0646 \u0645\u0633\u062A\u062D\u0642\u0629", account_type: "liability", account_subtype: "credit_card", parent_code: "2000", is_system: false },
  // Long-term Liabilities (الالتزامات طويلة الأجل)
  { code: "2700", name: "Long-term Liabilities", name_ar: "\u0627\u0644\u0627\u0644\u062A\u0632\u0627\u0645\u0627\u062A \u0637\u0648\u064A\u0644\u0629 \u0627\u0644\u0623\u062C\u0644", account_type: "liability", account_subtype: "long_term_liability", is_system: true },
  { code: "2710", name: "Long-term Loans", name_ar: "\u0642\u0631\u0648\u0636 \u0637\u0648\u064A\u0644\u0629 \u0627\u0644\u0623\u062C\u0644", account_type: "liability", account_subtype: "long_term_liability", parent_code: "2700", is_system: false },
  { code: "2720", name: "Mortgage Payable", name_ar: "\u0631\u0647\u0646 \u0639\u0642\u0627\u0631\u064A \u0645\u0633\u062A\u062D\u0642", account_type: "liability", account_subtype: "long_term_liability", parent_code: "2700", is_system: false },
  { code: "2800", name: "Employee Benefits Payable", name_ar: "\u0645\u0633\u062A\u062D\u0642\u0627\u062A \u0646\u0647\u0627\u064A\u0629 \u0627\u0644\u062E\u062F\u0645\u0629", account_type: "liability", account_subtype: "long_term_liability", parent_code: "2700", is_system: true },
  // ================== EQUITY (حقوق الملكية) ==================
  { code: "3000", name: "Equity", name_ar: "\u062D\u0642\u0648\u0642 \u0627\u0644\u0645\u0644\u0643\u064A\u0629", account_type: "equity", account_subtype: "owners_equity", is_system: true },
  { code: "3100", name: "Share Capital", name_ar: "\u0631\u0623\u0633 \u0627\u0644\u0645\u0627\u0644", account_type: "equity", account_subtype: "share_capital", parent_code: "3000", is_system: true },
  { code: "3200", name: "Additional Paid-in Capital", name_ar: "\u0639\u0644\u0627\u0648\u0629 \u0625\u0635\u062F\u0627\u0631 \u0623\u0633\u0647\u0645", account_type: "equity", account_subtype: "share_capital", parent_code: "3000", is_system: false },
  { code: "3300", name: "Retained Earnings", name_ar: "\u0627\u0644\u0623\u0631\u0628\u0627\u062D \u0627\u0644\u0645\u062D\u062A\u062C\u0632\u0629", account_type: "equity", account_subtype: "retained_earnings", parent_code: "3000", is_system: true },
  { code: "3400", name: "Current Year Earnings", name_ar: "\u0623\u0631\u0628\u0627\u062D \u0627\u0644\u0633\u0646\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629", account_type: "equity", account_subtype: "retained_earnings", parent_code: "3000", is_system: true },
  { code: "3500", name: "Owner Drawings", name_ar: "\u0645\u0633\u062D\u0648\u0628\u0627\u062A \u0627\u0644\u0645\u0627\u0644\u0643", account_type: "equity", account_subtype: "dividends", parent_code: "3000", is_system: false },
  { code: "3600", name: "Dividends", name_ar: "\u062A\u0648\u0632\u064A\u0639\u0627\u062A \u0627\u0644\u0623\u0631\u0628\u0627\u062D", account_type: "equity", account_subtype: "dividends", parent_code: "3000", is_system: false },
  { code: "3700", name: "Treasury Stock", name_ar: "\u0623\u0633\u0647\u0645 \u0627\u0644\u062E\u0632\u064A\u0646\u0629", account_type: "equity", account_subtype: "owners_equity", parent_code: "3000", is_system: false },
  { code: "3800", name: "Reserves", name_ar: "\u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0627\u062A", account_type: "equity", account_subtype: "retained_earnings", parent_code: "3000", is_system: false },
  { code: "3810", name: "Legal Reserve", name_ar: "\u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A \u0627\u0644\u0642\u0627\u0646\u0648\u0646\u064A", account_type: "equity", account_subtype: "retained_earnings", parent_code: "3800", is_system: false },
  { code: "3820", name: "General Reserve", name_ar: "\u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A \u0627\u0644\u0639\u0627\u0645", account_type: "equity", account_subtype: "retained_earnings", parent_code: "3800", is_system: false },
  // ================== REVENUE (الإيرادات) ==================
  { code: "4000", name: "Revenue", name_ar: "\u0627\u0644\u0625\u064A\u0631\u0627\u062F\u0627\u062A", account_type: "revenue", account_subtype: "sales_revenue", is_system: true },
  { code: "4100", name: "Sales Revenue", name_ar: "\u0625\u064A\u0631\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u0628\u064A\u0639\u0627\u062A", account_type: "revenue", account_subtype: "sales_revenue", parent_code: "4000", is_system: true },
  { code: "4110", name: "Product Sales", name_ar: "\u0645\u0628\u064A\u0639\u0627\u062A \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A", account_type: "revenue", account_subtype: "sales_revenue", parent_code: "4100", is_system: false },
  { code: "4120", name: "Service Revenue", name_ar: "\u0625\u064A\u0631\u0627\u062F\u0627\u062A \u0627\u0644\u062E\u062F\u0645\u0627\u062A", account_type: "revenue", account_subtype: "service_revenue", parent_code: "4100", is_system: false },
  { code: "4130", name: "Sales Returns & Allowances", name_ar: "\u0645\u0631\u062F\u0648\u062F\u0627\u062A \u0648\u0645\u0633\u0645\u0648\u062D\u0627\u062A \u0627\u0644\u0645\u0628\u064A\u0639\u0627\u062A", account_type: "revenue", account_subtype: "sales_revenue", parent_code: "4100", is_system: true },
  { code: "4140", name: "Sales Discounts", name_ar: "\u062E\u0635\u0648\u0645\u0627\u062A \u0627\u0644\u0645\u0628\u064A\u0639\u0627\u062A", account_type: "revenue", account_subtype: "sales_revenue", parent_code: "4100", is_system: true },
  { code: "4200", name: "Other Income", name_ar: "\u0625\u064A\u0631\u0627\u062F\u0627\u062A \u0623\u062E\u0631\u0649", account_type: "revenue", account_subtype: "other_revenue", parent_code: "4000", is_system: true },
  { code: "4210", name: "Interest Income", name_ar: "\u0625\u064A\u0631\u0627\u062F\u0627\u062A \u0627\u0644\u0641\u0648\u0627\u0626\u062F", account_type: "revenue", account_subtype: "interest_income", parent_code: "4200", is_system: false },
  { code: "4220", name: "Rental Income", name_ar: "\u0625\u064A\u0631\u0627\u062F\u0627\u062A \u0627\u0644\u0625\u064A\u062C\u0627\u0631", account_type: "revenue", account_subtype: "other_revenue", parent_code: "4200", is_system: false },
  { code: "4230", name: "Gain on Asset Sale", name_ar: "\u0623\u0631\u0628\u0627\u062D \u0628\u064A\u0639 \u0627\u0644\u0623\u0635\u0648\u0644", account_type: "revenue", account_subtype: "other_revenue", parent_code: "4200", is_system: false },
  { code: "4240", name: "Foreign Exchange Gain", name_ar: "\u0623\u0631\u0628\u0627\u062D \u062A\u062D\u0648\u064A\u0644 \u0627\u0644\u0639\u0645\u0644\u0627\u062A", account_type: "revenue", account_subtype: "other_revenue", parent_code: "4200", is_system: true },
  // ================== EXPENSES (المصروفات) ==================
  // Cost of Goods Sold (تكلفة البضاعة المباعة)
  { code: "5000", name: "Cost of Goods Sold", name_ar: "\u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0627\u0644\u0645\u0628\u0627\u0639\u0629", account_type: "expense", account_subtype: "cost_of_goods", is_system: true },
  { code: "5100", name: "Direct Materials", name_ar: "\u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u0645\u0628\u0627\u0634\u0631\u0629", account_type: "expense", account_subtype: "cost_of_goods", parent_code: "5000", is_system: false },
  { code: "5200", name: "Direct Labor", name_ar: "\u0627\u0644\u0639\u0645\u0627\u0644\u0629 \u0627\u0644\u0645\u0628\u0627\u0634\u0631\u0629", account_type: "expense", account_subtype: "cost_of_goods", parent_code: "5000", is_system: false },
  { code: "5300", name: "Manufacturing Overhead", name_ar: "\u062A\u0643\u0627\u0644\u064A\u0641 \u0627\u0644\u062A\u0635\u0646\u064A\u0639 \u063A\u064A\u0631 \u0627\u0644\u0645\u0628\u0627\u0634\u0631\u0629", account_type: "expense", account_subtype: "cost_of_goods", parent_code: "5000", is_system: false },
  { code: "5400", name: "Purchase Discounts", name_ar: "\u062E\u0635\u0648\u0645\u0627\u062A \u0627\u0644\u0645\u0634\u062A\u0631\u064A\u0627\u062A", account_type: "expense", account_subtype: "cost_of_goods", parent_code: "5000", is_system: true },
  { code: "5500", name: "Purchase Returns", name_ar: "\u0645\u0631\u062F\u0648\u062F\u0627\u062A \u0627\u0644\u0645\u0634\u062A\u0631\u064A\u0627\u062A", account_type: "expense", account_subtype: "cost_of_goods", parent_code: "5000", is_system: true },
  // Project Costs (تكاليف المشاريع)
  { code: "5600", name: "Project Costs", name_ar: "\u062A\u0643\u0627\u0644\u064A\u0641 \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639", account_type: "expense", account_subtype: "cost_of_goods", is_system: true },
  { code: "5610", name: "Project Materials", name_ar: "\u0645\u0648\u0627\u062F \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639", account_type: "expense", account_subtype: "cost_of_goods", parent_code: "5600", is_system: false },
  { code: "5620", name: "Project Labor", name_ar: "\u0623\u062C\u0648\u0631 \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639", account_type: "expense", account_subtype: "cost_of_goods", parent_code: "5600", is_system: false },
  { code: "5630", name: "Project Subcontractors", name_ar: "\u0645\u0642\u0627\u0648\u0644\u064A\u0646 \u0645\u0646 \u0627\u0644\u0628\u0627\u0637\u0646", account_type: "expense", account_subtype: "cost_of_goods", parent_code: "5600", is_system: false },
  { code: "5640", name: "Project Equipment Rental", name_ar: "\u0625\u064A\u062C\u0627\u0631 \u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639", account_type: "expense", account_subtype: "cost_of_goods", parent_code: "5600", is_system: false },
  { code: "5650", name: "Project Overhead", name_ar: "\u0645\u0635\u0627\u0631\u064A\u0641 \u063A\u064A\u0631 \u0645\u0628\u0627\u0634\u0631\u0629 \u0644\u0644\u0645\u0634\u0627\u0631\u064A\u0639", account_type: "expense", account_subtype: "cost_of_goods", parent_code: "5600", is_system: false },
  // Operating Expenses (المصروفات التشغيلية)
  { code: "6000", name: "Operating Expenses", name_ar: "\u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0627\u0644\u062A\u0634\u063A\u064A\u0644\u064A\u0629", account_type: "expense", account_subtype: "operating_expense", is_system: true },
  { code: "6100", name: "Salaries & Wages", name_ar: "\u0627\u0644\u0631\u0648\u0627\u062A\u0628 \u0648\u0627\u0644\u0623\u062C\u0648\u0631", account_type: "expense", account_subtype: "salary_expense", parent_code: "6000", is_system: true },
  { code: "6110", name: "Employee Salaries", name_ar: "\u0631\u0648\u0627\u062A\u0628 \u0627\u0644\u0645\u0648\u0638\u0641\u064A\u0646", account_type: "expense", account_subtype: "salary_expense", parent_code: "6100", is_system: false },
  { code: "6120", name: "Employee Benefits", name_ar: "\u0645\u0632\u0627\u064A\u0627 \u0627\u0644\u0645\u0648\u0638\u0641\u064A\u0646", account_type: "expense", account_subtype: "salary_expense", parent_code: "6100", is_system: false },
  { code: "6130", name: "Social Insurance", name_ar: "\u0627\u0644\u062A\u0623\u0645\u064A\u0646\u0627\u062A \u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639\u064A\u0629", account_type: "expense", account_subtype: "salary_expense", parent_code: "6100", is_system: false },
  { code: "6200", name: "Rent Expense", name_ar: "\u0645\u0635\u0631\u0648\u0641 \u0627\u0644\u0625\u064A\u062C\u0627\u0631", account_type: "expense", account_subtype: "rent_expense", parent_code: "6000", is_system: true },
  { code: "6300", name: "Utilities Expense", name_ar: "\u0645\u0635\u0631\u0648\u0641 \u0627\u0644\u062E\u062F\u0645\u0627\u062A", account_type: "expense", account_subtype: "utility_expense", parent_code: "6000", is_system: true },
  { code: "6310", name: "Electricity", name_ar: "\u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0621", account_type: "expense", account_subtype: "utility_expense", parent_code: "6300", is_system: false },
  { code: "6320", name: "Water", name_ar: "\u0627\u0644\u0645\u064A\u0627\u0647", account_type: "expense", account_subtype: "utility_expense", parent_code: "6300", is_system: false },
  { code: "6330", name: "Internet & Phone", name_ar: "\u0627\u0644\u0625\u0646\u062A\u0631\u0646\u062A \u0648\u0627\u0644\u0647\u0627\u062A\u0641", account_type: "expense", account_subtype: "utility_expense", parent_code: "6300", is_system: false },
  { code: "6400", name: "Office Supplies", name_ar: "\u0627\u0644\u0644\u0648\u0627\u0632\u0645 \u0627\u0644\u0645\u0643\u062A\u0628\u064A\u0629", account_type: "expense", account_subtype: "operating_expense", parent_code: "6000", is_system: false },
  { code: "6500", name: "Insurance Expense", name_ar: "\u0645\u0635\u0631\u0648\u0641 \u0627\u0644\u062A\u0623\u0645\u064A\u0646", account_type: "expense", account_subtype: "operating_expense", parent_code: "6000", is_system: false },
  { code: "6600", name: "Depreciation Expense", name_ar: "\u0645\u0635\u0631\u0648\u0641 \u0627\u0644\u0625\u0647\u0644\u0627\u0643", account_type: "expense", account_subtype: "operating_expense", parent_code: "6000", is_system: true },
  { code: "6700", name: "Advertising & Marketing", name_ar: "\u0627\u0644\u0625\u0639\u0644\u0627\u0646 \u0648\u0627\u0644\u062A\u0633\u0648\u064A\u0642", account_type: "expense", account_subtype: "operating_expense", parent_code: "6000", is_system: false },
  { code: "6800", name: "Professional Fees", name_ar: "\u0623\u062A\u0639\u0627\u0628 \u0645\u0647\u0646\u064A\u0629", account_type: "expense", account_subtype: "operating_expense", parent_code: "6000", is_system: false },
  { code: "6810", name: "Legal Fees", name_ar: "\u0623\u062A\u0639\u0627\u0628 \u0642\u0627\u0646\u0648\u0646\u064A\u0629", account_type: "expense", account_subtype: "operating_expense", parent_code: "6800", is_system: false },
  { code: "6820", name: "Accounting Fees", name_ar: "\u0623\u062A\u0639\u0627\u0628 \u0645\u062D\u0627\u0633\u0628\u064A\u0629", account_type: "expense", account_subtype: "operating_expense", parent_code: "6800", is_system: false },
  { code: "6900", name: "Travel & Transportation", name_ar: "\u0627\u0644\u0633\u0641\u0631 \u0648\u0627\u0644\u0645\u0648\u0627\u0635\u0644\u0627\u062A", account_type: "expense", account_subtype: "operating_expense", parent_code: "6000", is_system: false },
  // Administrative Expenses
  { code: "7000", name: "Administrative Expenses", name_ar: "\u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0627\u0644\u0625\u062F\u0627\u0631\u064A\u0629", account_type: "expense", account_subtype: "operating_expense", is_system: true },
  { code: "7100", name: "Bank Charges", name_ar: "\u0639\u0645\u0648\u0644\u0627\u062A \u0628\u0646\u0643\u064A\u0629", account_type: "expense", account_subtype: "other_expense", parent_code: "7000", is_system: true },
  { code: "7200", name: "Interest Expense", name_ar: "\u0645\u0635\u0631\u0648\u0641 \u0627\u0644\u0641\u0648\u0627\u0626\u062F", account_type: "expense", account_subtype: "other_expense", parent_code: "7000", is_system: true },
  { code: "7300", name: "Bad Debt Expense", name_ar: "\u0645\u0635\u0631\u0648\u0641 \u0627\u0644\u062F\u064A\u0648\u0646 \u0627\u0644\u0645\u0639\u062F\u0648\u0645\u0629", account_type: "expense", account_subtype: "other_expense", parent_code: "7000", is_system: true },
  { code: "7400", name: "Loss on Asset Sale", name_ar: "\u062E\u0633\u0627\u0626\u0631 \u0628\u064A\u0639 \u0627\u0644\u0623\u0635\u0648\u0644", account_type: "expense", account_subtype: "other_expense", parent_code: "7000", is_system: false },
  { code: "7500", name: "Foreign Exchange Loss", name_ar: "\u062E\u0633\u0627\u0626\u0631 \u062A\u062D\u0648\u064A\u0644 \u0627\u0644\u0639\u0645\u0644\u0627\u062A", account_type: "expense", account_subtype: "other_expense", parent_code: "7000", is_system: true },
  { code: "7600", name: "Miscellaneous Expense", name_ar: "\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0645\u062A\u0646\u0648\u0639\u0629", account_type: "expense", account_subtype: "other_expense", parent_code: "7000", is_system: false },
  // Tax Expenses
  { code: "8000", name: "Tax Expenses", name_ar: "\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0627\u0644\u0636\u0631\u0627\u0626\u0628", account_type: "expense", account_subtype: "other_expense", is_system: true },
  { code: "8100", name: "Corporate Tax", name_ar: "\u0636\u0631\u064A\u0628\u0629 \u0627\u0644\u0634\u0631\u0643\u0627\u062A", account_type: "expense", account_subtype: "other_expense", parent_code: "8000", is_system: false },
  { code: "8200", name: "Withholding Tax", name_ar: "\u0636\u0631\u064A\u0628\u0629 \u0627\u0644\u062E\u0635\u0645 \u0648\u0627\u0644\u0625\u0636\u0627\u0641\u0629", account_type: "expense", account_subtype: "other_expense", parent_code: "8000", is_system: false },
  { code: "8300", name: "Zakat", name_ar: "\u0627\u0644\u0632\u0643\u0627\u0629", account_type: "expense", account_subtype: "other_expense", parent_code: "8000", is_system: false },
  { code: "8400", name: "Municipal Tax", name_ar: "\u0631\u0633\u0648\u0645 \u0627\u0644\u0628\u0644\u062F\u064A\u0629", account_type: "expense", account_subtype: "other_expense", parent_code: "8000", is_system: false },
  { code: "8500", name: "Customs Duties", name_ar: "\u0627\u0644\u0631\u0633\u0648\u0645 \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629", account_type: "expense", account_subtype: "other_expense", parent_code: "8000", is_system: false }
];
async function createDefaultAccounts(companyId, storage2, existingAccounts = []) {
  const existingCodes = /* @__PURE__ */ new Map();
  for (const acc of existingAccounts) {
    existingCodes.set(acc.code, acc.id);
  }
  const codeToId = new Map(existingCodes);
  const sortedAccounts = [...DEFAULT_ACCOUNTS].sort((a, b) => a.code.localeCompare(b.code));
  let created = 0;
  let skipped = 0;
  for (const account of sortedAccounts) {
    if (existingCodes.has(account.code)) {
      skipped++;
      continue;
    }
    const parentId = account.parent_code ? codeToId.get(account.parent_code) : null;
    try {
      const accountData = {
        company_id: companyId,
        code: account.code,
        name: account.name,
        account_type: account.account_type,
        account_subtype: account.account_subtype,
        parent_id: parentId,
        is_system: account.is_system,
        is_active: true,
        description: account.description || null
      };
      if (account.name_ar) {
        accountData.name_ar = account.name_ar;
      }
      const createdAccount = await storage2.createAccount(accountData);
      codeToId.set(account.code, createdAccount.id);
      created++;
    } catch (error) {
      console.error(`Failed to create account ${account.code}:`, error);
      skipped++;
    }
  }
  console.log(`Created ${created} default accounts for company ${companyId}, skipped ${skipped}`);
  return { created, skipped };
}

// server/routes/accounting.ts
init_db();
import { eq as eq10, sql as sql8 } from "drizzle-orm";
var router5 = Router5();
router5.get("/accounts", requireAuth2, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const includeBalances = req.query.include_balances === "true";
    const accountsList = await storage.getAccountsByCompany(companyId);
    if (includeBalances && accountsList.length > 0) {
      const balances = await db.select({
        accountId: journal_lines.account_id,
        debit: sql8`COALESCE(SUM(${journal_lines.debit}), 0)`,
        credit: sql8`COALESCE(SUM(${journal_lines.credit}), 0)`
      }).from(journal_lines).innerJoin(journals, eq10(journal_lines.journal_id, journals.id)).where(eq10(journals.company_id, companyId)).groupBy(journal_lines.account_id);
      const balanceMap = /* @__PURE__ */ new Map();
      balances.forEach((b) => {
        balanceMap.set(b.accountId, {
          debit: parseFloat(b.debit || "0"),
          credit: parseFloat(b.credit || "0")
        });
      });
      const accountsWithBalances = accountsList.map((acc) => {
        const bal = balanceMap.get(acc.id) || { debit: 0, credit: 0 };
        const normalDebitTypes = ["asset", "expense"];
        const balance = normalDebitTypes.includes(acc.account_type) ? bal.debit - bal.credit : bal.credit - bal.debit;
        return {
          ...acc,
          debit: bal.debit,
          credit: bal.credit,
          balance
        };
      });
      return res.json(accountsWithBalances);
    }
    res.json(accountsList);
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return serverError(res, "Failed to fetch accounts");
  }
});
router5.post("/accounts/initialize-defaults", requireAuth2, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const existingAccounts = await storage.getAccountsByCompany(companyId);
    const existingCodesMap = existingAccounts.map((a) => ({ code: a.code, id: a.id }));
    const result = await createDefaultAccounts(companyId, storage, existingCodesMap);
    const allAccounts = await storage.getAccountsByCompany(companyId);
    res.status(201).json({
      message: `\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 ${result.created} \u062D\u0633\u0627\u0628 \u062C\u062F\u064A\u062F${result.skipped > 0 ? ` (\u062A\u0645 \u062A\u062E\u0637\u064A ${result.skipped} \u062D\u0633\u0627\u0628 \u0645\u0648\u062C\u0648\u062F)` : ""}`,
      created: result.created,
      skipped: result.skipped,
      accounts: allAccounts
    });
  } catch (error) {
    console.error("Error initializing default accounts:", error);
    return serverError(res, "Failed to initialize default accounts");
  }
});
router5.post("/accounts/update-arabic-names", requireAuth2, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const existingAccounts = await storage.getAccountsByCompany(companyId);
    const codeToArabicName = /* @__PURE__ */ new Map();
    for (const acc of DEFAULT_ACCOUNTS) {
      codeToArabicName.set(acc.code, acc.name_ar);
    }
    let updated = 0;
    for (const account of existingAccounts) {
      const arabicName = codeToArabicName.get(account.code);
      if (arabicName && (!account.name_ar || account.name_ar !== arabicName)) {
        try {
          await storage.updateAccount(account.id, { name_ar: arabicName });
          updated++;
        } catch (error) {
          console.error(`Failed to update Arabic name for account ${account.code}:`, error);
        }
      }
    }
    const updatedAccounts = await storage.getAccountsByCompany(companyId);
    res.json({
      message: `\u062A\u0645 \u062A\u062D\u062F\u064A\u062B ${updated} \u062D\u0633\u0627\u0628 \u0628\u0627\u0644\u0623\u0633\u0645\u0627\u0621 \u0627\u0644\u0639\u0631\u0628\u064A\u0629`,
      updated,
      accounts: updatedAccounts
    });
  } catch (error) {
    console.error("Error updating Arabic names:", error);
    return serverError(res, "Failed to update Arabic names");
  }
});
router5.post("/accounts", requireAuth2, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const validatedData = insertAccountSchema.parse({
      ...req.body,
      company_id: companyId
    });
    const account = await storage.createAccount(validatedData);
    const userId = req.session.userId;
    await logCreate({
      companyId,
      entityType: "account",
      entityId: account.id,
      createdData: { code: account.code, name: account.name, account_type: account.account_type },
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.status(201).json(account);
  } catch (error) {
    if (error.name === "ZodError") {
      const validationError = fromZodError5(error);
      return badRequest(res, validationError.message);
    } else {
      console.error("Error creating account:", error);
      return serverError(res, "Failed to create account");
    }
  }
});
router5.put("/accounts/:id", requireAuth2, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const oldAccount = await storage.getAccountById(req.params.id);
    const account = await storage.updateAccount(req.params.id, req.body);
    if (!account) return notFound(res, "Account not found");
    await logUpdate({
      companyId,
      entityType: "account",
      entityId: account.id,
      oldData: oldAccount || {},
      newData: req.body,
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json(account);
  } catch (error) {
    console.error("Error updating account:", error);
    return serverError(res, "Failed to update account");
  }
});
router5.delete("/accounts/:id", requireAuth2, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const account = await storage.getAccountById(req.params.id);
    const success = await storage.deleteAccount(req.params.id);
    if (!success) return notFound(res, "Account not found");
    await logDelete({
      companyId,
      entityType: "account",
      entityId: req.params.id,
      deletedData: account ? { code: account.code, name: account.name } : {},
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    return serverError(res, "Failed to delete account");
  }
});
router5.get("/accounts/:id/ledger", requireAuth2, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const accountId = req.params.id;
    const startDate = req.query.start_date ? new Date(req.query.start_date) : null;
    const endDate = req.query.end_date ? new Date(req.query.end_date) : null;
    const account = await storage.getAccountById(accountId);
    if (!account || account.company_id !== companyId) {
      return notFound(res, "Account not found");
    }
    const entries = await storage.getAccountLedger(accountId, startDate, endDate);
    let openingBalance = 0;
    if (startDate) {
      openingBalance = await storage.getAccountBalanceBeforeDate(accountId, startDate);
    }
    let runningBalance = openingBalance;
    const entriesWithBalance = entries.map((entry) => {
      const debit = parseFloat(entry.debit_amount || "0");
      const credit = parseFloat(entry.credit_amount || "0");
      runningBalance = runningBalance + debit - credit;
      return {
        id: entry.id,
        date: entry.journal_date || entry.created_at,
        journal_number: entry.journal_number,
        description: entry.description || entry.journal_description,
        reference: entry.reference,
        debit,
        credit,
        balance: runningBalance,
        document_type: entry.document_type,
        document_id: entry.document_id
      };
    });
    res.json({
      entries: entriesWithBalance,
      opening_balance: openingBalance
    });
  } catch (error) {
    console.error("Error fetching account ledger:", error);
    return serverError(res, "Failed to fetch account ledger");
  }
});
router5.get("/reports/balance-sheet", requireAuth2, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const endDate = req.query.date ? new Date(req.query.date) : /* @__PURE__ */ new Date();
    const cacheKey = `report:${companyId}:balance-sheet:${endDate.toISOString().split("T")[0]}`;
    const cached = await getCache2(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    const data = await storage.getBalanceSheet(companyId, endDate);
    await setCache2(cacheKey, data, 3600);
    res.json(data);
  } catch (error) {
    console.error("Error generating balance sheet:", error);
    return serverError(res, "Failed to generate balance sheet");
  }
});
router5.get("/reports/profit-loss", requireAuth2, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const startDate = req.query.start_date ? new Date(req.query.start_date) : void 0;
    const endDate = req.query.end_date ? new Date(req.query.end_date) : /* @__PURE__ */ new Date();
    const startStr = startDate ? startDate.toISOString().split("T")[0] : "all";
    const endStr = endDate.toISOString().split("T")[0];
    const cacheKey = `report:${companyId}:profit-loss:${startStr}:${endStr}`;
    const cached = await getCache2(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    const data = await storage.getProfitLoss(companyId, startDate, endDate);
    await setCache2(cacheKey, data, 3600);
    res.json(data);
  } catch (error) {
    console.error("Error generating profit & loss:", error);
    return serverError(res, "Failed to generate profit & loss");
  }
});
router5.get("/reports/cash-flow", requireAuth2, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const startDate = req.query.start_date ? new Date(req.query.start_date) : void 0;
    const endDate = req.query.end_date ? new Date(req.query.end_date) : /* @__PURE__ */ new Date();
    const data = await storage.getCashFlow(companyId, startDate, endDate);
    res.json(data);
  } catch (error) {
    console.error("Error generating cash flow:", error);
    return serverError(res, "Failed to generate cash flow");
  }
});
router5.get("/reports/trial-balance", requireAuth2, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const endDate = req.query.date ? new Date(req.query.date) : /* @__PURE__ */ new Date();
    const data = await storage.getTrialBalance(companyId, endDate);
    res.json(data);
  } catch (error) {
    console.error("Error generating trial balance:", error);
    return serverError(res, "Failed to generate trial balance");
  }
});
router5.get("/reports/tax", requireAuth2, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const startDate = req.query.startDate ? new Date(req.query.startDate) : void 0;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : /* @__PURE__ */ new Date();
    const filters = {
      customerId: req.query.customerId,
      vendorId: req.query.vendorId,
      currency: req.query.currency,
      warehouseId: req.query.warehouseId
    };
    const data = await storage.getTaxReport(companyId, startDate, endDate, filters);
    res.json(data);
  } catch (error) {
    console.error("Error generating tax report:", error);
    return serverError(res, "Failed to generate tax report");
  }
});
router5.get("/insights", requireAuth2, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const enableAI = req.query.ai === "true";
    const insights = await getFinancialInsights(companyId, enableAI);
    res.json(insights);
  } catch (error) {
    console.error("Error fetching insights:", error);
    serverError(res, `Failed to fetch financial insights: ${error.message}`);
  }
});
var accounting_default = router5;

// server/routes/sales.ts
import { Router as Router6 } from "express";
init_schema();
init_permissions();
init_sendError();
import { fromZodError as fromZodError6 } from "zod-validation-error";

// server/utils/paymentAllocation.ts
init_db();
init_schema();
import { eq as eq11, and as and8, sum as sum3, sql as sql9, desc as desc4 } from "drizzle-orm";
async function allocatePayment(allocation, tx) {
  const dbConnection = tx || db;
  const inserted = await dbConnection.insert(payment_allocations).values({
    company_id: allocation.company_id,
    payment_type: allocation.payment_type,
    payment_id: allocation.payment_id,
    document_type: allocation.document_type,
    document_id: allocation.document_id,
    allocated_amount: allocation.allocated_amount.toString(),
    created_by: allocation.created_by
  }).returning({ id: payment_allocations.id });
  await updateDocumentPaymentStatus(
    allocation.document_type,
    allocation.document_id,
    dbConnection
  );
  return { id: inserted?.[0]?.id };
}
async function getTotalAllocated(documentType, documentId) {
  const result = await db.select({
    total: sum3(payment_allocations.allocated_amount)
  }).from(payment_allocations).where(
    and8(
      eq11(payment_allocations.document_type, documentType),
      eq11(payment_allocations.document_id, documentId)
    )
  );
  const total = result[0]?.total;
  return total ? parseFloat(total.toString()) : 0;
}
async function updateDocumentPaymentStatus(documentType, documentId, tx) {
  const totalAllocated = await getTotalAllocated(documentType, documentId);
  const table = documentType === "invoice" ? sales_invoices : bills;
  const [document] = await tx.select().from(table).where(eq11(table.id, documentId)).limit(1);
  if (!document) return;
  const totalAmount = parseFloat(document.total.toString());
  const dueDate = document.due_date ? new Date(document.due_date) : null;
  const now = /* @__PURE__ */ new Date();
  const epsilon = 0.01;
  let newStatus;
  if (totalAllocated >= totalAmount - epsilon) {
    newStatus = "paid";
  } else if (totalAllocated > epsilon) {
    newStatus = "partially_paid";
  } else {
    if (documentType === "invoice") {
      if (document.status === "draft") {
        newStatus = "draft";
      } else if (dueDate && dueDate.getTime() < now.getTime()) {
        newStatus = "overdue";
      } else {
        newStatus = "sent";
      }
    } else {
      if (document.status === "draft") {
        newStatus = "draft";
      } else if (dueDate && dueDate.getTime() < now.getTime()) {
        newStatus = "overdue";
      } else {
        newStatus = "pending";
      }
    }
  }
  await tx.update(table).set({
    status: newStatus,
    paid_amount: (totalAllocated > totalAmount ? totalAmount : totalAllocated).toString(),
    updated_at: /* @__PURE__ */ new Date()
  }).where(eq11(table.id, documentId));
}
async function getDocumentAllocations(documentType, documentId) {
  const allocations = await db.select().from(payment_allocations).where(
    and8(
      eq11(payment_allocations.document_type, documentType),
      eq11(payment_allocations.document_id, documentId)
    )
  ).orderBy(sql9`${payment_allocations.allocation_date} DESC`);
  const enriched = [];
  for (const allocation of allocations) {
    let paymentDetails = null;
    if (allocation.payment_type === "receipt") {
      const [receipt] = await db.select().from(receipts).where(eq11(receipts.id, allocation.payment_id)).limit(1);
      paymentDetails = receipt;
    } else {
      const [payment] = await db.select().from(payments).where(eq11(payments.id, allocation.payment_id)).limit(1);
      paymentDetails = payment;
    }
    enriched.push({
      ...allocation,
      payment_details: paymentDetails
    });
  }
  return enriched;
}
async function getUnallocatedAmount(paymentType, paymentId) {
  const table = paymentType === "receipt" ? receipts : payments;
  const [payment] = await db.select().from(table).where(eq11(table.id, paymentId)).limit(1);
  if (!payment) return 0;
  const paymentAmount = parseFloat(payment.amount.toString());
  const result = await db.select({
    total: sum3(payment_allocations.allocated_amount)
  }).from(payment_allocations).where(
    and8(
      eq11(payment_allocations.payment_type, paymentType),
      eq11(payment_allocations.payment_id, paymentId)
    )
  );
  const totalAllocated = result[0]?.total ? parseFloat(result[0].total.toString()) : 0;
  return paymentAmount - totalAllocated;
}
async function deletePaymentAllocation(allocationId) {
  const [allocation] = await db.select().from(payment_allocations).where(eq11(payment_allocations.id, allocationId)).limit(1);
  if (!allocation) return;
  await db.delete(payment_allocations).where(eq11(payment_allocations.id, allocationId));
  await updateDocumentPaymentStatus(
    allocation.document_type,
    allocation.document_id,
    db
  );
}
async function getAllocationById(allocationId) {
  const [row] = await db.select({
    id: payment_allocations.id,
    company_id: payment_allocations.company_id,
    document_type: payment_allocations.document_type,
    document_id: payment_allocations.document_id
  }).from(payment_allocations).where(eq11(payment_allocations.id, allocationId)).limit(1);
  return row || null;
}
async function getRecentAllocations(companyId, limit = 20) {
  const rows = await db.select().from(payment_allocations).where(eq11(payment_allocations.company_id, companyId)).orderBy(desc4(payment_allocations.allocation_date)).limit(limit);
  const enriched = [];
  for (const row of rows) {
    let paymentDetails = null;
    let documentDetails = null;
    if (row.payment_type === "receipt") {
      const [receipt] = await db.select({
        id: receipts.id,
        company_id: receipts.company_id,
        receipt_number: receipts.receipt_number,
        customer_id: receipts.customer_id,
        customer_name: receipts.customer_name,
        date: receipts.date,
        amount: receipts.amount,
        payment_method: receipts.payment_method,
        reference: receipts.reference,
        description: receipts.description,
        bank_account_id: receipts.bank_account_id,
        status: receipts.status,
        currency: receipts.currency,
        fx_rate: receipts.fx_rate,
        journal_id: receipts.journal_id,
        created_by: receipts.created_by,
        created_at: receipts.created_at,
        updated_at: receipts.updated_at
      }).from(receipts).where(eq11(receipts.id, row.payment_id)).limit(1);
      paymentDetails = receipt;
    } else {
      const [payment] = await db.select({
        id: payments.id,
        company_id: payments.company_id,
        payment_number: payments.payment_number,
        vendor_id: payments.vendor_id,
        vendor_name: payments.vendor_name,
        date: payments.date,
        amount: payments.amount,
        payment_method: payments.payment_method,
        reference: payments.reference,
        description: payments.description,
        bank_account_id: payments.bank_account_id,
        status: payments.status,
        currency: payments.currency,
        fx_rate: payments.fx_rate,
        journal_id: payments.journal_id,
        created_by: payments.created_by,
        created_at: payments.created_at,
        updated_at: payments.updated_at
      }).from(payments).where(eq11(payments.id, row.payment_id)).limit(1);
      paymentDetails = payment;
    }
    if (row.document_type === "invoice") {
      const [inv] = await db.select().from(sales_invoices).where(eq11(sales_invoices.id, row.document_id)).limit(1);
      documentDetails = inv;
    } else {
      const [bill] = await db.select().from(bills).where(eq11(bills.id, row.document_id)).limit(1);
      documentDetails = bill;
    }
    enriched.push({
      ...row,
      payment_details: paymentDetails,
      document_details: documentDetails
    });
  }
  return enriched;
}

// server/utils/documentSequence.ts
init_db();
init_schema();
import { eq as eq12, and as and9 } from "drizzle-orm";
var documentConfigs = {
  invoice: { prefix: "INV", padLength: 5 },
  bill: { prefix: "BILL", padLength: 5 },
  quote: { prefix: "QT", padLength: 5 },
  order: { prefix: "SO", padLength: 5 },
  payment: { prefix: "PAY", padLength: 5 },
  receipt: { prefix: "RCPT", padLength: 5 },
  expense: { prefix: "EXP", padLength: 5 },
  credit_note: { prefix: "CN", padLength: 5 },
  debit_note: { prefix: "DN", padLength: 5 },
  journal: { prefix: "JE", padLength: 5 }
};
async function getNextDocumentNumber(companyId, documentType, customPrefix) {
  const [company] = await db.select().from(companies).where(eq12(companies.id, companyId)).limit(1);
  if (!company) {
    throw new Error("Company not found");
  }
  const currentDate = /* @__PURE__ */ new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const fiscalYearStart = company.fiscal_year_start || 1;
  let fiscalYear = currentYear;
  if (currentMonth < fiscalYearStart) {
    fiscalYear = currentYear - 1;
  }
  const config = documentConfigs[documentType];
  const prefix = customPrefix || config.prefix;
  const [existingSeq] = await db.select().from(document_sequences).where(
    and9(
      eq12(document_sequences.company_id, companyId),
      eq12(document_sequences.document_type, documentType),
      eq12(document_sequences.fiscal_year, fiscalYear)
    )
  ).limit(1);
  let nextNumber;
  if (existingSeq) {
    nextNumber = existingSeq.next_number;
    await db.update(document_sequences).set({
      next_number: nextNumber + 1,
      updated_at: /* @__PURE__ */ new Date()
    }).where(eq12(document_sequences.id, existingSeq.id));
  } else {
    nextNumber = 1;
    await db.insert(document_sequences).values({
      company_id: companyId,
      document_type: documentType,
      prefix,
      next_number: 2,
      // Next call will get 2
      fiscal_year: fiscalYear
    });
  }
  const paddedNumber = String(nextNumber).padStart(config.padLength, "0");
  return `${prefix}-${fiscalYear}-${paddedNumber}`;
}

// server/utils/journalEntry.ts
init_db();
init_schema();
import { eq as eq13 } from "drizzle-orm";
async function createJournalEntry(input) {
  const totalDebits = input.lines.reduce((sum8, line) => sum8 + line.debit, 0);
  const totalCredits = input.lines.reduce((sum8, line) => sum8 + line.credit, 0);
  const epsilon = 0.01;
  if (Math.abs(totalDebits - totalCredits) > epsilon) {
    throw new Error(
      `Journal entry must balance: Debits=${totalDebits.toFixed(2)}, Credits=${totalCredits.toFixed(2)}`
    );
  }
  const journalNumber = await getNextDocumentNumber(
    input.company_id,
    "payment",
    // Using payment as journal type
    "JE"
  );
  const currency = input.currency || "USD";
  const fxRate = input.fx_rate || 1;
  const [journal] = await db.insert(journals).values({
    company_id: input.company_id,
    journal_number: journalNumber,
    date: input.date,
    source_type: input.source_type || "manual",
    source_id: input.source_id,
    description: input.description,
    total_amount: totalDebits.toString(),
    created_by: input.created_by
  }).returning();
  const lineValues = input.lines.map((line, index2) => ({
    journal_id: journal.id,
    line_number: index2 + 1,
    account_id: line.account_id,
    debit: line.debit.toString(),
    credit: line.credit.toString(),
    description: line.description || input.description,
    currency,
    fx_rate: fxRate.toString(),
    base_debit: (line.debit * fxRate).toString(),
    base_credit: (line.credit * fxRate).toString(),
    project_id: line.project_id
  }));
  await db.insert(journal_lines).values(lineValues);
  return { id: journal.id, journal_number: journalNumber };
}
async function createInvoiceJournalEntry(companyId, invoiceId, customerId, invoiceNumber, subtotal, taxTotal, total, date, userId, currency = "USD", fxRate = 1, invoiceLines) {
  try {
    const accountsList = await db.select().from(accounts).where(eq13(accounts.company_id, companyId));
    const arAccount = accountsList.find(
      (a) => a.account_subtype === "accounts_receivable" || a.code === "1200"
    );
    const revenueAccount = accountsList.find(
      (a) => a.account_subtype === "sales_revenue" || a.code === "4000"
    );
    const taxPayableAccount = accountsList.find(
      (a) => a.account_type === "liability" && a.name.toLowerCase().includes("tax")
    );
    if (!arAccount || !revenueAccount) {
      console.warn("Missing default accounts for invoice journal entry");
      return null;
    }
    const lines = [
      {
        account_id: arAccount.id,
        debit: total,
        credit: 0,
        description: `Invoice ${invoiceNumber} - Customer Receivable`
      }
    ];
    if (invoiceLines && invoiceLines.length > 0) {
      for (const line of invoiceLines) {
        const lineAmount = parseFloat(line.amount || line.line_total || 0);
        if (lineAmount > 0) {
          lines.push({
            account_id: revenueAccount.id,
            // Could be overridden per line if we had item accounts
            debit: 0,
            credit: lineAmount,
            description: `Invoice ${invoiceNumber} - ${line.description}`,
            project_id: line.project_id
          });
        }
      }
    } else {
      lines.push({
        account_id: revenueAccount.id,
        debit: 0,
        credit: subtotal,
        description: `Invoice ${invoiceNumber} - Sales Revenue`
      });
    }
    if (taxTotal > 0 && taxPayableAccount) {
      lines.push({
        account_id: taxPayableAccount.id,
        debit: 0,
        credit: taxTotal,
        description: `Invoice ${invoiceNumber} - Tax Payable`
      });
    }
    return await createJournalEntry({
      company_id: companyId,
      date,
      source_type: "invoice",
      source_id: invoiceId,
      description: `Sales Invoice ${invoiceNumber}`,
      lines,
      created_by: userId,
      currency,
      fx_rate: fxRate
    });
  } catch (error) {
    console.error("Error creating invoice journal entry:", error);
    return null;
  }
}
async function createBillJournalEntry(companyId, billId, vendorId, billNumber, subtotal, taxTotal, total, date, userId, currency = "USD", fxRate = 1, projectId) {
  try {
    const accountsList = await db.select().from(accounts).where(eq13(accounts.company_id, companyId));
    const apAccount = accountsList.find(
      (a) => a.account_subtype === "accounts_payable" || a.code === "2100"
    );
    const expenseAccount = accountsList.find(
      (a) => a.account_subtype === "operating_expense" || a.code === "5000"
    );
    const taxReceivableAccount = accountsList.find(
      (a) => a.account_type === "asset" && a.name.toLowerCase().includes("tax")
    );
    if (!apAccount || !expenseAccount) {
      console.warn("Missing default accounts for bill journal entry");
      return null;
    }
    const lines = [
      {
        account_id: expenseAccount.id,
        debit: subtotal,
        credit: 0,
        description: `Bill ${billNumber} - Purchase Expense`,
        project_id: projectId
      }
    ];
    if (taxTotal > 0 && taxReceivableAccount) {
      lines.push({
        account_id: taxReceivableAccount.id,
        debit: taxTotal,
        credit: 0,
        description: `Bill ${billNumber} - Input Tax`
      });
    }
    lines.push({
      account_id: apAccount.id,
      debit: 0,
      credit: total,
      description: `Bill ${billNumber} - Accounts Payable`
    });
    return await createJournalEntry({
      company_id: companyId,
      date,
      source_type: "bill",
      source_id: billId,
      description: `Purchase Bill ${billNumber}`,
      lines,
      created_by: userId,
      currency,
      fx_rate: fxRate
    });
  } catch (error) {
    console.error("Error creating bill journal entry:", error);
    return null;
  }
}
async function createReceiptJournalEntry(companyId, receiptId, receiptNumber, amount, bankAccountId, date, userId, currency = "USD", fxRate = 1) {
  try {
    const accountsList = await db.select().from(accounts).where(eq13(accounts.company_id, companyId));
    const arAccount = accountsList.find(
      (a) => a.account_subtype === "accounts_receivable"
    );
    const cashAccount = accountsList.find(
      (a) => a.account_subtype === "cash" || a.code === "1100"
    );
    if (!arAccount || !cashAccount) {
      console.warn("Missing default accounts for receipt journal entry");
      return null;
    }
    const lines = [
      {
        account_id: cashAccount.id,
        debit: amount,
        credit: 0,
        description: `Receipt ${receiptNumber} - Cash Received`
      },
      {
        account_id: arAccount.id,
        debit: 0,
        credit: amount,
        description: `Receipt ${receiptNumber} - Reduce Receivable`
      }
    ];
    return await createJournalEntry({
      company_id: companyId,
      date,
      source_type: "receipt",
      source_id: receiptId,
      description: `Customer Receipt ${receiptNumber}`,
      lines,
      created_by: userId,
      currency,
      fx_rate: fxRate
    });
  } catch (error) {
    console.error("Error creating receipt journal entry:", error);
    return null;
  }
}
async function createPaymentJournalEntry(companyId, paymentId, paymentNumber, amount, bankAccountId, date, userId, currency = "USD", fxRate = 1) {
  try {
    const accountsList = await db.select().from(accounts).where(eq13(accounts.company_id, companyId));
    const apAccount = accountsList.find(
      (a) => a.account_subtype === "accounts_payable"
    );
    const cashAccount = accountsList.find(
      (a) => a.account_subtype === "cash" || a.code === "1100"
    );
    if (!apAccount || !cashAccount) {
      console.warn("Missing default accounts for payment journal entry");
      return null;
    }
    const lines = [
      {
        account_id: apAccount.id,
        debit: amount,
        credit: 0,
        description: `Payment ${paymentNumber} - Reduce Payable`
      },
      {
        account_id: cashAccount.id,
        debit: 0,
        credit: amount,
        description: `Payment ${paymentNumber} - Cash Paid`
      }
    ];
    return await createJournalEntry({
      company_id: companyId,
      date,
      source_type: "payment",
      source_id: paymentId,
      description: `Vendor Payment ${paymentNumber}`,
      lines,
      created_by: userId,
      currency,
      fx_rate: fxRate
    });
  } catch (error) {
    console.error("Error creating payment journal entry:", error);
    return null;
  }
}
async function getJournalLines(journalId) {
  return await db.select().from(journal_lines).where(eq13(journal_lines.journal_id, journalId));
}
async function reverseJournalEntry(journalId, reversalDate, reason, userId) {
  const [journal] = await db.select().from(journals).where(eq13(journals.id, journalId)).limit(1);
  if (!journal) {
    throw new Error("Journal entry not found");
  }
  const lines = await getJournalLines(journalId);
  const reversedLines = lines.map((line) => ({
    account_id: line.account_id,
    debit: parseFloat(line.credit),
    credit: parseFloat(line.debit),
    description: `Reversal: ${line.description}`
  }));
  return await createJournalEntry({
    company_id: journal.company_id,
    date: reversalDate,
    source_type: "reversal",
    source_id: journalId,
    description: `Reversal of ${journal.journal_number}: ${reason}`,
    lines: reversedLines,
    created_by: userId
  });
}

// server/utils/currency.ts
init_db();
init_schema();
import { eq as eq14, and as and11, desc as desc5, lte as lte4 } from "drizzle-orm";
async function seedCurrencies() {
  const defaultCurrencies = [
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "\u20AC" },
    { code: "GBP", name: "British Pound", symbol: "\xA3" },
    { code: "SAR", name: "Saudi Riyal", symbol: "SAR" },
    { code: "AED", name: "UAE Dirham", symbol: "AED" },
    { code: "KWD", name: "Kuwaiti Dinar", symbol: "KWD" },
    { code: "QAR", name: "Qatari Riyal", symbol: "QAR" },
    { code: "BHD", name: "Bahraini Dinar", symbol: "BHD" },
    { code: "OMR", name: "Omani Rial", symbol: "OMR" },
    { code: "JOD", name: "Jordanian Dinar", symbol: "JOD" },
    { code: "EGP", name: "Egyptian Pound", symbol: "EGP" },
    { code: "TRY", name: "Turkish Lira", symbol: "\u20BA" },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
    { code: "AUD", name: "Australian Dollar", symbol: "A$" },
    { code: "JPY", name: "Japanese Yen", symbol: "\xA5" },
    { code: "CNY", name: "Chinese Yuan", symbol: "\xA5" },
    { code: "INR", name: "Indian Rupee", symbol: "\u20B9" }
  ];
  for (const currency of defaultCurrencies) {
    await db.insert(currencies).values(currency).onConflictDoNothing().execute();
  }
}
async function getExchangeRate(companyId, fromCurrency, toCurrency, date = /* @__PURE__ */ new Date()) {
  if (fromCurrency === toCurrency) {
    return 1;
  }
  const rate = await db.select().from(exchange_rates).where(
    and11(
      eq14(exchange_rates.company_id, companyId),
      eq14(exchange_rates.from_currency, fromCurrency),
      eq14(exchange_rates.to_currency, toCurrency),
      lte4(exchange_rates.date, date)
    )
  ).orderBy(desc5(exchange_rates.date)).limit(1);
  if (rate.length > 0) {
    return parseFloat(rate[0].rate);
  }
  const inverseRate = await db.select().from(exchange_rates).where(
    and11(
      eq14(exchange_rates.company_id, companyId),
      eq14(exchange_rates.from_currency, toCurrency),
      eq14(exchange_rates.to_currency, fromCurrency),
      lte4(exchange_rates.date, date)
    )
  ).orderBy(desc5(exchange_rates.date)).limit(1);
  if (inverseRate.length > 0) {
    return 1 / parseFloat(inverseRate[0].rate);
  }
  console.warn(`No exchange rate found for ${fromCurrency} -> ${toCurrency} on ${date}`);
  return 1;
}
async function fetchLiveExchangeRate(fromCurrency, toCurrency) {
  try {
    const response = await fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch rates: ${response.statusText}`);
    }
    const data = await response.json();
    if (data.result !== "success") {
      throw new Error("Failed to fetch rates from API");
    }
    const rate = data.rates[toCurrency];
    if (!rate) {
      throw new Error(`Rate for ${toCurrency} not found`);
    }
    return rate;
  } catch (error) {
    console.error("Error fetching live rate:", error);
    throw error;
  }
}
async function convertCurrency(companyId, amount, fromCurrency, toCurrency, date = /* @__PURE__ */ new Date()) {
  const rate = await getExchangeRate(companyId, fromCurrency, toCurrency, date);
  return amount * rate;
}
async function getCompanyBaseCurrency(companyId) {
  const company = await db.select({ base_currency: companies.base_currency }).from(companies).where(eq14(companies.id, companyId)).limit(1);
  return company[0]?.base_currency || "USD";
}

// server/routes/sales.ts
init_db();
import { eq as eq15, and as and12, inArray } from "drizzle-orm";
var router6 = Router6();
router6.get("/invoices/next-number", requireAuth2, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const invoiceNumber = await getNextDocumentNumber(companyId, "invoice");
    res.json({ invoice_number: invoiceNumber });
  } catch (error) {
    console.error("Error getting next invoice number:", error);
    return serverError(res, "Failed to get next invoice number");
  }
});
router6.get("/invoices", requireAuth2, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const invoices = await storage.getSalesInvoicesByCompany(companyId);
    res.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return serverError(res, "Failed to fetch invoices");
  }
});
router6.post("/invoices", requireAuth2, requirePermission("sales", "create"), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const body = normalize(req.body);
    const now = /* @__PURE__ */ new Date();
    if (!body.invoice_number) {
      body.invoice_number = await getNextDocumentNumber(companyId, "invoice");
    }
    if (body.date) {
      body.date = typeof body.date === "string" ? new Date(body.date) : body.date;
    } else {
      body.date = now;
    }
    if (body.due_date) {
      body.due_date = typeof body.due_date === "string" ? new Date(body.due_date) : body.due_date;
    } else {
      body.due_date = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1e3);
    }
    if (!body.currency) body.currency = "USD";
    if (!body.fx_rate || body.fx_rate === "1") {
      const baseCurrency = await getCompanyBaseCurrency(companyId);
      if (body.currency !== baseCurrency) {
        const rate = await getExchangeRate(companyId, body.currency, baseCurrency, body.date);
        body.fx_rate = rate.toString();
      } else {
        body.fx_rate = "1";
      }
    }
    if (body.subtotal === void 0) body.subtotal = "0";
    if (body.tax_total === void 0) body.tax_total = "0";
    if (body.total === void 0) body.total = "0";
    if (body.paid_amount === void 0) body.paid_amount = "0";
    if (!body.status) body.status = "draft";
    const validatedData = insertSalesInvoiceSchema.parse({
      ...body,
      company_id: companyId,
      created_by: userId
    });
    const invoice = await storage.createSalesInvoice(validatedData);
    if (body.lines && Array.isArray(body.lines)) {
      const linesToInsert = body.lines.map((line, index2) => ({
        document_type: "invoice",
        document_id: invoice.id,
        description: line.description || "Item",
        quantity: (line.quantity || 0).toString(),
        unit_price: (line.unit_price || 0).toString(),
        line_total: (line.amount || 0).toString(),
        tax_amount: ((line.amount || 0) * (line.tax_rate || 0) / 100).toString(),
        line_number: index2 + 1,
        project_id: line.project_id || null
      }));
      if (linesToInsert.length > 0) {
        await db.insert(document_lines).values(linesToInsert);
      }
    }
    try {
      await createInvoiceJournalEntry(
        companyId,
        invoice.id,
        invoice.customer_id,
        invoice.invoice_number,
        parseFloat(invoice.subtotal || "0"),
        parseFloat(invoice.tax_total || "0"),
        parseFloat(invoice.total || "0"),
        invoice.date,
        userId,
        invoice.currency,
        parseFloat(invoice.fx_rate || "1"),
        body.lines
        // Pass lines to journal entry creation
      );
    } catch (journalError) {
      console.error("Failed to create journal entry for invoice:", journalError);
    }
    if (body.lines && Array.isArray(body.lines)) {
      for (const line of body.lines) {
        if (line.item_id && line.warehouse_id) {
          try {
            const [item] = await db.select().from(items).where(eq15(items.id, line.item_id));
            if (item && (item.type === "product" || item.type === "inventory")) {
              await recordStockMovement({
                company_id: companyId,
                item_id: line.item_id,
                warehouse_id: line.warehouse_id,
                transaction_type: "sale",
                transaction_date: new Date(invoice.date),
                quantity: -Math.abs(parseFloat(line.quantity || "0")),
                // Negative for sales (reduces stock)
                unit_cost: parseFloat(line.unit_price || "0"),
                reference_type: "invoice",
                reference_id: invoice.id,
                notes: `Sale - Invoice ${invoice.invoice_number}`,
                created_by: userId
              });
              if (line.tracking_type === "serial" && line.serial_numbers?.length) {
                await db.update(inventory_serials).set({ status: "sold" }).where(and12(
                  eq15(inventory_serials.company_id, companyId),
                  inArray(inventory_serials.id, line.serial_numbers)
                ));
              } else if (line.tracking_type === "batch" && line.batch_id) {
                const [batch] = await db.select().from(inventory_batches).where(and12(
                  eq15(inventory_batches.id, line.batch_id),
                  eq15(inventory_batches.company_id, companyId)
                ));
                if (batch) {
                  const currentQty = parseFloat(batch.quantity || "0");
                  const soldQty = parseFloat(line.quantity || "0");
                  const newQty = Math.max(0, currentQty - soldQty);
                  await db.update(inventory_batches).set({ quantity: String(newQty) }).where(eq15(inventory_batches.id, line.batch_id));
                }
              }
            }
          } catch (stockError) {
            console.error("Failed to record stock movement for line:", stockError);
          }
        }
      }
    }
    await logCreate({
      companyId,
      entityType: "sales_invoice",
      entityId: invoice.id,
      createdData: { invoice_number: invoice.invoice_number, customer_id: invoice.customer_id, total: invoice.total, currency: invoice.currency },
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.status(201).json(invoice);
  } catch (error) {
    if (error.name === "ZodError") {
      const validationError = fromZodError6(error);
      return badRequest(res, validationError.message);
    } else {
      console.error("Error creating invoice:", error);
      return serverError(res, "Failed to create invoice");
    }
  }
});
router6.get("/invoices/:id", requireAuth2, async (req, res) => {
  try {
    const invoice = await storage.getSalesInvoiceById(req.params.id);
    if (!invoice) return notFound(res, "Invoice not found");
    res.json(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return serverError(res, "Failed to fetch invoice");
  }
});
router6.get("/invoices/:id/allocations", requireAuth2, async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await getDocumentAllocations("invoice", id);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching invoice allocations:", error);
    return serverError(res, "Failed to fetch invoice allocations");
  }
});
router6.put("/invoices/:id", requireAuth2, requireRole2(["owner", "admin", "accountant"]), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const oldInvoice = await storage.getSalesInvoiceById(req.params.id);
    if (!oldInvoice) return notFound(res, "Invoice not found");
    const { lines, ...bodyWithoutLines } = req.body;
    if (bodyWithoutLines.date && typeof bodyWithoutLines.date === "string") {
      bodyWithoutLines.date = new Date(bodyWithoutLines.date);
    }
    if (bodyWithoutLines.due_date && typeof bodyWithoutLines.due_date === "string") {
      bodyWithoutLines.due_date = new Date(bodyWithoutLines.due_date);
    }
    const update = sanitizeUpdate(bodyWithoutLines, ["company_id", "created_by", "id"], ["subtotal", "tax_total", "total", "paid_amount", "fx_rate"]);
    let invoice;
    try {
      const validated = insertSalesInvoiceSchema.partial().parse(update);
      invoice = await storage.updateSalesInvoice(req.params.id, validated);
    } catch (parseError) {
      console.error("Invoice validation error:", parseError);
      return res.status(400).json({ error: "Validation failed", details: parseError.message });
    }
    if (!invoice) return notFound(res, "Invoice not found");
    if (lines && Array.isArray(lines)) {
      try {
        await db.delete(document_lines).where(
          and12(
            eq15(document_lines.document_type, "invoice"),
            eq15(document_lines.document_id, req.params.id)
          )
        );
        const linesToInsert = lines.map((line, index2) => ({
          document_type: "invoice",
          document_id: req.params.id,
          description: line.description || "Item",
          quantity: (line.quantity || 1).toString(),
          unit_price: (line.unit_price || 0).toString(),
          line_total: (line.amount || 0).toString(),
          tax_amount: ((line.amount || 0) * (line.tax_rate || 0) / 100).toString(),
          discount_percentage: (line.discount_percentage || 0).toString(),
          line_number: index2 + 1,
          project_id: line.project_id || null,
          item_id: line.item_id || null,
          warehouse_id: line.warehouse_id || null,
          tax_id: line.tax_id || null
        }));
        if (linesToInsert.length > 0) {
          await db.insert(document_lines).values(linesToInsert);
        }
      } catch (linesError) {
        console.error("Error updating lines:", linesError);
      }
    }
    await logUpdate({
      companyId,
      entityType: "sales_invoice",
      entityId: req.params.id,
      oldData: oldInvoice || {},
      newData: invoice,
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    const updatedInvoice = await storage.getSalesInvoiceById(req.params.id);
    res.json(updatedInvoice);
  } catch (error) {
    console.error("Error updating invoice:", error);
    return serverError(res, "Failed to update invoice");
  }
});
router6.post("/invoices/:id/send", requireAuth2, requireRole2(["owner", "admin", "accountant"]), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const invoice = await storage.getSalesInvoiceById(id);
    if (!invoice) return notFound(res, "Invoice not found");
    let contactEmail = "customer@example.com";
    if (invoice.customer_id) {
      const contact = await storage.getContactById(invoice.customer_id);
      if (contact?.email) {
        contactEmail = contact.email;
      }
    }
    log(
      `\u{1F4E7} Invoice ${invoice.invoice_number} would be sent to ${contactEmail}`,
      `Amount: ${invoice.currency} ${invoice.total}`,
      `Due Date: ${invoice.due_date}`
    );
    const updatedInvoice = await storage.updateSalesInvoice(id, {
      status: "sent"
    });
    await logAudit({
      companyId,
      entityType: "sales_invoice",
      entityId: id,
      action: "update",
      changes: {
        action: "send_invoice",
        invoice_number: invoice.invoice_number,
        recipient: contactEmail,
        amount: invoice.total,
        currency: invoice.currency,
        status: "sent"
      },
      actorId: userId,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json({
      success: true,
      message: "Invoice marked as sent",
      invoice: updatedInvoice,
      note: "Email service not configured. Please add SendGrid/AWS SES credentials to send actual emails."
    });
  } catch (error) {
    logError("Error sending invoice:", error);
    return serverError(res, "Failed to send invoice");
  }
});
router6.delete("/invoices/:id", requireAuth2, requireRole2(["owner", "admin"]), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const invoice = await storage.getSalesInvoiceById(req.params.id);
    const success = await storage.deleteSalesInvoice(req.params.id);
    if (!success) return notFound(res, "Invoice not found");
    await logDelete({
      companyId,
      entityType: "sales_invoice",
      entityId: req.params.id,
      deletedData: { invoice_number: invoice?.invoice_number, customer_id: invoice?.customer_id, total: invoice?.total },
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return serverError(res, "Failed to delete invoice");
  }
});
router6.get("/quotations", requireAuth2, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const quotations = await storage.getSalesQuotesByCompany(companyId);
    res.json(quotations);
  } catch (error) {
    console.error("Error fetching quotations:", error);
    return serverError(res, "Failed to fetch quotations");
  }
});
router6.post("/quotations", requireAuth2, requirePermission("sales", "create"), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const body = normalize(req.body);
    if (!body.quote_number) body.quote_number = `QT-${Date.now().toString(36).toUpperCase()}`;
    if (!body.date) body.date = /* @__PURE__ */ new Date();
    if (!body.currency) body.currency = "USD";
    if (!body.fx_rate) body.fx_rate = "1";
    if (body.subtotal === void 0) body.subtotal = "0";
    if (body.tax_total === void 0) body.tax_total = "0";
    if (body.total === void 0) body.total = "0";
    const payload = {
      ...body,
      company_id: companyId,
      created_by: userId
    };
    const quotation = await storage.createSalesQuote(payload);
    if (body.lines && Array.isArray(body.lines)) {
      const linesToInsert = body.lines.map((line, index2) => ({
        document_type: "quote",
        document_id: quotation.id,
        description: line.description || "Item",
        quantity: (line.quantity || 0).toString(),
        unit_price: (line.unit_price || 0).toString(),
        line_total: (line.amount || 0).toString(),
        tax_amount: ((line.amount || 0) * (line.tax_rate || 0) / 100).toString(),
        line_number: index2 + 1,
        project_id: line.project_id || null
      }));
      if (linesToInsert.length > 0) {
        await db.insert(document_lines).values(linesToInsert);
      }
    }
    await logCreate({
      companyId,
      entityType: "sales_quote",
      entityId: quotation.id,
      createdData: { quote_number: quotation.quote_number, customer_id: quotation.customer_id, total: quotation.total },
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.status(201).json(quotation);
  } catch (error) {
    console.error("Error creating quotation:", error);
    return serverError(res, "Failed to create quotation");
  }
});
router6.get("/quotations/:id", requireAuth2, async (req, res) => {
  try {
    const quotation = await storage.getSalesQuoteById(req.params.id);
    if (!quotation) return notFound(res, "Quotation not found");
    res.json(quotation);
  } catch (error) {
    console.error("Error fetching quotation:", error);
    return serverError(res, "Failed to fetch quotation");
  }
});
router6.put("/quotations/:id", requireAuth2, requirePermission("sales", "edit"), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const oldQuote = await storage.getSalesQuoteById(id);
    const update = sanitizeUpdate(req.body, ["company_id", "created_by", "id"]);
    const quotation = await storage.updateSalesQuote(id, update);
    if (!quotation) return notFound(res, "Quotation not found");
    await logUpdate({
      companyId,
      entityType: "sales_quote",
      entityId: id,
      oldData: oldQuote || {},
      newData: quotation,
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json(quotation);
  } catch (error) {
    console.error("Error updating quotation:", error);
    return serverError(res, "Failed to update quotation");
  }
});
router6.delete("/quotations/:id", requireAuth2, requirePermission("sales", "delete"), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const quote = await storage.getSalesQuoteById(id);
    const success = await storage.deleteSalesQuote(id);
    if (!success) return notFound(res, "Quotation not found");
    await logDelete({
      companyId,
      entityType: "sales_quote",
      entityId: id,
      deletedData: { quote_number: quote?.quote_number, customer_id: quote?.customer_id, total: quote?.total },
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting quotation:", error);
    return serverError(res, "Failed to delete quotation");
  }
});
router6.post("/quotations/:id/convert", requireAuth2, requirePermission("sales", "create"), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const quote = await storage.getSalesQuoteById(id);
    if (!quote) return notFound(res, "Quotation not found");
    const invoiceData = {
      company_id: companyId,
      created_by: userId,
      customer_id: quote.customer_id,
      invoice_number: `INV-${Date.now().toString(36).toUpperCase()}`,
      // Auto-generate
      date: /* @__PURE__ */ new Date(),
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3),
      // Default 30 days
      currency: quote.currency,
      fx_rate: quote.fx_rate,
      subtotal: quote.subtotal,
      tax_total: quote.tax_total,
      total: quote.total,
      paid_amount: "0",
      status: "draft",
      notes: `Converted from Quote #${quote.quote_number}`
      // Copy line items if we had them in a separate table, but for now assuming they are handled or simple
      // If line items are in a separate table, we would need to fetch and copy them too.
      // Assuming simple structure for now or that the frontend handles line items via a separate call or included in body?
      // Wait, insertSalesInvoiceSchema might require line items if they are part of the schema?
      // Let's check schema.
    };
    const validatedData = insertSalesInvoiceSchema.parse(invoiceData);
    const invoice = await storage.createSalesInvoice(validatedData);
    await storage.updateSalesQuote(id, { status: "invoiced" });
    res.status(201).json(invoice);
  } catch (error) {
    console.error("Error converting quotation:", error);
    return serverError(res, "Failed to convert quotation");
  }
});
router6.get("/credit-notes", requireAuth2, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    if (!companyId) return res.json([]);
    const notes = await storage.getSalesCreditNotesByCompany(companyId);
    res.json(notes);
  } catch (error) {
    const msg = String(error?.message || "");
    if (msg.includes('relation "sales_credit_notes" does not exist') || error?.code === "42P01") {
      return res.json([]);
    }
    console.error("Error fetching credit notes:", error);
    return serverError(res, "Failed to fetch credit notes");
  }
});
router6.post("/credit-notes", requireAuth2, requirePermission("sales", "create"), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const body = normalize(req.body);
    if (!body.credit_note_number) body.credit_note_number = `CN-${Date.now().toString(36).toUpperCase()}`;
    if (!body.date) body.date = /* @__PURE__ */ new Date();
    if (!body.currency) body.currency = "USD";
    if (!body.fx_rate) body.fx_rate = "1";
    if (body.subtotal === void 0) body.subtotal = "0";
    if (body.tax_total === void 0) body.tax_total = "0";
    if (body.total === void 0) body.total = "0";
    if (body.remaining_amount === void 0) body.remaining_amount = body.total;
    if (!body.status) body.status = "draft";
    const validatedData = insertSalesCreditNoteSchema.parse({
      ...body,
      company_id: companyId,
      created_by: userId
    });
    const note = await storage.createSalesCreditNote(validatedData);
    if (body.lines && Array.isArray(body.lines)) {
      const linesToInsert = body.lines.map((line, index2) => ({
        document_type: "credit_note",
        document_id: note.id,
        description: line.description || "Item",
        quantity: (line.quantity || 0).toString(),
        unit_price: (line.unit_price || 0).toString(),
        line_total: (line.amount || 0).toString(),
        tax_amount: ((line.amount || 0) * (line.tax_rate || 0) / 100).toString(),
        line_number: index2 + 1,
        project_id: line.project_id || null
      }));
      if (linesToInsert.length > 0) {
        await db.insert(document_lines).values(linesToInsert);
      }
    }
    await logCreate({
      companyId,
      entityType: "sales_credit_note",
      entityId: note.id,
      createdData: { credit_note_number: note.credit_note_number, customer_id: note.customer_id, total: note.total },
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.status(201).json(note);
  } catch (error) {
    if (error.name === "ZodError") {
      const validationError = fromZodError6(error);
      return badRequest(res, validationError.message);
    } else {
      console.error("Error creating credit note:", error);
      return serverError(res, "Failed to create credit note");
    }
  }
});
router6.put("/credit-notes/:id", requireAuth2, requirePermission("sales", "edit"), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const oldNote = await storage.getSalesCreditNoteById(id);
    const update = sanitizeUpdate(req.body, ["company_id", "created_by", "id"]);
    const note = await storage.updateSalesCreditNote(id, update);
    if (!note) return notFound(res, "Credit note not found");
    await logUpdate({
      companyId,
      entityType: "sales_credit_note",
      entityId: id,
      oldData: oldNote || {},
      newData: note,
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json(note);
  } catch (error) {
    console.error("Error updating credit note:", error);
    return serverError(res, "Failed to update credit note");
  }
});
router6.delete("/credit-notes/:id", requireAuth2, requirePermission("sales", "delete"), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const note = await storage.getSalesCreditNoteById(id);
    const success = await storage.deleteSalesCreditNote(companyId, id);
    if (!success) return notFound(res, "Credit note not found");
    await logDelete({
      companyId,
      entityType: "sales_credit_note",
      entityId: id,
      deletedData: { credit_note_number: note?.credit_note_number, customer_id: note?.customer_id, total: note?.total },
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting credit note:", error);
    return serverError(res, "Failed to delete credit note");
  }
});
router6.post("/credit-notes/:id/apply", requireAuth2, requirePermission("sales", "create"), async (req, res) => {
  try {
    const { id } = req.params;
    const { invoice_id, amount } = req.body;
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    if (!invoice_id || !amount) return badRequest(res, "Invoice ID and amount are required");
    const allocation = {
      company_id: companyId,
      payment_type: "credit_note",
      payment_id: id,
      document_type: "invoice",
      document_id: invoice_id,
      allocated_amount: amount.toString(),
      created_by: userId
    };
    await storage.applySalesCreditNote(allocation);
    res.json({ success: true });
  } catch (error) {
    console.error("Error applying credit note:", error);
    return serverError(res, "Failed to apply credit note");
  }
});
router6.get("/orders", requireAuth2, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    if (!companyId) return res.json([]);
    const orders = await storage.getSalesOrdersByCompany(companyId);
    res.json(orders);
  } catch (error) {
    const msg = String(error?.message || "");
    if (msg.includes('relation "sales_orders" does not exist') || error?.code === "42P01") {
      return res.json([]);
    }
    console.error("Error fetching sales orders:", error);
    return serverError(res, "Failed to fetch sales orders");
  }
});
router6.post("/orders", requireAuth2, requirePermission("sales", "create"), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const body = normalize(req.body);
    if (!body.order_number) body.order_number = `SO-${Date.now().toString(36).toUpperCase()}`;
    if (!body.date) body.date = /* @__PURE__ */ new Date();
    if (!body.currency) body.currency = "USD";
    if (!body.fx_rate) body.fx_rate = "1";
    if (body.subtotal === void 0) body.subtotal = "0";
    if (body.tax_total === void 0) body.tax_total = "0";
    if (body.total === void 0) body.total = "0";
    if (!body.status) body.status = "draft";
    const validatedData = insertSalesOrderSchema.parse({
      ...body,
      company_id: companyId,
      created_by: userId
    });
    const order = await storage.createSalesOrder(validatedData);
    if (body.lines && Array.isArray(body.lines)) {
      const linesToInsert = body.lines.map((line, index2) => ({
        document_type: "order",
        document_id: order.id,
        description: line.description || "Item",
        quantity: (line.quantity || 0).toString(),
        unit_price: (line.unit_price || 0).toString(),
        line_total: (line.amount || 0).toString(),
        tax_amount: ((line.amount || 0) * (line.tax_rate || 0) / 100).toString(),
        line_number: index2 + 1,
        project_id: line.project_id || null
      }));
      if (linesToInsert.length > 0) {
        await db.insert(document_lines).values(linesToInsert);
      }
    }
    await logCreate({
      companyId,
      entityType: "sales_order",
      entityId: order.id,
      createdData: { order_number: order.order_number, customer_id: order.customer_id, total: order.total },
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.status(201).json(order);
  } catch (error) {
    if (error.name === "ZodError") {
      const validationError = fromZodError6(error);
      return badRequest(res, validationError.message);
    } else {
      console.error("Error creating sales order:", error);
      return serverError(res, "Failed to create sales order");
    }
  }
});
router6.get("/recurring-invoices", requireAuth2, async (req, res) => {
  try {
    const companyId = req.session?.companyId || req.session?.company?.id;
    if (!companyId) return unauthorized(res, "No company selected");
    const templates = await storage.getRecurringTemplatesByCompany(companyId, "invoice");
    res.json(templates);
  } catch (error) {
    console.error("Error fetching recurring invoices:", error);
    return serverError(res, "Failed to fetch recurring invoices");
  }
});
router6.post("/recurring-invoices", requireAuth2, requirePermission("sales", "create"), async (req, res) => {
  try {
    const companyId = req.session?.companyId || req.session?.company?.id;
    const userId = req.session?.userId;
    if (!companyId || !userId) return unauthorized(res, "Unauthorized");
    const body = req.body || {};
    const now = /* @__PURE__ */ new Date();
    const startDate = body.start_date ? new Date(body.start_date) : now;
    const endDate = body.end_date ? new Date(body.end_date) : void 0;
    const validated = insertRecurringTemplateSchema.parse({
      ...body,
      company_id: companyId,
      created_by: userId,
      type: "invoice",
      start_date: startDate,
      end_date: endDate,
      last_generated: null,
      next_generation: startDate,
      is_active: body.is_active !== false
    });
    const template = await storage.createRecurringTemplate(validated);
    res.status(201).json(template);
  } catch (error) {
    if (error.name === "ZodError") {
      const validationError = fromZodError6(error);
      return badRequest(res, validationError.message);
    }
    console.error("Error creating recurring invoice template:", error);
    return serverError(res, "Failed to create recurring invoice template");
  }
});
router6.put("/recurring-invoices/:id", requireAuth2, requireRole2(["owner", "admin", "accountant"]), async (req, res) => {
  try {
    const { id } = req.params;
    const update = sanitizeUpdate(req.body, ["company_id", "created_by", "id", "type"]);
    const validated = insertRecurringTemplateSchema.partial().parse(update);
    const template = await storage.updateRecurringTemplate(id, validated);
    if (!template) return notFound(res, "Template not found");
    res.json(template);
  } catch (error) {
    console.error("Error updating recurring invoice template:", error);
    return serverError(res, "Failed to update recurring invoice template");
  }
});
router6.delete("/recurring-invoices/:id", requireAuth2, requireRole2(["owner", "admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const success = await storage.deleteRecurringTemplate(id);
    if (!success) return notFound(res, "Template not found");
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting recurring invoice template:", error);
    return serverError(res, "Failed to delete recurring invoice template");
  }
});
router6.post("/recurring-invoices/:id/generate", requireAuth2, requireRole2(["owner", "admin", "accountant"]), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const templates = await storage.getRecurringTemplatesByCompany(companyId, "invoice");
    const template = templates.find((t) => t.id === id);
    if (!template) {
      return notFound(res, "Recurring template not found");
    }
    if (!template.is_active) {
      return badRequest(res, "Template is paused. Please activate it first.");
    }
    const templateData = template.template_data || {};
    const invoiceNumber = await getNextDocumentNumber(companyId, "invoice");
    const invoiceData = {
      company_id: companyId,
      invoice_number: invoiceNumber,
      customer_id: templateData.customer_id,
      date: /* @__PURE__ */ new Date(),
      due_date: new Date(Date.now() + parseInt(templateData.payment_terms || "30") * 24 * 60 * 60 * 1e3),
      total: String(parseFloat(templateData.amount || "0")),
      subtotal: String(parseFloat(templateData.amount || "0")),
      currency: templateData.currency || "USD",
      status: "draft",
      notes: templateData.notes || "",
      created_by: userId
    };
    const invoice = await storage.createSalesInvoice(invoiceData);
    const nextRunDate = calculateNextRunDate(template.frequency, /* @__PURE__ */ new Date());
    const currentCount = parseInt(templateData.invoices_sent || "0");
    await storage.updateRecurringTemplate(id, {
      next_run_date: nextRunDate,
      last_run_date: /* @__PURE__ */ new Date(),
      template_data: {
        ...templateData,
        invoices_sent: currentCount + 1
      }
    });
    res.json({
      success: true,
      invoice_id: invoice.id,
      invoice_number: invoice.invoice_number,
      message: `Invoice ${invoice.invoice_number} generated successfully`
    });
  } catch (error) {
    console.error("Error generating invoice from template:", error);
    return serverError(res, "Failed to generate invoice");
  }
});
function calculateNextRunDate(frequency, fromDate) {
  const date = new Date(fromDate);
  switch (frequency) {
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
    case "quarterly":
      date.setMonth(date.getMonth() + 3);
      break;
    case "yearly":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  return date;
}
router6.post("/invoices/:id/send-email", requireAuth2, requireRole2(["owner", "admin", "accountant"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { to, cc, message, language = "en" } = req.body;
    if (!to) {
      return badRequest(res, "Recipient email is required");
    }
    const invoice = await storage.getSalesInvoiceById(id);
    if (!invoice) {
      return notFound(res, "Invoice not found");
    }
    const company = await storage.getCompanyById(invoice.company_id);
    if (!company) {
      return notFound(res, "Company not found");
    }
    let customerName = "Customer";
    if (invoice.customer_id) {
      const contact = await storage.getContactById(invoice.customer_id);
      if (contact) {
        customerName = contact.name;
      }
    }
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat(language === "ar" ? "ar-SA" : "en-US", {
        style: "currency",
        currency: invoice.currency || "USD"
      }).format(amount);
    };
    const { sendInvoiceEmail: sendInvoiceEmail2, isEmailServiceConfigured: isEmailServiceConfigured2 } = await Promise.resolve().then(() => (init_email(), email_exports));
    if (!isEmailServiceConfigured2()) {
      return res.status(503).json({
        success: false,
        error: "Email service not configured. Please set SMTP credentials in environment variables."
      });
    }
    const result = await sendInvoiceEmail2({
      to,
      cc,
      invoiceNumber: invoice.invoice_number || id,
      customerName,
      companyName: company.name,
      amount: formatCurrency(parseFloat(invoice.total?.toString() || "0")),
      dueDate: invoice.due_date ? new Date(invoice.due_date).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US") : "",
      currency: invoice.currency || "USD",
      language,
      customMessage: message
    });
    if (result.success) {
      if (invoice.status === "draft") {
        await storage.updateSalesInvoice(id, { status: "sent" });
      }
      res.json({ success: true, messageId: result.messageId });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error("Error sending invoice email:", error);
    return serverError(res, "Failed to send invoice email");
  }
});
router6.post("/invoices/:id/send-reminder", requireAuth2, requireRole2(["owner", "admin", "accountant"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { to, language = "en" } = req.body;
    const invoice = await storage.getSalesInvoiceById(id);
    if (!invoice) {
      return notFound(res, "Invoice not found");
    }
    const company = await storage.getCompanyById(invoice.company_id);
    if (!company) {
      return notFound(res, "Company not found");
    }
    let customerName = "Customer";
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
    const dueDate = invoice.due_date ? new Date(invoice.due_date) : /* @__PURE__ */ new Date();
    const today = /* @__PURE__ */ new Date();
    const daysOverdue = Math.max(0, Math.floor((today.getTime() - dueDate.getTime()) / (1e3 * 60 * 60 * 24)));
    const outstanding = parseFloat(invoice.total?.toString() || "0") - parseFloat(invoice.paid_amount?.toString() || "0");
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat(language === "ar" ? "ar-SA" : "en-US", {
        style: "currency",
        currency: invoice.currency || "USD"
      }).format(amount);
    };
    const { sendPaymentReminder: sendPaymentReminder2, isEmailServiceConfigured: isEmailServiceConfigured2 } = await Promise.resolve().then(() => (init_email(), email_exports));
    if (!isEmailServiceConfigured2()) {
      return res.status(503).json({
        success: false,
        error: "Email service not configured. Please set SMTP credentials in environment variables."
      });
    }
    const result = await sendPaymentReminder2({
      to: customerEmail,
      invoiceNumber: invoice.invoice_number || id,
      customerName,
      companyName: company.name,
      amount: formatCurrency(outstanding),
      dueDate: dueDate.toLocaleDateString(language === "ar" ? "ar-SA" : "en-US"),
      daysOverdue,
      currency: invoice.currency || "USD",
      language
    });
    if (result.success) {
      res.json({ success: true, messageId: result.messageId });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error("Error sending payment reminder:", error);
    return serverError(res, "Failed to send payment reminder");
  }
});
router6.get("/email-status", requireAuth2, async (req, res) => {
  try {
    const { isEmailServiceConfigured: isEmailServiceConfigured2 } = await Promise.resolve().then(() => (init_email(), email_exports));
    res.json({ configured: isEmailServiceConfigured2() });
  } catch (error) {
    res.json({ configured: false });
  }
});
var sales_default = router6;

// server/routes/purchases.ts
import { Router as Router7 } from "express";
init_db();
init_schema();
import { eq as eq16 } from "drizzle-orm";
init_permissions();
init_sendError();
import { fromZodError as fromZodError7 } from "zod-validation-error";
var router7 = Router7();
router7.get("/bills", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const bills3 = await storage.getBillsByCompany(companyId);
    res.json(bills3);
  } catch (error) {
    console.error("Error fetching bills:", error);
    return serverError(res, "Failed to fetch bills");
  }
});
router7.get("/bills/:id", requireAuth, async (req, res) => {
  try {
    const bill = await storage.getBillById(req.params.id);
    if (!bill) return notFound(res, "Bill not found");
    res.json(bill);
  } catch (error) {
    console.error("Error fetching bill:", error);
    return serverError(res, "Failed to fetch bill");
  }
});
router7.get("/bills/:id/allocations", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await getDocumentAllocations("bill", id);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching bill allocations:", error);
    return serverError(res, "Failed to fetch bill allocations");
  }
});
router7.post("/bills", requireAuth, requirePermission("purchases", "create"), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const body = normalize(req.body);
    const now = /* @__PURE__ */ new Date();
    if (!body.bill_number) body.bill_number = `BILL-${Date.now().toString(36).toUpperCase()}`;
    if (!body.date) body.date = now;
    if (!body.due_date) body.due_date = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1e3);
    if (!body.currency) body.currency = "USD";
    if (!body.fx_rate || body.fx_rate === "1") {
      const baseCurrency = await getCompanyBaseCurrency(companyId);
      if (body.currency !== baseCurrency) {
        const rate = await getExchangeRate(companyId, body.currency, baseCurrency, body.date);
        body.fx_rate = rate.toString();
      } else {
        body.fx_rate = "1";
      }
    }
    if (body.subtotal === void 0) body.subtotal = "0";
    if (body.tax_total === void 0) body.tax_total = "0";
    if (body.total === void 0) body.total = "0";
    if (body.paid_amount === void 0) body.paid_amount = "0";
    if (!body.status) body.status = "draft";
    const validatedData = insertBillSchema.parse({
      ...body,
      company_id: companyId,
      created_by: userId
    });
    const bill = await storage.createBill(validatedData);
    if (body.project_id) {
      await db.insert(document_lines).values({
        document_type: "bill",
        document_id: bill.id,
        description: bill.notes || "Bill Expense",
        quantity: "1",
        unit_price: bill.subtotal,
        line_total: bill.subtotal,
        line_number: 1,
        project_id: body.project_id
      });
    }
    try {
      await createBillJournalEntry(
        companyId,
        bill.id,
        bill.supplier_id,
        bill.bill_number,
        parseFloat(bill.subtotal || "0"),
        parseFloat(bill.tax_total || "0"),
        parseFloat(bill.total || "0"),
        bill.date,
        userId,
        bill.currency,
        parseFloat(bill.fx_rate || "1"),
        body.project_id
      );
    } catch (journalError) {
      console.error("Failed to create journal entry for bill:", journalError);
    }
    if (body.lines && Array.isArray(body.lines)) {
      for (const line of body.lines) {
        if (line.item_id && line.warehouse_id) {
          try {
            const [item] = await db.select().from(items).where(eq16(items.id, line.item_id));
            if (item && (item.type === "product" || item.type === "inventory")) {
              await recordStockMovement({
                company_id: companyId,
                item_id: line.item_id,
                warehouse_id: line.warehouse_id,
                transaction_type: "purchase",
                transaction_date: new Date(bill.date),
                quantity: Math.abs(parseFloat(line.quantity || "0")),
                // Positive for purchases (increases stock)
                unit_cost: parseFloat(line.unit_price || "0"),
                reference_type: "bill",
                reference_id: bill.id,
                notes: `Purchase - Bill ${bill.bill_number}`,
                created_by: userId
              });
            }
          } catch (stockError) {
            console.error("Failed to record stock movement for line:", stockError);
          }
        }
      }
    }
    await logCreate({
      companyId,
      entityType: "bill",
      entityId: bill.id,
      createdData: { bill_number: bill.bill_number, supplier_id: bill.supplier_id, total: bill.total, currency: bill.currency },
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.status(201).json(bill);
  } catch (error) {
    if (error.name === "ZodError") {
      const validationError = fromZodError7(error);
      return badRequest(res, validationError.message);
    } else {
      console.error("Error creating bill:", error);
      return serverError(res, "Failed to create bill");
    }
  }
});
router7.delete("/bills/:id", requireAuth, requireRole(["owner", "admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const bill = await storage.getBillById(id);
    const deleted = await storage.deleteBill(companyId, id);
    if (!deleted) {
      return notFound(res, "Bill not found");
    }
    await logDelete({
      companyId,
      entityType: "bill",
      entityId: id,
      deletedData: { bill_number: bill?.bill_number, supplier_id: bill?.supplier_id, total: bill?.total },
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting bill:", error);
    return serverError(res, "Failed to delete bill");
  }
});
router7.get("/orders", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const orders = await storage.getPurchaseOrdersByCompany(companyId);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    return serverError(res, "Failed to fetch purchase orders");
  }
});
router7.post("/orders", requireAuth, requirePermission("purchases", "create"), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const body = normalize(req.body);
    const now = /* @__PURE__ */ new Date();
    if (!body.po_number) body.po_number = `PO-${Date.now().toString(36).toUpperCase()}`;
    if (!body.date) body.date = now;
    if (!body.currency) body.currency = "USD";
    if (!body.fx_rate) body.fx_rate = "1";
    if (body.subtotal === void 0) body.subtotal = "0";
    if (body.tax_total === void 0) body.tax_total = "0";
    if (body.total === void 0) body.total = "0";
    const validatedData = insertPurchaseOrderSchema.parse({
      ...body,
      company_id: companyId,
      created_by: userId
    });
    const order = await storage.createPurchaseOrder(validatedData);
    if (body.lines && Array.isArray(body.lines)) {
      const linesToInsert = body.lines.map((line, index2) => ({
        document_type: "purchase_order",
        document_id: order.id,
        description: line.description || "Item",
        quantity: (line.quantity || 0).toString(),
        unit_price: (line.unit_price || 0).toString(),
        line_total: (line.amount || 0).toString(),
        tax_amount: ((line.amount || 0) * (line.tax_rate || 0) / 100).toString(),
        line_number: index2 + 1,
        project_id: line.project_id || null
      }));
      if (linesToInsert.length > 0) {
        await db.insert(document_lines).values(linesToInsert);
      }
    }
    await logCreate({
      companyId,
      entityType: "purchase_order",
      entityId: order.id,
      createdData: { po_number: order.po_number, supplier_id: order.supplier_id, total: order.total },
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.status(201).json(order);
  } catch (error) {
    if (error.name === "ZodError") {
      const validationError = fromZodError7(error);
      return badRequest(res, validationError.message);
    } else {
      console.error("Error creating purchase order:", error);
      return serverError(res, "Failed to create purchase order");
    }
  }
});
router7.get("/orders/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.session.companyId;
    const order = await storage.getPurchaseOrderById(id);
    if (!order || order.company_id !== companyId) {
      return notFound(res, "Purchase order not found");
    }
    res.json(order);
  } catch (error) {
    console.error("Error fetching purchase order:", error);
    return serverError(res, "Failed to fetch purchase order");
  }
});
router7.put("/orders/:id", requireAuth, requireRole(["owner", "admin", "accountant"]), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const oldOrder = await storage.getPurchaseOrderById(id);
    const update = sanitizeUpdate(req.body, ["company_id", "created_by", "id"], ["subtotal", "tax_total", "total", "fx_rate"]);
    const validatedUpdate = insertPurchaseOrderSchema.partial().parse(update);
    const order = await storage.updatePurchaseOrder(id, { ...validatedUpdate, updated_at: /* @__PURE__ */ new Date() });
    if (!order) return notFound(res, "Purchase order not found");
    await logUpdate({
      companyId,
      entityType: "purchase_order",
      entityId: id,
      oldData: oldOrder || {},
      newData: order,
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json(order);
  } catch (error) {
    if (error.name === "ZodError") {
      const validationError = fromZodError7(error);
      return badRequest(res, validationError.message);
    } else {
      console.error("Error updating purchase order:", error);
      return serverError(res, "Failed to update purchase order");
    }
  }
});
router7.post("/orders/:id/convert", requireAuth, requirePermission("purchases", "create"), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const order = await storage.getPurchaseOrderById(id);
    if (!order || order.company_id !== companyId) {
      return notFound(res, "Purchase order not found");
    }
    const billData = {
      company_id: companyId,
      created_by: userId,
      supplier_id: order.supplier_id,
      bill_number: `BILL-${Date.now().toString(36).toUpperCase()}`,
      // Auto-generate
      date: /* @__PURE__ */ new Date(),
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3),
      // Default 30 days
      currency: order.currency,
      fx_rate: order.fx_rate,
      subtotal: order.subtotal,
      tax_total: order.tax_total,
      total: order.total,
      paid_amount: "0",
      status: "draft",
      notes: `Converted from PO #${order.po_number}`
    };
    const validatedData = insertBillSchema.parse(billData);
    const bill = await storage.createBill(validatedData);
    await storage.updatePurchaseOrder(id, { status: "received" });
    res.status(201).json(bill);
  } catch (error) {
    console.error("Error converting purchase order:", error);
    return serverError(res, "Failed to convert purchase order");
  }
});
router7.delete("/orders/:id", requireAuth, requireRole(["owner", "admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const order = await storage.getPurchaseOrderById(id);
    const deleted = await storage.deletePurchaseOrder(companyId, id);
    if (!deleted) return notFound(res, "Purchase order not found");
    await logDelete({
      companyId,
      entityType: "purchase_order",
      entityId: id,
      deletedData: { po_number: order?.po_number, supplier_id: order?.supplier_id, total: order?.total },
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting purchase order:", error);
    return serverError(res, "Failed to delete purchase order");
  }
});
router7.get("/debit-notes", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    if (!companyId) return res.json([]);
    const notes = await storage.getPurchaseDebitNotesByCompany(companyId);
    res.json(notes);
  } catch (error) {
    const msg = String(error?.message || "");
    if (msg.includes('relation "purchase_debit_notes" does not exist') || error?.code === "42P01") {
      return res.json([]);
    }
    console.error("Error fetching debit notes:", error);
    return serverError(res, "Failed to fetch debit notes");
  }
});
router7.post("/debit-notes", requireAuth, requirePermission("purchases", "create"), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const body = normalize(req.body);
    const now = /* @__PURE__ */ new Date();
    if (!body.debit_note_number) body.debit_note_number = `DN-${Date.now().toString(36).toUpperCase()}`;
    if (!body.issue_date) body.issue_date = now;
    if (!body.currency) body.currency = "USD";
    if (body.total === void 0) body.total = "0";
    if (body.remaining_amount === void 0) body.remaining_amount = body.total;
    if (!body.status) body.status = "draft";
    if (!body.vendor_name && body.vendor_id) {
      try {
        const contacts2 = await storage.getContactsByCompany(companyId);
        const v = contacts2.find((c) => c.id === body.vendor_id);
        if (v) body.vendor_name = v.name;
      } catch {
      }
    }
    if (!body.bill_number && body.bill_id) {
      try {
        const bills3 = await storage.getBillsByCompany(companyId);
        const b = bills3.find((b2) => b2.id === body.bill_id);
        if (b) body.bill_number = b.bill_number;
      } catch {
      }
    }
    const validated = insertPurchaseDebitNoteSchema.parse({
      ...body,
      company_id: companyId,
      created_by: userId
    });
    const note = await storage.createPurchaseDebitNote(validated);
    if (body.lines && Array.isArray(body.lines)) {
      const linesToInsert = body.lines.map((line, index2) => ({
        document_type: "debit_note",
        document_id: note.id,
        description: line.description || "Item",
        quantity: (line.quantity || 0).toString(),
        unit_price: (line.unit_price || 0).toString(),
        line_total: (line.amount || 0).toString(),
        tax_amount: ((line.amount || 0) * (line.tax_rate || 0) / 100).toString(),
        line_number: index2 + 1,
        project_id: line.project_id || null
      }));
      if (linesToInsert.length > 0) {
        await db.insert(document_lines).values(linesToInsert);
      }
    }
    await logCreate({
      companyId,
      entityType: "purchase_debit_note",
      entityId: note.id,
      createdData: { debit_note_number: note.debit_note_number, vendor_id: note.vendor_id, total: note.total },
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.status(201).json(note);
  } catch (error) {
    if (error.name === "ZodError") {
      const validationError = fromZodError7(error);
      return badRequest(res, validationError.message);
    }
    console.error("Error creating debit note:", error);
    return serverError(res, "Failed to create debit note");
  }
});
router7.put("/debit-notes/:id", requireAuth, requireRole(["owner", "admin", "accountant"]), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const oldNote = await storage.getPurchaseDebitNoteById(id);
    const update = sanitizeUpdate(req.body, ["company_id", "created_by", "id"], ["total_amount"]);
    const validated = insertPurchaseDebitNoteSchema.partial().parse(update);
    const note = await storage.updatePurchaseDebitNote(id, { ...validated, updated_at: /* @__PURE__ */ new Date() });
    if (!note) return notFound(res, "Debit note not found");
    await logUpdate({
      companyId,
      entityType: "purchase_debit_note",
      entityId: id,
      oldData: oldNote || {},
      newData: note,
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json(note);
  } catch (error) {
    console.error("Error updating debit note:", error);
    return serverError(res, "Failed to update debit note");
  }
});
router7.delete("/debit-notes/:id", requireAuth, requireRole(["owner", "admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const note = await storage.getPurchaseDebitNoteById(id);
    const deleted = await storage.deletePurchaseDebitNote(companyId, id);
    if (!deleted) return notFound(res, "Debit note not found");
    await logDelete({
      companyId,
      entityType: "purchase_debit_note",
      entityId: id,
      deletedData: { debit_note_number: note?.debit_note_number, vendor_id: note?.vendor_id, total: note?.total },
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting debit note:", error);
    return serverError(res, "Failed to delete debit note");
  }
});
router7.post("/debit-notes/:id/apply", requireAuth, requirePermission("purchases", "create"), async (req, res) => {
  try {
    const { id } = req.params;
    const { bill_id, amount } = req.body;
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    if (!bill_id || !amount) return badRequest(res, "Bill ID and amount are required");
    const allocation = {
      company_id: companyId,
      payment_type: "debit_note",
      payment_id: id,
      document_type: "bill",
      document_id: bill_id,
      allocated_amount: amount.toString(),
      created_by: userId
    };
    await storage.applyPurchaseDebitNote(allocation);
    res.json({ success: true });
  } catch (error) {
    console.error("Error applying debit note:", error);
    return serverError(res, "Failed to apply debit note");
  }
});
router7.get("/expenses", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const expenses2 = await storage.getExpensesByCompany(companyId);
    res.json(expenses2);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return serverError(res, `Failed to fetch expenses: ${error.message}`);
  }
});
router7.post("/expenses", requireAuth, requirePermission("purchases", "create"), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const body = normalize(req.body);
    const now = /* @__PURE__ */ new Date();
    if (!body.expense_number) body.expense_number = `EXP-${Date.now().toString(36).toUpperCase()}`;
    if (body.date) {
      body.date = new Date(body.date);
    } else {
      body.date = now;
    }
    if (body.tax_amount === void 0) body.tax_amount = "0";
    if (!body.status) body.status = "pending";
    const validatedData = insertExpenseSchema.parse({
      ...body,
      company_id: companyId,
      created_by: userId
    });
    const expense = await storage.createExpense(validatedData);
    await logCreate({
      companyId,
      entityType: "expense",
      entityId: expense.id,
      createdData: { expense_number: expense.expense_number, amount: expense.amount, category: expense.category },
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.status(201).json(expense);
  } catch (error) {
    if (error.name === "ZodError") {
      const validationError = fromZodError7(error);
      return badRequest(res, validationError.message);
    } else {
      console.error("Error creating expense:", error);
      return serverError(res, "Failed to create expense");
    }
  }
});
var purchases_default = router7;

// server/routes/banking.ts
import { Router as Router8 } from "express";
init_schema();
init_permissions();
init_sendError();
import { fromZodError as fromZodError8 } from "zod-validation-error";
var router8 = Router8();
router8.get("/accounts", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const cacheKey = `banking:accounts:${companyId}`;
    const cached = await getCache2(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    const accounts5 = await storage.getBankAccountsByCompany(companyId);
    await setCache2(cacheKey, accounts5, 1800);
    res.json(accounts5);
  } catch (error) {
    console.error("Error fetching bank accounts:", error);
    return serverError(res, "Failed to fetch bank accounts");
  }
});
router8.post("/accounts", requireAuth, requirePermission("banking", "create"), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const body = normalize(req.body);
    const now = /* @__PURE__ */ new Date();
    if (!body.currency) body.currency = "USD";
    if (body.opening_balance === void 0) body.opening_balance = "0";
    if (!body.opening_balance_date) body.opening_balance_date = now;
    const validatedData = insertBankAccountSchema.parse({
      ...body,
      company_id: companyId
    });
    const account = await storage.createBankAccount(validatedData);
    await deleteCache2(`banking:accounts:${companyId}`);
    await logCreate({
      companyId,
      entityType: "bank_account",
      entityId: account.id,
      createdData: { name: account.name, account_number: account.account_number, currency: account.currency },
      actorId: req.session?.userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.status(201).json(account);
  } catch (error) {
    if (error.name === "ZodError") {
      const validationError = fromZodError8(error);
      return badRequest(res, validationError.message);
    } else {
      console.error("Error creating bank account:", error);
      return serverError(res, "Failed to create bank account");
    }
  }
});
router8.put("/accounts/:id", requireAuth, requireRole(["owner", "admin"]), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const update = sanitizeUpdate(req.body, ["company_id", "id"], ["opening_balance"]);
    const validated = insertBankAccountSchema.partial().parse(update);
    const account = await storage.updateBankAccount(req.params.id, validated);
    if (!account) return notFound(res, "Bank account not found");
    await deleteCache2(`banking:accounts:${companyId}`);
    res.json(account);
  } catch (error) {
    console.error("Error updating bank account:", error);
    return serverError(res, "Failed to update bank account");
  }
});
router8.delete("/accounts/:id", requireAuth, requireRole(["owner", "admin"]), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const success = await storage.deleteBankAccount(req.params.id);
    if (!success) return notFound(res, "Bank account not found");
    await deleteCache2(`banking:accounts:${companyId}`);
    await logDelete({
      companyId,
      entityType: "bank_account",
      entityId: req.params.id,
      deletedData: { id: req.params.id },
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting bank account:", error);
    return serverError(res, "Failed to delete bank account");
  }
});
router8.get("/payments", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const payments3 = await storage.getPaymentsByCompany(companyId);
    res.json(payments3);
  } catch (error) {
    console.error("Error fetching payments:", error);
    if (error?.code === "42703") {
      return serverError(res, "Database schema mismatch: Missing columns in payments table. Please run FIX_BANKING_SCHEMA.sql");
    }
    return serverError(res, "Failed to fetch payments");
  }
});
router8.post("/payments", requireAuth, requirePermission("banking", "create"), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const body = normalize(req.body);
    const now = /* @__PURE__ */ new Date();
    if (!body.payment_number) body.payment_number = `PAY-${Date.now().toString(36).toUpperCase()}`;
    if (!body.date) body.date = now;
    if (!body.payment_method) body.payment_method = "bank_transfer";
    if (!body.currency) body.currency = "USD";
    if (!body.fx_rate) body.fx_rate = "1";
    if (!body.status) body.status = "pending";
    const validatedData = insertPaymentSchema.parse({
      ...body,
      company_id: companyId,
      created_by: userId
    });
    const payment = await storage.createPayment(validatedData);
    try {
      await createPaymentJournalEntry(
        companyId,
        payment.id,
        payment.payment_number,
        parseFloat(payment.amount || "0"),
        payment.bank_account_id || "",
        payment.date,
        userId,
        payment.currency,
        parseFloat(payment.fx_rate || "1")
      );
    } catch (journalError) {
      console.error("Failed to create journal entry for payment:", journalError);
    }
    await logCreate({
      companyId,
      entityType: "payment",
      entityId: payment.id,
      createdData: { payment_number: payment.payment_number, amount: payment.amount, currency: payment.currency },
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.status(201).json(payment);
  } catch (error) {
    if (error.name === "ZodError") {
      const validationError = fromZodError8(error);
      return badRequest(res, validationError.message);
    } else {
      console.error("Error creating payment:", error);
      return serverError(res, "Failed to create payment");
    }
  }
});
router8.delete("/payments/:id", requireAuth, requireRole(["owner", "admin", "accountant"]), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const deleted = await storage.deletePayment(companyId, id);
    if (!deleted) {
      return notFound(res, "Payment not found");
    }
    await logDelete({
      companyId,
      entityType: "payment",
      entityId: id,
      deletedData: { id },
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting payment:", error);
    return serverError(res, "Failed to delete payment");
  }
});
router8.get("/receipts", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const receipts3 = await storage.getReceiptsByCompany(companyId);
    res.json(receipts3);
  } catch (error) {
    console.error("Error fetching receipts:", error);
    if (error?.code === "42703") {
      return serverError(res, "Database schema mismatch: Missing columns in receipts table. Please run FIX_BANKING_SCHEMA.sql");
    }
    return serverError(res, "Failed to fetch receipts");
  }
});
router8.post("/receipts", requireAuth, requirePermission("banking", "create"), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const body = normalize(req.body);
    const now = /* @__PURE__ */ new Date();
    if (!body.receipt_number) body.receipt_number = `RCPT-${Date.now().toString(36).toUpperCase()}`;
    if (!body.date) body.date = now;
    if (!body.payment_method) body.payment_method = "bank_transfer";
    if (!body.currency) body.currency = "USD";
    if (!body.fx_rate) body.fx_rate = "1";
    if (!body.status) body.status = "received";
    const validatedData = insertReceiptSchema.parse({
      ...body,
      company_id: companyId,
      created_by: userId
    });
    const receipt = await storage.createReceipt(validatedData);
    try {
      await createReceiptJournalEntry(
        companyId,
        receipt.id,
        receipt.receipt_number,
        parseFloat(receipt.amount || "0"),
        receipt.bank_account_id || "",
        receipt.date,
        userId,
        receipt.currency,
        parseFloat(receipt.fx_rate || "1")
      );
    } catch (journalError) {
      console.error("Failed to create journal entry for receipt:", journalError);
    }
    await logCreate({
      companyId,
      entityType: "receipt",
      entityId: receipt.id,
      createdData: { receipt_number: receipt.receipt_number, customer_id: receipt.customer_id, amount: receipt.amount, currency: receipt.currency },
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.status(201).json(receipt);
  } catch (error) {
    if (error.name === "ZodError") {
      const validationError = fromZodError8(error);
      return badRequest(res, validationError.message);
    } else {
      console.error("Error creating receipt:", error);
      return serverError(res, "Failed to create receipt");
    }
  }
});
router8.delete("/receipts/:id", requireAuth, requireRole(["owner", "admin", "accountant"]), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const deleted = await storage.deleteReceipt(companyId, id);
    if (!deleted) {
      return notFound(res, "Receipt not found");
    }
    await logDelete({
      companyId,
      entityType: "receipt",
      entityId: id,
      deletedData: { id },
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting receipt:", error);
    return serverError(res, "Failed to delete receipt");
  }
});
router8.post("/receipts/:id/allocate", requireAuth, requirePermission("banking", "create"), async (req, res) => {
  try {
    const { id } = req.params;
    const { invoice_id, amount } = req.body;
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    if (!invoice_id || !amount) {
      return badRequest(res, "Invoice ID and amount are required");
    }
    const allocation = {
      company_id: companyId,
      payment_type: "receipt",
      payment_id: id,
      document_type: "invoice",
      document_id: invoice_id,
      allocated_amount: amount.toString(),
      created_by: userId
    };
    await allocatePayment(allocation);
    const invoice = await storage.getSalesInvoiceById(invoice_id);
    if (invoice) {
      const totalAllocated = await getTotalAllocated("invoice", invoice_id);
      const newPaid = totalAllocated.toString();
      let status = invoice.status;
      if (parseFloat(newPaid) >= parseFloat(invoice.total)) {
        status = "paid";
      } else if (parseFloat(newPaid) > 0) {
        status = "partially_paid";
      }
      await storage.updateSalesInvoice(invoice.id, { paid_amount: newPaid, status });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error allocating receipt:", error);
    return serverError(res, "Failed to allocate receipt");
  }
});
router8.post("/payments/:id/allocate", requireAuth, requirePermission("banking", "create"), async (req, res) => {
  try {
    const { id } = req.params;
    const { bill_id, amount } = req.body;
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    if (!bill_id || !amount) {
      return badRequest(res, "Bill ID and amount are required");
    }
    const allocation = {
      company_id: companyId,
      payment_type: "payment",
      payment_id: id,
      document_type: "bill",
      document_id: bill_id,
      allocated_amount: amount.toString(),
      created_by: userId
    };
    await allocatePayment(allocation);
    const bill = await storage.getBillById(bill_id);
    if (bill) {
      const totalAllocated = await getTotalAllocated("bill", bill_id);
      const newPaid = totalAllocated.toString();
      let status = bill.status;
      if (parseFloat(newPaid) >= parseFloat(bill.total)) {
        status = "paid";
      } else if (parseFloat(newPaid) > 0) {
        status = "partially_paid";
      }
      await storage.updateBill(bill.id, { paid_amount: newPaid, status });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error allocating payment:", error);
    return serverError(res, "Failed to allocate payment");
  }
});
router8.get("/reconciliation/allocations/recent", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const allocations = await getRecentAllocations(companyId, 50);
    res.json(allocations);
  } catch (error) {
    console.error("Error fetching recent allocations:", error);
    return serverError(res, "Failed to fetch recent allocations");
  }
});
router8.get("/reconciliation/suggestions", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const fromParam = req.query.from || void 0;
    const toParam = req.query.to || void 0;
    const typeParam = (req.query.type || "both").toLowerCase();
    const maxParam = req.query.max || void 0;
    const maxCandidatesParam = req.query.max_candidates || void 0;
    const minScoreParam = req.query.min_score || void 0;
    const amountTolParam = req.query.amount_tolerance || void 0;
    const maxDaysParam = req.query.max_days || void 0;
    const preferExactParam = req.query.prefer_exact_amount || void 0;
    const currencyStrictParam = req.query.currency_strict || void 0;
    const customerIdParam = req.query.customer_id || void 0;
    const vendorIdParam = req.query.vendor_id || void 0;
    const fromDate = fromParam && !isNaN(Date.parse(fromParam)) ? new Date(fromParam) : void 0;
    const toDate = toParam && !isNaN(Date.parse(toParam)) ? new Date(toParam) : void 0;
    const max = maxParam ? Math.max(1, Math.min(1e3, parseInt(maxParam, 10) || 0)) : void 0;
    const maxCandidates = maxCandidatesParam ? Math.max(1, Math.min(10, parseInt(maxCandidatesParam, 10) || 0)) : 3;
    const minScore = typeof minScoreParam !== "undefined" ? Math.max(0, Math.min(1e3, parseInt(minScoreParam, 10) || 0)) : 0;
    const amountTolerance = typeof amountTolParam !== "undefined" ? Math.max(0, Math.min(10, parseFloat(amountTolParam) || 0)) : 0.01;
    const maxDays = maxDaysParam ? Math.max(1, Math.min(365, parseInt(maxDaysParam, 10) || 0)) : 30;
    const preferExactAmount = typeof preferExactParam === "undefined" ? true : ["1", "true", "yes", "y", "on"].includes(String(preferExactParam).toLowerCase());
    const currencyStrict = typeof currencyStrictParam === "undefined" ? false : ["1", "true", "yes", "y", "on"].includes(String(currencyStrictParam).toLowerCase());
    const [allReceipts, allPayments, invoices, bills3] = await Promise.all([
      storage.getReceiptsByCompany(companyId),
      storage.getPaymentsByCompany(companyId),
      storage.getSalesInvoicesByCompany(companyId),
      storage.getBillsByCompany(companyId)
    ]);
    const inRange = (d) => {
      const ts = new Date(d).getTime();
      if (fromDate && ts < fromDate.getTime()) return false;
      if (toDate && ts > toDate.getTime()) return false;
      return true;
    };
    let receipts3 = fromDate || toDate ? allReceipts.filter((r) => inRange(new Date(r.date))) : allReceipts;
    let payments3 = fromDate || toDate ? allPayments.filter((p) => inRange(new Date(p.date))) : allPayments;
    if (customerIdParam) receipts3 = receipts3.filter((r) => r.customer_id === customerIdParam);
    if (vendorIdParam) payments3 = payments3.filter((p) => p.vendor_id === vendorIdParam);
    const sortByDateDesc = (arr) => arr.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (max) {
      receipts3 = sortByDateDesc(receipts3).slice(0, max);
      payments3 = sortByDateDesc(payments3).slice(0, max);
    }
    const invoiceOutstanding = {};
    for (const inv of invoices) {
      const total = parseFloat(inv.total?.toString?.() || inv.total || "0") || 0;
      const allocated = await getTotalAllocated("invoice", inv.id);
      invoiceOutstanding[inv.id] = Math.max(0, Number((total - allocated).toFixed(2)));
    }
    const billOutstanding = {};
    for (const bill of bills3) {
      const total = parseFloat(bill.total?.toString?.() || bill.total || "0") || 0;
      const allocated = await getTotalAllocated("bill", bill.id);
      billOutstanding[bill.id] = Math.max(0, Number((total - allocated).toFixed(2)));
    }
    const daysDiff = (a, b) => Math.abs(Math.round((a.getTime() - b.getTime()) / (1e3 * 60 * 60 * 24)));
    const receiptSuggestions = [];
    if (typeParam === "receipts" || typeParam === "both") {
      for (const r of receipts3) {
        const unallocated = await getUnallocatedAmount("receipt", r.id);
        if (unallocated <= 1e-3) continue;
        const rDate = new Date(r.date);
        const candidates = invoices.filter((inv) => inv.customer_id === r.customer_id && (invoiceOutstanding[inv.id] || 0) > 0).map((inv) => {
          const outstanding = invoiceOutstanding[inv.id];
          const amountEqual = Math.abs(outstanding - unallocated) <= amountTolerance;
          const d = daysDiff(rDate, new Date(inv.date));
          const amountBonus = amountEqual ? preferExactAmount ? 100 : 60 : 0;
          const dateBonus = Math.max(0, maxDays - Math.min(d, maxDays));
          const score = amountBonus + dateBonus;
          const high_confidence = Boolean(amountEqual && d <= Math.min(7, maxDays));
          const confidence = high_confidence ? "high" : amountEqual || d <= Math.min(14, maxDays) ? "medium" : "low";
          return {
            documentId: inv.id,
            documentType: "invoice",
            invoice_number: inv.invoice_number,
            currency_mismatch: Boolean(r?.currency && inv?.currency && r.currency !== inv.currency),
            currency: inv?.currency,
            outstanding,
            score,
            amount_equal: amountEqual,
            amount_score: amountBonus,
            date_score: dateBonus,
            total_score: score,
            dateDiffDays: d,
            high_confidence,
            confidence
          };
        }).filter((c) => (!currencyStrict || !c.currency_mismatch) && c.score >= minScore).sort((a, b) => b.score - a.score).slice(0, maxCandidates);
        if (candidates.length)
          receiptSuggestions.push({
            paymentType: "receipt",
            paymentId: r.id,
            customer_id: r.customer_id,
            receipt_number: r.receipt_number,
            customer_name: r.customer_name,
            amount: Number(unallocated.toFixed(2)),
            date: r.date,
            suggestions: candidates
          });
      }
    }
    const paymentSuggestions = [];
    if (typeParam === "payments" || typeParam === "both") {
      for (const p of payments3) {
        const unallocated = await getUnallocatedAmount("payment", p.id);
        if (unallocated <= 1e-3) continue;
        const pDate = new Date(p.date);
        const candidates = bills3.filter((b) => b.supplier_id === p.vendor_id && (billOutstanding[b.id] || 0) > 0).map((b) => {
          const outstanding = billOutstanding[b.id];
          const amountEqual = Math.abs(outstanding - unallocated) <= amountTolerance;
          const d = daysDiff(pDate, new Date(b.date));
          const amountBonus = amountEqual ? preferExactAmount ? 100 : 60 : 0;
          const dateBonus = Math.max(0, maxDays - Math.min(d, maxDays));
          const score = amountBonus + dateBonus;
          const high_confidence = Boolean(amountEqual && d <= Math.min(7, maxDays));
          const confidence = high_confidence ? "high" : amountEqual || d <= Math.min(14, maxDays) ? "medium" : "low";
          return {
            documentId: b.id,
            documentType: "bill",
            bill_number: b.bill_number,
            currency_mismatch: Boolean(p?.currency && b?.currency && p.currency !== b.currency),
            currency: b?.currency,
            outstanding,
            score,
            amount_equal: amountEqual,
            amount_score: amountBonus,
            date_score: dateBonus,
            total_score: score,
            dateDiffDays: d,
            high_confidence,
            confidence
          };
        }).filter((c) => (!currencyStrict || !c.currency_mismatch) && c.score >= minScore).sort((a, b) => b.score - a.score).slice(0, maxCandidates);
        if (candidates.length)
          paymentSuggestions.push({
            paymentType: "payment",
            paymentId: p.id,
            vendor_id: p.vendor_id,
            payment_number: p.payment_number,
            vendor_name: p.vendor_name,
            amount: Number(unallocated.toFixed(2)),
            date: p.date,
            suggestions: candidates
          });
      }
    }
    res.json({ receipts: receiptSuggestions, payments: paymentSuggestions });
  } catch (error) {
    console.error("Error building reconciliation suggestions:", error);
    if (error?.code === "42703" || error?.code === "42P01") {
      return serverError(res, "Database schema mismatch: Missing banking tables or columns. Please run FIX_BANKING_SCHEMA.sql");
    }
    return serverError(res, "Failed to build suggestions");
  }
});
router8.post("/reconciliation/auto-match", requireAuth, requirePermission("banking", "create"), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const body = req.body || {};
    const typeParam = String(body.type ?? "both").toLowerCase();
    const fromParam = body.from;
    const toParam = body.to;
    const customerIdParam = body.customer_id;
    const vendorIdParam = body.vendor_id;
    const amountTolParam = body.amount_tolerance;
    const maxDaysParam = body.max_days;
    const currencyStrictParam = body.currency_strict;
    const maxPerSideParam = body.max;
    const maxActionsParam = body.max_actions;
    const dryRun = typeof body.dry_run === "undefined" ? true : ["1", "true", "yes", "y", "on"].includes(String(body.dry_run).toLowerCase());
    const selected = Array.isArray(body.selected) ? body.selected : [];
    const fromDate = fromParam && !isNaN(Date.parse(fromParam)) ? new Date(fromParam) : void 0;
    const toDate = toParam && !isNaN(Date.parse(toParam)) ? new Date(toParam) : void 0;
    const amountTolerance = typeof amountTolParam !== "undefined" ? Math.max(0, Math.min(10, typeof amountTolParam === "string" ? parseFloat(amountTolParam) : Number(amountTolParam))) : 0.01;
    const maxDays = maxDaysParam ? Math.max(1, Math.min(365, typeof maxDaysParam === "string" ? parseInt(maxDaysParam, 10) : Number(maxDaysParam))) : 30;
    const currencyStrict = typeof currencyStrictParam === "undefined" ? false : ["1", "true", "yes", "y", "on"].includes(String(currencyStrictParam).toLowerCase());
    const max = maxPerSideParam ? Math.max(1, Math.min(1e3, typeof maxPerSideParam === "string" ? parseInt(maxPerSideParam, 10) : Number(maxPerSideParam))) : void 0;
    const maxActions = maxActionsParam ? Math.max(1, Math.min(500, typeof maxActionsParam === "string" ? parseInt(maxActionsParam, 10) : Number(maxActionsParam))) : 50;
    const [allReceipts, allPayments, invoices, bills3] = await Promise.all([
      storage.getReceiptsByCompany(companyId),
      storage.getPaymentsByCompany(companyId),
      storage.getSalesInvoicesByCompany(companyId),
      storage.getBillsByCompany(companyId)
    ]);
    const inRange = (d) => {
      const ts = new Date(d).getTime();
      if (fromDate && ts < fromDate.getTime()) return false;
      if (toDate && ts > toDate.getTime()) return false;
      return true;
    };
    let receipts3 = fromDate || toDate ? allReceipts.filter((r) => inRange(new Date(r.date))) : allReceipts;
    let payments3 = fromDate || toDate ? allPayments.filter((p) => inRange(new Date(p.date))) : allPayments;
    if (customerIdParam) receipts3 = receipts3.filter((r) => r.customer_id === customerIdParam);
    if (vendorIdParam) payments3 = payments3.filter((p) => p.vendor_id === vendorIdParam);
    const sortByDateDesc = (arr) => arr.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (max) {
      receipts3 = sortByDateDesc(receipts3).slice(0, max);
      payments3 = sortByDateDesc(payments3).slice(0, max);
    }
    const invoiceOutstanding = {};
    for (const inv of invoices) {
      const total = parseFloat(inv.total?.toString?.() || inv.total || "0") || 0;
      const allocated = await getTotalAllocated("invoice", inv.id);
      invoiceOutstanding[inv.id] = Math.max(0, Number((total - allocated).toFixed(2)));
    }
    const billOutstanding = {};
    for (const bill of bills3) {
      const total = parseFloat(bill.total?.toString?.() || bill.total || "0") || 0;
      const allocated = await getTotalAllocated("bill", bill.id);
      billOutstanding[bill.id] = Math.max(0, Number((total - allocated).toFixed(2)));
    }
    const daysDiff = (a, b) => Math.abs(Math.round((a.getTime() - b.getTime()) / (1e3 * 60 * 60 * 24)));
    const actions = [];
    const processReceipt = async (r) => {
      const unallocated = await getUnallocatedAmount("receipt", r.id);
      if (unallocated <= 1e-3) return;
      const rDate = new Date(r.date);
      const exacts = invoices.filter((inv) => inv.customer_id === r.customer_id && (invoiceOutstanding[inv.id] || 0) > 0).map((inv) => {
        const outstanding = invoiceOutstanding[inv.id];
        const diff = Math.abs(outstanding - unallocated);
        return { inv, outstanding, diff };
      }).filter((x) => x.diff <= amountTolerance && (!currencyStrict || r.currency && x.inv.currency && r.currency === x.inv.currency));
      if (exacts.length === 1) {
        const { inv, outstanding } = exacts[0];
        const amt = Math.min(unallocated, outstanding);
        const diffDays = daysDiff(new Date(r.date), new Date(inv.date));
        const amountBonus = 100;
        const dateBonus = Math.max(0, maxDays - Math.min(diffDays, maxDays));
        actions.push({
          paymentType: "receipt",
          paymentId: r.id,
          documentType: "invoice",
          documentId: inv.id,
          amount: Number(amt.toFixed(2)),
          status: "would-allocate",
          payment_ref: r.receipt_number,
          document_ref: inv.invoice_number,
          counterparty_name: r.customer_name,
          date: new Date(r.date).toISOString(),
          document_date: new Date(inv.date).toISOString(),
          currency_mismatch: Boolean(r?.currency && inv?.currency && r.currency !== inv.currency),
          date_diff_days: diffDays,
          high_confidence: Boolean(diffDays <= Math.min(7, maxDays)),
          unique: true,
          amount_equal: true,
          amount_score: amountBonus,
          date_score: dateBonus,
          total_score: amountBonus + dateBonus
        });
      } else if (exacts.length > 1) {
        actions.push({
          paymentType: "receipt",
          paymentId: r.id,
          documentType: "invoice",
          documentId: exacts[0].inv.id,
          amount: Number(unallocated.toFixed(2)),
          status: "skipped",
          reason: "multiple exact matches",
          payment_ref: r.receipt_number,
          counterparty_name: r.customer_name,
          date: new Date(r.date).toISOString()
        });
      }
    };
    const processPayment = async (p) => {
      const unallocated = await getUnallocatedAmount("payment", p.id);
      if (unallocated <= 1e-3) return;
      const pDate = new Date(p.date);
      const exacts = bills3.filter((b) => b.supplier_id === p.vendor_id && (billOutstanding[b.id] || 0) > 0).map((b) => {
        const outstanding = billOutstanding[b.id];
        const diff = Math.abs(outstanding - unallocated);
        return { b, outstanding, diff };
      }).filter((x) => x.diff <= amountTolerance && (!currencyStrict || p.currency && x.b.currency && p.currency === x.b.currency));
      if (exacts.length === 1) {
        const { b, outstanding } = exacts[0];
        const amt = Math.min(unallocated, outstanding);
        const diffDays = daysDiff(new Date(p.date), new Date(b.date));
        const amountBonus = 100;
        const dateBonus = Math.max(0, maxDays - Math.min(diffDays, maxDays));
        actions.push({
          paymentType: "payment",
          paymentId: p.id,
          documentType: "bill",
          documentId: b.id,
          amount: Number(amt.toFixed(2)),
          status: "would-allocate",
          payment_ref: p.payment_number,
          document_ref: b.bill_number,
          counterparty_name: p.vendor_name,
          date: new Date(p.date).toISOString(),
          document_date: new Date(b.date).toISOString(),
          currency_mismatch: Boolean(p?.currency && b?.currency && p.currency !== b.currency),
          date_diff_days: diffDays,
          high_confidence: Boolean(diffDays <= Math.min(7, maxDays)),
          unique: true,
          amount_equal: true,
          amount_score: amountBonus,
          date_score: dateBonus,
          total_score: amountBonus + dateBonus
        });
      } else if (exacts.length > 1) {
        actions.push({
          paymentType: "payment",
          paymentId: p.id,
          documentType: "bill",
          documentId: exacts[0].b.id,
          amount: Number(unallocated.toFixed(2)),
          status: "skipped",
          reason: "multiple exact matches",
          payment_ref: p.payment_number,
          counterparty_name: p.vendor_name,
          date: new Date(p.date).toISOString()
        });
      }
    };
    if (typeParam === "receipts" || typeParam === "both") {
      for (const r of receipts3) {
        await processReceipt(r);
        if (actions.length >= maxActions) break;
      }
    }
    if (actions.length < maxActions && (typeParam === "payments" || typeParam === "both")) {
      for (const p of payments3) {
        await processPayment(p);
        if (actions.length >= maxActions) break;
      }
    }
    let selectedSet = null;
    const keyOf = (a) => `${a.paymentType}:${a.paymentId}:${a.documentType}:${a.documentId}`;
    if (selected && selected.length > 0) {
      selectedSet = new Set(selected.map((s) => keyOf(s)));
      for (const a of actions) {
        if (a.status === "would-allocate" && !selectedSet.has(keyOf(a))) {
          a.status = "skipped";
          a.reason = "not selected";
        }
      }
    }
    let allocationsCreated = 0;
    const allocationIds = [];
    if (!dryRun) {
      for (const a of actions) {
        if (a.status !== "would-allocate") continue;
        if (selectedSet && !selectedSet.has(keyOf(a))) continue;
        try {
          const { id } = await allocatePayment({
            company_id: companyId,
            payment_type: a.paymentType,
            payment_id: a.paymentId,
            document_type: a.documentType,
            document_id: a.documentId,
            allocated_amount: a.amount,
            created_by: userId
          });
          a.status = "allocated";
          allocationsCreated++;
          if (id) allocationIds.push(id);
          await logAudit({
            companyId,
            entityType: "payment_allocation",
            entityId: id || `${a.paymentType}:${a.paymentId}->${a.documentType}:${a.documentId}`,
            action: "create",
            changes: {
              payment_type: a.paymentType,
              payment_id: a.paymentId,
              document_type: a.documentType,
              document_id: a.documentId,
              amount: a.amount,
              auto_match: true
            },
            actorId: userId,
            actorName: "AutoMatch",
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"]
          });
        } catch (e) {
          a.status = "failed";
          a.error = String(e);
        }
      }
    }
    res.json({
      dry_run: dryRun,
      actions,
      summary: {
        total_candidates: actions.length,
        would_allocate: actions.filter((a) => a.status === "would-allocate").length,
        allocated: allocationsCreated,
        skipped: actions.filter((a) => a.status === "skipped").length,
        failed: actions.filter((a) => a.status === "failed").length
      }
    });
  } catch (error) {
    console.error("Error in auto-match:", error);
    return serverError(res, "Failed to auto-match");
  }
});
router8.post("/reconciliation/allocations", requireAuth, requirePermission("banking", "create"), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const { paymentType, paymentId, documentType, documentId, amount } = req.body;
    if (!paymentType || !paymentId || !documentType || !documentId || !amount) {
      return badRequest(res, "Missing required fields");
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return badRequest(res, "Invalid amount");
    if (paymentType === "receipt") {
      const receipts3 = await storage.getReceiptsByCompany(companyId);
      const rec = receipts3.find((r) => r.id === paymentId);
      if (!rec) return notFound(res, "Receipt not found");
    } else {
      const payments3 = await storage.getPaymentsByCompany(companyId);
      const pay = payments3.find((p) => p.id === paymentId);
      if (!pay) return notFound(res, "Payment not found");
    }
    if (documentType === "invoice") {
      const inv = await storage.getSalesInvoiceById(documentId);
      if (!inv) return notFound(res, "Invoice not found");
      if (inv.company_id && inv.company_id !== companyId) {
        return notFound(res, "Invoice not found");
      }
    } else {
      const bill = await storage.getBillById(documentId);
      if (!bill) return notFound(res, "Bill not found");
      if (bill.company_id && bill.company_id !== companyId) {
        return notFound(res, "Bill not found");
      }
    }
    const unallocated = await getUnallocatedAmount(paymentType, paymentId);
    const outstanding = await getTotalAllocated(documentType, documentId).then((totalAllocated) => {
      return (async () => {
        if (documentType === "invoice") {
          const inv = await storage.getSalesInvoiceById(documentId);
          const total = parseFloat(inv?.total?.toString?.() || inv?.total || "0") || 0;
          return Math.max(0, Number((total - totalAllocated).toFixed(2)));
        } else {
          const b = await storage.getBillById(documentId);
          const total = parseFloat(b?.total?.toString?.() || b?.total || "0") || 0;
          return Math.max(0, Number((total - totalAllocated).toFixed(2)));
        }
      })();
    });
    const maxAlloc = Math.min(unallocated, outstanding);
    if (maxAlloc <= 1e-3) return badRequest(res, "Nothing to allocate");
    if (amt - maxAlloc > 0.01) return badRequest(res, "Amount exceeds available");
    const { id: allocationId } = await allocatePayment({
      company_id: companyId,
      payment_type: paymentType,
      payment_id: paymentId,
      document_type: documentType,
      document_id: documentId,
      allocated_amount: amt,
      created_by: userId
    });
    await logAudit({
      companyId,
      entityType: "payment_allocation",
      entityId: allocationId,
      action: "create",
      changes: { payment_type: paymentType, payment_id: paymentId, document_type: documentType, document_id: documentId, amount: amt },
      actorId: userId,
      actorName: req?.session?.userName || userId || "System",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.status(201).json({ success: true, id: allocationId });
  } catch (error) {
    console.error("Error creating allocation:", error);
    return serverError(res, "Failed to create allocation");
  }
});
router8.delete("/reconciliation/allocations/:id", requireAuth, requireRole(["owner", "admin", "accountant"]), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.session.companyId;
    const alloc = await getAllocationById(id);
    if (!alloc || alloc.company_id !== companyId) {
      return notFound(res, "Allocation not found");
    }
    await deletePaymentAllocation(id);
    await logAudit({
      companyId,
      entityType: "payment_allocation",
      entityId: id,
      action: "delete",
      changes: { document_type: alloc.document_type, document_id: alloc.document_id },
      actorId: req.session.userId,
      actorName: req?.session?.userName || req.session.userId || "System",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting allocation:", error);
    return serverError(res, "Failed to delete allocation");
  }
});
router8.post("/reconciliation/allocations/undo-batch", requireAuth, requireRole(["owner", "admin", "accountant"]), async (req, res) => {
  try {
    const body = req.body || {};
    const idsInput = body.ids;
    const ids = Array.isArray(idsInput) ? idsInput.filter((x) => typeof x === "string" && x.trim().length > 0) : [];
    if (!ids.length) {
      return badRequest(res, "No allocation ids provided", { details: [{ path: ["ids"], message: "ids: string[] is required" }] });
    }
    const uniqueIds = Array.from(new Set(ids));
    const errors = [];
    const undoneIds = [];
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    for (const id of uniqueIds) {
      try {
        const alloc = await getAllocationById(id);
        if (!alloc) {
          errors.push({ id, error: "not_found" });
          continue;
        }
        if (alloc.company_id !== companyId) {
          errors.push({ id, error: "forbidden" });
          continue;
        }
        await deletePaymentAllocation(id);
        undoneIds.push(id);
      } catch (e) {
        errors.push({ id, error: String(e) });
      }
    }
    if (undoneIds.length > 0) {
      await logAudit({
        companyId,
        entityType: "payment_allocation",
        entityId: "batch",
        action: "delete",
        changes: { count: undoneIds.length, ids: undoneIds },
        actorId: userId,
        actorName: req?.session?.userName || userId || "System",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
      });
    }
    res.json({
      success: true,
      undone: undoneIds,
      errors: errors.length > 0 ? errors : void 0
    });
  } catch (error) {
    console.error("Error in batch undo:", error);
    return serverError(res, "Failed to batch undo allocations");
  }
});
router8.get("/transactions", async (req, res, next) => {
  try {
    const session3 = req.session;
    if (!session3 || !session3.userId || !session3.companyId) {
      return next();
    }
    const companyId = session3.companyId;
    const accountId = req.query.account_id || void 0;
    let rows;
    try {
      rows = await storage.getBankStatementLinesByCompany(companyId, accountId);
    } catch (err) {
      const msg = String(err?.message || "");
      if (msg.includes('relation "bank_statement_lines" does not exist') || err?.code === "42P01") {
        return res.json([]);
      }
      throw err;
    }
    return res.json(rows);
  } catch (error) {
    console.error("Error fetching banking transactions (session):", error);
    return serverError(res, "Failed to fetch transactions");
  }
});
router8.get("/transactions", requireFirebaseAuth, async (req, res) => {
  try {
    const userId = req.firebaseUser.uid;
    const userCompanies = await storage.getCompaniesByUserId(userId);
    if (userCompanies.length === 0) return res.json([]);
    const companyId = userCompanies[0].id;
    const accountId = req.query.account_id || void 0;
    let rows;
    try {
      rows = await storage.getBankStatementLinesByCompany(companyId, accountId);
    } catch (err) {
      const msg = String(err?.message || "");
      if (msg.includes('relation "bank_statement_lines" does not exist') || err?.code === "42P01") {
        return res.json([]);
      }
      throw err;
    }
    res.json(rows);
  } catch (error) {
    console.error("Error fetching banking transactions:", error);
    return serverError(res, "Failed to fetch transactions");
  }
});
router8.post("/transactions/import", requireFirebaseAuth, async (req, res) => {
  try {
    const userId = req.firebaseUser.uid;
    const userCompanies = await storage.getCompaniesByUserId(userId);
    if (userCompanies.length === 0) return badRequest(res, "No company found");
    const companyId = userCompanies[0].id;
    const lines = Array.isArray(req.body?.lines) ? req.body.lines : [];
    if (lines.length === 0) return badRequest(res, "No lines to import");
    const created = [];
    for (const l of lines) {
      const date = l.date && !isNaN(Date.parse(l.date)) ? new Date(l.date) : /* @__PURE__ */ new Date();
      const amount = Number(l.amount);
      if (!amount || !isFinite(amount)) continue;
      created.push({ ...l, id: `line-${Date.now()}-${Math.random()}` });
    }
    res.json({ success: true, imported: created.length });
  } catch (error) {
    console.error("Error importing transactions:", error);
    return serverError(res, "Failed to import transactions");
  }
});
var banking_default = router8;

// server/routes/journals.ts
import { Router as Router9 } from "express";
init_permissions();
init_sendError();
import { fromZodError as fromZodError9 } from "zod-validation-error";

// server/utils/journalAI.ts
init_db();
init_schema();
init_aiProviders();
import { eq as eq17 } from "drizzle-orm";
async function draftJournalFromText(companyId, text2, date = /* @__PURE__ */ new Date()) {
  try {
    const providers = await db.select().from(ai_providers).where(eq17(ai_providers.company_id, companyId));
    const activeProvider = providers[0];
    if (!activeProvider || !activeProvider.api_key) {
      throw new Error("No AI provider configured");
    }
    const allAccounts = await db.select({
      id: accounts.id,
      name: accounts.name,
      code: accounts.code,
      type: accounts.account_type
    }).from(accounts).where(eq17(accounts.company_id, companyId));
    const accountsContext = allAccounts.map((a) => `${a.code} - ${a.name} (${a.type})`).join("\n");
    const prompt = `
      You are an expert accountant. Create a balanced journal entry from this description:
      "${text2}"
      
      Date: ${date.toISOString().split("T")[0]}
      
      Available Accounts:
      ${accountsContext}
      
      Rules:
      1. Total Debit must equal Total Credit.
      2. Use ONLY the provided accounts. If no exact match, pick the closest one.
      3. Return JSON only.
      
      Output Format:
      {
        "description": "Brief description of the transaction",
        "lines": [
          { "account_code": "CODE", "debit": 100.00, "credit": 0, "description": "Line description" },
          { "account_code": "CODE", "debit": 0, "credit": 100.00, "description": "Line description" }
        ],
        "warnings": ["Any assumptions made"]
      }
    `;
    const response = await callAIProvider({
      provider: (activeProvider.provider || "openai").toLowerCase(),
      model: activeProvider.default_model || "gpt-4o-mini",
      apiKey: activeProvider.api_key,
      baseUrl: activeProvider.base_url || void 0
    }, [{ role: "user", content: prompt }]);
    if (response.content) {
      try {
        const json = JSON.parse(response.content.replace(/```json|```/g, "").trim());
        const lines = json.lines.map((l) => {
          const acc = allAccounts.find((a) => a.code === l.account_code);
          return {
            ...l,
            account_id: acc?.id,
            account_name: acc?.name
          };
        });
        return {
          description: json.description,
          lines,
          warnings: json.warnings
        };
      } catch (e) {
        console.warn("Failed to parse AI journal draft", e);
        throw new Error("Failed to parse AI response");
      }
    }
  } catch (e) {
    console.error("AI journal drafting failed", e);
    throw e;
  }
  return null;
}

// server/routes/journals.ts
init_db();
init_schema();
import { eq as eq18, and as and14, desc as desc6 } from "drizzle-orm";
var router9 = Router9();
router9.get("/", requireAuth2, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const includeLines = req.query.include_lines === "true";
    const startDate = req.query.start_date ? new Date(req.query.start_date) : null;
    const endDate = req.query.end_date ? new Date(req.query.end_date) : null;
    let entries = await db.select().from(journals).where(eq18(journals.company_id, companyId)).orderBy(desc6(journals.date));
    if (startDate || endDate) {
      entries = entries.filter((entry) => {
        const entryDate = new Date(entry.date);
        if (startDate && entryDate < startDate) return false;
        if (endDate && entryDate > endDate) return false;
        return true;
      });
    }
    if (includeLines) {
      const entriesWithLines = await Promise.all(
        entries.map(async (entry) => {
          const lines = await storage.getJournalLinesWithAccounts(entry.id);
          return { ...entry, lines };
        })
      );
      return res.json(entriesWithLines);
    }
    res.json(entries);
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    return serverError(res, "Failed to fetch journal entries");
  }
});
router9.get("/:id", requireAuth2, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.session.companyId;
    const journal = await db.select().from(journals).where(
      and14(
        eq18(journals.id, id),
        eq18(journals.company_id, companyId)
      )
    ).limit(1);
    if (!journal.length) {
      return notFound(res, "Journal entry not found");
    }
    const lines = await db.select().from(journal_lines).where(eq18(journal_lines.journal_id, id));
    res.json({
      ...journal[0],
      lines
    });
  } catch (error) {
    console.error("Error fetching journal entry:", error);
    return serverError(res, "Failed to fetch journal entry");
  }
});
router9.post("/draft-from-nl", requireAuth2, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { text: text2, date } = req.body;
    if (!text2) {
      return badRequest(res, "Text description is required");
    }
    const draft = await draftJournalFromText(companyId, text2, date ? new Date(date) : /* @__PURE__ */ new Date());
    res.json(draft);
  } catch (error) {
    console.error("Error drafting journal from NL:", error);
    return serverError(res, error.message || "Failed to draft journal");
  }
});
router9.get("/by-reference/:refType/:refId", requireAuth2, async (req, res) => {
  try {
    const { refType, refId } = req.params;
    const companyId = req.session.companyId;
    const entries = await db.select().from(journals).where(
      and14(
        eq18(journals.company_id, companyId),
        eq18(journals.source_type, refType),
        eq18(journals.source_id, refId)
      )
    );
    const entriesWithLines = await Promise.all(
      entries.map(async (entry) => {
        const lines = await db.select().from(journal_lines).where(eq18(journal_lines.journal_id, entry.id));
        return {
          ...entry,
          lines
        };
      })
    );
    res.json(entriesWithLines);
  } catch (error) {
    console.error("Error fetching journal entries by reference:", error);
    return serverError(res, "Failed to fetch journal entries");
  }
});
router9.post("/", requireAuth2, requirePermission("accounting", "create"), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const body = normalize(req.body);
    if (!body.entry_date) {
      return badRequest(res, "Entry date is required");
    }
    if (!body.lines || !Array.isArray(body.lines) || body.lines.length < 2) {
      return badRequest(res, "At least 2 journal lines are required");
    }
    let totalDebits = 0;
    let totalCredits = 0;
    body.lines.forEach((line) => {
      const debit = parseFloat(line.debit || "0");
      const credit = parseFloat(line.credit || "0");
      totalDebits += debit;
      totalCredits += credit;
    });
    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      return badRequest(
        res,
        `Debits (${totalDebits}) must equal credits (${totalCredits})`
      );
    }
    const result = await createJournalEntry({
      company_id: companyId,
      date: new Date(body.entry_date),
      source_type: body.source_type || "manual",
      source_id: body.source_id || null,
      description: body.description || "Manual Journal Entry",
      lines: body.lines.map((line) => ({
        account_id: line.account_id,
        debit: parseFloat(line.debit || "0"),
        credit: parseFloat(line.credit || "0"),
        description: line.description || "",
        project_id: line.project_id || null
      })),
      created_by: userId
    });
    if (!result) {
      return serverError(res, "Failed to create journal entry");
    }
    const entry = await db.select().from(journals).where(eq18(journals.id, result.id)).limit(1);
    const lines = await db.select().from(journal_lines).where(eq18(journal_lines.journal_id, result.id));
    await logCreate({
      companyId,
      entityType: "journal",
      entityId: result.id,
      createdData: { journal_number: result.journal_number, description: body.description, total: totalDebits },
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.status(201).json({
      ...entry[0],
      lines
    });
  } catch (error) {
    if (error.name === "ZodError") {
      const validationError = fromZodError9(error);
      return badRequest(res, validationError.message);
    } else {
      console.error("Error creating journal entry:", error);
      return serverError(res, "Failed to create journal entry");
    }
  }
});
router9.post("/:id/reverse", requireAuth2, requireRole2(["owner", "admin", "accountant"]), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const { reason } = req.body;
    const journal = await db.select().from(journals).where(
      and14(
        eq18(journals.id, id),
        eq18(journals.company_id, companyId)
      )
    ).limit(1);
    if (!journal.length) {
      return notFound(res, "Journal entry not found");
    }
    const result = await reverseJournalEntry(
      id,
      /* @__PURE__ */ new Date(),
      reason || "Reversal of journal entry",
      userId
    );
    if (!result) {
      return serverError(res, "Failed to reverse journal entry");
    }
    await logAudit({
      companyId,
      entityType: "journal",
      entityId: id,
      action: "update",
      changes: { action: "reverse", reversing_entry_id: result.id, reason },
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json({
      success: true,
      reversing_entry_id: result.id,
      journal_number: result.journal_number
    });
  } catch (error) {
    console.error("Error reversing journal entry:", error);
    return serverError(res, "Failed to reverse journal entry");
  }
});
router9.delete("/:id", requireAuth2, requireRole2(["owner", "admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const journal = await db.select().from(journals).where(
      and14(
        eq18(journals.id, id),
        eq18(journals.company_id, companyId)
      )
    ).limit(1);
    if (!journal.length) {
      return notFound(res, "Journal entry not found");
    }
    if (journal[0].source_type !== "manual") {
      return badRequest(
        res,
        "Cannot delete system-generated journal entries. Use reverse instead."
      );
    }
    await db.delete(journal_lines).where(eq18(journal_lines.journal_id, id));
    await db.delete(journals).where(eq18(journals.id, id));
    await logDelete({
      companyId,
      entityType: "journal",
      entityId: id,
      deletedData: { journal_number: journal[0].journal_number, description: journal[0].description },
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting journal entry:", error);
    return serverError(res, "Failed to delete journal entry");
  }
});
var journals_default = router9;

// server/routes/bankReconciliation.ts
import { Router as Router10 } from "express";
init_sendError();

// server/utils/bankReconciliation.ts
init_db();
init_schema();
import { eq as eq19, and as and15, between, sql as sql10 } from "drizzle-orm";
async function getUnreconciledTransactions(companyId, bankAccountId, startDate, endDate) {
  const conditions = [
    eq19(payments.company_id, companyId),
    eq19(payments.bank_account_id, bankAccountId),
    eq19(payments.reconciled, false)
  ];
  if (startDate && endDate) {
    conditions.push(between(payments.date, startDate, endDate));
  }
  const unreconciledPayments = await db.select({
    id: payments.id,
    type: sql10`'payment'`,
    date: payments.date,
    amount: payments.amount,
    reference: payments.payment_number,
    description: payments.description,
    reconciled: payments.reconciled
  }).from(payments).where(and15(...conditions));
  const receiptConditions = [
    eq19(receipts.company_id, companyId),
    eq19(receipts.bank_account_id, bankAccountId),
    eq19(receipts.reconciled, false)
  ];
  if (startDate && endDate) {
    receiptConditions.push(between(receipts.date, startDate, endDate));
  }
  const unreconciledReceipts = await db.select({
    id: receipts.id,
    type: sql10`'receipt'`,
    date: receipts.date,
    amount: receipts.amount,
    reference: receipts.receipt_number,
    description: receipts.description,
    reconciled: receipts.reconciled
  }).from(receipts).where(and15(...receiptConditions));
  return {
    payments: unreconciledPayments,
    receipts: unreconciledReceipts,
    all: [...unreconciledPayments, ...unreconciledReceipts].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  };
}
async function getReconciliationById(reconciliationId) {
  const [reconciliation] = await db.select().from(bank_reconciliations).where(eq19(bank_reconciliations.id, reconciliationId)).limit(1);
  if (!reconciliation) {
    return null;
  }
  const items3 = await db.select().from(bank_reconciliation_items).where(eq19(bank_reconciliation_items.reconciliation_id, reconciliationId));
  return {
    ...reconciliation,
    items: items3
  };
}
async function getReconciliationsByBankAccount(companyId, bankAccountId) {
  return await db.select().from(bank_reconciliations).where(
    and15(
      eq19(bank_reconciliations.company_id, companyId),
      eq19(bank_reconciliations.bank_account_id, bankAccountId)
    )
  ).orderBy(sql10`${bank_reconciliations.reconciliation_date} DESC`);
}
async function getBankAccountBalance(companyId, bankAccountId, asOfDate) {
  let receiptTotal = 0;
  let paymentTotal = 0;
  const receiptConditions = [
    eq19(receipts.company_id, companyId),
    eq19(receipts.bank_account_id, bankAccountId),
    eq19(receipts.status, "received")
  ];
  if (asOfDate) {
    receiptConditions.push(sql10`${receipts.date} <= ${asOfDate}`);
  }
  const receiptsResult = await db.select({
    total: sql10`COALESCE(SUM(${receipts.amount}::numeric), 0)`
  }).from(receipts).where(and15(...receiptConditions));
  receiptTotal = parseFloat(receiptsResult[0]?.total || "0");
  const paymentConditions = [
    eq19(payments.company_id, companyId),
    eq19(payments.bank_account_id, bankAccountId),
    eq19(payments.status, "paid")
  ];
  if (asOfDate) {
    paymentConditions.push(sql10`${payments.date} <= ${asOfDate}`);
  }
  const paymentsResult = await db.select({
    total: sql10`COALESCE(SUM(${payments.amount}::numeric), 0)`
  }).from(payments).where(and15(...paymentConditions));
  paymentTotal = parseFloat(paymentsResult[0]?.total || "0");
  const [bankAccount] = await db.select().from(bank_accounts).where(eq19(bank_accounts.id, bankAccountId)).limit(1);
  const openingBalance = parseFloat(bankAccount?.opening_balance || "0");
  return {
    opening_balance: openingBalance,
    total_receipts: receiptTotal,
    total_payments: paymentTotal,
    current_balance: openingBalance + receiptTotal - paymentTotal
  };
}

// server/utils/reconciliationAI.ts
init_db();
init_schema();
init_aiProviders();
import { eq as eq20, and as and16, sql as sql11 } from "drizzle-orm";
async function findMatches(companyId, bankAccountId, line, options2 = {}) {
  const amountTolerance = options2.amountTolerance ?? 0.01;
  const dateToleranceDays = options2.dateToleranceDays ?? 5;
  const isPayment = line.amount < 0;
  const absAmount = Math.abs(line.amount);
  const startDate = new Date(line.date);
  startDate.setDate(startDate.getDate() - dateToleranceDays);
  const endDate = new Date(line.date);
  endDate.setDate(endDate.getDate() + dateToleranceDays);
  let candidates = [];
  if (isPayment) {
    const rows = await db.select().from(payments).where(and16(
      eq20(payments.company_id, companyId),
      eq20(payments.bank_account_id, bankAccountId),
      eq20(payments.reconciled, false),
      sql11`${payments.amount} BETWEEN ${absAmount - amountTolerance} AND ${absAmount + amountTolerance}`,
      sql11`${payments.date} BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}`
    ));
    candidates = rows.map((r) => ({
      id: r.id,
      type: "payment",
      date: r.date,
      amount: Number(r.amount),
      description: r.description,
      reference: r.payment_number,
      score: 0,
      reason: ""
    }));
  } else {
    const rows = await db.select().from(receipts).where(and16(
      eq20(receipts.company_id, companyId),
      eq20(receipts.bank_account_id, bankAccountId),
      eq20(receipts.reconciled, false),
      sql11`${receipts.amount} BETWEEN ${absAmount - amountTolerance} AND ${absAmount + amountTolerance}`,
      sql11`${receipts.date} BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}`
    ));
    candidates = rows.map((r) => ({
      id: r.id,
      type: "receipt",
      date: r.date,
      amount: Number(r.amount),
      description: r.description,
      reference: r.receipt_number,
      score: 0,
      reason: ""
    }));
  }
  for (const c of candidates) {
    let score = 0;
    const reasons = [];
    if (Math.abs(c.amount - absAmount) < 1e-3) {
      score += 50;
      reasons.push("Exact amount");
    } else {
      score += 30;
      reasons.push("Close amount");
    }
    const daysDiff = Math.abs((new Date(c.date).getTime() - new Date(line.date).getTime()) / (1e3 * 60 * 60 * 24));
    if (daysDiff === 0) {
      score += 30;
      reasons.push("Same date");
    } else if (daysDiff <= 1) {
      score += 20;
      reasons.push("\xB11 day");
    } else {
      score += Math.max(0, 10 - daysDiff);
    }
    if (line.description && c.description) {
      const lineTokens = line.description.toLowerCase().split(/\W+/);
      const descTokens = c.description.toLowerCase().split(/\W+/);
      const matches = lineTokens.filter((t) => t.length > 3 && descTokens.includes(t));
      if (matches.length > 0) {
        score += 20 + matches.length * 5;
        reasons.push(`Matched words: ${matches.join(", ")}`);
      }
    }
    c.score = Math.min(100, score);
    c.reason = reasons.join(", ");
  }
  return candidates.sort((a, b) => b.score - a.score);
}
async function suggestClassification(companyId, line) {
  try {
    const providers = await db.select().from(ai_providers).where(eq20(ai_providers.company_id, companyId));
    const activeProvider = providers[0];
    if (!activeProvider || !activeProvider.api_key) {
      return { category: "Uncategorized", confidence: 0, reason: "No AI provider configured" };
    }
    const expenseAccounts = await db.select({ name: accounts.name, code: accounts.code }).from(accounts).where(and16(eq20(accounts.company_id, companyId), eq20(accounts.account_type, "expense"))).limit(50);
    const recentContacts = await db.select({ name: contacts.name }).from(contacts).where(eq20(contacts.company_id, companyId)).limit(50);
    const prompt = `
      Classify this bank transaction:
      Description: "${line.description}"
      Amount: ${line.amount} ${line.currency}
      
      Available Expense Accounts: ${expenseAccounts.map((a) => a.name).join(", ")}
      Available Contacts: ${recentContacts.map((c) => c.name).join(", ")}
      
      Return JSON with:
      - category (best matching expense account name or "Uncategorized")
      - counterparty (best matching contact name or suggest a new one)
      - confidence (0-1)
      - reason (short explanation)
    `;
    const response = await callAIProvider({
      provider: (activeProvider.provider || "openai").toLowerCase(),
      model: activeProvider.default_model || "gpt-4o-mini",
      apiKey: activeProvider.api_key,
      baseUrl: activeProvider.base_url || void 0
    }, [{ role: "user", content: prompt }]);
    if (response.content) {
      try {
        const json = JSON.parse(response.content.replace(/```json|```/g, "").trim());
        return json;
      } catch (e) {
        console.warn("Failed to parse AI classification", e);
      }
    }
  } catch (e) {
    console.error("AI classification failed", e);
  }
  return null;
}

// server/routes/bankReconciliation.ts
var router10 = Router10();
router10.get("/unreconciled/:bankAccountId", requireAuth, async (req, res) => {
  try {
    const { bankAccountId } = req.params;
    const { startDate, endDate } = req.query;
    const companyId = req.session.companyId;
    const start = startDate ? new Date(startDate) : void 0;
    const end = endDate ? new Date(endDate) : void 0;
    const transactions = await getUnreconciledTransactions(
      companyId,
      bankAccountId,
      start,
      end
    );
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching unreconciled transactions:", error);
    return serverError(res, "Failed to fetch unreconciled transactions");
  }
});
router10.get("/balance/:bankAccountId", requireAuth, async (req, res) => {
  try {
    const { bankAccountId } = req.params;
    const { asOfDate } = req.query;
    const companyId = req.session.companyId;
    const asOf = asOfDate ? new Date(asOfDate) : void 0;
    const balance = await getBankAccountBalance(companyId, bankAccountId, asOf);
    res.json(balance);
  } catch (error) {
    console.error("Error fetching bank account balance:", error);
    return serverError(res, "Failed to fetch bank account balance");
  }
});
router10.get("/account/:bankAccountId", requireAuth, async (req, res) => {
  try {
    const { bankAccountId } = req.params;
    const companyId = req.session.companyId;
    const reconciliations = await getReconciliationsByBankAccount(
      companyId,
      bankAccountId
    );
    res.json(reconciliations);
  } catch (error) {
    console.error("Error fetching reconciliations:", error);
    return serverError(res, "Failed to fetch reconciliations");
  }
});
router10.get("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const reconciliation = await getReconciliationById(id);
    if (!reconciliation) {
      return notFound(res, "Reconciliation not found");
    }
    res.json(reconciliation);
  } catch (error) {
    console.error("Error fetching reconciliation:", error);
    return serverError(res, "Failed to fetch reconciliation");
  }
});
router10.post("/match", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { bankAccountId, line, options: options2 } = req.body;
    if (!bankAccountId || !line) {
      return badRequest(res, "bankAccountId and line are required");
    }
    const candidates = await findMatches(companyId, bankAccountId, line, options2);
    res.json(candidates);
  } catch (error) {
    console.error("Error finding matches:", error);
    return serverError(res, "Failed to find matches");
  }
});
router10.post("/classify", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { line } = req.body;
    if (!line) {
      return badRequest(res, "line is required");
    }
    const suggestion = await suggestClassification(companyId, line);
    res.json(suggestion);
  } catch (error) {
    console.error("Error classifying transaction:", error);
    return serverError(res, "Failed to classify transaction");
  }
});
var bankReconciliation_default = router10;

// server/routes/currencies.ts
init_db();
init_schema();
init_permissions();
import { Router as Router11 } from "express";
import { eq as eq21, desc as desc8 } from "drizzle-orm";
init_sendError();
var router11 = Router11();
router11.get("/", requireAuth, async (req, res) => {
  try {
    await seedCurrencies();
    const allCurrencies = await db.select().from(currencies).where(eq21(currencies.is_active, true));
    res.json(allCurrencies);
  } catch (error) {
    console.error("Error fetching currencies:", error);
    return serverError(res, "Failed to fetch currencies");
  }
});
router11.get("/rates", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const rates = await db.select().from(exchange_rates).where(eq21(exchange_rates.company_id, companyId)).orderBy(desc8(exchange_rates.date));
    res.json(rates);
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return serverError(res, "Failed to fetch exchange rates");
  }
});
router11.get("/live-rate", requireAuth, async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return badRequest(res, "From and To currencies are required");
    }
    const rate = await fetchLiveExchangeRate(from, to);
    res.json({ rate });
  } catch (error) {
    console.error("Error fetching live rate:", error);
    return serverError(res, "Failed to fetch live rate");
  }
});
router11.post("/rates", requireAuth, requirePermission("settings", "edit"), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const body = normalize(req.body);
    if (!body.from_currency || !body.to_currency || !body.rate) {
      return badRequest(res, "Missing required fields");
    }
    const rate = await db.insert(exchange_rates).values({
      company_id: companyId,
      from_currency: body.from_currency,
      to_currency: body.to_currency,
      rate: body.rate.toString(),
      date: body.date ? new Date(body.date) : /* @__PURE__ */ new Date(),
      source: "manual",
      created_by: userId
    }).returning();
    await logCreate({
      companyId,
      entityType: "exchange_rate",
      entityId: rate[0].id,
      createdData: { from_currency: body.from_currency, to_currency: body.to_currency, rate: body.rate },
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.status(201).json(rate[0]);
  } catch (error) {
    console.error("Error creating exchange rate:", error);
    return serverError(res, "Failed to create exchange rate");
  }
});
router11.post("/convert", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { amount, from, to, date } = req.body;
    if (!amount || !from || !to) {
      return badRequest(res, "Missing required fields");
    }
    const result = await convertCurrency(
      companyId,
      parseFloat(amount),
      from,
      to,
      date ? new Date(date) : /* @__PURE__ */ new Date()
    );
    const rate = await getExchangeRate(
      companyId,
      from,
      to,
      date ? new Date(date) : /* @__PURE__ */ new Date()
    );
    res.json({
      amount: parseFloat(amount),
      from,
      to,
      rate,
      result,
      date: date || /* @__PURE__ */ new Date()
    });
  } catch (error) {
    console.error("Error converting currency:", error);
    return serverError(res, "Failed to convert currency");
  }
});
var currencies_default = router11;

// server/routes/reports.ts
import { Router as Router12 } from "express";
init_reports();
init_sendError();

// server/utils/forecasting.ts
init_db();
init_schema();
init_aiProviders();
import { eq as eq23, and as and19, or as or4, sql as sql13 } from "drizzle-orm";
async function generateCashFlowForecast(companyId, months = 3, useAI = false) {
  const today = /* @__PURE__ */ new Date();
  const endDate = new Date(today);
  endDate.setMonth(today.getMonth() + months);
  const accounts5 = await db.select().from(bank_accounts).where(eq23(bank_accounts.company_id, companyId));
  let currentBalance = 0;
  for (const acc of accounts5) {
    const [receiptsResult] = await db.select({ total: sql13`sum(amount)` }).from(receipts).where(and19(
      eq23(receipts.bank_account_id, acc.id),
      eq23(receipts.status, "cleared")
      // Only cleared funds count for actual cash
    ));
    const [paymentsResult] = await db.select({ total: sql13`sum(amount)` }).from(payments).where(and19(
      eq23(payments.bank_account_id, acc.id),
      eq23(payments.status, "completed")
      // Only completed payments
    ));
    const r = parseFloat(receiptsResult?.total || "0");
    const p = parseFloat(paymentsResult?.total || "0");
    currentBalance += r - p;
  }
  const items3 = [];
  const unpaidInvoices = await db.select({
    invoice: sales_invoices,
    customerName: contacts.name
  }).from(sales_invoices).leftJoin(contacts, eq23(sales_invoices.customer_id, contacts.id)).where(and19(
    eq23(sales_invoices.company_id, companyId),
    or4(eq23(sales_invoices.status, "sent"), eq23(sales_invoices.status, "overdue"), eq23(sales_invoices.status, "partially_paid"))
  ));
  for (const { invoice, customerName } of unpaidInvoices) {
    if (invoice.due_date && new Date(invoice.due_date) <= endDate) {
      let date = new Date(invoice.due_date);
      if (date < today) date = today;
      const total = parseFloat(invoice.total.toString());
      const paid = parseFloat(invoice.paid_amount.toString());
      const remaining = total - paid;
      if (remaining > 0) {
        items3.push({
          date: date.toISOString().split("T")[0],
          description: `Invoice #${invoice.invoice_number} (${customerName || "Unknown Customer"})`,
          amount: remaining,
          type: "inflow",
          source: "invoice",
          confidence: 0.9
        });
      }
    }
  }
  const unpaidBills = await db.select({
    bill: bills,
    vendorName: contacts.name
  }).from(bills).leftJoin(contacts, eq23(bills.supplier_id, contacts.id)).where(and19(
    eq23(bills.company_id, companyId),
    or4(eq23(bills.status, "received"), eq23(bills.status, "overdue"), eq23(bills.status, "partially_paid"))
  ));
  for (const { bill, vendorName } of unpaidBills) {
    if (bill.due_date && new Date(bill.due_date) <= endDate) {
      let date = new Date(bill.due_date);
      if (date < today) date = today;
      const total = parseFloat(bill.total.toString());
      const paid = parseFloat(bill.paid_amount.toString());
      const remaining = total - paid;
      if (remaining > 0) {
        items3.push({
          date: date.toISOString().split("T")[0],
          description: `Bill #${bill.bill_number} (${vendorName || "Unknown Vendor"})`,
          amount: remaining,
          type: "outflow",
          source: "bill",
          confidence: 0.9
        });
      }
    }
  }
  const templates = await db.select().from(recurring_templates).where(and19(
    eq23(recurring_templates.company_id, companyId),
    eq23(recurring_templates.is_active, true)
  ));
  for (const tmpl of templates) {
    let nextDate = new Date(tmpl.next_run_date);
    while (nextDate <= endDate) {
      if (nextDate >= today) {
        const data = tmpl.template_data;
        const amount = parseFloat(data.total || "0");
        if (tmpl.document_type === "invoice") {
          items3.push({
            date: nextDate.toISOString().split("T")[0],
            description: `Recurring Invoice: ${tmpl.template_name}`,
            amount,
            type: "inflow",
            source: "recurring_invoice",
            confidence: 0.8
          });
        } else if (tmpl.document_type === "bill" || tmpl.document_type === "expense") {
          items3.push({
            date: nextDate.toISOString().split("T")[0],
            description: `Recurring ${tmpl.document_type}: ${tmpl.template_name}`,
            amount,
            type: "outflow",
            source: "recurring_bill",
            confidence: 0.8
          });
        }
      }
      if (tmpl.frequency === "daily") nextDate.setDate(nextDate.getDate() + (tmpl.interval || 1));
      else if (tmpl.frequency === "weekly") nextDate.setDate(nextDate.getDate() + 7 * (tmpl.interval || 1));
      else if (tmpl.frequency === "monthly") nextDate.setMonth(nextDate.getMonth() + (tmpl.interval || 1));
      else if (tmpl.frequency === "quarterly") nextDate.setMonth(nextDate.getMonth() + 3 * (tmpl.interval || 1));
      else if (tmpl.frequency === "yearly") nextDate.setFullYear(nextDate.getFullYear() + (tmpl.interval || 1));
      else break;
    }
  }
  items3.sort((a, b) => a.date.localeCompare(b.date));
  const timeline = [];
  let runningBalance = currentBalance;
  let totalInflow = 0;
  let totalOutflow = 0;
  let lowestBalance = currentBalance;
  let lowestBalanceDate = today.toISOString().split("T")[0];
  const groupedByDate = {};
  items3.forEach((item) => {
    if (!groupedByDate[item.date]) groupedByDate[item.date] = [];
    groupedByDate[item.date].push(item);
  });
  const dates = Object.keys(groupedByDate).sort();
  const todayStr = today.toISOString().split("T")[0];
  if (!dates.includes(todayStr)) dates.unshift(todayStr);
  for (const dateStr of dates) {
    const dayItems = groupedByDate[dateStr] || [];
    let dayInflow = 0;
    let dayOutflow = 0;
    dayItems.forEach((item) => {
      if (item.type === "inflow") dayInflow += item.amount;
      else dayOutflow += item.amount;
    });
    runningBalance += dayInflow - dayOutflow;
    totalInflow += dayInflow;
    totalOutflow += dayOutflow;
    if (runningBalance < lowestBalance) {
      lowestBalance = runningBalance;
      lowestBalanceDate = dateStr;
    }
    timeline.push({
      date: dateStr,
      balance: runningBalance,
      inflow: dayInflow,
      outflow: dayOutflow,
      items: dayItems
    });
  }
  let aiAnalysis;
  if (useAI) {
    try {
      const [provider] = await db.select().from(ai_providers).where(eq23(ai_providers.company_id, companyId));
      if (provider?.api_key) {
        const summaryText = `
Current Balance: ${currentBalance}
Projected Balance (in ${months} months): ${runningBalance}
Total Inflow: ${totalInflow}
Total Outflow: ${totalOutflow}
Lowest Balance: ${lowestBalance} on ${lowestBalanceDate}
Timeline Summary:
${timeline.map((t) => `${t.date}: Bal ${t.balance} (+${t.inflow}, -${t.outflow})`).join("\n")}
        `.trim();
        const prompt = `Analyze this cash flow forecast summary. Identify potential risks (e.g., negative balance, low liquidity) and opportunities. Be concise (max 3 sentences).`;
        const response = await callAIProvider({
          provider: provider.provider || "openai",
          apiKey: provider.api_key,
          baseUrl: provider.base_url || void 0,
          model: provider.default_model || "gpt-4o-mini"
        }, [
          { role: "system", content: "You are a financial analyst." },
          { role: "user", content: prompt + "\n\nData:\n" + summaryText }
        ]);
        aiAnalysis = response.content;
      }
    } catch (e) {
      console.error("AI Forecast Analysis failed:", e);
    }
  }
  return {
    currentBalance,
    projectedBalance: runningBalance,
    timeline,
    summary: {
      totalInflow,
      totalOutflow,
      netChange: totalInflow - totalOutflow,
      lowestBalance,
      lowestBalanceDate
    },
    aiAnalysis
  };
}

// server/routes/reports.ts
init_db();
init_schema();
import { eq as eq24, and as and20, gte as gte7 } from "drizzle-orm";
var router12 = Router12();
router12.get("/trial-balance", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return badRequest(res, "startDate and endDate are required");
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return badRequest(res, "Invalid date format");
    }
    const cacheKey = CacheKeys.trialBalance(companyId, startDate, endDate);
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    const report = await getTrialBalance(companyId, start, end);
    await setCache(cacheKey, report, CacheTTL.LONG);
    res.json(report);
  } catch (error) {
    console.error("Error generating trial balance:", error);
    serverError(res, "Failed to generate trial balance");
  }
});
router12.get("/general-ledger", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { accountId, startDate, endDate } = req.query;
    if (!accountId || !startDate || !endDate) {
      return badRequest(res, "accountId, startDate and endDate are required");
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return badRequest(res, "Invalid date format");
    }
    const report = await getGeneralLedger(companyId, accountId, start, end);
    res.json(report);
  } catch (error) {
    console.error("Error generating general ledger:", error);
    serverError(res, "Failed to generate general ledger");
  }
});
router12.get("/income-statement", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return badRequest(res, "startDate and endDate are required");
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return badRequest(res, "Invalid date format");
    }
    const report = await getIncomeStatement(companyId, start, end);
    res.json(report);
  } catch (error) {
    console.error("Error generating income statement:", error);
    serverError(res, "Failed to generate income statement");
  }
});
router12.get("/balance-sheet", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { date } = req.query;
    if (!date) {
      return badRequest(res, "date is required");
    }
    const asOfDate = new Date(date);
    if (isNaN(asOfDate.getTime())) {
      return badRequest(res, "Invalid date format");
    }
    const report = await getBalanceSheet(companyId, asOfDate);
    res.json(report);
  } catch (error) {
    console.error("Error generating balance sheet:", error);
    serverError(res, "Failed to generate balance sheet");
  }
});
router12.get("/consolidated-balance-sheet", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { date } = req.query;
    if (!date) {
      return badRequest(res, "date is required");
    }
    const asOfDate = new Date(date);
    if (isNaN(asOfDate.getTime())) {
      return badRequest(res, "Invalid date format");
    }
    const report = await getConsolidatedBalanceSheet(companyId, asOfDate);
    res.json(report);
  } catch (error) {
    console.error("Error generating consolidated balance sheet:", error);
    serverError(res, "Failed to generate consolidated balance sheet");
  }
});
router12.get("/cash-flow-forecast", requireAuth, async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 3;
    const useAI = req.query.useAI === "true";
    const companyId = req.session.companyId;
    const forecast = await generateCashFlowForecast(companyId, months, useAI);
    res.json(forecast);
  } catch (error) {
    serverError(res, error, { message: "Error generating cash flow forecast" });
  }
});
router12.get("/ai-analytics", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const days = parseInt(req.query.days) || 30;
    const startDate = /* @__PURE__ */ new Date();
    startDate.setDate(startDate.getDate() - days);
    const logs = await db.select().from(audit_logs).where(and20(
      eq24(audit_logs.company_id, companyId),
      eq24(audit_logs.entity_type, "ai_invoice_extract"),
      gte7(audit_logs.timestamp, startDate)
    ));
    const summary = {
      totalExtractions: logs.length,
      successfulExtractions: logs.filter((l) => l.changes?.success).length,
      failedExtractions: logs.filter((l) => !l.changes?.success).length,
      successRate: 0,
      estimatedCost: logs.reduce((acc, l) => acc + (l.changes?.estimated_cost_usd || 0), 0),
      currency: "USD"
    };
    summary.successRate = summary.totalExtractions ? Math.round(summary.successfulExtractions / summary.totalExtractions * 100) : 0;
    const providersMap = /* @__PURE__ */ new Map();
    const modelsMap = /* @__PURE__ */ new Map();
    const modesMap = /* @__PURE__ */ new Map();
    const dailyTrendMap = /* @__PURE__ */ new Map();
    logs.forEach((l) => {
      const changes = l.changes || {};
      const provider = changes.provider || "unknown";
      const model = changes.model || "unknown";
      const mode = changes.mode || "unknown";
      const date = l.timestamp.toISOString().split("T")[0];
      if (!providersMap.has(provider)) providersMap.set(provider, { total: 0, success: 0 });
      const p = providersMap.get(provider);
      p.total++;
      if (changes.success) p.success++;
      modelsMap.set(model, (modelsMap.get(model) || 0) + 1);
      modesMap.set(mode, (modesMap.get(mode) || 0) + 1);
      if (!dailyTrendMap.has(date)) dailyTrendMap.set(date, { extractions: 0, success: 0 });
      const d = dailyTrendMap.get(date);
      d.extractions++;
      if (changes.success) d.success++;
    });
    const providers = Array.from(providersMap.entries()).map(([name, stats]) => ({
      name,
      total: stats.total,
      success: stats.success,
      successRate: stats.total ? Math.round(stats.success / stats.total * 100) + "%" : "0%"
    }));
    const models = Array.from(modelsMap.entries()).map(([name, count3]) => ({ name, count: count3 }));
    const modes = Array.from(modesMap.entries()).map(([name, count3]) => ({ name, count: count3 }));
    const dailyTrend = Array.from(dailyTrendMap.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([date, stats]) => ({ date, ...stats }));
    const recentExtractions = logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10).map((l) => ({
      id: l.id,
      timestamp: l.timestamp.toISOString(),
      entity_id: l.entity_id,
      provider: l.changes?.provider || "unknown",
      model: l.changes?.model || "unknown",
      mode: l.changes?.mode || "unknown",
      success: !!l.changes?.success,
      actor: l.actor_name || "System",
      cost: l.changes?.estimated_cost_usd,
      tokens: {
        in: l.changes?.estimated_tokens_in || 0,
        out: l.changes?.estimated_tokens_out || 0
      },
      error: l.changes?.error
    }));
    res.json({
      summary,
      providers,
      models,
      modes,
      dailyTrend,
      recentExtractions
    });
  } catch (error) {
    console.error("Error generating AI analytics:", error);
    serverError(res, "Failed to generate AI analytics");
  }
});
router12.get("/global-dashboard", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const stats = await getGlobalDashboardStats(companyId);
    res.json(stats);
  } catch (error) {
    console.error("Error fetching global dashboard:", error);
    return serverError(res, "Failed to fetch global dashboard stats");
  }
});
router12.get("/aging", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { type, asOfDate } = req.query;
    if (!type || !["receivable", "payable"].includes(type)) {
      return badRequest(res, "type must be 'receivable' or 'payable'");
    }
    const asOf = asOfDate ? new Date(asOfDate) : /* @__PURE__ */ new Date();
    if (isNaN(asOf.getTime())) {
      return badRequest(res, "Invalid date format");
    }
    const { getAgingReport: getAgingReport2 } = await Promise.resolve().then(() => (init_reports(), reports_exports));
    const report = await getAgingReport2(companyId, type, asOf);
    res.json(report);
  } catch (error) {
    console.error("Error generating aging report:", error);
    serverError(res, "Failed to generate aging report");
  }
});
router12.get("/contact-statement/:contactId", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { contactId } = req.params;
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return badRequest(res, "startDate and endDate are required");
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return badRequest(res, "Invalid date format");
    }
    const { getContactStatement: getContactStatement2 } = await Promise.resolve().then(() => (init_reports(), reports_exports));
    const statement = await getContactStatement2(companyId, contactId, start, end);
    res.json(statement);
  } catch (error) {
    console.error("Error generating contact statement:", error);
    serverError(res, "Failed to generate contact statement");
  }
});
router12.get("/sales-summary", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return badRequest(res, "startDate and endDate are required");
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return badRequest(res, "Invalid date format");
    }
    const { getSalesSummary: getSalesSummary2 } = await Promise.resolve().then(() => (init_reports(), reports_exports));
    const summary = await getSalesSummary2(companyId, start, end);
    res.json(summary);
  } catch (error) {
    console.error("Error generating sales summary:", error);
    serverError(res, "Failed to generate sales summary");
  }
});
router12.get("/purchases-summary", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return badRequest(res, "startDate and endDate are required");
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return badRequest(res, "Invalid date format");
    }
    const { getPurchasesSummary: getPurchasesSummary2 } = await Promise.resolve().then(() => (init_reports(), reports_exports));
    const summary = await getPurchasesSummary2(companyId, start, end);
    res.json(summary);
  } catch (error) {
    console.error("Error generating purchases summary:", error);
    serverError(res, "Failed to generate purchases summary");
  }
});
router12.get("/profit-loss-comparison", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { period1Start, period1End, period2Start, period2End } = req.query;
    if (!period1Start || !period1End || !period2Start || !period2End) {
      return badRequest(res, "All period dates are required");
    }
    const p1Start = new Date(period1Start);
    const p1End = new Date(period1End);
    const p2Start = new Date(period2Start);
    const p2End = new Date(period2End);
    if (isNaN(p1Start.getTime()) || isNaN(p1End.getTime()) || isNaN(p2Start.getTime()) || isNaN(p2End.getTime())) {
      return badRequest(res, "Invalid date format");
    }
    const { getProfitLossComparison: getProfitLossComparison2 } = await Promise.resolve().then(() => (init_reports(), reports_exports));
    const comparison = await getProfitLossComparison2(companyId, p1Start, p1End, p2Start, p2End);
    res.json(comparison);
  } catch (error) {
    console.error("Error generating profit/loss comparison:", error);
    serverError(res, "Failed to generate profit/loss comparison");
  }
});
var reports_default = router12;

// server/routes/fixedAssets.ts
init_db();
init_schema();
init_permissions();
import { Router as Router13 } from "express";
import { eq as eq26, desc as desc10 } from "drizzle-orm";
init_sendError();

// server/utils/fixedAssets.ts
init_db();
init_schema();
import { eq as eq25, sql as sql14, desc as desc9 } from "drizzle-orm";
async function calculateDepreciation(assetId, targetDate) {
  const asset = await db.query.fixed_assets.findFirst({
    where: eq25(fixed_assets.id, assetId)
  });
  if (!asset) throw new Error("Asset not found");
  if (!asset.is_active) return { amount: 0, months: 0, startDate: targetDate, endDate: targetDate };
  const cost = parseFloat(asset.cost?.toString() || "0");
  const salvage = parseFloat(asset.salvage_value?.toString() || "0");
  const lifeYears = asset.useful_life_years;
  const accumulated = parseFloat(asset.accumulated_depreciation?.toString() || "0");
  const depreciableAmount = cost - salvage;
  if (accumulated >= depreciableAmount) {
    return { amount: 0, months: 0, startDate: targetDate, endDate: targetDate };
  }
  const lastEntry = await db.query.asset_depreciation_entries.findFirst({
    where: eq25(asset_depreciation_entries.asset_id, assetId),
    orderBy: [desc9(asset_depreciation_entries.date)]
  });
  let startDate;
  if (lastEntry) {
    startDate = new Date(lastEntry.date);
  } else {
    startDate = new Date(asset.acquisition_date);
    if (startDate.getDate() > 15) {
      startDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
    } else {
      startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    }
  }
  if (targetDate <= startDate) {
    return { amount: 0, months: 0, startDate, endDate: targetDate };
  }
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth();
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth();
  let months = (targetYear - startYear) * 12 + (targetMonth - startMonth);
  if (!lastEntry) {
    months += 1;
  }
  if (months <= 0) return { amount: 0, months: 0, startDate, endDate: targetDate };
  let amount = 0;
  if (asset.depreciation_method === "straight_line") {
    const annualDepreciation = depreciableAmount / lifeYears;
    const monthlyDepreciation = annualDepreciation / 12;
    amount = monthlyDepreciation * months;
  } else if (asset.depreciation_method === "declining_balance") {
    const rate = 2 / lifeYears;
    const bookValue = cost - accumulated;
    const annualDepreciation = bookValue * rate;
    const monthlyDepreciation = annualDepreciation / 12;
    amount = monthlyDepreciation * months;
  }
  const remaining = depreciableAmount - accumulated;
  if (amount > remaining) {
    amount = remaining;
  }
  amount = Math.round(amount * 100) / 100;
  return { amount, months, startDate, endDate: targetDate };
}
async function postDepreciation(companyId, assetId, date, userId) {
  const calculation = await calculateDepreciation(assetId, date);
  if (calculation.amount <= 0) {
    return null;
  }
  const asset = await db.query.fixed_assets.findFirst({
    where: eq25(fixed_assets.id, assetId)
  });
  if (!asset) throw new Error("Asset not found");
  const journalNumber = await getNextDocumentNumber(companyId, "journal");
  const [journal] = await db.insert(journals).values({
    company_id: companyId,
    journal_number: journalNumber,
    date,
    description: `Depreciation - ${asset.name} - ${calculation.months} months`,
    reference: `DEP-${asset.asset_code}`,
    source_type: "depreciation",
    source_id: asset.id,
    total_amount: calculation.amount.toString(),
    created_by: userId
  }).returning();
  if (asset.expense_account_id) {
    await db.insert(journal_lines).values({
      journal_id: journal.id,
      account_id: asset.expense_account_id,
      description: `Depreciation Expense - ${asset.name}`,
      debit: calculation.amount.toString(),
      credit: "0",
      base_debit: calculation.amount.toString(),
      base_credit: "0"
    });
  }
  if (asset.depreciation_account_id) {
    await db.insert(journal_lines).values({
      journal_id: journal.id,
      account_id: asset.depreciation_account_id,
      description: `Accumulated Depreciation - ${asset.name}`,
      debit: "0",
      credit: calculation.amount.toString(),
      base_debit: "0",
      base_credit: calculation.amount.toString()
    });
  }
  await db.update(fixed_assets).set({
    accumulated_depreciation: sql14`${fixed_assets.accumulated_depreciation} + ${calculation.amount}`,
    updated_at: /* @__PURE__ */ new Date()
  }).where(eq25(fixed_assets.id, assetId));
  await db.insert(asset_depreciation_entries).values({
    asset_id: assetId,
    date,
    amount: calculation.amount.toString(),
    journal_id: journal.id,
    fiscal_year: date.getFullYear()
  });
  return journal;
}
async function disposeAsset(companyId, assetId, disposalDate, proceeds, depositAccountId, gainLossAccountId, userId) {
  try {
    await postDepreciation(companyId, assetId, disposalDate, userId);
  } catch (e) {
    console.warn("Auto-depreciation before disposal failed or skipped:", e);
  }
  const asset = await db.query.fixed_assets.findFirst({
    where: eq25(fixed_assets.id, assetId)
  });
  if (!asset) throw new Error("Asset not found");
  if (!asset.is_active) throw new Error("Asset is already inactive");
  const cost = parseFloat(asset.cost?.toString() || "0");
  const accumulated = parseFloat(asset.accumulated_depreciation?.toString() || "0");
  const bookValue = cost - accumulated;
  const gainOrLoss = proceeds - bookValue;
  const journalNumber = await getNextDocumentNumber(companyId, "journal");
  const [journal] = await db.insert(journals).values({
    company_id: companyId,
    journal_number: journalNumber,
    date: disposalDate,
    description: `Disposal - ${asset.name}`,
    reference: `DISP-${asset.asset_code}`,
    source_type: "asset_disposal",
    source_id: asset.id,
    total_amount: cost.toString(),
    // The total value being moved
    created_by: userId
  }).returning();
  if (asset.asset_account_id) {
    await db.insert(journal_lines).values({
      journal_id: journal.id,
      account_id: asset.asset_account_id,
      description: `Asset Cost Reversal - ${asset.name}`,
      debit: "0",
      credit: cost.toString(),
      base_debit: "0",
      base_credit: cost.toString()
    });
  }
  if (asset.depreciation_account_id) {
    await db.insert(journal_lines).values({
      journal_id: journal.id,
      account_id: asset.depreciation_account_id,
      description: `Accumulated Depreciation Reversal - ${asset.name}`,
      debit: accumulated.toString(),
      credit: "0",
      base_debit: accumulated.toString(),
      base_credit: "0"
    });
  }
  if (proceeds > 0) {
    await db.insert(journal_lines).values({
      journal_id: journal.id,
      account_id: depositAccountId,
      description: `Disposal Proceeds - ${asset.name}`,
      debit: proceeds.toString(),
      credit: "0",
      base_debit: proceeds.toString(),
      base_credit: "0"
    });
  }
  if (gainOrLoss !== 0) {
    if (gainOrLoss > 0) {
      await db.insert(journal_lines).values({
        journal_id: journal.id,
        account_id: gainLossAccountId,
        description: `Gain on Disposal - ${asset.name}`,
        debit: "0",
        credit: Math.abs(gainOrLoss).toString(),
        base_debit: "0",
        base_credit: Math.abs(gainOrLoss).toString()
      });
    } else {
      await db.insert(journal_lines).values({
        journal_id: journal.id,
        account_id: gainLossAccountId,
        description: `Loss on Disposal - ${asset.name}`,
        debit: Math.abs(gainOrLoss).toString(),
        credit: "0",
        base_debit: Math.abs(gainOrLoss).toString(),
        base_credit: "0"
      });
    }
  }
  await db.update(fixed_assets).set({
    is_active: false,
    disposal_date: disposalDate,
    disposal_proceeds: proceeds.toString(),
    updated_at: /* @__PURE__ */ new Date()
  }).where(eq25(fixed_assets.id, assetId));
  return journal;
}

// server/routes/fixedAssets.ts
import { fromZodError as fromZodError10 } from "zod-validation-error";
import QRCode from "qrcode";
var router13 = Router13();
router13.get("/", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const assets = await db.select().from(fixed_assets).where(eq26(fixed_assets.company_id, companyId)).orderBy(desc10(fixed_assets.created_at));
    res.json(assets);
  } catch (error) {
    console.error("Error fetching assets:", error);
    serverError(res, "Failed to fetch assets");
  }
});
router13.post("/", requireAuth, requirePermission("accounting", "create"), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const body = normalize(req.body);
    const validatedData = insertFixedAssetSchema.parse({
      ...body,
      company_id: companyId
    });
    const [asset] = await db.insert(fixed_assets).values(validatedData).returning();
    const userId = req.session.userId;
    await logCreate({
      companyId,
      entityType: "fixed_asset",
      entityId: asset.id,
      createdData: { name: asset.name, asset_code: asset.asset_code, cost: asset.cost },
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.status(201).json(asset);
  } catch (error) {
    if (error.name === "ZodError") {
      return badRequest(res, fromZodError10(error).message);
    }
    console.error("Error creating asset:", error);
    serverError(res, "Failed to create asset");
  }
});
router13.get("/:id", requireAuth, async (req, res) => {
  try {
    const [asset] = await db.select().from(fixed_assets).where(eq26(fixed_assets.id, req.params.id));
    if (!asset) return notFound(res, "Asset not found");
    res.json(asset);
  } catch (error) {
    serverError(res, "Failed to fetch asset");
  }
});
router13.get("/:id/history", requireAuth, async (req, res) => {
  try {
    const history = await db.select().from(asset_depreciation_entries).where(eq26(asset_depreciation_entries.asset_id, req.params.id)).orderBy(desc10(asset_depreciation_entries.date));
    res.json(history);
  } catch (error) {
    serverError(res, "Failed to fetch history");
  }
});
router13.post("/:id/preview-depreciation", requireAuth, async (req, res) => {
  try {
    const { date } = req.body;
    if (!date) return badRequest(res, "Date is required");
    const calculation = await calculateDepreciation(req.params.id, new Date(date));
    res.json(calculation);
  } catch (error) {
    badRequest(res, error.message);
  }
});
router13.post("/:id/depreciate", requireAuth, requirePermission("accounting", "create"), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const { date } = req.body;
    if (!date) return badRequest(res, "Date is required");
    const journal = await postDepreciation(companyId, req.params.id, new Date(date), userId);
    if (!journal) {
      return res.json({ message: "No depreciation to post (amount is 0)" });
    }
    await logCreate({
      companyId,
      entityType: "asset_depreciation",
      entityId: req.params.id,
      createdData: { asset_id: req.params.id, date, journal_id: journal.id },
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json({ message: "Depreciation posted successfully", journal });
  } catch (error) {
    console.error("Depreciation error:", error);
    badRequest(res, error.message);
  }
});
router13.post("/:id/dispose", requireAuth, requirePermission("accounting", "create"), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const { date, proceeds, depositAccountId, gainLossAccountId } = req.body;
    if (!date || proceeds === void 0 || !depositAccountId || !gainLossAccountId) {
      return badRequest(res, "Missing required fields: date, proceeds, depositAccountId, gainLossAccountId");
    }
    const journal = await disposeAsset(
      companyId,
      req.params.id,
      new Date(date),
      parseFloat(proceeds),
      depositAccountId,
      gainLossAccountId,
      userId
    );
    await logUpdate({
      companyId,
      entityType: "fixed_asset",
      entityId: req.params.id,
      oldData: { status: "active" },
      newData: { status: "disposed", disposal_date: date, disposal_proceeds: proceeds },
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json({ message: "Asset disposed successfully", journal });
  } catch (error) {
    console.error("Disposal error:", error);
    badRequest(res, error.message);
  }
});
router13.get("/:id/qrcode", requireAuth, async (req, res) => {
  try {
    const [asset] = await db.select().from(fixed_assets).where(eq26(fixed_assets.id, req.params.id));
    if (!asset) return notFound(res, "Asset not found");
    const data = JSON.stringify({
      id: asset.id,
      code: asset.asset_code,
      name: asset.name,
      company: asset.company_id
    });
    const qrCodeUrl = await QRCode.toDataURL(data);
    res.json({ url: qrCodeUrl, assetCode: asset.asset_code });
  } catch (error) {
    console.error("QR Code error:", error);
    serverError(res, "Failed to generate QR code");
  }
});
var fixedAssets_default = router13;

// server/routes/inventory.ts
init_db();
init_schema();
init_permissions();
import { Router as Router14 } from "express";
import { eq as eq27, and as and22, desc as desc11, sql as sql15 } from "drizzle-orm";
init_sendError();
import { fromZodError as fromZodError11 } from "zod-validation-error";
import { z as z3 } from "zod";
var router14 = Router14();
router14.get("/warehouses", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const result = await db.select().from(warehouses).where(eq27(warehouses.company_id, companyId)).orderBy(warehouses.name);
    res.json(result);
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    serverError(res, "Failed to fetch warehouses");
  }
});
router14.post("/warehouses", requireAuth, requirePermission("settings", "create"), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const body = normalize(req.body);
    const warehouseData = {
      company_id: companyId,
      code: body.code,
      name: body.name,
      is_active: body.is_active !== void 0 ? body.is_active : true
    };
    if (body.location !== void 0 && body.location !== "") {
      warehouseData.location = body.location;
    }
    const [warehouse] = await db.insert(warehouses).values(warehouseData).returning();
    const userId = req.session.userId;
    await logCreate({
      companyId,
      entityType: "warehouse",
      entityId: warehouse.id,
      createdData: { name: warehouse.name, code: warehouse.code },
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.status(201).json(warehouse);
  } catch (error) {
    if (error.name === "ZodError") {
      return badRequest(res, fromZodError11(error).message);
    }
    serverError(res, "Failed to create warehouse");
  }
});
router14.put("/warehouses/:id", requireAuth, requirePermission("settings", "edit"), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { id } = req.params;
    const body = normalize(req.body);
    const [existing] = await db.select().from(warehouses).where(and22(eq27(warehouses.id, id), eq27(warehouses.company_id, companyId)));
    if (!existing) {
      return notFound(res, "Warehouse not found");
    }
    const updateData = {
      code: body.code || existing.code,
      name: body.name || existing.name,
      location: body.location,
      is_active: body.is_active !== void 0 ? body.is_active : existing.is_active,
      updated_at: /* @__PURE__ */ new Date()
    };
    const [updated] = await db.update(warehouses).set(updateData).where(and22(eq27(warehouses.id, id), eq27(warehouses.company_id, companyId))).returning();
    const userId = req.session.userId;
    await logUpdate({
      companyId,
      entityType: "warehouse",
      entityId: id,
      oldData: { name: existing.name, code: existing.code, is_active: existing.is_active },
      newData: { name: updated.name, code: updated.code, is_active: updated.is_active },
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json(updated);
  } catch (error) {
    console.error("Error updating warehouse:", error);
    serverError(res, "Failed to update warehouse");
  }
});
router14.get("/movements", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { type, limit = "50" } = req.query;
    const conditions = [eq27(stock_movements.company_id, companyId)];
    if (type === "in") {
      conditions.push(sql15`${stock_movements.transaction_type} IN ('purchase', 'manufacturing_in')`);
    } else if (type === "adjustment") {
      conditions.push(sql15`(${stock_movements.transaction_type} = 'adjustment' OR ${stock_movements.reference_type} = 'manual_adjustment')`);
    } else if (type === "sale") {
      conditions.push(sql15`${stock_movements.transaction_type} = 'sale'`);
    } else if (type === "transfer") {
      conditions.push(sql15`${stock_movements.transaction_type} IN ('transfer_in', 'transfer_out')`);
    }
    const movements = await db.query.stock_movements.findMany({
      where: and22(...conditions),
      orderBy: [desc11(stock_movements.transaction_date)],
      limit: parseInt(limit),
      with: {
        item: true,
        warehouse: true
      }
    });
    res.json(movements);
  } catch (error) {
    console.error("Error fetching movements:", error);
    serverError(res, "Failed to fetch movements");
  }
});
router14.get("/batches/:itemId", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { itemId } = req.params;
    const { warehouseId } = req.query;
    const itemBatches = await db.select().from(batches).where(and22(
      eq27(batches.company_id, companyId),
      eq27(batches.item_id, itemId)
    )).orderBy(desc11(batches.expiry_date));
    res.json(itemBatches);
  } catch (error) {
    console.error("Error fetching batches:", error);
    serverError(res, "Failed to fetch batches");
  }
});
router14.get("/levels", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const levels = await getStockLevels(companyId);
    const enrichedLevels = await Promise.all(levels.map(async (level) => {
      const [item] = await db.select().from(items).where(eq27(items.id, level.item_id));
      const [warehouse] = await db.select().from(warehouses).where(eq27(warehouses.id, level.warehouse_id));
      const totalIn = parseFloat(level.total_in?.toString() || "0");
      const totalOut = parseFloat(level.total_out?.toString() || "0");
      return {
        ...level,
        itemName: item?.name,
        itemCode: item?.sku,
        warehouseName: warehouse?.name,
        currentQuantity: totalIn - totalOut
      };
    }));
    res.json(enrichedLevels);
  } catch (error) {
    console.error("Error fetching stock levels:", error);
    serverError(res, "Failed to fetch stock levels");
  }
});
router14.get("/items/:id/history", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const itemId = req.params.id;
    console.log("Fetching history for item:", itemId, "company:", companyId);
    const history = await getItemStockHistory(companyId, itemId);
    console.log("History found:", history.length, "records");
    res.json(history);
  } catch (error) {
    console.error("Error fetching history:", error);
    serverError(res, "Failed to fetch stock history: " + error.message);
  }
});
router14.get("/items/:id/valuation", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { warehouseId } = req.query;
    const valuation = await calculateStockValue(
      companyId,
      req.params.id,
      warehouseId
    );
    res.json(valuation);
  } catch (error) {
    serverError(res, "Failed to calculate valuation");
  }
});
router14.get("/valuation", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { warehouseId } = req.query;
    const allItems = await db.select().from(items).where(and22(
      eq27(items.company_id, companyId),
      sql15`${items.type} IN ('product', 'inventory')`
    ));
    const valuationReport = await Promise.all(allItems.map(async (item) => {
      const valuation = await calculateStockValue(
        companyId,
        item.id,
        warehouseId
      );
      return {
        itemId: item.id,
        itemCode: item.sku,
        itemName: item.name,
        quantity: valuation.quantity,
        averageCost: valuation.average_cost,
        totalValue: valuation.value
      };
    }));
    const filteredReport = valuationReport.filter((item) => item.quantity > 0 || item.totalValue > 0);
    res.json(filteredReport);
  } catch (error) {
    console.error("Error fetching valuation report:", error);
    serverError(res, "Failed to fetch valuation report");
  }
});
router14.post("/adjustments", requireAuth, requirePermission("items", "create"), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const body = normalize(req.body);
    if (!body.item_id || !body.warehouse_id || !body.quantity || !body.transaction_type) {
      return badRequest(res, "Missing required fields");
    }
    await recordStockMovement({
      company_id: companyId,
      item_id: body.item_id,
      warehouse_id: body.warehouse_id,
      transaction_type: body.transaction_type,
      // adjustment, transfer_in, transfer_out
      transaction_date: new Date(body.date || /* @__PURE__ */ new Date()),
      quantity: parseFloat(body.quantity),
      unit_cost: parseFloat(body.unit_cost || "0"),
      notes: body.notes,
      reference_type: "manual_adjustment",
      created_by: userId
    });
    await logCreate({
      companyId,
      entityType: "stock_movement",
      entityId: body.item_id,
      createdData: { item_id: body.item_id, warehouse_id: body.warehouse_id, quantity: body.quantity, type: body.transaction_type },
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json({ message: "Stock adjustment recorded successfully" });
  } catch (error) {
    console.error("Error recording adjustment:", error);
    serverError(res, "Failed to record adjustment");
  }
});
router14.put("/adjustments/:id", requireAuth, requirePermission("items", "edit"), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const { id } = req.params;
    const body = normalize(req.body);
    const existing = await db.query.stock_movements.findFirst({
      where: and22(
        eq27(stock_movements.id, id),
        eq27(stock_movements.company_id, companyId)
      )
    });
    if (!existing) {
      return notFound(res, "Adjustment not found");
    }
    if (existing.reference_type !== "manual_adjustment") {
      return badRequest(res, "Only manual adjustments can be edited");
    }
    const oldData = { ...existing };
    const updateData = {};
    if (body.item_id) updateData.item_id = body.item_id;
    if (body.warehouse_id) updateData.warehouse_id = body.warehouse_id;
    if (body.quantity !== void 0) {
      updateData.quantity = String(body.quantity);
      updateData.total_cost = String(parseFloat(body.quantity) * parseFloat(body.unit_cost || existing.unit_cost || "0"));
    }
    if (body.unit_cost !== void 0) {
      updateData.unit_cost = String(body.unit_cost);
      updateData.total_cost = String(parseFloat(body.quantity || existing.quantity || "0") * parseFloat(body.unit_cost));
    }
    if (body.date) updateData.transaction_date = new Date(body.date);
    if (body.notes !== void 0) updateData.notes = body.notes;
    await db.update(stock_movements).set(updateData).where(eq27(stock_movements.id, id));
    await logUpdate({
      companyId,
      entityType: "stock_movement",
      entityId: id,
      oldData,
      newData: updateData,
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json({ message: "Adjustment updated successfully" });
  } catch (error) {
    console.error("Error updating adjustment:", error);
    serverError(res, "Failed to update adjustment");
  }
});
router14.delete("/adjustments/:id", requireAuth, requirePermission("items", "delete"), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const { id } = req.params;
    const existing = await db.query.stock_movements.findFirst({
      where: and22(
        eq27(stock_movements.id, id),
        eq27(stock_movements.company_id, companyId)
      )
    });
    if (!existing) {
      return notFound(res, "Adjustment not found");
    }
    if (existing.reference_type !== "manual_adjustment") {
      return badRequest(res, "Only manual adjustments can be deleted");
    }
    await db.delete(stock_movements).where(eq27(stock_movements.id, id));
    await logDelete({
      companyId,
      entityType: "stock_movement",
      entityId: id,
      deletedData: existing,
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json({ message: "Adjustment deleted successfully" });
  } catch (error) {
    console.error("Error deleting adjustment:", error);
    serverError(res, "Failed to delete adjustment");
  }
});
router14.get("/transfers", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const transfers = await db.query.stock_transfers.findMany({
      where: eq27(stock_transfers.company_id, companyId),
      orderBy: [desc11(stock_transfers.date)],
      with: {
        from_warehouse: true,
        to_warehouse: true,
        items: {
          with: {
            item: true,
            batch: true
          }
        }
      }
    });
    res.json(transfers);
  } catch (error) {
    console.error("Error fetching transfers:", error);
    serverError(res, "Failed to fetch transfers");
  }
});
router14.post("/transfers", requireAuth, requirePermission("items", "create"), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const schema = z3.object({
      transfer_number: z3.string(),
      from_warehouse_id: z3.string(),
      to_warehouse_id: z3.string(),
      date: z3.string().transform((str) => new Date(str)),
      notes: z3.string().optional(),
      items: z3.array(z3.object({
        item_id: z3.string(),
        batch_id: z3.string().optional(),
        quantity: z3.number()
      }))
    });
    const result = schema.safeParse(req.body);
    if (!result.success) return badRequest(res, fromZodError11(result.error).message);
    const { items: transferItems, ...transferData } = result.data;
    const [transfer] = await db.insert(stock_transfers).values({
      ...transferData,
      company_id: companyId,
      created_by: userId,
      status: "draft"
    }).returning();
    if (transferItems.length > 0) {
      await db.insert(stock_transfer_items).values(
        transferItems.map((item) => ({
          transfer_id: transfer.id,
          item_id: item.item_id,
          batch_id: item.batch_id,
          quantity: item.quantity.toString()
        }))
      );
    }
    await logCreate({
      companyId,
      entityType: "stock_transfer",
      entityId: transfer.id,
      createdData: { transfer_number: transfer.transfer_number, from_warehouse_id: transferData.from_warehouse_id, to_warehouse_id: transferData.to_warehouse_id },
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.status(201).json(transfer);
  } catch (error) {
    console.error("Error creating transfer:", error);
    serverError(res, "Failed to create transfer");
  }
});
router14.get("/transfers/:id", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const transfer = await db.query.stock_transfers.findFirst({
      where: and22(
        eq27(stock_transfers.id, req.params.id),
        eq27(stock_transfers.company_id, companyId)
      ),
      with: {
        from_warehouse: true,
        to_warehouse: true,
        items: {
          with: {
            item: true,
            batch: true
          }
        }
      }
    });
    if (!transfer) return notFound(res, "Transfer not found");
    res.json(transfer);
  } catch (error) {
    serverError(res, "Failed to fetch transfer details");
  }
});
router14.put("/transfers/:id", requireAuth, requirePermission("items", "edit"), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { from_warehouse_id, to_warehouse_id, date, notes, items: items3 } = req.body;
    const transfer = await db.query.stock_transfers.findFirst({
      where: and22(
        eq27(stock_transfers.id, req.params.id),
        eq27(stock_transfers.company_id, companyId)
      )
    });
    if (!transfer) return notFound(res, "Transfer not found");
    if (transfer.status !== "draft") return badRequest(res, "Only draft transfers can be edited");
    await db.update(stock_transfers).set({
      from_warehouse_id,
      to_warehouse_id,
      date: new Date(date),
      notes
    }).where(eq27(stock_transfers.id, transfer.id));
    await db.delete(stock_transfer_items).where(eq27(stock_transfer_items.transfer_id, transfer.id));
    for (const item of items3) {
      await db.insert(stock_transfer_items).values({
        transfer_id: transfer.id,
        item_id: item.item_id,
        quantity: item.quantity,
        batch_id: item.batch_id || null
      });
    }
    const updatedTransfer = await db.query.stock_transfers.findFirst({
      where: eq27(stock_transfers.id, transfer.id),
      with: {
        from_warehouse: true,
        to_warehouse: true,
        items: {
          with: {
            item: true,
            batch: true
          }
        }
      }
    });
    res.json(updatedTransfer);
  } catch (error) {
    console.error("Error updating transfer:", error);
    serverError(res, "Failed to update transfer");
  }
});
router14.post("/transfers/:id/submit", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const transfer = await db.query.stock_transfers.findFirst({
      where: and22(
        eq27(stock_transfers.id, req.params.id),
        eq27(stock_transfers.company_id, companyId)
      )
    });
    if (!transfer) return notFound(res, "Transfer not found");
    if (transfer.status !== "draft") return badRequest(res, "Transfer must be in draft status to submit");
    await db.update(stock_transfers).set({ status: "pending_approval" }).where(eq27(stock_transfers.id, transfer.id));
    res.json({ message: "Transfer submitted for approval" });
  } catch (error) {
    console.error("Error submitting transfer:", error);
    serverError(res, "Failed to submit transfer");
  }
});
router14.delete("/transfers/:id", requireAuth, requirePermission("items", "delete"), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const transfer = await db.query.stock_transfers.findFirst({
      where: and22(
        eq27(stock_transfers.id, req.params.id),
        eq27(stock_transfers.company_id, companyId)
      )
    });
    if (!transfer) return notFound(res, "Transfer not found");
    if (transfer.status !== "draft") return badRequest(res, "Only draft transfers can be deleted");
    await db.delete(stock_transfer_items).where(eq27(stock_transfer_items.transfer_id, transfer.id));
    await db.delete(stock_transfers).where(eq27(stock_transfers.id, transfer.id));
    res.json({ message: "Transfer deleted successfully" });
  } catch (error) {
    console.error("Error deleting transfer:", error);
    serverError(res, "Failed to delete transfer");
  }
});
router14.post("/transfers/:id/approve", requireAuth, requirePermission("items", "edit"), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const transfer = await db.query.stock_transfers.findFirst({
      where: and22(
        eq27(stock_transfers.id, req.params.id),
        eq27(stock_transfers.company_id, companyId)
      )
    });
    if (!transfer) return notFound(res, "Transfer not found");
    if (transfer.status !== "pending_approval") return badRequest(res, "Transfer must be pending approval");
    await db.update(stock_transfers).set({ status: "approved" }).where(eq27(stock_transfers.id, transfer.id));
    res.json({ message: "Transfer approved" });
  } catch (error) {
    console.error("Error approving transfer:", error);
    serverError(res, "Failed to approve transfer");
  }
});
router14.post("/transfers/:id/complete", requireAuth, requirePermission("items", "edit"), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const transfer = await db.query.stock_transfers.findFirst({
      where: and22(
        eq27(stock_transfers.id, req.params.id),
        eq27(stock_transfers.company_id, companyId)
      ),
      with: {
        items: true
      }
    });
    if (!transfer) return notFound(res, "Transfer not found");
    if (transfer.status === "completed") {
      return badRequest(res, "Transfer is already completed");
    }
    if (transfer.status === "cancelled") {
      return badRequest(res, "Cannot complete a cancelled transfer");
    }
    for (const transferItem of transfer.items) {
      const [item] = await db.select().from(items).where(eq27(items.id, transferItem.item_id));
      const currentCost = item?.cost_price ? Number(item.cost_price) : 0;
      await recordStockMovement({
        company_id: companyId,
        item_id: transferItem.item_id,
        warehouse_id: transfer.from_warehouse_id,
        transaction_type: "transfer_out",
        transaction_date: /* @__PURE__ */ new Date(),
        quantity: parseFloat(transferItem.quantity),
        unit_cost: currentCost,
        notes: `Transfer ${transfer.transfer_number} to ${transfer.to_warehouse_id}`,
        reference_type: "stock_transfer",
        reference_id: transfer.id,
        batch_id: transferItem.batch_id || void 0,
        created_by: userId
      });
      await recordStockMovement({
        company_id: companyId,
        item_id: transferItem.item_id,
        warehouse_id: transfer.to_warehouse_id,
        transaction_type: "transfer_in",
        transaction_date: /* @__PURE__ */ new Date(),
        quantity: parseFloat(transferItem.quantity),
        unit_cost: currentCost,
        notes: `Transfer ${transfer.transfer_number} from ${transfer.from_warehouse_id}`,
        reference_type: "stock_transfer",
        reference_id: transfer.id,
        batch_id: transferItem.batch_id || void 0,
        created_by: userId
      });
    }
    await db.update(stock_transfers).set({ status: "completed" }).where(eq27(stock_transfers.id, transfer.id));
    res.json({ message: "Transfer completed" });
  } catch (error) {
    console.error("Error completing transfer:", error);
    serverError(res, "Failed to complete transfer");
  }
});
router14.get("/items/:itemId/batches", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const itemBatches = await db.query.batches.findMany({
      where: and22(
        eq27(batches.company_id, companyId),
        eq27(batches.item_id, req.params.itemId)
      ),
      with: {
        warehouse: true
      },
      orderBy: [desc11(batches.expiry_date)]
    });
    res.json(itemBatches);
  } catch (error) {
    console.error("Error fetching batches:", error);
    serverError(res, "Failed to fetch batches");
  }
});
router14.get("/debug-data", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const allInvoices = await db.select().from(sales_invoices).where(eq27(sales_invoices.company_id, companyId));
    const allLines = await db.select().from(document_lines).limit(50);
    const allTransfers = await db.select().from(stock_transfers).where(eq27(stock_transfers.company_id, companyId));
    const allTransferItems = await db.select().from(stock_transfer_items).limit(50);
    const allItems = await db.select().from(items).where(eq27(items.company_id, companyId));
    const existingMovements = await db.select().from(stock_movements).where(eq27(stock_movements.company_id, companyId));
    res.json({
      invoices: {
        count: allInvoices.length,
        sample: allInvoices.slice(0, 3).map((i) => ({ id: i.id, number: i.invoice_number, date: i.date }))
      },
      document_lines: {
        count: allLines.length,
        sample: allLines.slice(0, 5).map((l) => ({
          id: l.id,
          document_type: l.document_type,
          document_id: l.document_id,
          item_id: l.item_id,
          quantity: l.quantity
        }))
      },
      transfers: {
        count: allTransfers.length,
        sample: allTransfers.slice(0, 3).map((t) => ({
          id: t.id,
          number: t.transfer_number,
          status: t.status,
          from: t.from_warehouse_id,
          to: t.to_warehouse_id
        }))
      },
      transfer_items: {
        count: allTransferItems.length,
        sample: allTransferItems.slice(0, 5)
      },
      items: {
        count: allItems.length,
        sample: allItems.slice(0, 3).map((i) => ({ id: i.id, name: i.name, type: i.type }))
      },
      existing_movements: {
        count: existingMovements.length,
        sample: existingMovements.slice(0, 5)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router14.get("/debug-history/:itemId", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const itemId = req.params.itemId;
    const movements = await db.select().from(stock_movements).where(and22(
      eq27(stock_movements.company_id, companyId),
      eq27(stock_movements.item_id, itemId)
    )).orderBy(desc11(stock_movements.transaction_date));
    const [item] = await db.select().from(items).where(eq27(items.id, itemId));
    res.json({
      itemId,
      item: item ? { id: item.id, name: item.name, type: item.type } : null,
      movements: {
        count: movements.length,
        data: movements
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router14.post("/backfill-movements", requireAuth, requirePermission("settings", "create"), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    let recordedCount = 0;
    let skippedCount = 0;
    let errors = [];
    const [defaultWarehouse] = await db.select().from(warehouses).where(and22(
      eq27(warehouses.company_id, companyId),
      eq27(warehouses.is_active, true)
    )).limit(1);
    if (!defaultWarehouse) {
      return badRequest(res, "No active warehouse found. Please create a warehouse first.");
    }
    console.log("Starting backfill for company:", companyId);
    try {
      const invoices = await db.select({
        invoice: sales_invoices,
        line: document_lines
      }).from(sales_invoices).innerJoin(document_lines, and22(
        eq27(document_lines.document_id, sales_invoices.id),
        eq27(document_lines.document_type, "invoice")
      )).where(eq27(sales_invoices.company_id, companyId));
      console.log(`Found ${invoices.length} invoice lines`);
      for (const { invoice, line } of invoices) {
        if (!line.item_id) continue;
        const [existingMovement] = await db.select().from(stock_movements).where(and22(
          eq27(stock_movements.company_id, companyId),
          eq27(stock_movements.reference_type, "invoice"),
          eq27(stock_movements.reference_id, invoice.id),
          eq27(stock_movements.item_id, line.item_id)
        )).limit(1);
        if (existingMovement) {
          skippedCount++;
          continue;
        }
        const [item] = await db.select().from(items).where(eq27(items.id, line.item_id));
        if (!item || item.type !== "product" && item.type !== "inventory") {
          continue;
        }
        try {
          await recordStockMovement({
            company_id: companyId,
            item_id: line.item_id,
            warehouse_id: line.warehouse_id || defaultWarehouse.id,
            transaction_type: "sale",
            transaction_date: new Date(invoice.date),
            quantity: -Math.abs(parseFloat(line.quantity || "0")),
            unit_cost: parseFloat(line.unit_price || "0"),
            reference_type: "invoice",
            reference_id: invoice.id,
            notes: `Sale - Invoice ${invoice.invoice_number}`,
            created_by: userId
          });
          recordedCount++;
        } catch (e) {
          errors.push(`Invoice ${invoice.invoice_number}: ${e.message}`);
        }
      }
    } catch (e) {
      console.error("Error processing invoices:", e);
      errors.push(`Invoice processing error: ${e.message}`);
    }
    try {
      const billsData = await db.select({
        bill: bills,
        line: document_lines
      }).from(bills).innerJoin(document_lines, and22(
        eq27(document_lines.document_id, bills.id),
        eq27(document_lines.document_type, "bill")
      )).where(eq27(bills.company_id, companyId));
      console.log(`Found ${billsData.length} bill lines`);
      for (const { bill, line } of billsData) {
        if (!line.item_id) continue;
        const [existingMovement] = await db.select().from(stock_movements).where(and22(
          eq27(stock_movements.company_id, companyId),
          eq27(stock_movements.reference_type, "bill"),
          eq27(stock_movements.reference_id, bill.id),
          eq27(stock_movements.item_id, line.item_id)
        )).limit(1);
        if (existingMovement) {
          skippedCount++;
          continue;
        }
        const [item] = await db.select().from(items).where(eq27(items.id, line.item_id));
        if (!item || item.type !== "product" && item.type !== "inventory") {
          continue;
        }
        try {
          await recordStockMovement({
            company_id: companyId,
            item_id: line.item_id,
            warehouse_id: line.warehouse_id || defaultWarehouse.id,
            transaction_type: "purchase",
            transaction_date: new Date(bill.date),
            quantity: Math.abs(parseFloat(line.quantity || "0")),
            unit_cost: parseFloat(line.unit_price || "0"),
            reference_type: "bill",
            reference_id: bill.id,
            notes: `Purchase - Bill ${bill.bill_number}`,
            created_by: userId
          });
          recordedCount++;
        } catch (e) {
          errors.push(`Bill ${bill.bill_number}: ${e.message}`);
        }
      }
    } catch (e) {
      console.error("Error processing bills:", e);
      errors.push(`Bill processing error: ${e.message}`);
    }
    try {
      const transfers = await db.select({
        transfer: stock_transfers,
        transferItem: stock_transfer_items
      }).from(stock_transfers).innerJoin(stock_transfer_items, eq27(stock_transfer_items.transfer_id, stock_transfers.id)).where(and22(
        eq27(stock_transfers.company_id, companyId),
        eq27(stock_transfers.status, "completed")
      ));
      console.log(`Found ${transfers.length} completed transfer items`);
      for (const { transfer, transferItem } of transfers) {
        const [existingOut] = await db.select().from(stock_movements).where(and22(
          eq27(stock_movements.company_id, companyId),
          eq27(stock_movements.reference_type, "transfer"),
          eq27(stock_movements.reference_id, transfer.id),
          eq27(stock_movements.item_id, transferItem.item_id),
          eq27(stock_movements.transaction_type, "transfer_out")
        )).limit(1);
        const [existingIn] = await db.select().from(stock_movements).where(and22(
          eq27(stock_movements.company_id, companyId),
          eq27(stock_movements.reference_type, "transfer"),
          eq27(stock_movements.reference_id, transfer.id),
          eq27(stock_movements.item_id, transferItem.item_id),
          eq27(stock_movements.transaction_type, "transfer_in")
        )).limit(1);
        const [item] = await db.select().from(items).where(eq27(items.id, transferItem.item_id));
        if (!item) continue;
        const qty = Math.abs(parseFloat(transferItem.quantity || "0"));
        const unitCost = parseFloat(item.cost_price || "0");
        if (!existingOut) {
          try {
            await recordStockMovement({
              company_id: companyId,
              item_id: transferItem.item_id,
              warehouse_id: transfer.from_warehouse_id,
              transaction_type: "transfer_out",
              transaction_date: new Date(transfer.date),
              quantity: -qty,
              unit_cost: unitCost,
              reference_type: "transfer",
              reference_id: transfer.id,
              notes: `Transfer Out - ${transfer.transfer_number}`,
              created_by: userId
            });
            recordedCount++;
          } catch (e) {
            errors.push(`Transfer ${transfer.transfer_number} out: ${e.message}`);
          }
        } else {
          skippedCount++;
        }
        if (!existingIn) {
          try {
            await recordStockMovement({
              company_id: companyId,
              item_id: transferItem.item_id,
              warehouse_id: transfer.to_warehouse_id,
              transaction_type: "transfer_in",
              transaction_date: new Date(transfer.date),
              quantity: qty,
              unit_cost: unitCost,
              reference_type: "transfer",
              reference_id: transfer.id,
              notes: `Transfer In - ${transfer.transfer_number}`,
              created_by: userId
            });
            recordedCount++;
          } catch (e) {
            errors.push(`Transfer ${transfer.transfer_number} in: ${e.message}`);
          }
        } else {
          skippedCount++;
        }
      }
    } catch (e) {
      console.error("Error processing transfers:", e);
      errors.push(`Transfer processing error: ${e.message}`);
    }
    console.log(`Backfill complete: recorded=${recordedCount}, skipped=${skippedCount}, errors=${errors.length}`);
    res.json({
      success: true,
      message: `Backfill completed. Recorded: ${recordedCount}, Skipped: ${skippedCount}${errors.length > 0 ? `, Errors: ${errors.length}` : ""}`,
      recorded: recordedCount,
      skipped: skippedCount,
      errors: errors.length > 0 ? errors : void 0
    });
  } catch (error) {
    console.error("Error in backfill:", error);
    serverError(res, "Failed to backfill stock movements: " + error.message);
  }
});
router14.get("/serials/:itemId", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { itemId } = req.params;
    const warehouseId = req.query.warehouse_id;
    const conditions = [
      eq27(inventory_serials.company_id, companyId),
      eq27(inventory_serials.item_id, itemId),
      eq27(inventory_serials.status, "available")
    ];
    if (warehouseId) {
      conditions.push(eq27(inventory_serials.warehouse_id, warehouseId));
    }
    const serials = await db.select().from(inventory_serials).where(and22(...conditions));
    res.json(serials);
  } catch (error) {
    console.error("Error fetching serials:", error);
    serverError(res, "Failed to fetch serial numbers");
  }
});
router14.post("/serials", requireAuth, requirePermission("items", "create"), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const body = normalize(req.body);
    const schema = z3.object({
      item_id: z3.string(),
      warehouse_id: z3.string(),
      serial_numbers: z3.array(z3.string().min(1))
    });
    const result = schema.safeParse(body);
    if (!result.success) return badRequest(res, fromZodError11(result.error).message);
    const { item_id, warehouse_id, serial_numbers } = result.data;
    const existing = await db.select().from(inventory_serials).where(and22(
      eq27(inventory_serials.company_id, companyId),
      eq27(inventory_serials.item_id, item_id)
    ));
    const existingNumbers = existing.map((s) => s.serial_number);
    const duplicates = serial_numbers.filter((sn) => existingNumbers.includes(sn));
    if (duplicates.length > 0) {
      return badRequest(res, `Duplicate serial numbers: ${duplicates.join(", ")}`);
    }
    const insertData = serial_numbers.map((sn) => ({
      company_id: companyId,
      item_id,
      warehouse_id,
      serial_number: sn,
      status: "available"
    }));
    await db.insert(inventory_serials).values(insertData);
    res.json({ success: true, count: serial_numbers.length });
  } catch (error) {
    console.error("Error creating serials:", error);
    serverError(res, "Failed to create serial numbers");
  }
});
router14.put("/serials/:id/status", requireAuth, requirePermission("items", "edit"), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { id } = req.params;
    const { status } = req.body;
    if (!["available", "sold", "returned", "damaged"].includes(status)) {
      return badRequest(res, "Invalid status");
    }
    await db.update(inventory_serials).set({ status }).where(and22(
      eq27(inventory_serials.id, id),
      eq27(inventory_serials.company_id, companyId)
    ));
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating serial status:", error);
    serverError(res, "Failed to update serial status");
  }
});
router14.get("/batches/:itemId", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { itemId } = req.params;
    const warehouseId = req.query.warehouse_id;
    const conditions = [
      eq27(inventory_batches.company_id, companyId),
      eq27(inventory_batches.item_id, itemId)
    ];
    if (warehouseId) {
      conditions.push(eq27(inventory_batches.warehouse_id, warehouseId));
    }
    const batches2 = await db.select().from(inventory_batches).where(and22(...conditions));
    const availableBatches = batches2.filter((b) => parseFloat(b.quantity || "0") > 0);
    res.json(availableBatches);
  } catch (error) {
    console.error("Error fetching batches:", error);
    serverError(res, "Failed to fetch batches");
  }
});
router14.post("/batches", requireAuth, requirePermission("items", "create"), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const body = normalize(req.body);
    const schema = z3.object({
      item_id: z3.string(),
      warehouse_id: z3.string(),
      batch_number: z3.string().min(1),
      quantity: z3.number().positive(),
      expiry_date: z3.string().optional()
    });
    const result = schema.safeParse(body);
    if (!result.success) return badRequest(res, fromZodError11(result.error).message);
    const { item_id, warehouse_id, batch_number, quantity, expiry_date } = result.data;
    const existing = await db.select().from(inventory_batches).where(and22(
      eq27(inventory_batches.company_id, companyId),
      eq27(inventory_batches.item_id, item_id),
      eq27(inventory_batches.batch_number, batch_number),
      eq27(inventory_batches.warehouse_id, warehouse_id)
    ));
    if (existing.length > 0) {
      const newQty = parseFloat(existing[0].quantity || "0") + quantity;
      await db.update(inventory_batches).set({ quantity: String(newQty) }).where(eq27(inventory_batches.id, existing[0].id));
      res.json({ success: true, batch_id: existing[0].id, updated: true });
    } else {
      const [batch] = await db.insert(inventory_batches).values({
        company_id: companyId,
        item_id,
        warehouse_id,
        batch_number,
        quantity: String(quantity),
        expiry_date: expiry_date ? new Date(expiry_date) : null
      }).returning();
      res.json({ success: true, batch_id: batch.id, created: true });
    }
  } catch (error) {
    console.error("Error creating/updating batch:", error);
    serverError(res, "Failed to create/update batch");
  }
});
router14.put("/batches/:id/reduce", requireAuth, requirePermission("items", "edit"), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { id } = req.params;
    const { quantity } = req.body;
    if (!quantity || quantity <= 0) {
      return badRequest(res, "Invalid quantity");
    }
    const [batch] = await db.select().from(inventory_batches).where(and22(
      eq27(inventory_batches.id, id),
      eq27(inventory_batches.company_id, companyId)
    ));
    if (!batch) {
      return notFound(res, "Batch not found");
    }
    const currentQty = parseFloat(batch.quantity || "0");
    if (quantity > currentQty) {
      return badRequest(res, `Insufficient quantity. Available: ${currentQty}`);
    }
    const newQty = currentQty - quantity;
    await db.update(inventory_batches).set({ quantity: String(newQty) }).where(eq27(inventory_batches.id, id));
    res.json({ success: true, remaining: newQty });
  } catch (error) {
    console.error("Error reducing batch quantity:", error);
    serverError(res, "Failed to reduce batch quantity");
  }
});
var inventory_default = router14;

// server/routes/budgets.ts
init_db();
init_schema();
init_permissions();
import { Router as Router15 } from "express";
import { eq as eq29, and as and24, desc as desc12 } from "drizzle-orm";
init_sendError();

// server/utils/budget.ts
init_db();
init_schema();
import { eq as eq28, and as and23, sum as sum5, gte as gte8, lte as lte7 } from "drizzle-orm";
async function getBudgetVsActual(companyId, fiscalYear, period) {
  const budgetRecords = await db.select().from(budgets).innerJoin(accounts, eq28(budgets.account_id, accounts.id)).where(and23(
    eq28(budgets.company_id, companyId),
    eq28(budgets.fiscal_year, fiscalYear)
  ));
  const months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december"
  ];
  let startDate;
  let endDate;
  if (period) {
    startDate = new Date(fiscalYear, period - 1, 1);
    endDate = new Date(fiscalYear, period, 0);
  } else {
    startDate = new Date(fiscalYear, 0, 1);
    endDate = new Date(fiscalYear, 11, 31);
  }
  const actuals = await db.select({
    accountId: journal_lines.account_id,
    debitSum: sum5(journal_lines.base_debit),
    creditSum: sum5(journal_lines.base_credit)
  }).from(journal_lines).innerJoin(journals, eq28(journal_lines.journal_id, journals.id)).where(and23(
    eq28(journals.company_id, companyId),
    gte8(journals.date, startDate),
    lte7(journals.date, endDate)
  )).groupBy(journal_lines.account_id);
  const actualMap = /* @__PURE__ */ new Map();
  actuals.forEach((a) => {
    actualMap.set(a.accountId, {
      debit: parseFloat(a.debitSum || "0"),
      credit: parseFloat(a.creditSum || "0")
    });
  });
  const lines = budgetRecords.map((record) => {
    const b = record.budgets;
    const acc = record.accounts;
    let budgetAmount = 0;
    const monthlyBudget = {};
    months.forEach((month, idx) => {
      const monthCol = month;
      const val = parseFloat(b[monthCol]?.toString() || "0");
      monthlyBudget[month] = val;
      if (period) {
        if (idx === period - 1) {
          budgetAmount = val;
        }
      } else {
        budgetAmount += val;
      }
    });
    const actualData = actualMap.get(acc.id) || { debit: 0, credit: 0 };
    let actualAmount = 0;
    if (acc.account_type === "expense") {
      actualAmount = actualData.debit - actualData.credit;
    } else if (acc.account_type === "revenue") {
      actualAmount = actualData.credit - actualData.debit;
    } else {
      actualAmount = actualData.debit - actualData.credit;
    }
    const variance = budgetAmount - actualAmount;
    const variancePercentage = budgetAmount !== 0 ? variance / budgetAmount * 100 : 0;
    return {
      accountId: acc.id,
      accountCode: acc.code,
      accountName: acc.name,
      accountType: acc.account_type,
      budgetAmount,
      actualAmount,
      variance,
      variancePercentage,
      monthlyBudget,
      monthlyActual: {}
      // Could be enhanced to show monthly actuals
    };
  });
  const summary = {
    totalRevenueBudget: 0,
    totalRevenueActual: 0,
    totalExpenseBudget: 0,
    totalExpenseActual: 0,
    netBudget: 0,
    netActual: 0,
    netVariance: 0
  };
  lines.forEach((line) => {
    if (line.accountType === "revenue") {
      summary.totalRevenueBudget += line.budgetAmount;
      summary.totalRevenueActual += line.actualAmount;
    } else if (line.accountType === "expense") {
      summary.totalExpenseBudget += line.budgetAmount;
      summary.totalExpenseActual += line.actualAmount;
    }
  });
  summary.netBudget = summary.totalRevenueBudget - summary.totalExpenseBudget;
  summary.netActual = summary.totalRevenueActual - summary.totalExpenseActual;
  summary.netVariance = summary.netActual - summary.netBudget;
  return { lines, summary };
}

// server/routes/budgets.ts
import { fromZodError as fromZodError12 } from "zod-validation-error";
var router15 = Router15();
router15.get("/", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { fiscalYear } = req.query;
    const conditions = [eq29(budgets.company_id, companyId)];
    if (fiscalYear) {
      conditions.push(eq29(budgets.fiscal_year, parseInt(fiscalYear)));
    }
    const result = await db.query.budgets.findMany({
      where: and24(...conditions),
      with: {
        account: true
      },
      orderBy: [desc12(budgets.fiscal_year)]
    });
    res.json(result);
  } catch (error) {
    console.error("Error fetching budgets:", error);
    serverError(res, "Failed to fetch budgets");
  }
});
router15.post("/", requireAuth, requirePermission("accounting", "create"), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const body = normalize(req.body);
    const monthlyFields = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december"
    ];
    let calculatedTotal = 0;
    monthlyFields.forEach((month) => {
      if (body[month]) {
        calculatedTotal += parseFloat(body[month]) || 0;
      }
    });
    const total = calculatedTotal > 0 ? calculatedTotal.toString() : body.total || "0";
    const validatedData = insertBudgetSchema.parse({
      ...body,
      company_id: companyId,
      total,
      budget_name: body.budget_name || `Budget ${body.fiscal_year}`,
      period_type: body.period_type || "yearly"
    });
    const existing = await db.select().from(budgets).where(and24(
      eq29(budgets.company_id, companyId),
      eq29(budgets.account_id, validatedData.account_id),
      eq29(budgets.fiscal_year, validatedData.fiscal_year)
    ));
    let budget;
    if (existing.length > 0) {
      [budget] = await db.update(budgets).set({ ...validatedData, updated_at: /* @__PURE__ */ new Date() }).where(eq29(budgets.id, existing[0].id)).returning();
      await logUpdate({
        companyId,
        entityType: "budget",
        entityId: budget.id,
        oldData: existing[0],
        newData: validatedData,
        actorId: userId,
        actorName: req.session?.userName || "User",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
      });
    } else {
      [budget] = await db.insert(budgets).values({
        ...validatedData,
        created_by: userId
      }).returning();
      await logCreate({
        companyId,
        entityType: "budget",
        entityId: budget.id,
        createdData: { account_id: budget.account_id, fiscal_year: budget.fiscal_year, total: budget.total },
        actorId: userId,
        actorName: req.session?.userName || "User",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
      });
    }
    res.status(201).json(budget);
  } catch (error) {
    console.error("Error saving budget:", error);
    if (error.name === "ZodError") {
      return badRequest(res, fromZodError12(error).message);
    }
    serverError(res, "Failed to save budget");
  }
});
router15.get("/vs-actual", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { fiscalYear, period } = req.query;
    if (!fiscalYear) {
      return badRequest(res, "fiscalYear is required");
    }
    const report = await getBudgetVsActual(
      companyId,
      parseInt(fiscalYear),
      period ? parseInt(period) : void 0
    );
    res.json(report);
  } catch (error) {
    console.error("Error generating budget report:", error);
    serverError(res, "Failed to generate budget report");
  }
});
router15.post("/copy", requireAuth, requirePermission("accounting", "create"), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const { fromYear, toYear, adjustmentPercent = 0 } = req.body;
    if (!fromYear || !toYear) {
      return badRequest(res, "fromYear and toYear are required");
    }
    if (fromYear === toYear) {
      return badRequest(res, "Source and target year must be different");
    }
    const sourceBudgets = await db.select().from(budgets).where(and24(
      eq29(budgets.company_id, companyId),
      eq29(budgets.fiscal_year, parseInt(fromYear))
    ));
    if (sourceBudgets.length === 0) {
      return notFound(res, "No budgets found for source year");
    }
    const existingTarget = await db.select().from(budgets).where(and24(
      eq29(budgets.company_id, companyId),
      eq29(budgets.fiscal_year, parseInt(toYear))
    ));
    if (existingTarget.length > 0) {
      return badRequest(res, "Target year already has budgets. Delete them first.");
    }
    const adjustment = 1 + parseFloat(adjustmentPercent) / 100;
    const months = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december"
    ];
    const newBudgets = [];
    for (const source of sourceBudgets) {
      const newBudget = {
        company_id: companyId,
        budget_name: source.budget_name?.replace(fromYear, toYear) || `Budget ${toYear}`,
        fiscal_year: parseInt(toYear),
        account_id: source.account_id,
        period_type: source.period_type,
        created_by: userId
      };
      let total = 0;
      for (const month of months) {
        const sourceValue = parseFloat(source[month]?.toString() || "0");
        const adjustedValue = (sourceValue * adjustment).toFixed(2);
        newBudget[month] = adjustedValue;
        total += parseFloat(adjustedValue);
      }
      newBudget.total = total.toFixed(2);
      const [inserted] = await db.insert(budgets).values(newBudget).returning();
      newBudgets.push(inserted);
    }
    await logCreate({
      companyId,
      entityType: "budget",
      entityId: "bulk-copy",
      createdData: { fromYear, toYear, adjustmentPercent, count: newBudgets.length },
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json({
      success: true,
      message: `Copied ${newBudgets.length} budgets from ${fromYear} to ${toYear}`,
      count: newBudgets.length
    });
  } catch (error) {
    console.error("Error copying budgets:", error);
    serverError(res, "Failed to copy budgets");
  }
});
router15.delete("/:id", requireAuth, requirePermission("accounting", "delete"), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const { id } = req.params;
    const existing = await db.select().from(budgets).where(and24(
      eq29(budgets.id, id),
      eq29(budgets.company_id, companyId)
    ));
    if (existing.length === 0) {
      return notFound(res, "Budget not found");
    }
    await db.delete(budgets).where(eq29(budgets.id, id));
    await logDelete({
      companyId,
      entityType: "budget",
      entityId: id,
      deletedData: existing[0],
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting budget:", error);
    serverError(res, "Failed to delete budget");
  }
});
var budgets_default = router15;

// server/routes/projects.ts
init_db();
init_schema();
import { Router as Router16 } from "express";
import { eq as eq31, and as and26, asc, desc as desc14, sum as sum7 } from "drizzle-orm";

// server/utils/projects.ts
init_db();
init_schema();
import { eq as eq30, and as and25, desc as desc13, isNull as isNull3 } from "drizzle-orm";
async function getProjectFinancials(projectId) {
  const lines = await db.select({
    accountType: accounts.account_type,
    accountCategory: accounts.account_subtype,
    debit: journal_lines.base_debit,
    credit: journal_lines.base_credit
  }).from(journal_lines).innerJoin(accounts, eq30(journal_lines.account_id, accounts.id)).where(eq30(journal_lines.project_id, projectId));
  let revenue = 0;
  let expenses2 = 0;
  let assets = 0;
  let liabilities = 0;
  let equity = 0;
  for (const line of lines) {
    const amount = Number(line.debit) - Number(line.credit);
    if (line.accountType === "asset") {
      assets += amount;
    } else if (line.accountType === "liability") {
      liabilities += -amount;
    } else if (line.accountType === "equity") {
      equity += -amount;
    } else if (line.accountType === "revenue") {
      revenue += -amount;
    } else if (line.accountType === "expense") {
      expenses2 += amount;
    }
  }
  const directExpenses = await db.select({
    amount: expenses.amount
  }).from(expenses).where(and25(
    eq30(expenses.project_id, projectId),
    isNull3(expenses.journal_id)
  ));
  for (const exp of directExpenses) {
    expenses2 += Number(exp.amount);
  }
  return {
    revenue,
    expenses: expenses2,
    profit: revenue - expenses2,
    assets,
    liabilities,
    equity
  };
}
async function getProjectTransactions(projectId) {
  const journalLines = await db.query.journal_lines.findMany({
    where: eq30(journal_lines.project_id, projectId),
    with: {
      account: true,
      journal: true
    },
    orderBy: [desc13(journal_lines.id)]
  });
  const directExpenses = await db.select().from(expenses).where(and25(
    eq30(expenses.project_id, projectId),
    isNull3(expenses.journal_id)
  ));
  const expenseLines = directExpenses.map((exp) => ({
    id: exp.id,
    description: exp.description || `Expense: ${exp.category}`,
    base_debit: exp.amount,
    base_credit: "0",
    account: { name: exp.category || "Expense" },
    journal: { date: exp.date, description: exp.description }
  }));
  return [...journalLines, ...expenseLines].sort((a, b) => {
    const dateA = new Date(a.journal?.date || 0).getTime();
    const dateB = new Date(b.journal?.date || 0).getTime();
    return dateB - dateA;
  });
}

// server/routes/projects.ts
import { z as z4 } from "zod";
var router16 = Router16();
router16.get("/", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const allProjects = await db.select().from(projects).where(eq31(projects.company_id, companyId));
    res.json(allProjects);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});
router16.get("/:id", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const project = await db.query.projects.findFirst({
      where: and26(
        eq31(projects.id, req.params.id),
        eq31(projects.company_id, companyId)
      )
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch project" });
  }
});
router16.post("/", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const schema = z4.object({
      code: z4.string(),
      name: z4.string(),
      description: z4.string().optional(),
      budget: z4.number().optional(),
      start_date: z4.string().optional(),
      // ISO date string
      end_date: z4.string().optional(),
      // ISO date string
      status: z4.enum(["active", "completed", "on_hold", "cancelled"]).optional()
    });
    const data = schema.parse(req.body);
    if (data.start_date && data.end_date) {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      if (startDate > endDate) {
        return res.status(400).json({ error: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0628\u062F\u0621 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0642\u0628\u0644 \u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0627\u0646\u062A\u0647\u0627\u0621" });
      }
    }
    const [newProject] = await db.insert(projects).values({
      ...data,
      company_id: companyId,
      budget: data.budget ? data.budget.toString() : void 0,
      start_date: data.start_date ? new Date(data.start_date) : void 0,
      end_date: data.end_date ? new Date(data.end_date) : void 0
    }).returning();
    const userId = req.session.userId;
    await logCreate({
      companyId,
      entityType: "project",
      entityId: newProject.id,
      createdData: { code: newProject.code, name: newProject.name },
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json(newProject);
  } catch (error) {
    if (error instanceof z4.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Failed to create project" });
    }
  }
});
router16.put("/:id", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const schema = z4.object({
      code: z4.string().optional(),
      name: z4.string().optional(),
      description: z4.string().optional(),
      budget: z4.number().optional(),
      start_date: z4.string().optional(),
      end_date: z4.string().optional(),
      status: z4.enum(["active", "completed", "on_hold", "cancelled"]).optional(),
      is_active: z4.boolean().optional()
    });
    const data = schema.parse(req.body);
    if (data.start_date && data.end_date) {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      if (startDate > endDate) {
        return res.status(400).json({ error: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0628\u062F\u0621 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0642\u0628\u0644 \u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0627\u0646\u062A\u0647\u0627\u0621" });
      }
    }
    const [updatedProject] = await db.update(projects).set({
      ...data,
      budget: data.budget ? data.budget.toString() : void 0,
      start_date: data.start_date ? new Date(data.start_date) : void 0,
      end_date: data.end_date ? new Date(data.end_date) : void 0,
      updated_at: /* @__PURE__ */ new Date()
    }).where(and26(
      eq31(projects.id, req.params.id),
      eq31(projects.company_id, companyId)
    )).returning();
    if (!updatedProject) {
      return res.status(404).json({ error: "Project not found" });
    }
    const userId = req.session.userId;
    await logUpdate({
      companyId,
      entityType: "project",
      entityId: updatedProject.id,
      oldData: {},
      newData: data,
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ error: "Failed to update project" });
  }
});
router16.delete("/:id", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const project = await db.query.projects.findFirst({
      where: and26(
        eq31(projects.id, req.params.id),
        eq31(projects.company_id, companyId)
      )
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    await db.delete(projects).where(
      and26(
        eq31(projects.id, req.params.id),
        eq31(projects.company_id, companyId)
      )
    );
    const userId = req.session.userId;
    await logDelete({
      companyId,
      entityType: "project",
      entityId: req.params.id,
      deletedData: { code: project.code, name: project.name },
      actorId: userId,
      actorName: req.session?.userName || "User",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
});
router16.get("/:id/financials", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const project = await db.query.projects.findFirst({
      where: and26(
        eq31(projects.id, req.params.id),
        eq31(projects.company_id, companyId)
      )
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    const financials = await getProjectFinancials(req.params.id);
    res.json(financials);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch project financials" });
  }
});
router16.get("/:id/transactions", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const project = await db.query.projects.findFirst({
      where: and26(
        eq31(projects.id, req.params.id),
        eq31(projects.company_id, companyId)
      )
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    const transactions = await getProjectTransactions(req.params.id);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch project transactions" });
  }
});
router16.get("/:projectId/phases", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const project = await db.query.projects.findFirst({
      where: and26(
        eq31(projects.id, req.params.projectId),
        eq31(projects.company_id, companyId)
      )
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    const phases = await db.select().from(project_phases).where(eq31(project_phases.project_id, req.params.projectId)).orderBy(asc(project_phases.order_index));
    res.json(phases);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch phases" });
  }
});
router16.post("/:projectId/phases", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const project = await db.query.projects.findFirst({
      where: and26(
        eq31(projects.id, req.params.projectId),
        eq31(projects.company_id, companyId)
      )
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    const schema = z4.object({
      name: z4.string(),
      description: z4.string().optional(),
      order_index: z4.number().optional(),
      budget: z4.number().optional(),
      start_date: z4.string().optional(),
      end_date: z4.string().optional(),
      status: z4.enum(["pending", "in_progress", "completed", "cancelled"]).optional()
    });
    const data = schema.parse(req.body);
    const [newPhase] = await db.insert(project_phases).values({
      project_id: req.params.projectId,
      ...data,
      budget: data.budget?.toString(),
      start_date: data.start_date ? new Date(data.start_date) : void 0,
      end_date: data.end_date ? new Date(data.end_date) : void 0
    }).returning();
    res.json(newPhase);
  } catch (error) {
    if (error instanceof z4.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Failed to create phase" });
    }
  }
});
router16.put("/:projectId/phases/:phaseId", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const project = await db.query.projects.findFirst({
      where: and26(
        eq31(projects.id, req.params.projectId),
        eq31(projects.company_id, companyId)
      )
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    const schema = z4.object({
      name: z4.string().optional(),
      description: z4.string().optional(),
      order_index: z4.number().optional(),
      budget: z4.number().optional(),
      start_date: z4.string().optional(),
      end_date: z4.string().optional(),
      status: z4.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
      progress_percent: z4.number().min(0).max(100).optional()
    });
    const data = schema.parse(req.body);
    const [updatedPhase] = await db.update(project_phases).set({
      ...data,
      budget: data.budget?.toString(),
      start_date: data.start_date ? new Date(data.start_date) : void 0,
      end_date: data.end_date ? new Date(data.end_date) : void 0,
      updated_at: /* @__PURE__ */ new Date()
    }).where(eq31(project_phases.id, req.params.phaseId)).returning();
    if (!updatedPhase) {
      return res.status(404).json({ error: "Phase not found" });
    }
    res.json(updatedPhase);
  } catch (error) {
    res.status(500).json({ error: "Failed to update phase" });
  }
});
router16.delete("/:projectId/phases/:phaseId", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const project = await db.query.projects.findFirst({
      where: and26(
        eq31(projects.id, req.params.projectId),
        eq31(projects.company_id, companyId)
      )
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    await db.delete(project_phases).where(eq31(project_phases.id, req.params.phaseId));
    res.json({ message: "Phase deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete phase" });
  }
});
router16.get("/:projectId/tasks", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const project = await db.query.projects.findFirst({
      where: and26(
        eq31(projects.id, req.params.projectId),
        eq31(projects.company_id, companyId)
      )
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    const tasks = await db.query.project_tasks.findMany({
      where: eq31(project_tasks.project_id, req.params.projectId),
      with: {
        phase: true,
        assignee: {
          columns: { id: true, full_name: true, email: true }
        }
      },
      orderBy: [asc(project_tasks.order_index)]
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});
router16.post("/:projectId/tasks", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const project = await db.query.projects.findFirst({
      where: and26(
        eq31(projects.id, req.params.projectId),
        eq31(projects.company_id, companyId)
      )
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    const schema = z4.object({
      title: z4.string(),
      description: z4.string().optional(),
      phase_id: z4.string().optional(),
      priority: z4.enum(["low", "medium", "high", "urgent"]).optional(),
      status: z4.enum(["todo", "in_progress", "review", "completed", "cancelled"]).optional(),
      assigned_to: z4.string().optional(),
      due_date: z4.string().optional(),
      estimated_hours: z4.number().optional(),
      order_index: z4.number().optional()
    });
    const data = schema.parse(req.body);
    const [newTask] = await db.insert(project_tasks).values({
      project_id: req.params.projectId,
      ...data,
      estimated_hours: data.estimated_hours?.toString(),
      due_date: data.due_date ? new Date(data.due_date) : void 0,
      created_by: userId
    }).returning();
    res.json(newTask);
  } catch (error) {
    if (error instanceof z4.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Failed to create task" });
    }
  }
});
router16.put("/:projectId/tasks/:taskId", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const project = await db.query.projects.findFirst({
      where: and26(
        eq31(projects.id, req.params.projectId),
        eq31(projects.company_id, companyId)
      )
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    const schema = z4.object({
      title: z4.string().optional(),
      description: z4.string().optional(),
      phase_id: z4.string().nullable().optional(),
      priority: z4.enum(["low", "medium", "high", "urgent"]).optional(),
      status: z4.enum(["todo", "in_progress", "review", "completed", "cancelled"]).optional(),
      assigned_to: z4.string().nullable().optional(),
      due_date: z4.string().nullable().optional(),
      estimated_hours: z4.number().optional(),
      actual_hours: z4.number().optional(),
      order_index: z4.number().optional()
    });
    const data = schema.parse(req.body);
    const updateData = {
      ...data,
      estimated_hours: data.estimated_hours?.toString(),
      actual_hours: data.actual_hours?.toString(),
      due_date: data.due_date ? new Date(data.due_date) : null,
      updated_at: /* @__PURE__ */ new Date()
    };
    if (data.status === "completed") {
      updateData.completed_at = /* @__PURE__ */ new Date();
    }
    const [updatedTask] = await db.update(project_tasks).set(updateData).where(eq31(project_tasks.id, req.params.taskId)).returning();
    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: "Failed to update task" });
  }
});
router16.delete("/:projectId/tasks/:taskId", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const project = await db.query.projects.findFirst({
      where: and26(
        eq31(projects.id, req.params.projectId),
        eq31(projects.company_id, companyId)
      )
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    await db.delete(project_tasks).where(eq31(project_tasks.id, req.params.taskId));
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete task" });
  }
});
router16.get("/:projectId/time-entries", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const project = await db.query.projects.findFirst({
      where: and26(
        eq31(projects.id, req.params.projectId),
        eq31(projects.company_id, companyId)
      )
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    const entries = await db.query.project_time_entries.findMany({
      where: eq31(project_time_entries.project_id, req.params.projectId),
      with: {
        task: true,
        user: {
          columns: { id: true, full_name: true, email: true }
        }
      },
      orderBy: [desc14(project_time_entries.date)]
    });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch time entries" });
  }
});
router16.get("/:projectId/time-summary", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const project = await db.query.projects.findFirst({
      where: and26(
        eq31(projects.id, req.params.projectId),
        eq31(projects.company_id, companyId)
      )
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    const entries = await db.select({
      totalHours: sum7(project_time_entries.hours),
      billableHours: sum7(project_time_entries.hours)
    }).from(project_time_entries).where(eq31(project_time_entries.project_id, req.params.projectId));
    const billableEntries = await db.select({
      billableHours: sum7(project_time_entries.hours)
    }).from(project_time_entries).where(and26(
      eq31(project_time_entries.project_id, req.params.projectId),
      eq31(project_time_entries.billable, true)
    ));
    res.json({
      totalHours: parseFloat(entries[0]?.totalHours || "0"),
      billableHours: parseFloat(billableEntries[0]?.billableHours || "0")
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch time summary" });
  }
});
router16.post("/:projectId/time-entries", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const project = await db.query.projects.findFirst({
      where: and26(
        eq31(projects.id, req.params.projectId),
        eq31(projects.company_id, companyId)
      )
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    const schema = z4.object({
      task_id: z4.string().optional(),
      date: z4.string(),
      hours: z4.number().positive(),
      description: z4.string().optional(),
      billable: z4.boolean().optional(),
      hourly_rate: z4.number().optional()
    });
    const data = schema.parse(req.body);
    const [newEntry] = await db.insert(project_time_entries).values({
      project_id: req.params.projectId,
      user_id: userId,
      ...data,
      hours: data.hours.toString(),
      hourly_rate: data.hourly_rate?.toString(),
      date: new Date(data.date)
    }).returning();
    res.json(newEntry);
  } catch (error) {
    if (error instanceof z4.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Failed to create time entry" });
    }
  }
});
router16.put("/:projectId/time-entries/:entryId", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const project = await db.query.projects.findFirst({
      where: and26(
        eq31(projects.id, req.params.projectId),
        eq31(projects.company_id, companyId)
      )
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    const schema = z4.object({
      task_id: z4.string().nullable().optional(),
      date: z4.string().optional(),
      hours: z4.number().positive().optional(),
      description: z4.string().optional(),
      billable: z4.boolean().optional(),
      hourly_rate: z4.number().optional()
    });
    const data = schema.parse(req.body);
    const [updatedEntry] = await db.update(project_time_entries).set({
      ...data,
      hours: data.hours?.toString(),
      hourly_rate: data.hourly_rate?.toString(),
      date: data.date ? new Date(data.date) : void 0,
      updated_at: /* @__PURE__ */ new Date()
    }).where(eq31(project_time_entries.id, req.params.entryId)).returning();
    if (!updatedEntry) {
      return res.status(404).json({ error: "Time entry not found" });
    }
    res.json(updatedEntry);
  } catch (error) {
    res.status(500).json({ error: "Failed to update time entry" });
  }
});
router16.delete("/:projectId/time-entries/:entryId", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const project = await db.query.projects.findFirst({
      where: and26(
        eq31(projects.id, req.params.projectId),
        eq31(projects.company_id, companyId)
      )
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    await db.delete(project_time_entries).where(eq31(project_time_entries.id, req.params.entryId));
    res.json({ message: "Time entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete time entry" });
  }
});
router16.get("/:projectId/progress", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const project = await db.query.projects.findFirst({
      where: and26(
        eq31(projects.id, req.params.projectId),
        eq31(projects.company_id, companyId)
      )
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    const tasks = await db.select().from(project_tasks).where(eq31(project_tasks.project_id, req.params.projectId));
    const taskStats = {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === "completed").length,
      inProgress: tasks.filter((t) => t.status === "in_progress").length,
      todo: tasks.filter((t) => t.status === "todo").length,
      overdue: tasks.filter((t) => t.due_date && new Date(t.due_date) < /* @__PURE__ */ new Date() && t.status !== "completed").length
    };
    const phases = await db.select().from(project_phases).where(eq31(project_phases.project_id, req.params.projectId));
    const phaseStats = {
      total: phases.length,
      completed: phases.filter((p) => p.status === "completed").length,
      inProgress: phases.filter((p) => p.status === "in_progress").length,
      avgProgress: phases.length > 0 ? phases.reduce((sum8, p) => sum8 + p.progress_percent, 0) / phases.length : 0
    };
    const overallProgress = taskStats.total > 0 ? Math.round(taskStats.completed / taskStats.total * 100) : 0;
    res.json({
      tasks: taskStats,
      phases: phaseStats,
      overallProgress
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch project progress" });
  }
});
var projects_default = router16;

// server/routes/manufacturing.ts
init_db();
init_schema();
import { Router as Router17 } from "express";
import { eq as eq32, and as and27, desc as desc15 } from "drizzle-orm";
init_sendError();
var router17 = Router17();
router17.get("/boms", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const results = await db.select().from(manufacturing_boms).where(eq32(manufacturing_boms.company_id, companyId));
    res.json(results);
  } catch (error) {
    return serverError(res, "Failed to fetch BOMs");
  }
});
router17.post("/boms", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { items: items3, ...bomData } = req.body;
    const validatedBom = insertManufacturingBomSchema.parse(bomData);
    const result = await db.transaction(async (tx) => {
      const [newBom] = await tx.insert(manufacturing_boms).values({ ...validatedBom, company_id: companyId }).returning();
      if (items3 && Array.isArray(items3)) {
        for (const item of items3) {
          const validatedItem = insertManufacturingBomItemSchema.parse({ ...item, bom_id: newBom.id });
          await tx.insert(manufacturing_bom_items).values(validatedItem);
        }
      }
      return newBom;
    });
    res.status(201).json(result);
  } catch (error) {
    console.error("BOM creation error:", error);
    return serverError(res, "Failed to create BOM");
  }
});
router17.post("/orders", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const data = insertProductionOrderSchema.parse(req.body);
    const [order] = await db.insert(production_orders).values({ ...data, company_id: companyId }).returning();
    res.status(201).json(order);
  } catch (error) {
    return serverError(res, "Failed to create production order");
  }
});
router17.get("/orders", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const results = await db.select().from(production_orders).where(eq32(production_orders.company_id, companyId)).orderBy(desc15(production_orders.created_at));
    res.json(results);
  } catch (error) {
    return serverError(res, "Failed to fetch production orders");
  }
});
router17.patch("/orders/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.session.companyId;
    const data = req.body;
    const [updated] = await db.update(production_orders).set({ ...data, updated_at: /* @__PURE__ */ new Date() }).where(and27(eq32(production_orders.id, id), eq32(production_orders.company_id, companyId))).returning();
    if (!updated) return notFound(res, "Order not found");
    res.json(updated);
  } catch (error) {
    return serverError(res, "Failed to update order");
  }
});
router17.post("/orders/:id/complete", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.session.companyId;
    const userId = req.user.id;
    const { batch_number, expiry_date } = req.body;
    const [order] = await db.select().from(production_orders).where(and27(eq32(production_orders.id, id), eq32(production_orders.company_id, companyId)));
    if (!order) return notFound(res, "Order not found");
    if (order.status === "completed") return badRequest(res, "Order already completed");
    if (!order.bom_id) return badRequest(res, "Order has no BOM linked");
    const bomItems = await db.select().from(manufacturing_bom_items).where(eq32(manufacturing_bom_items.bom_id, order.bom_id));
    await db.transaction(async (tx) => {
      for (const item of bomItems) {
        const qtyNeeded = Number(item.quantity) * Number(order.quantity);
        await tx.insert(stock_movements).values({
          company_id: companyId,
          item_id: item.item_id,
          warehouse_id: order.warehouse_id || "default",
          // Fallback needs handling
          transaction_type: "manufacturing_out",
          transaction_date: /* @__PURE__ */ new Date(),
          quantity: (-qtyNeeded).toString(),
          unit_cost: "0",
          // TODO: Implement costing
          total_cost: "0",
          reference_type: "production_order",
          reference_id: order.id,
          created_by: userId
        });
      }
      let batchId;
      if (batch_number) {
        const [newBatch] = await tx.insert(batches).values({
          company_id: companyId,
          item_id: order.item_id,
          batch_number,
          expiry_date: expiry_date ? new Date(expiry_date) : null,
          quantity: order.quantity.toString(),
          warehouse_id: order.warehouse_id,
          manufacturing_date: /* @__PURE__ */ new Date()
        }).returning();
        batchId = newBatch.id;
      }
      await tx.insert(stock_movements).values({
        company_id: companyId,
        item_id: order.item_id,
        warehouse_id: order.warehouse_id || "default",
        transaction_type: "manufacturing_in",
        transaction_date: /* @__PURE__ */ new Date(),
        quantity: order.quantity.toString(),
        unit_cost: "0",
        // TODO: Calculate from BOM cost
        total_cost: "0",
        reference_type: "production_order",
        reference_id: order.id,
        batch_id: batchId,
        created_by: userId
      });
      await tx.update(production_orders).set({
        status: "completed",
        updated_at: /* @__PURE__ */ new Date(),
        output_batch_number: batch_number,
        output_expiry_date: expiry_date ? new Date(expiry_date) : null
      }).where(eq32(production_orders.id, id));
    });
    res.json({ message: "Production completed successfully" });
  } catch (error) {
    console.error("Production completion error:", error);
    return serverError(res, "Failed to complete production");
  }
});
var manufacturing_default = router17;

// server/routes/hr.ts
init_db();
init_schema();
import { Router as Router18 } from "express";
import { eq as eq33, and as and28, desc as desc16 } from "drizzle-orm";
init_sendError();
var router18 = Router18();
router18.get("/employees", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const results = await db.select().from(employees).where(eq33(employees.company_id, companyId));
    res.json(results);
  } catch (error) {
    return serverError(res, "Failed to fetch employees");
  }
});
router18.post("/employees", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const data = insertEmployeeSchema.parse(req.body);
    const [newEmployee] = await db.insert(employees).values({ ...data, company_id: companyId }).returning();
    res.status(201).json(newEmployee);
  } catch (error) {
    return serverError(res, "Failed to create employee");
  }
});
router18.get("/departments", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const results = await db.select().from(departments).where(eq33(departments.company_id, companyId));
    res.json(results);
  } catch (error) {
    return serverError(res, "Failed to fetch departments");
  }
});
router18.post("/departments", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const data = insertDepartmentSchema.parse(req.body);
    const [newDept] = await db.insert(departments).values({ ...data, company_id: companyId }).returning();
    res.status(201).json(newDept);
  } catch (error) {
    return serverError(res, "Failed to create department");
  }
});
router18.post("/payroll/run", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const data = insertPayrollRunSchema.parse(req.body);
    const [run] = await db.insert(payroll_runs).values({ ...data, company_id: companyId }).returning();
    const activeEmployees = await db.select().from(employees).where(and28(eq33(employees.company_id, companyId), eq33(employees.status, "active")));
    const payslipPromises = activeEmployees.map((emp) => {
      return db.insert(payslips).values({
        payroll_run_id: run.id,
        employee_id: emp.id,
        basic_salary: emp.salary || "0",
        net_salary: emp.salary || "0",
        allowances: "0",
        deductions: "0"
      });
    });
    await Promise.all(payslipPromises);
    res.status(201).json({ run, generated_payslips: activeEmployees.length });
  } catch (error) {
    console.error("Payroll error:", error);
    return serverError(res, "Failed to run payroll");
  }
});
router18.get("/payroll-runs", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const results = await db.select().from(payroll_runs).where(eq33(payroll_runs.company_id, companyId)).orderBy(desc16(payroll_runs.created_at));
    res.json(results);
  } catch (error) {
    return serverError(res, "Failed to fetch payroll runs");
  }
});
router18.get("/payroll-runs/:id/payslips", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const results = await db.select({
      id: payslips.id,
      employee_name: employees.first_name,
      employee_last_name: employees.last_name,
      basic_salary: payslips.basic_salary,
      allowances: payslips.allowances,
      deductions: payslips.deductions,
      net_salary: payslips.net_salary
    }).from(payslips).innerJoin(employees, eq33(payslips.employee_id, employees.id)).where(eq33(payslips.payroll_run_id, id));
    res.json(results);
  } catch (error) {
    return serverError(res, "Failed to fetch payslips");
  }
});
var hr_default = router18;

// server/routes/checks.ts
init_db();
init_schema();
import { Router as Router19 } from "express";
import { eq as eq34, and as and29, desc as desc17, getTableColumns } from "drizzle-orm";
init_sendError();
import { z as z5 } from "zod";
var router19 = Router19();
router19.get("/", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { type, status } = req.query;
    const conditions = [eq34(checks.company_id, companyId)];
    if (type) {
      conditions.push(eq34(checks.type, type));
    }
    if (status) {
      conditions.push(eq34(checks.status, status));
    }
    const results = await db.select({
      ...getTableColumns(checks),
      bank_name: bank_accounts.bank_name,
      currency: bank_accounts.currency
    }).from(checks).leftJoin(bank_accounts, eq34(checks.bank_account_id, bank_accounts.id)).where(and29(...conditions)).orderBy(desc17(checks.issue_date));
    res.json(results);
  } catch (error) {
    console.error("Error fetching checks:", error);
    return serverError(res, "Failed to fetch checks");
  }
});
router19.post("/", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const data = insertCheckSchema.parse(req.body);
    const [newCheck] = await db.insert(checks).values({ ...data, company_id: companyId }).returning();
    await logCreate({
      companyId,
      entityType: "checks",
      entityId: newCheck.id,
      createdData: newCheck,
      actorId: req.session.userId,
      actorName: req.session.userName,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.status(201).json(newCheck);
  } catch (error) {
    if (error instanceof z5.ZodError) {
      return badRequest(res, error.message);
    }
    console.error("Error creating check:", error);
    return serverError(res, "Failed to create check");
  }
});
router19.patch("/:id/status", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { id } = req.params;
    const { status } = req.body;
    if (!["on_hand", "deposited", "cleared", "bounced", "returned", "cancelled"].includes(status)) {
      return badRequest(res, "Invalid status");
    }
    const [existing] = await db.select().from(checks).where(and29(eq34(checks.id, id), eq34(checks.company_id, companyId)));
    if (!existing) return notFound(res, "Check not found");
    const [updated] = await db.update(checks).set({ status, updated_at: /* @__PURE__ */ new Date() }).where(eq34(checks.id, id)).returning();
    await logUpdate({
      companyId,
      entityType: "checks",
      entityId: id,
      oldData: existing,
      newData: updated,
      actorId: req.session.userId,
      actorName: req.session.userName,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json(updated);
  } catch (error) {
    console.error("Error updating check status:", error);
    return serverError(res, "Failed to update check status");
  }
});
var checks_default = router19;

// server/routes/costCenters.ts
init_db();
init_schema();
import { Router as Router20 } from "express";
import { eq as eq35, and as and30 } from "drizzle-orm";
init_sendError();
import { z as z6 } from "zod";
var router20 = Router20();
router20.get("/", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const allCostCenters = await db.select().from(cost_centers).where(and30(eq35(cost_centers.company_id, companyId), eq35(cost_centers.is_active, true)));
    res.json(allCostCenters);
  } catch (error) {
    console.error("Error fetching cost centers:", error);
    return serverError(res, "Failed to fetch cost centers");
  }
});
router20.post("/", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const data = insertCostCenterSchema.parse(req.body);
    const [newCostCenter] = await db.insert(cost_centers).values({ ...data, company_id: companyId }).returning();
    await logCreate({
      companyId,
      entityType: "cost_centers",
      entityId: newCostCenter.id,
      createdData: newCostCenter,
      actorId: req.session.userId,
      actorName: req.session.userName,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.status(201).json(newCostCenter);
  } catch (error) {
    if (error instanceof z6.ZodError) {
      return badRequest(res, error.message);
    }
    console.error("Error creating cost center:", error);
    return serverError(res, "Failed to create cost center");
  }
});
router20.put("/:id", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { id } = req.params;
    const data = insertCostCenterSchema.partial().parse(req.body);
    const [existing] = await db.select().from(cost_centers).where(and30(eq35(cost_centers.id, id), eq35(cost_centers.company_id, companyId)));
    if (!existing) return notFound(res, "Cost center not found");
    const [updated] = await db.update(cost_centers).set({ ...data, updated_at: /* @__PURE__ */ new Date() }).where(eq35(cost_centers.id, id)).returning();
    await logUpdate({
      companyId,
      entityType: "cost_centers",
      entityId: id,
      oldData: existing,
      newData: updated,
      actorId: req.session.userId,
      actorName: req.session.userName,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json(updated);
  } catch (error) {
    console.error("Error updating cost center:", error);
    return serverError(res, "Failed to update cost center");
  }
});
router20.delete("/:id", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { id } = req.params;
    const [existing] = await db.select().from(cost_centers).where(and30(eq35(cost_centers.id, id), eq35(cost_centers.company_id, companyId)));
    if (!existing) return notFound(res, "Cost center not found");
    const [deleted] = await db.update(cost_centers).set({ is_active: false, updated_at: /* @__PURE__ */ new Date() }).where(eq35(cost_centers.id, id)).returning();
    await logDelete({
      companyId,
      entityType: "cost_centers",
      entityId: id,
      deletedData: existing,
      actorId: req.session.userId,
      actorName: req.session.userName,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting cost center:", error);
    return serverError(res, "Failed to delete cost center");
  }
});
var costCenters_default = router20;

// server/routes/approvals.ts
init_db();
init_schema();
import { Router as Router21 } from "express";
import { eq as eq36, and as and31, desc as desc18, asc as asc2 } from "drizzle-orm";
init_sendError();
var router21 = Router21();
router21.get("/workflows", requireAuth, requireRole(["admin", "owner"]), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const workflows = await db.select().from(approval_workflows).where(eq36(approval_workflows.company_id, companyId));
    const workflowsWithSteps = await Promise.all(workflows.map(async (wf) => {
      const steps = await db.select().from(approval_workflow_steps).where(eq36(approval_workflow_steps.workflow_id, wf.id)).orderBy(asc2(approval_workflow_steps.step_order));
      return { ...wf, steps };
    }));
    res.json(workflowsWithSteps);
  } catch (error) {
    serverError(res, "Failed to fetch workflows");
  }
});
router21.post("/workflows", requireAuth, requireRole(["admin", "owner"]), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { steps, ...workflowData } = req.body;
    const parsedWorkflow = insertApprovalWorkflowSchema.parse({
      ...workflowData,
      company_id: companyId
    });
    const [workflow] = await db.insert(approval_workflows).values(parsedWorkflow).returning();
    if (steps && Array.isArray(steps)) {
      for (const step of steps) {
        const parsedStep = insertApprovalWorkflowStepSchema.parse({
          ...step,
          workflow_id: workflow.id
        });
        await db.insert(approval_workflow_steps).values(parsedStep);
      }
    } else {
      await db.insert(approval_workflow_steps).values({
        workflow_id: workflow.id,
        step_order: 1,
        approver_role: workflowData.approver_role || "admin"
      });
    }
    const createdSteps = await db.select().from(approval_workflow_steps).where(eq36(approval_workflow_steps.workflow_id, workflow.id)).orderBy(asc2(approval_workflow_steps.step_order));
    res.json({ ...workflow, steps: createdSteps });
  } catch (error) {
    console.error(error);
    badRequest(res, "Invalid workflow data");
  }
});
router21.delete("/workflows/:id", requireAuth, requireRole(["admin", "owner"]), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    await db.delete(approval_workflows).where(and31(
      eq36(approval_workflows.id, req.params.id),
      eq36(approval_workflows.company_id, companyId)
    ));
    res.json({ ok: true });
  } catch (error) {
    serverError(res, "Failed to delete workflow");
  }
});
router21.get("/requests", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const requests = await db.select({
      request: approval_requests,
      requester: {
        id: users.id,
        name: users.full_name,
        email: users.email
      },
      workflow: approval_workflows
    }).from(approval_requests).leftJoin(users, eq36(approval_requests.requester_id, users.id)).leftJoin(approval_workflows, eq36(approval_requests.workflow_id, approval_workflows.id)).where(eq36(approval_requests.company_id, companyId)).orderBy(desc18(approval_requests.created_at));
    const enrichedRequests = await Promise.all(requests.map(async (r) => {
      let entityDetails = null;
      if (r.request.entity_type === "expense") {
        const [exp] = await db.select().from(expenses).where(eq36(expenses.id, r.request.entity_id));
        entityDetails = exp;
      } else if (r.request.entity_type === "invoice") {
        const [inv] = await db.select().from(sales_invoices).where(eq36(sales_invoices.id, r.request.entity_id));
        entityDetails = inv;
      } else if (r.request.entity_type === "purchase_order") {
        const [po] = await db.select().from(purchase_orders).where(eq36(purchase_orders.id, r.request.entity_id));
        entityDetails = po;
      }
      let currentStepDetails = null;
      if (r.request.status === "pending") {
        const [step] = await db.select().from(approval_workflow_steps).where(and31(
          eq36(approval_workflow_steps.workflow_id, r.request.workflow_id),
          eq36(approval_workflow_steps.step_order, r.request.current_step)
        ));
        currentStepDetails = step;
      }
      return {
        ...r.request,
        requester: r.requester,
        workflow_name: r.workflow?.name,
        entity: entityDetails,
        current_step_details: currentStepDetails
      };
    }));
    res.json(enrichedRequests);
  } catch (error) {
    serverError(res, "Failed to fetch requests");
  }
});
router21.get("/requests/pending", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const userRole = req.user.role;
    const userId = req.user.id;
    const pendingRequests = await db.select({
      request: approval_requests,
      workflow: approval_workflows
    }).from(approval_requests).innerJoin(approval_workflows, eq36(approval_requests.workflow_id, approval_workflows.id)).where(and31(
      eq36(approval_requests.company_id, companyId),
      eq36(approval_requests.status, "pending")
    ));
    const actionableRequests = [];
    for (const item of pendingRequests) {
      const [currentStep] = await db.select().from(approval_workflow_steps).where(and31(
        eq36(approval_workflow_steps.workflow_id, item.request.workflow_id),
        eq36(approval_workflow_steps.step_order, item.request.current_step)
      ));
      if (currentStep) {
        const roleMatch = currentStep.approver_role === userRole;
        const userMatch = currentStep.approver_id === userId;
        if (currentStep.approver_id) {
          if (userMatch) actionableRequests.push(item);
        } else {
          if (roleMatch) actionableRequests.push(item);
        }
      }
    }
    if (actionableRequests.length === 0 && userRole !== "owner") {
      return res.json([]);
    }
    const finalRequests = userRole === "owner" ? pendingRequests : actionableRequests;
    const enrichedRequests = await Promise.all(finalRequests.map(async (r) => {
      let requesterName = "Unknown";
      if (r.request.requester_id) {
        const [requester] = await db.select().from(users).where(eq36(users.id, r.request.requester_id));
        if (requester) requesterName = requester.full_name;
      }
      let entityDetails = null;
      if (r.request.entity_type === "expense") {
        const [exp] = await db.select().from(expenses).where(eq36(expenses.id, r.request.entity_id));
        entityDetails = exp;
      } else if (r.request.entity_type === "invoice") {
        const [inv] = await db.select().from(sales_invoices).where(eq36(sales_invoices.id, r.request.entity_id));
        entityDetails = inv;
      }
      return {
        ...r.request,
        requester_name: requesterName,
        workflow_name: r.workflow?.name,
        entity_details: entityDetails
      };
    }));
    res.json(enrichedRequests);
  } catch (error) {
    console.error(error);
    serverError(res, "Failed to fetch requests");
  }
});
router21.post("/requests/:id/action", requireAuth, async (req, res) => {
  try {
    const { action, comments } = req.body;
    const userId = req.user.id;
    if (!["approve", "reject"].includes(action)) return badRequest(res, "Invalid action");
    const [request] = await db.select().from(approval_requests).where(eq36(approval_requests.id, req.params.id));
    if (!request) return notFound(res, "Request not found");
    await db.insert(approval_request_actions).values({
      request_id: request.id,
      step_order: request.current_step,
      approver_id: userId,
      action,
      comments
    });
    if (action === "reject") {
      await db.update(approval_requests).set({
        status: "rejected",
        approver_id: userId,
        // Last actor
        comments,
        updated_at: /* @__PURE__ */ new Date()
      }).where(eq36(approval_requests.id, req.params.id));
      if (request.entity_type === "expense") {
        await db.update(expenses).set({ status: "draft" }).where(eq36(expenses.id, request.entity_id));
      } else if (request.entity_type === "invoice") {
        await db.update(sales_invoices).set({ status: "draft" }).where(eq36(sales_invoices.id, request.entity_id));
      }
    } else {
      const nextStep = await db.select().from(approval_workflow_steps).where(and31(
        eq36(approval_workflow_steps.workflow_id, request.workflow_id),
        eq36(approval_workflow_steps.step_order, request.current_step + 1)
      ));
      if (nextStep.length > 0) {
        await db.update(approval_requests).set({
          current_step: request.current_step + 1,
          updated_at: /* @__PURE__ */ new Date()
        }).where(eq36(approval_requests.id, req.params.id));
      } else {
        await db.update(approval_requests).set({
          status: "approved",
          approver_id: userId,
          comments,
          updated_at: /* @__PURE__ */ new Date()
        }).where(eq36(approval_requests.id, req.params.id));
        if (request.entity_type === "expense") {
          await db.update(expenses).set({ status: "approved" }).where(eq36(expenses.id, request.entity_id));
        } else if (request.entity_type === "invoice") {
          await db.update(sales_invoices).set({ status: "approved" }).where(eq36(sales_invoices.id, request.entity_id));
        }
      }
    }
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    serverError(res, "Failed to process approval");
  }
});
var approvals_default = router21;

// server/routes/landedCost.ts
init_db();
init_schema();
import { Router as Router22 } from "express";
import { eq as eq38, desc as desc19 } from "drizzle-orm";

// server/utils/landedCost.ts
init_db();
init_schema();
import { eq as eq37, sql as sql18, and as and32 } from "drizzle-orm";
async function allocateLandedCost(voucherId) {
  const [voucher] = await db.select().from(landed_cost_vouchers).where(eq37(landed_cost_vouchers.id, voucherId));
  if (!voucher) throw new Error("Voucher not found");
  const bills3 = await db.select().from(landed_cost_bills).where(eq37(landed_cost_bills.voucher_id, voucherId));
  const totalAmount = bills3.reduce((sum8, b) => sum8 + parseFloat(b.amount.toString()), 0);
  const itemsList = await db.select().from(landed_cost_items).where(eq37(landed_cost_items.voucher_id, voucherId));
  const itemDetails = await Promise.all(itemsList.map(async (item) => {
    const [movement] = await db.select().from(stock_movements).where(eq37(stock_movements.id, item.stock_movement_id));
    return { ...item, movement };
  }));
  let totalBase = 0;
  if (voucher.allocation_method === "quantity") {
    totalBase = itemDetails.reduce((sum8, i) => sum8 + parseFloat(i.movement?.quantity.toString() || "0"), 0);
  } else {
    totalBase = itemDetails.reduce((sum8, i) => sum8 + parseFloat(i.movement?.total_cost.toString() || "0"), 0);
  }
  if (totalBase === 0) return;
  for (const item of itemDetails) {
    if (!item.movement) continue;
    const base = voucher.allocation_method === "quantity" ? parseFloat(item.movement.quantity.toString()) : parseFloat(item.movement.total_cost.toString());
    const ratio = base / totalBase;
    const allocatedAmount = totalAmount * ratio;
    const originalCost = parseFloat(item.movement.total_cost.toString());
    const newTotalCost = originalCost + allocatedAmount;
    const quantity = parseFloat(item.movement.quantity.toString());
    const newUnitCost = quantity !== 0 ? newTotalCost / quantity : 0;
    await db.update(landed_cost_items).set({
      original_cost: originalCost.toString(),
      allocated_cost: allocatedAmount.toString(),
      new_unit_cost: newUnitCost.toString()
    }).where(eq37(landed_cost_items.id, item.id));
  }
}
async function postLandedCostVoucher(voucherId, userId) {
  await allocateLandedCost(voucherId);
  const [voucher] = await db.select().from(landed_cost_vouchers).where(eq37(landed_cost_vouchers.id, voucherId));
  if (!voucher) throw new Error("Voucher not found");
  if (voucher.status === "posted") throw new Error("Already posted");
  const voucherItems = await db.select().from(landed_cost_items).where(eq37(landed_cost_items.voucher_id, voucherId));
  const voucherBills = await db.select().from(landed_cost_bills).where(eq37(landed_cost_bills.voucher_id, voucherId));
  const affectedItemIds = /* @__PURE__ */ new Set();
  for (const item of voucherItems) {
    await db.update(stock_movements).set({
      unit_cost: item.new_unit_cost,
      total_cost: sql18`${stock_movements.quantity} * ${item.new_unit_cost}`
    }).where(eq37(stock_movements.id, item.stock_movement_id));
    const [movement] = await db.select().from(stock_movements).where(eq37(stock_movements.id, item.stock_movement_id));
    if (movement) affectedItemIds.add(movement.item_id);
  }
  const journalLines = [];
  for (const vItem of voucherItems) {
    const allocated = parseFloat(vItem.allocated_cost.toString());
    if (allocated <= 0) continue;
    const [movement] = await db.select().from(stock_movements).where(eq37(stock_movements.id, vItem.stock_movement_id));
    if (movement) {
      const [item] = await db.select().from(items).where(eq37(items.id, movement.item_id));
      if (item && item.inventory_account_id) {
        journalLines.push({
          account_id: item.inventory_account_id,
          debit: allocated,
          credit: 0,
          description: `Landed Cost Allocation - ${item.name}`
        });
      }
    }
  }
  for (const vBill of voucherBills) {
    const amount = parseFloat(vBill.amount.toString());
    if (amount <= 0) continue;
    const lines = await db.select().from(document_lines).where(and32(
      eq37(document_lines.document_id, vBill.bill_id),
      eq37(document_lines.document_type, "bill")
    ));
    let remainingCredit = amount;
    for (const line of lines) {
      if (remainingCredit <= 0) break;
      if (line.item_id) {
        const [lineItem] = await db.select().from(items).where(eq37(items.id, line.item_id));
        if (lineItem && lineItem.cost_account_id) {
          journalLines.push({
            account_id: lineItem.cost_account_id,
            debit: 0,
            credit: remainingCredit,
            // TODO: Better distribution if multiple lines
            description: `Landed Cost Allocation - Bill ${vBill.bill_id}`
          });
          remainingCredit = 0;
        }
      }
    }
    if (remainingCredit > 0) {
      console.warn(`Could not find expense account for bill ${vBill.bill_id}`);
    }
  }
  if (journalLines.length > 0) {
    await createJournalEntry({
      company_id: voucher.company_id,
      date: /* @__PURE__ */ new Date(),
      description: `Landed Cost Allocation: ${voucher.voucher_number}`,
      source_type: "landed_cost",
      source_id: voucher.id,
      lines: journalLines,
      created_by: userId
    });
  }
  for (const itemId of Array.from(affectedItemIds)) {
    await calculateStockValue(voucher.company_id, itemId);
  }
  await db.update(landed_cost_vouchers).set({ status: "posted", updated_at: /* @__PURE__ */ new Date() }).where(eq37(landed_cost_vouchers.id, voucherId));
}

// server/routes/landedCost.ts
var router22 = Router22();
router22.get("/", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    console.log(`Fetching landed cost vouchers for company: ${companyId}`);
    const vouchers = await db.query.landed_cost_vouchers.findMany({
      where: eq38(landed_cost_vouchers.company_id, companyId),
      orderBy: [desc19(landed_cost_vouchers.date)],
      with: {
        bills: {
          with: {
            bill: true
          }
        },
        items: {
          with: {
            stock_movement: {
              with: {
                item: true
              }
            }
          }
        }
      }
    });
    console.log(`Found ${vouchers.length} vouchers`);
    res.json(vouchers);
  } catch (error) {
    console.error("Error fetching landed cost vouchers:", error);
    res.status(500).json({ error: "Failed to fetch vouchers", details: error.message });
  }
});
router22.post("/", async (req, res) => {
  try {
    const { date, description, allocation_method } = req.body;
    const count3 = await db.$count(landed_cost_vouchers, eq38(landed_cost_vouchers.company_id, req.session.companyId));
    const voucher_number = `LCV-${(/* @__PURE__ */ new Date()).getFullYear()}-${(count3 + 1).toString().padStart(4, "0")}`;
    const [voucher] = await db.insert(landed_cost_vouchers).values({
      company_id: req.session.companyId,
      voucher_number,
      date: new Date(date),
      description,
      allocation_method: allocation_method || "value",
      created_by: req.session.userId,
      status: "draft"
    }).returning();
    res.json(voucher);
  } catch (error) {
    res.status(500).json({ error: "Failed to create voucher" });
  }
});
router22.get("/:id", async (req, res) => {
  try {
    const voucher = await db.query.landed_cost_vouchers.findFirst({
      where: eq38(landed_cost_vouchers.id, req.params.id),
      with: {
        bills: {
          with: {
            bill: true
          }
        },
        items: {
          with: {
            stock_movement: {
              with: {
                item: true
              }
            }
          }
        }
      }
    });
    if (!voucher) return res.status(404).json({ error: "Voucher not found" });
    if (voucher.company_id !== req.session.companyId) return res.status(403).json({ error: "Unauthorized" });
    res.json(voucher);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch voucher" });
  }
});
router22.post("/:id/bills", async (req, res) => {
  try {
    const { bill_id, amount } = req.body;
    const companyId = req.session.companyId;
    const bill = await db.query.bills.findFirst({
      where: eq38(bills.id, bill_id)
    });
    if (!bill || bill.company_id !== companyId) {
      return res.status(400).json({ error: "Invalid bill" });
    }
    const [entry] = await db.insert(landed_cost_bills).values({
      voucher_id: req.params.id,
      bill_id,
      amount
    }).returning();
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: "Failed to add bill" });
  }
});
router22.post("/:id/items", async (req, res) => {
  try {
    const { stock_movement_ids } = req.body;
    const companyId = req.session.companyId;
    const movements = await db.query.stock_movements.findMany({
      where: (table, { inArray: inArray3, and: and40, eq: eq50 }) => and40(
        inArray3(table.id, stock_movement_ids),
        eq50(table.company_id, companyId)
      )
    });
    if (movements.length !== stock_movement_ids.length) {
      return res.status(400).json({ error: "Some stock movements are invalid" });
    }
    const items3 = await Promise.all(movements.map(
      (m) => db.insert(landed_cost_items).values({
        voucher_id: req.params.id,
        stock_movement_id: m.id,
        original_cost: m.total_cost,
        allocated_cost: "0",
        new_unit_cost: m.unit_cost
      }).returning()
    ));
    res.json(items3.flat());
  } catch (error) {
    res.status(500).json({ error: "Failed to add items" });
  }
});
router22.post("/:id/allocate", async (req, res) => {
  try {
    await allocateLandedCost(req.params.id);
    const voucher = await db.query.landed_cost_vouchers.findFirst({
      where: eq38(landed_cost_vouchers.id, req.params.id),
      with: {
        items: true
      }
    });
    res.json(voucher);
  } catch (error) {
    res.status(500).json({ error: "Failed to allocate costs" });
  }
});
router22.post("/:id/post", async (req, res) => {
  try {
    const userId = req.session.userId;
    await postLandedCostVoucher(req.params.id, userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to post voucher" });
  }
});
var landedCost_default = router22;

// server/routes/portal.ts
init_db();
init_schema();
import { Router as Router23 } from "express";
import { eq as eq39, desc as desc20 } from "drizzle-orm";
import bcrypt4 from "bcryptjs";
var router23 = Router23();
var requirePortalAuth = (req, res, next) => {
  if (!req.session.portalUserId && !req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};
router23.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.query.contact_portal_users.findFirst({
      where: eq39(contact_portal_users.email, email),
      with: {
        contact: true
      }
    });
    if (!user || user.status !== "active") {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const valid = await bcrypt4.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    req.session.portalUserId = user.id;
    req.session.portalContactId = user.contact_id;
    req.session.portalCompanyId = user.contact.company_id;
    await db.update(contact_portal_users).set({ last_login_at: /* @__PURE__ */ new Date() }).where(eq39(contact_portal_users.id, user.id));
    res.json({
      id: user.id,
      email: user.email,
      contact_name: user.contact.name,
      type: user.contact.type
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});
router23.post("/logout", (req, res) => {
  req.session.portalUserId = void 0;
  req.session.portalContactId = void 0;
  req.session.portalCompanyId = void 0;
  res.json({ success: true });
});
router23.get("/me", requirePortalAuth, async (req, res) => {
  try {
    if (req.session.userId && !req.session.portalUserId) {
      return res.json({
        id: req.session.userId,
        email: req.session.userEmail || "admin@logledger.com",
        contact_name: req.session.userName || "System Admin",
        type: "admin",
        company_name: "System Admin View"
      });
    }
    const user = await db.query.contact_portal_users.findFirst({
      where: eq39(contact_portal_users.id, req.session.portalUserId),
      with: {
        contact: true
      }
    });
    if (!user) return res.status(401).json({ error: "User not found" });
    res.json({
      id: user.id,
      email: user.email,
      contact_name: user.contact.name,
      type: user.contact.type
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching user" });
  }
});
router23.get("/dashboard", requirePortalAuth, async (req, res) => {
  if (req.session.userId && !req.session.portalUserId) {
    return res.json({
      outstanding_invoices: 0,
      outstanding_amount: 0,
      recent_transactions: []
    });
  }
  const contactId = req.session.portalContactId;
  const companyId = req.session.portalCompanyId;
  const contact = await db.query.contacts.findFirst({
    where: eq39(contacts.id, contactId)
  });
  if (!contact) return res.status(404).json({ error: "Contact not found" });
  let stats = {
    outstanding_invoices: 0,
    outstanding_amount: 0,
    recent_transactions: []
  };
  if (contact.type === "customer" || contact.type === "both") {
    const invoices = await db.query.sales_invoices.findMany({
      where: eq39(sales_invoices.customer_id, contactId),
      orderBy: [desc20(sales_invoices.date)],
      limit: 5
    });
    stats.outstanding_invoices = invoices.filter((i) => i.status !== "paid" && i.status !== "cancelled" && i.status !== "draft").length;
    stats.outstanding_amount = invoices.filter((i) => i.status !== "paid" && i.status !== "cancelled" && i.status !== "draft").reduce((sum8, i) => sum8 + Number(i.total), 0);
    stats.recent_transactions = invoices;
  } else if (contact.type === "supplier" || contact.type === "both") {
    const supplierBills = await db.query.bills.findMany({
      where: eq39(bills.supplier_id, contactId),
      orderBy: [desc20(bills.date)],
      limit: 5
    });
    stats.outstanding_invoices = supplierBills.filter((b) => b.status !== "paid" && b.status !== "draft").length;
    stats.outstanding_amount = supplierBills.filter((b) => b.status !== "paid" && b.status !== "draft").reduce((sum8, b) => sum8 + Number(b.total), 0);
    stats.recent_transactions = supplierBills;
  }
  res.json(stats);
});
router23.get("/documents", requirePortalAuth, async (req, res) => {
  if (req.session.userId && !req.session.portalUserId) {
    return res.json([]);
  }
  const contactId = req.session.portalContactId;
  const contact = await db.query.contacts.findFirst({
    where: eq39(contacts.id, contactId)
  });
  if (!contact) return res.status(404).json({ error: "Contact not found" });
  let documents = [];
  if (contact.type === "customer" || contact.type === "both") {
    const invoices = await db.query.sales_invoices.findMany({
      where: eq39(sales_invoices.customer_id, contactId),
      orderBy: [desc20(sales_invoices.date)]
    });
    documents = invoices.map((i) => ({ ...i, document_type: "invoice", number: i.invoice_number }));
  }
  if (contact.type === "supplier" || contact.type === "both") {
    const supplierBills = await db.query.bills.findMany({
      where: eq39(bills.supplier_id, contactId),
      orderBy: [desc20(bills.date)]
    });
    const billDocs = supplierBills.map((b) => ({ ...b, document_type: "bill", number: b.bill_number }));
    documents = [...documents, ...billDocs];
  }
  documents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  res.json(documents);
});
var portal_default = router23;

// server/routes/ai_cfo.ts
init_db();
init_schema();
import { Router as Router24 } from "express";
import { eq as eq40, and as and34, gte as gte9, lte as lte8, sql as sql19 } from "drizzle-orm";
init_sendError();
var router24 = Router24();
function calculateTrend(data) {
  const n = data.length;
  if (n < 2) return { slope: 0, intercept: data[0] || 0 };
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += data[i];
    sumXY += i * data[i];
    sumXX += i * i;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}
router24.get("/forecast/cashflow", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const endDate = /* @__PURE__ */ new Date();
    const startDate = /* @__PURE__ */ new Date();
    startDate.setMonth(startDate.getMonth() - 11);
    startDate.setDate(1);
    const receiptsData = await db.select({
      month: sql19`to_char(${receipts.date}, 'YYYY-MM')`,
      total: sql19`sum(${receipts.amount})`
    }).from(receipts).where(and34(
      eq40(receipts.company_id, companyId),
      gte9(receipts.date, startDate),
      lte8(receipts.date, endDate)
    )).groupBy(sql19`to_char(${receipts.date}, 'YYYY-MM')`).orderBy(sql19`to_char(${receipts.date}, 'YYYY-MM')`);
    const paymentsData = await db.select({
      month: sql19`to_char(${payments.date}, 'YYYY-MM')`,
      total: sql19`sum(${payments.amount})`
    }).from(payments).where(and34(
      eq40(payments.company_id, companyId),
      gte9(payments.date, startDate),
      lte8(payments.date, endDate)
    )).groupBy(sql19`to_char(${payments.date}, 'YYYY-MM')`).orderBy(sql19`to_char(${payments.date}, 'YYYY-MM')`);
    const history = [];
    const months = [];
    const cashInArr = [];
    const cashOutArr = [];
    const netArr = [];
    let current = new Date(startDate);
    while (current <= endDate) {
      const monthStr = current.toISOString().slice(0, 7);
      months.push(monthStr);
      const inVal = parseFloat(receiptsData.find((r) => r.month === monthStr)?.total?.toString() || "0");
      const outVal = parseFloat(paymentsData.find((p) => p.month === monthStr)?.total?.toString() || "0");
      history.push({
        month: monthStr,
        cashIn: inVal,
        cashOut: outVal,
        net: inVal - outVal
      });
      cashInArr.push(inVal);
      cashOutArr.push(outVal);
      netArr.push(inVal - outVal);
      current.setMonth(current.getMonth() + 1);
    }
    const forecast = [];
    const trendIn = calculateTrend(cashInArr);
    const trendOut = calculateTrend(cashOutArr);
    const lastIndex = cashInArr.length - 1;
    for (let i = 1; i <= 6; i++) {
      const nextIndex = lastIndex + i;
      const nextDate = /* @__PURE__ */ new Date();
      nextDate.setMonth(nextDate.getMonth() + i);
      const monthStr = nextDate.toISOString().slice(0, 7);
      const predIn = Math.max(0, trendIn.slope * nextIndex + trendIn.intercept);
      const predOut = Math.max(0, trendOut.slope * nextIndex + trendOut.intercept);
      forecast.push({
        month: monthStr,
        cashIn: predIn,
        cashOut: predOut,
        net: predIn - predOut
      });
    }
    const insights = [];
    const avgNet = netArr.reduce((a, b) => a + b, 0) / netArr.length;
    const lastNet = netArr[netArr.length - 1];
    if (lastNet < 0) {
      insights.push("Warning: Negative cash flow in the last month.");
    }
    if (trendOut.slope > trendIn.slope) {
      insights.push("Alert: Expenses are growing faster than revenue.");
    }
    if (avgNet > 0 && lastNet < avgNet * 0.5) {
      insights.push("Notice: Recent cash flow is significantly lower than average.");
    }
    res.json({
      history,
      forecast,
      insights
    });
  } catch (error) {
    console.error("Error generating cash flow forecast:", error);
    serverError(res, "Failed to generate forecast");
  }
});
var ai_cfo_default = router24;

// server/routes/esg.ts
init_db();
init_schema();
import { Router as Router25 } from "express";
import { eq as eq41, and as and35, gte as gte10, lte as lte9, sql as sql20, desc as desc21 } from "drizzle-orm";
init_sendError();
var router25 = Router25();
router25.get("/summary", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { year } = req.query;
    const currentYear = year ? parseInt(year) : (/* @__PURE__ */ new Date()).getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31, 23, 59, 59);
    const emissions = await db.select({
      category: expenses.category,
      total_co2: sql20`SUM(COALESCE(${expenses.quantity}, 0) * COALESCE(${expenses.carbon_factor}, 0))`,
      total_spend: sql20`SUM(${expenses.amount})`,
      count: sql20`COUNT(*)`
    }).from(expenses).where(and35(
      eq41(expenses.company_id, companyId),
      gte10(expenses.date, startDate),
      lte9(expenses.date, endDate),
      sql20`${expenses.carbon_factor} IS NOT NULL`
    )).groupBy(expenses.category).orderBy(desc21(sql20`SUM(COALESCE(${expenses.quantity}, 0) * COALESCE(${expenses.carbon_factor}, 0))`));
    const totalFootprint = emissions.reduce((sum8, row) => sum8 + Number(row.total_co2), 0);
    const monthlyTrend = await db.select({
      month: sql20`to_char(${expenses.date}, 'YYYY-MM')`,
      total_co2: sql20`SUM(COALESCE(${expenses.quantity}, 0) * COALESCE(${expenses.carbon_factor}, 0))`
    }).from(expenses).where(and35(
      eq41(expenses.company_id, companyId),
      gte10(expenses.date, startDate),
      lte9(expenses.date, endDate),
      sql20`${expenses.carbon_factor} IS NOT NULL`
    )).groupBy(sql20`to_char(${expenses.date}, 'YYYY-MM')`).orderBy(sql20`to_char(${expenses.date}, 'YYYY-MM')`);
    res.json({
      year: currentYear,
      total_co2_kg: totalFootprint,
      by_category: emissions,
      trend: monthlyTrend
    });
  } catch (error) {
    console.error("Error fetching ESG summary:", error);
    serverError(res, "Failed to fetch ESG summary");
  }
});
var esg_default = router25;

// server/routes/archiving.ts
init_db();
init_schema();
import { Router as Router26 } from "express";
import { eq as eq42, and as and36, lte as lte10, sql as sql21 } from "drizzle-orm";
init_sendError();
var router26 = Router26();
router26.post("/archive-year", requireAuth, requireRole(["owner", "admin"]), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { fiscalYear } = req.body;
    if (!fiscalYear) return badRequest(res, "Fiscal year is required");
    const period = await db.query.fiscal_periods.findFirst({
      where: and36(
        eq42(fiscal_periods.company_id, companyId),
        eq42(fiscal_periods.fiscal_year, fiscalYear),
        eq42(fiscal_periods.period_type, "year")
      )
    });
    if (!period) return badRequest(res, "Fiscal year not found");
    if (!period.is_closed) return badRequest(res, "Fiscal year must be closed before archiving");
    const startDate = new Date(fiscalYear, 0, 1);
    const endDate = new Date(fiscalYear, 11, 31, 23, 59, 59);
    const journalsToArchive = await db.query.journals.findMany({
      where: and36(
        eq42(journals.company_id, companyId),
        lte10(journals.date, endDate),
        sql21`${journals.date} >= ${startDate.toISOString()}`
      ),
      with: {
        lines: true
      }
    });
    if (journalsToArchive.length === 0) {
      return res.json({ message: "No journals found to archive for this year" });
    }
    await db.transaction(async (tx) => {
      for (const journal of journalsToArchive) {
        await tx.insert(journals_archive).values({
          id: journal.id,
          company_id: journal.company_id,
          journal_number: journal.journal_number,
          date: journal.date,
          description: journal.description,
          reference: journal.reference,
          source_type: journal.source_type,
          source_id: journal.source_id,
          total_amount: journal.total_amount,
          created_by: journal.created_by,
          created_at: journal.created_at,
          updated_at: journal.updated_at,
          fiscal_year: fiscalYear
        });
        if (journal.lines && journal.lines.length > 0) {
          await tx.insert(journal_lines_archive).values(
            journal.lines.map((line) => ({
              id: line.id,
              journal_id: line.journal_id,
              account_id: line.account_id,
              description: line.description,
              debit: line.debit,
              credit: line.credit,
              currency: line.currency,
              fx_rate: line.fx_rate,
              base_debit: line.base_debit,
              base_credit: line.base_credit,
              project_id: line.project_id,
              cost_center_id: line.cost_center_id
            }))
          );
        }
      }
      const journalIds = journalsToArchive.map((j) => j.id);
      for (const id of journalIds) {
        await tx.delete(journals).where(eq42(journals.id, id));
      }
    });
    await logAudit({
      companyId,
      entityType: "fiscal_year",
      entityId: fiscalYear.toString(),
      action: "update",
      changes: { archivedCount: journalsToArchive.length, action: "archive_year" },
      actorId: req.session.userId,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json({
      success: true,
      message: `Successfully archived ${journalsToArchive.length} journals for FY ${fiscalYear}`,
      archivedCount: journalsToArchive.length
    });
  } catch (error) {
    console.error("Error archiving fiscal year:", error);
    serverError(res, "Failed to archive fiscal year");
  }
});
var archiving_default = router26;

// server/routes/api_keys.ts
init_db();
init_schema();
import { Router as Router27 } from "express";
import { eq as eq43, and as and37, desc as desc22 } from "drizzle-orm";
init_sendError();
import crypto from "crypto";
var router27 = Router27();
function hashKey(key) {
  return crypto.createHash("sha256").update(key).digest("hex");
}
router27.get("/", requireAuth, requireRole(["owner", "admin"]), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const keys = await db.query.api_keys.findMany({
      where: eq43(api_keys.company_id, companyId),
      orderBy: [desc22(api_keys.created_at)]
    });
    const safeKeys = keys.map((k) => ({
      id: k.id,
      name: k.name,
      prefix: k.prefix,
      scopes: k.scopes,
      last_used_at: k.last_used_at,
      expires_at: k.expires_at,
      is_active: k.is_active,
      created_at: k.created_at
    }));
    res.json(safeKeys);
  } catch (error) {
    console.error("Error listing API keys:", error);
    serverError(res, "Failed to list API keys");
  }
});
router27.post("/", requireAuth, requireRole(["owner", "admin"]), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const userId = req.session.userId;
    const { name, scopes, expires_at } = req.body;
    if (!name) return badRequest(res, "Name is required");
    const randomPart = crypto.randomBytes(24).toString("hex");
    const plainKey = `sk_live_${randomPart}`;
    const prefix = plainKey.substring(0, 12);
    const hashed = hashKey(plainKey);
    const [newKey] = await db.insert(api_keys).values({
      company_id: companyId,
      name,
      key_hash: hashed,
      prefix,
      scopes: scopes || [],
      expires_at: expires_at ? new Date(expires_at) : null,
      created_by: userId
    }).returning();
    await logAudit({
      companyId,
      entityType: "api_key",
      entityId: newKey.id,
      action: "create",
      changes: { name, scopes },
      actorId: userId,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json({
      success: true,
      apiKey: plainKey,
      // Return full key ONLY ONCE
      meta: {
        id: newKey.id,
        name: newKey.name,
        prefix: newKey.prefix,
        scopes: newKey.scopes,
        expires_at: newKey.expires_at
      }
    });
  } catch (error) {
    console.error("Error creating API key:", error);
    serverError(res, "Failed to create API key");
  }
});
router27.delete("/:id", requireAuth, requireRole(["owner", "admin"]), async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const { id } = req.params;
    const [deleted] = await db.delete(api_keys).where(and37(
      eq43(api_keys.id, id),
      eq43(api_keys.company_id, companyId)
    )).returning();
    if (!deleted) return badRequest(res, "API key not found");
    await logAudit({
      companyId,
      entityType: "api_key",
      entityId: id,
      action: "delete",
      actorId: req.session.userId,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json({ success: true, message: "API key revoked" });
  } catch (error) {
    console.error("Error revoking API key:", error);
    serverError(res, "Failed to revoke API key");
  }
});
var api_keys_default = router27;

// server/routes/public_api.ts
init_db();
init_schema();
import { Router as Router28 } from "express";
import { eq as eq45, desc as desc23 } from "drizzle-orm";

// server/middleware/apiKeyAuth.ts
init_db();
init_schema();
import { eq as eq44 } from "drizzle-orm";
import crypto2 from "crypto";
function hashKey2(key) {
  return crypto2.createHash("sha256").update(key).digest("hex");
}
async function apiKeyAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid Authorization header" });
  }
  const token = authHeader.split(" ")[1];
  if (!token.startsWith("sk_live_")) {
    return res.status(401).json({ message: "Invalid API key format" });
  }
  const hashed = hashKey2(token);
  try {
    const key = await db.query.api_keys.findFirst({
      where: eq44(api_keys.key_hash, hashed)
    });
    if (!key || !key.is_active) {
      return res.status(401).json({ message: "Invalid or inactive API key" });
    }
    if (key.expires_at && /* @__PURE__ */ new Date() > key.expires_at) {
      return res.status(401).json({ message: "API key expired" });
    }
    db.update(api_keys).set({ last_used_at: /* @__PURE__ */ new Date() }).where(eq44(api_keys.id, key.id)).catch((err) => console.error("Failed to update api key last_used_at", err));
    req.apiKey = key;
    req.companyId = key.company_id;
    req.session = {
      companyId: key.company_id,
      userId: key.created_by,
      isApiKey: true
    };
    next();
  } catch (error) {
    console.error("API Key Auth Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
function requireScope(scope) {
  return (req, res, next) => {
    const key = req.apiKey;
    if (!key) return res.status(401).json({ message: "Unauthorized" });
    const scopes = key.scopes;
    if (scopes.includes("all") || scopes.includes(scope)) {
      next();
    } else {
      res.status(403).json({ message: `Missing required scope: ${scope}` });
    }
  };
}

// server/routes/public_api.ts
var router28 = Router28();
router28.use(apiKeyAuth);
router28.use(apiLimiter);
router28.get("/journals", requireScope("read:journals"), async (req, res) => {
  try {
    const companyId = req.companyId;
    const data = await db.query.journals.findMany({
      where: eq45(journals.company_id, companyId),
      orderBy: [desc23(journals.date)],
      limit: 100
      // Default limit
    });
    res.json({ data });
  } catch (error) {
    console.error("Public API Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
router28.get("/invoices", requireScope("read:invoices"), async (req, res) => {
  try {
    const companyId = req.companyId;
    const data = await db.query.sales_invoices.findMany({
      where: eq45(sales_invoices.company_id, companyId),
      orderBy: [desc23(sales_invoices.date)],
      limit: 100
    });
    res.json({ data });
  } catch (error) {
    console.error("Public API Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
var public_api_default = router28;

// server/routes/two_factor.ts
init_db();
init_schema();
init_permissions();
import { Router as Router29 } from "express";
import speakeasy2 from "speakeasy";
import QRCode2 from "qrcode";
import { eq as eq46 } from "drizzle-orm";
var router29 = Router29();
router29.post("/setup", requireAuth2, async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await db.query.users.findFirst({ where: eq46(users.id, userId) });
    if (!user) return res.status(404).json({ error: "User not found" });
    const secret = speakeasy2.generateSecret({
      name: `LogAndLedger (${user.email})`
    });
    await db.update(users).set({ two_factor_secret: secret.base32 }).where(eq46(users.id, userId));
    QRCode2.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) return res.status(500).json({ error: "Could not generate QR code" });
      res.json({ secret: secret.base32, qrCode: data_url });
    });
  } catch (error) {
    console.error("2FA Setup Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router29.post("/verify", requireAuth2, async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.session.userId;
    const user = await db.query.users.findFirst({ where: eq46(users.id, userId) });
    if (!user || !user.two_factor_secret) return res.status(400).json({ error: "2FA not initialized" });
    const verified = speakeasy2.totp.verify({
      secret: user.two_factor_secret,
      encoding: "base32",
      token
    });
    if (verified) {
      await db.update(users).set({ two_factor_enabled: true }).where(eq46(users.id, userId));
      res.json({ success: true, message: "2FA enabled successfully" });
    } else {
      res.status(400).json({ error: "Invalid token" });
    }
  } catch (error) {
    console.error("2FA Verify Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router29.post("/disable", requireAuth2, async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.session.userId;
    const user = await db.query.users.findFirst({ where: eq46(users.id, userId) });
    if (!user || !user.two_factor_enabled) return res.status(400).json({ error: "2FA not enabled" });
    const verified = speakeasy2.totp.verify({
      secret: user.two_factor_secret,
      encoding: "base32",
      token
    });
    if (verified) {
      await db.update(users).set({ two_factor_enabled: false, two_factor_secret: null }).where(eq46(users.id, userId));
      res.json({ success: true, message: "2FA disabled" });
    } else {
      res.status(400).json({ error: "Invalid token" });
    }
  } catch (error) {
    console.error("2FA Disable Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
var two_factor_default = router29;

// server/routes/v2.ts
import { Router as Router30 } from "express";
init_db();
init_schema();
import { eq as eq47, desc as desc24, asc as asc3, count } from "drizzle-orm";

// server/utils/pagination.ts
var PAGINATION_LIMITS = {
  default: 25,
  max: 100,
  invoices: 50,
  bills: 50,
  journals: 100,
  auditLogs: 200,
  contacts: 100,
  items: 100,
  accounts: 200
  // Usually need all at once for dropdowns
};
function parsePaginationParams(req, entityType = "default") {
  const maxLimit = PAGINATION_LIMITS[entityType] || PAGINATION_LIMITS.default;
  let page = parseInt(req.query.page, 10);
  if (isNaN(page) || page < 1) page = 1;
  let limit = parseInt(req.query.limit, 10);
  if (isNaN(limit) || limit < 1) limit = PAGINATION_LIMITS.default;
  if (limit > maxLimit) limit = maxLimit;
  const offset = (page - 1) * limit;
  const sortBy = req.query.sortBy || "created_at";
  const sortOrderParam = (req.query.sortOrder || "").toLowerCase();
  const sortOrder = sortOrderParam === "asc" ? "asc" : "desc";
  return { page, limit, offset, sortBy, sortOrder };
}
function createPaginatedResponse(data, total, params) {
  const totalPages = Math.ceil(total / params.limit);
  return {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages,
      hasNext: params.page < totalPages,
      hasPrev: params.page > 1
    }
  };
}

// server/routes/v2.ts
init_sendError();
var router30 = Router30();
router30.get("/accounts", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const params = parsePaginationParams(req, "accounts");
    if (params.page === 1 && params.limit === 25) {
      const cached = await getCache(CacheKeys.accounts(companyId));
      if (cached) {
        return res.json(cached);
      }
    }
    const [countResult] = await db.select({ total: count() }).from(accounts).where(eq47(accounts.company_id, companyId));
    const total = countResult?.total || 0;
    const data = await db.select().from(accounts).where(eq47(accounts.company_id, companyId)).orderBy(
      params.sortOrder === "asc" ? asc3(accounts.code) : desc24(accounts.code)
    ).limit(params.limit).offset(params.offset);
    const response = createPaginatedResponse(data, total, params);
    if (params.page === 1 && params.limit === 25) {
      await setCache(CacheKeys.accounts(companyId), response, CacheTTL.MEDIUM);
    }
    res.json(response);
  } catch (error) {
    console.error("Error fetching accounts:", error);
    serverError(res, "Failed to fetch accounts");
  }
});
router30.get("/contacts", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const params = parsePaginationParams(req, "contacts");
    const { type } = req.query;
    let query = db.select().from(contacts).where(eq47(contacts.company_id, companyId));
    const [countResult] = await db.select({ total: count() }).from(contacts).where(eq47(contacts.company_id, companyId));
    const total = countResult?.total || 0;
    const data = await db.select().from(contacts).where(eq47(contacts.company_id, companyId)).orderBy(
      params.sortOrder === "asc" ? asc3(contacts.name) : desc24(contacts.name)
    ).limit(params.limit).offset(params.offset);
    res.json(createPaginatedResponse(data, total, params));
  } catch (error) {
    console.error("Error fetching contacts:", error);
    serverError(res, "Failed to fetch contacts");
  }
});
router30.get("/items", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const params = parsePaginationParams(req, "items");
    const [countResult] = await db.select({ total: count() }).from(items).where(eq47(items.company_id, companyId));
    const total = countResult?.total || 0;
    const data = await db.select().from(items).where(eq47(items.company_id, companyId)).orderBy(
      params.sortOrder === "asc" ? asc3(items.name) : desc24(items.name)
    ).limit(params.limit).offset(params.offset);
    res.json(createPaginatedResponse(data, total, params));
  } catch (error) {
    console.error("Error fetching items:", error);
    serverError(res, "Failed to fetch items");
  }
});
router30.get("/invoices", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const params = parsePaginationParams(req, "invoices");
    const [countResult] = await db.select({ total: count() }).from(sales_invoices).where(eq47(sales_invoices.company_id, companyId));
    const total = countResult?.total || 0;
    const data = await db.select().from(sales_invoices).where(eq47(sales_invoices.company_id, companyId)).orderBy(desc24(sales_invoices.date)).limit(params.limit).offset(params.offset);
    res.json(createPaginatedResponse(data, total, params));
  } catch (error) {
    console.error("Error fetching invoices:", error);
    serverError(res, "Failed to fetch invoices");
  }
});
router30.get("/bills", requireAuth, async (req, res) => {
  try {
    const companyId = req.session.companyId;
    const params = parsePaginationParams(req, "bills");
    const [countResult] = await db.select({ total: count() }).from(bills).where(eq47(bills.company_id, companyId));
    const total = countResult?.total || 0;
    const data = await db.select().from(bills).where(eq47(bills.company_id, companyId)).orderBy(desc24(bills.date)).limit(params.limit).offset(params.offset);
    res.json(createPaginatedResponse(data, total, params));
  } catch (error) {
    console.error("Error fetching bills:", error);
    serverError(res, "Failed to fetch bills");
  }
});
router30.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    version: "2.0.0",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
var v2_default = router30;

// server/routes.ts
function sanitizeUser3(user) {
  const { password_hash, ...sanitized } = user;
  return sanitized;
}
async function registerRoutes(app) {
  app.use((req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      try {
        if (res.statusCode >= 400 && body && typeof body === "object" && "error" in body && !("message" in body)) {
          body = { message: body.error, ...body };
        }
      } catch {
      }
      return originalJson(body);
    };
    next();
  });
  app.use("/api/", apiLimiter);
  app.get("/api/docs", async (_req, res) => {
    res.redirect("/api-docs");
  });
  const swaggerUi = await import("swagger-ui-express");
  const { swaggerSpec: swaggerSpec2 } = await Promise.resolve().then(() => (init_swagger(), swagger_exports));
  app.use(
    "/api-docs",
    swaggerUi.default.serve,
    swaggerUi.default.setup(swaggerSpec2, {
      customSiteTitle: "Log & Ledger API Docs",
      customCss: ".swagger-ui .topbar { display: none }",
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true
      }
    })
  );
  app.get("/api/swagger.json", (_req, res) => {
    res.json(swaggerSpec2);
  });
  app.get("/api/health", async (req, res) => {
    const { healthCheck: healthCheck2 } = await Promise.resolve().then(() => (init_health(), health_exports));
    return healthCheck2(req, res);
  });
  app.get("/api/health/ready", async (req, res) => {
    const { readinessCheck: readinessCheck2 } = await Promise.resolve().then(() => (init_health(), health_exports));
    return readinessCheck2(req, res);
  });
  app.get("/api/health/live", async (req, res) => {
    const { livenessCheck: livenessCheck2 } = await Promise.resolve().then(() => (init_health(), health_exports));
    return livenessCheck2(req, res);
  });
  app.get("/api/session", requireAuth, async (req, res) => {
    try {
      const session3 = req.session;
      res.json({
        userId: session3.userId,
        userName: session3.userName,
        username: session3.username,
        userRole: session3.userRole,
        companyId: session3.companyId,
        isAuthenticated: true
      });
    } catch (error) {
      console.error("Error fetching session:", error);
      res.status(500).json({
        error: "Failed to fetch session",
        isAuthenticated: false
      });
    }
  });
  app.use("/api/ai", ai_default2);
  app.use("/api/users", users_default);
  app.use("/api", settings_default);
  app.use("/api", accounting_default);
  app.use("/api/sales", sales_default);
  app.use("/api/purchases", purchases_default);
  app.use("/api/banking", banking_default);
  app.use("/api/journals", journals_default);
  app.use("/api/bank-reconciliation", bankReconciliation_default);
  app.use("/api/currencies", currencies_default);
  app.use("/api/reports", reports_default);
  app.use("/api/fixed-assets", fixedAssets_default);
  app.use("/api/inventory", inventory_default);
  app.use("/api/warehouses", inventory_default);
  app.use("/api/budgets", budgets_default);
  app.use("/api/projects", projects_default);
  app.use("/api/manufacturing", manufacturing_default);
  app.use("/api/hr", hr_default);
  app.use("/api/checks", checks_default);
  app.use("/api/cost-centers", costCenters_default);
  app.use("/api/v1", public_api_default);
  app.use("/api/v2", v2_default);
  app.use("/api/auth/2fa", two_factor_default);
  app.get("/api/reports/dashboard", requireAuth, reportsLimiter, async (req, res) => {
    try {
      const companyId = req.session.companyId;
      const cacheKey = `dashboard:${companyId}`;
      const cached = await getCache2(cacheKey);
      if (cached) {
        return res.json(cached);
      }
      const now = /* @__PURE__ */ new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      const fetchWithFallback = async (tableName, queryFn) => {
        try {
          return await queryFn();
        } catch (error) {
          console.warn(`[Dashboard] Failed to fetch ${tableName}: ${error.message}`);
          return [];
        }
      };
      const [
        invoicesResult,
        billsResult,
        paymentsResult,
        receiptsResult,
        bankAccountsResult,
        accountsResult
      ] = await Promise.all([
        fetchWithFallback("sales_invoices", () => db.select().from(sales_invoices).where(eq49(sales_invoices.company_id, companyId))),
        fetchWithFallback("bills", () => db.select().from(bills).where(eq49(bills.company_id, companyId))),
        fetchWithFallback("payments", () => db.select().from(payments).where(eq49(payments.company_id, companyId))),
        fetchWithFallback("receipts", () => db.select().from(receipts).where(eq49(receipts.company_id, companyId))),
        fetchWithFallback("bank_accounts", () => db.select().from(bank_accounts).where(eq49(bank_accounts.company_id, companyId))),
        fetchWithFallback("accounts", () => db.select().from(accounts).where(eq49(accounts.company_id, companyId)))
      ]);
      const totalCash = bankAccountsResult.reduce((sum8, acc) => {
        const balance = parseFloat(acc.opening_balance || "0");
        return sum8 + balance;
      }, 0);
      const accountsReceivable = invoicesResult.filter((inv) => inv.status !== "paid" && inv.status !== "cancelled").reduce((sum8, inv) => sum8 + (parseFloat(inv.total || "0") - parseFloat(inv.paid_amount || "0")), 0);
      const accountsPayable = billsResult.filter((bill) => bill.status !== "paid" && bill.status !== "cancelled").reduce((sum8, bill) => sum8 + (parseFloat(bill.total || "0") - parseFloat(bill.paid_amount || "0")), 0);
      const currentMonthRevenue = invoicesResult.filter((inv) => {
        const invDate = new Date(inv.date);
        return invDate >= firstDayOfMonth && invDate <= lastDayOfMonth;
      }).reduce((sum8, inv) => sum8 + parseFloat(inv.total || "0"), 0);
      const lastMonthRevenue = invoicesResult.filter((inv) => {
        const invDate = new Date(inv.date);
        return invDate >= firstDayOfLastMonth && invDate <= lastDayOfLastMonth;
      }).reduce((sum8, inv) => sum8 + parseFloat(inv.total || "0"), 0);
      const revenueChange = lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : "0";
      const monthlyRevenueData = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
        const monthRevenue = invoicesResult.filter((inv) => {
          const invDate = new Date(inv.date);
          return invDate >= monthStart && invDate <= monthEnd;
        }).reduce((sum8, inv) => sum8 + parseFloat(inv.total || "0"), 0);
        const monthExpenses = billsResult.filter((bill) => {
          const billDate = new Date(bill.date);
          return billDate >= monthStart && billDate <= monthEnd;
        }).reduce((sum8, bill) => sum8 + parseFloat(bill.total || "0"), 0);
        monthlyRevenueData.push({
          month: monthDate.toLocaleString("en", { month: "short" }),
          revenue: Math.round(monthRevenue),
          expenses: Math.round(monthExpenses)
        });
      }
      const expenseAccounts = accountsResult.filter((acc) => acc.account_type === "expense");
      let expenseBreakdown = [];
      try {
        const expenseAccountIds = expenseAccounts.map((acc) => acc.id);
        if (expenseAccountIds.length > 0) {
          const fiscalYearStart = new Date(now.getFullYear(), 0, 1);
          const expenseTotals = await db.select({
            accountId: journal_lines.account_id,
            total: sql23`COALESCE(SUM(${journal_lines.base_debit}), 0)`
          }).from(journal_lines).innerJoin(journals, eq49(journal_lines.journal_id, journals.id)).where(
            and39(
              eq49(journals.company_id, companyId),
              gte11(journals.date, fiscalYearStart),
              sql23`${journal_lines.account_id} = ANY(${expenseAccountIds})`
            )
          ).groupBy(journal_lines.account_id).orderBy(sql23`SUM(${journal_lines.base_debit}) DESC`).limit(5);
          const accountMap = new Map(expenseAccounts.map((acc) => [acc.id, acc.name]));
          const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6"];
          expenseBreakdown = expenseTotals.map((exp, idx) => ({
            name: accountMap.get(exp.accountId) || "Other Expenses",
            value: Math.round(parseFloat(exp.total || "0")),
            color: colors[idx % colors.length]
          }));
        }
      } catch (expenseErr) {
        console.warn("[Dashboard] Failed to calculate expense breakdown:", expenseErr);
      }
      const recentTransactions = [
        ...invoicesResult.slice(0, 3).map((inv) => ({
          id: inv.id,
          date: new Date(inv.date).toISOString().split("T")[0],
          type: "invoice",
          description: `Invoice ${inv.invoice_number}`,
          amount: `$${parseFloat(inv.total || "0").toFixed(2)}`,
          status: inv.status
        })),
        ...billsResult.slice(0, 3).map((bill) => ({
          id: bill.id,
          date: new Date(bill.date).toISOString().split("T")[0],
          type: "bill",
          description: `Bill ${bill.bill_number || bill.supplier_reference}`,
          amount: `$${parseFloat(bill.total || "0").toFixed(2)}`,
          status: bill.status
        })),
        ...paymentsResult.slice(0, 2).map((payment) => ({
          id: payment.id,
          date: new Date(payment.date).toISOString().split("T")[0],
          type: "payment",
          description: payment.description || "Payment",
          amount: `$${parseFloat(payment.amount || "0").toFixed(2)}`,
          status: payment.status || "completed"
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
      const dashboardData = {
        kpis: {
          totalCash,
          accountsReceivable,
          accountsPayable,
          monthlyRevenue: currentMonthRevenue,
          revenueChange: parseFloat(revenueChange)
        },
        monthlyRevenueData,
        expenseBreakdown,
        recentTransactions
      };
      await setCache2(cacheKey, dashboardData, 300);
      res.json(dashboardData);
    } catch (error) {
      console.error("Dashboard API error:", error);
      return serverError(res, "Failed to fetch dashboard data");
    }
  });
  app.post("/api/logs", logsLimiter, async (req, res) => {
    try {
      const { message, name, stack, componentStack, url, tags, ts } = req.body || {};
      if (!message && !name && !stack) {
        return badRequest(res, "Invalid payload - need message, name, or stack");
      }
      const safe = redactSensitive({
        message: String(message || name || "Unknown error").slice(0, 500),
        name: String(name || "Error").slice(0, 200),
        stack: String(stack || "").split("\n").slice(0, 3).join(" | ").slice(0, 1e3),
        componentStack: String(componentStack || "").slice(0, 1500),
        url: String(url || req.headers["referer"] || ""),
        userAgent: String(req.headers["user-agent"] || ""),
        tags: Array.isArray(tags) ? tags.slice(0, 10) : void 0,
        ts: ts || Date.now(),
        ip: req.ip
      });
      log(`CLIENT-ERROR :: ${JSON.stringify(safe)}`);
      return res.json({ ok: true });
    } catch (e) {
      log(`CLIENT-ERROR-FAILED :: ${e?.message || "unknown error"}`);
      return serverError(res, "Failed to record error");
    }
  });
  app.use("/api/auth", auth_default);
  app.get("/api/diagnostics/session", async (req, res) => {
    try {
      const sidCookiePresent = typeof req.headers.cookie === "string" && req.headers.cookie.includes("ledger.sid=");
      const sess = req.session || {};
      const hasSession = Boolean(sess.userId && sess.companyId);
      const payload = {
        ok: true,
        cookiePresent: sidCookiePresent,
        hasSession,
        // Expose minimal IDs to correlate without sensitive profile data
        userId: hasSession ? String(sess.userId) : null,
        companyId: hasSession ? String(sess.companyId) : null,
        requestHeaders: {
          origin: req.headers.origin || null,
          host: req.headers.host || null,
          referer: req.headers.referer || null
        }
      };
      return res.json(payload);
    } catch (e) {
      return serverError(res, "Diagnostics failed");
    }
  });
  app.get("/api/diagnostics/db", async (_req, res) => {
    try {
      const { sql: sql24 } = await import("drizzle-orm");
      const rows = await db.execute(sql24`
        SELECT 
          to_regclass('public.users') IS NOT NULL AS has_users,
          to_regclass('public.companies') IS NOT NULL AS has_companies,
          to_regclass('public.accounts') IS NOT NULL AS has_accounts,
          to_regclass('public.audit_logs') IS NOT NULL AS has_audit_logs
      `);
      const r = rows?.rows?.[0] || rows?.[0] || {};
      let usersColumns = [];
      try {
        const colsRes = await db.execute(sql24`SELECT column_name FROM information_schema.columns WHERE table_name='users' ORDER BY ordinal_position`);
        usersColumns = (colsRes.rows || colsRes).map((r2) => r2.column_name);
      } catch {
      }
      res.status(200);
      return res.json({ ok: true, tables: r, usersColumns });
    } catch (e) {
      console.error("DB diagnostics error:", e);
      return serverError(res, "DB diagnostics failed");
    }
  });
  app.post("/api/users", requireAuth, async (req, res) => {
    try {
      console.log("\u{1F4DD} Creating new user - Session:", {
        userId: req.session?.userId,
        companyId: req.session?.companyId,
        hasSession: !!req.session,
        firebaseUser: req.firebaseUser?.email
      });
      const currentUserId = req.session?.userId;
      if (!currentUserId) {
        return unauthorized(res, "Authentication required");
      }
      const currentUser = await storage.getUserById(currentUserId);
      if (!currentUser || currentUser.role !== "owner") {
        return forbidden(res, "Only owners can create new users");
      }
      const validatedData = insertUserSchema.parse(req.body);
      let companyId = req.session?.companyId;
      if (!companyId && req.firebaseUser) {
        const firebaseUser = req.firebaseUser;
        const userCompanies = await storage.getCompaniesByUserId(firebaseUser.uid);
        if (userCompanies.length > 0) {
          companyId = userCompanies[0].id;
          console.log(`\u{1F3E2} Got companyId from Firebase user's companies: ${companyId}`);
        }
      }
      if (!companyId) {
        console.error("\u274C No companyId found!", {
          session: req.session,
          firebaseUser: req.firebaseUser
        });
        return badRequest(res, "Company context not found. Please refresh and try again.");
      }
      const userData = {
        ...validatedData,
        company_id: companyId,
        role: validatedData.role || "viewer"
        // Default to viewer for new users
      };
      console.log("\u2705 Creating user with data:", {
        email: userData.email,
        role: userData.role,
        company_id: userData.company_id
      });
      const user = await storage.createUser(userData);
      await logCreate({
        companyId,
        // Use the resolved companyId
        entityType: "users",
        entityId: user.id,
        createdData: sanitizeUser3(user),
        actorId: req.session?.userId || user.id,
        actorName: req.session?.userName || "System",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
      });
      await deleteCache2(`users:${companyId}`);
      res.status(201).json(sanitizeUser3(user));
    } catch (error) {
      console.error("\u274C Error creating user:", error);
      if (error.name === "ZodError") {
        const validationError = fromZodError13(error);
        return badRequest(res, validationError.message);
      } else if (error.message?.includes("company_id")) {
        return badRequest(res, "Company context is required. Please refresh and try again.");
      } else if (error.code === "23505") {
        if (error.constraint === "users_email_unique") {
          return badRequest(res, "This email address is already registered. Please use a different email.");
        } else if (error.constraint === "users_username_unique") {
          return badRequest(res, "This username is already taken. Please try again.");
        } else {
          return badRequest(res, "A user with this information already exists.");
        }
      } else {
        return serverError(res, `Failed to create user: ${error.message}`);
      }
    }
  });
  app.get("/api/users", requireAuth, async (req, res) => {
    try {
      const companyId = req.session.companyId;
      const cacheKey = `users:${companyId}`;
      const cached = await getCache2(cacheKey);
      if (cached) {
        return res.json(cached);
      }
      const users3 = await storage.getUsersByCompany(companyId);
      const sanitizedUsers = users3.map((u) => sanitizeUser3(u));
      await setCache2(cacheKey, sanitizedUsers, 120);
      res.json(sanitizedUsers);
    } catch (error) {
      console.error("Error listing users:", error);
      return serverError(res, "Failed to list users");
    }
  });
  app.get("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const currentUserId = req.session?.userId;
      const requestedId = req.params.id;
      const companyId = req.session?.companyId;
      console.log("GET /api/users/:id - Access check:", {
        currentUserId,
        requestedId,
        sessionCompanyId: companyId
      });
      const user = await storage.getUser(requestedId);
      if (!user) {
        return notFound(res, "User not found");
      }
      console.log("GET /api/users/:id - User found:", {
        userCompanyId: user.company_id,
        isSelf: currentUserId === requestedId,
        isSameCompany: user.company_id === companyId
      });
      const isSelf = currentUserId === requestedId;
      const isSameCompany = user.company_id === companyId;
      if (isSelf) {
        const userResponse2 = {
          id: user.id,
          company_id: user.company_id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          language: user.language,
          timezone: user.timezone,
          theme: user.theme,
          is_active: user.is_active,
          legal_consent_accepted: user.legal_consent_accepted,
          legal_consent_date: user.legal_consent_date,
          legal_consent_version: user.legal_consent_version,
          last_login_at: user.last_login_at,
          created_at: user.created_at,
          updated_at: user.updated_at
        };
        return res.json(userResponse2);
      }
      if (!isSameCompany) {
        return forbidden(res, "You can only view users in your company");
      }
      const userResponse = {
        id: user.id,
        company_id: user.company_id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        language: user.language,
        timezone: user.timezone,
        theme: user.theme,
        is_active: user.is_active,
        legal_consent_accepted: user.legal_consent_accepted,
        legal_consent_date: user.legal_consent_date,
        legal_consent_version: user.legal_consent_version,
        last_login_at: user.last_login_at,
        created_at: user.created_at,
        updated_at: user.updated_at
      };
      res.json(userResponse);
    } catch (error) {
      console.error("Error fetching user:", error);
      return serverError(res, "Failed to fetch user");
    }
  });
  app.put("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const currentUserId = req.session?.userId;
      const userId = req.params.id;
      const companyId = req.session.companyId;
      if (userId !== currentUserId) {
        const currentUser = await storage.getUserById(currentUserId);
        if (!currentUser || currentUser.role !== "owner") {
          return forbidden(res, "Only owners can update other users");
        }
      }
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return notFound(res, "User not found");
      }
      if (existingUser.company_id !== companyId) {
        return forbidden(res, "Cannot update user from different company");
      }
      const updateData = { ...req.body };
      if (updateData.password_hash) {
        updateData.password_hash = await bcrypt5.hash(updateData.password_hash, 10);
      }
      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) {
        return notFound(res, "User not found");
      }
      await logUpdate({
        companyId,
        entityType: "users",
        entityId: userId,
        oldData: sanitizeUser3(existingUser),
        newData: sanitizeUser3(updatedUser),
        actorId: req.session.userId,
        actorName: req.session.userName || "Unknown",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
      });
      const userResponse = {
        id: updatedUser.id,
        company_id: updatedUser.company_id,
        username: updatedUser.username,
        email: updatedUser.email,
        full_name: updatedUser.full_name,
        role: updatedUser.role,
        language: updatedUser.language,
        timezone: updatedUser.timezone,
        theme: updatedUser.theme,
        is_active: updatedUser.is_active,
        legal_consent_accepted: updatedUser.legal_consent_accepted,
        legal_consent_date: updatedUser.legal_consent_date,
        legal_consent_version: updatedUser.legal_consent_version,
        last_login_at: updatedUser.last_login_at,
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at
      };
      res.json(userResponse);
    } catch (error) {
      console.error("Error updating user:", error);
      return serverError(res, "Failed to update user");
    }
  });
  app.delete("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const currentUser = req.session;
      const user = await storage.getUserById(currentUser.userId);
      if (!user || user.role !== "owner") {
        return forbidden(res, "Only owners can delete users");
      }
      const userId = req.params.id;
      const companyId = currentUser.companyId;
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return notFound(res, "User not found");
      }
      if (existingUser.company_id !== companyId) {
        return forbidden(res, "Cannot delete user from different company");
      }
      if (userId === req.session.userId) {
        return badRequest(res, "Cannot delete your own account");
      }
      const deletedUser = await storage.updateUser(userId, { is_active: false });
      await logDelete({
        companyId,
        entityType: "users",
        entityId: userId,
        deletedData: sanitizeUser3(existingUser),
        actorId: req.session.userId,
        actorName: req.session.userName || "Unknown",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
      });
      res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      return serverError(res, "Failed to delete user");
    }
  });
  app.post("/api/users/accept-legal-consent", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const companyId = req.session.companyId;
      console.log("\u{1F4E8} Legal consent request received:", {
        userId,
        companyId,
        hasSession: !!req.session,
        firebaseUser: req.firebaseUser?.email,
        authHeader: req.headers.authorization ? "present" : "missing"
      });
      if (!userId) {
        console.error("\u274C No userId in session:", {
          session: req.session,
          firebaseUser: req.firebaseUser
        });
        return unauthorized(res, "User ID not found in session");
      }
      const user = await storage.getUser(userId);
      if (!user) {
        console.error("\u274C User not found in database:", userId);
        return notFound(res, "User not found");
      }
      console.log("\u{1F464} Current user:", {
        id: user.id,
        email: user.email,
        legal_consent_accepted: user.legal_consent_accepted
      });
      const consentVersion = process.env.LEGAL_CONSENT_VERSION || "2025-11-01";
      const ipAddress = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
      const userAgent = req.headers["user-agent"];
      const updatedUser = await storage.updateUser(userId, {
        legal_consent_accepted: true,
        legal_consent_date: /* @__PURE__ */ new Date(),
        legal_consent_version: consentVersion
      });
      if (!updatedUser) {
        console.error("\u274C Failed to update user:", userId);
        return serverError(res, "Failed to update user");
      }
      console.log("\u2705 User updated:", {
        id: updatedUser.id,
        legal_consent_accepted: updatedUser.legal_consent_accepted,
        legal_consent_date: updatedUser.legal_consent_date
      });
      try {
        await db.insert(legal_consent_logs).values({
          user_id: userId,
          company_id: companyId,
          consent_version: consentVersion,
          terms_accepted: true,
          privacy_accepted: true,
          disclaimer_accepted: true,
          ip_address: typeof ipAddress === "string" ? ipAddress : Array.isArray(ipAddress) ? ipAddress[0] : null,
          user_agent: userAgent || null
        });
        console.log("\u{1F4DD} Audit log created successfully");
      } catch (auditError) {
        console.error("\u26A0\uFE0F Failed to create audit log (non-critical):", auditError.message);
      }
      try {
        await logUpdate({
          companyId,
          entityType: "users",
          entityId: userId,
          oldData: { legal_consent_accepted: false },
          newData: {
            legal_consent_accepted: true,
            legal_consent_date: /* @__PURE__ */ new Date(),
            legal_consent_version: consentVersion,
            ip_address: ipAddress
          },
          actorId: userId,
          actorName: user.full_name,
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"]
        });
        console.log("\u{1F4CB} Update logged successfully");
      } catch (logError2) {
        console.error("\u26A0\uFE0F Failed to log update (non-critical):", logError2.message);
      }
      const sanitizedUser = sanitizeUser3(updatedUser);
      console.log("\u{1F4E4} Sending response:", {
        success: true,
        user_legal_consent_accepted: sanitizedUser.legal_consent_accepted
      });
      res.json({ success: true, message: "Legal consent accepted", user: sanitizedUser });
    } catch (error) {
      console.error("\u274C Error accepting legal consent:", error);
      return serverError(res, "Failed to accept legal consent");
    }
  });
  app.get("/", (req, res) => {
    res.json({
      name: "Log & Ledger API",
      version: "1.0.0",
      status: "running",
      endpoints: {
        health: "/api/health",
        auth: "/api/auth/wildcard",
        docs: "https://github.com/tibrcode/log-and-ledger"
      }
    });
  });
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app.get("/api/legal/info", (req, res) => {
    res.json({
      consent_version: process.env.LEGAL_CONSENT_VERSION || "2025-11-01",
      terms_url: "/terms",
      privacy_url: "/privacy",
      disclaimer_url: "/disclaimer"
    });
  });
  app.post("/api/ai/consent", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const companyId = req.session.companyId;
      const { version } = req.body || {};
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { ai_consent: ai_consent3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq50, and: and40 } = await import("drizzle-orm");
      const existing = await db2.select().from(ai_consent3).where(and40(eq50(ai_consent3.company_id, companyId), eq50(ai_consent3.user_id, userId))).limit(1);
      if (existing[0]) {
        res.json({ success: true, consent: existing[0], existing: true });
        return;
      }
      const versionStr = version || process.env.LEGAL_CONSENT_VERSION || "2025-11-01";
      await db2.insert(ai_consent3).values({ company_id: companyId, user_id: userId, version: versionStr, accepted: true });
      const inserted = await db2.select().from(ai_consent3).where(and40(eq50(ai_consent3.company_id, companyId), eq50(ai_consent3.user_id, userId))).limit(1);
      res.json({ success: true, consent: inserted[0], existing: false });
    } catch (error) {
      console.error("Failed to persist AI consent:", error);
      return serverError(res, "Failed to persist AI consent");
    }
  });
  app.get("/api/ai/consent", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const companyId = req.session.companyId;
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { ai_consent: ai_consent3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq50, and: and40 } = await import("drizzle-orm");
      const rows = await db2.select().from(ai_consent3).where(and40(eq50(ai_consent3.company_id, companyId), eq50(ai_consent3.user_id, userId))).limit(1);
      if (!rows[0]) {
        res.json({ accepted: false, version: null });
        return;
      }
      const c = rows[0];
      res.json({ accepted: c.accepted, version: c.version, accepted_at: c.accepted_at });
    } catch (error) {
      console.error("Failed to fetch AI consent:", error);
      return serverError(res, "Failed to fetch AI consent");
    }
  });
  app.get("/api/users/consent", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const companyId = req.session.companyId;
      const user = await storage.getUser(userId);
      if (!user) return notFound(res, "User not found");
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { audit_logs: audit_logs2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq50, and: and40, desc: desc26 } = await import("drizzle-orm");
      const rows = await db2.select().from(audit_logs2).where(and40(eq50(audit_logs2.company_id, companyId), eq50(audit_logs2.entity_type, "users"), eq50(audit_logs2.entity_id, userId))).orderBy(desc26(audit_logs2.timestamp)).limit(5);
      const consentLog = rows.find((r) => {
        try {
          const changes = r.changes || {};
          return changes.legal_consent_accepted?.new === true || changes.legal_consent_date?.new;
        } catch {
          return false;
        }
      }) || null;
      res.json({
        legal_consent_accepted: user.legal_consent_accepted,
        legal_consent_date: user.legal_consent_date,
        legal_consent_version: user.legal_consent_version || null,
        last_ip: consentLog?.ip_address || null,
        last_user_agent: consentLog?.user_agent || null
      });
    } catch (error) {
      console.error("Failed to fetch consent info:", error);
      return serverError(res, "Failed to fetch consent info");
    }
  });
  app.get("/api/audit-logs", requireAuth, requireRole(["owner", "admin"]), async (req, res) => {
    try {
      const companyId = req.session.companyId;
      const entityType = req.query.entity_type || void 0;
      const action = req.query.action || void 0;
      const actor = req.query.actor || void 0;
      const entityId = req.query.entity_id || void 0;
      const fromParam = req.query.from || void 0;
      const toParam = req.query.to || void 0;
      const limitParam = req.query.limit || void 0;
      const offsetParam = req.query.offset || void 0;
      const sortParam = (req.query.sort || "desc").toLowerCase() === "asc" ? "asc" : "desc";
      const fromDate = fromParam && !isNaN(Date.parse(fromParam)) ? new Date(fromParam) : void 0;
      const toDate = toParam && !isNaN(Date.parse(toParam)) ? new Date(toParam) : void 0;
      const limit = limitParam ? Math.max(1, Math.min(500, parseInt(limitParam, 10) || 50)) : 50;
      const offset = offsetParam ? Math.max(0, Math.min(1e6, parseInt(offsetParam, 10) || 0)) : 0;
      const whereClauses = [eq49(audit_logs.company_id, companyId)];
      if (entityType) whereClauses.push(eq49(audit_logs.entity_type, entityType));
      if (action) whereClauses.push(eq49(audit_logs.action, action));
      if (actor) whereClauses.push(eq49(audit_logs.actor_name, actor));
      if (entityId) whereClauses.push(eq49(audit_logs.entity_id, entityId));
      if (fromDate) whereClauses.push(gte11(audit_logs.timestamp, fromDate));
      if (toDate) whereClauses.push(lte11(audit_logs.timestamp, toDate));
      const [rows, totalRows] = await Promise.all([
        db.select().from(audit_logs).where(and39(...whereClauses)).orderBy(sortParam === "asc" ? asc4(audit_logs.timestamp) : desc25(audit_logs.timestamp)).limit(limit).offset(offset),
        db.select({ value: count2() }).from(audit_logs).where(and39(...whereClauses))
      ]);
      const total = Number(totalRows?.[0]?.value ?? 0);
      res.setHeader("X-Total-Count", String(total));
      res.json(rows);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      return serverError(res, "Failed to fetch audit logs");
    }
  });
  app.get("/api/audit-logs/export", requireAuth, requireRole(["owner", "admin"]), async (req, res) => {
    try {
      const companyId = req.session.companyId;
      const entityType = req.query.entity_type || void 0;
      const action = req.query.action || void 0;
      const actor = req.query.actor || void 0;
      const entityId = req.query.entity_id || void 0;
      const fromParam = req.query.from || void 0;
      const toParam = req.query.to || void 0;
      const sortParam = (req.query.sort || "desc").toLowerCase() === "asc" ? "asc" : "desc";
      const fromDate = fromParam && !isNaN(Date.parse(fromParam)) ? new Date(fromParam) : void 0;
      const toDate = toParam && !isNaN(Date.parse(toParam)) ? new Date(toParam) : void 0;
      const whereClauses = [eq49(audit_logs.company_id, companyId)];
      if (entityType) whereClauses.push(eq49(audit_logs.entity_type, entityType));
      if (action) whereClauses.push(eq49(audit_logs.action, action));
      if (actor) whereClauses.push(eq49(audit_logs.actor_name, actor));
      if (entityId) whereClauses.push(eq49(audit_logs.entity_id, entityId));
      if (fromDate) whereClauses.push(gte11(audit_logs.timestamp, fromDate));
      if (toDate) whereClauses.push(lte11(audit_logs.timestamp, toDate));
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", 'attachment; filename="audit-logs.csv"');
      const escapeCsv = (v) => {
        if (v === null || v === void 0) return '""';
        const s = String(v);
        return '"' + s.replace(/"/g, '""') + '"';
      };
      res.write(["timestamp", "action", "entity_type", "entity_id", "actor_name", "ip_address", "user_agent", "changes"].join(",") + "\n");
      const BATCH = 1e3;
      const MAX_ROWS = 1e5;
      let exported = 0;
      let offset = 0;
      while (exported < MAX_ROWS) {
        const rows = await db.select().from(audit_logs).where(and39(...whereClauses)).orderBy(sortParam === "asc" ? asc4(audit_logs.timestamp) : desc25(audit_logs.timestamp)).limit(BATCH).offset(offset);
        if (!rows.length) break;
        for (const r of rows) {
          const line = [
            escapeCsv(r.timestamp?.toISOString?.() || new Date(r.timestamp).toISOString()),
            escapeCsv(r.action),
            escapeCsv(r.entity_type),
            escapeCsv(r.entity_id),
            escapeCsv(r.actor_name),
            escapeCsv(r.ip_address),
            escapeCsv(r.user_agent),
            escapeCsv(r.changes ? JSON.stringify(r.changes) : "")
          ].join(",");
          res.write(line + "\n");
          exported++;
          if (exported >= MAX_ROWS) break;
        }
        if (exported >= MAX_ROWS) break;
        offset += rows.length;
      }
      res.end();
    } catch (error) {
      console.error("Error exporting audit logs:", error);
      return serverError(res, "Failed to export audit logs");
    }
  });
  app.get("/api/reports/ai-analytics", requireAuth, reportsLimiter, async (req, res) => {
    try {
      const companyId = req.session.companyId;
      const days = Math.min(365, Math.max(1, parseInt(req.query.days) || 30));
      const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1e3);
      const aiLogs = await db.select().from(audit_logs).where(
        and39(
          eq49(audit_logs.company_id, companyId),
          eq49(audit_logs.entity_type, "ai_invoice_extract"),
          gte11(audit_logs.timestamp, fromDate)
        )
      ).orderBy(desc25(audit_logs.timestamp));
      const totalExtractions = aiLogs.length;
      const successfulExtractions = aiLogs.filter((log2) => {
        const changes = log2.changes;
        return changes?.ok === true;
      }).length;
      const failedExtractions = totalExtractions - successfulExtractions;
      const successRate = totalExtractions > 0 ? (successfulExtractions / totalExtractions * 100).toFixed(1) : "0.0";
      const providerStats = {};
      const modelStats = {};
      const modeStats = {};
      aiLogs.forEach((log2) => {
        const changes = log2.changes;
        const provider = changes?.provider || "unknown";
        const model = changes?.model || "unknown";
        const mode = changes?.mode || "text";
        const success = changes?.ok === true;
        if (!providerStats[provider]) {
          providerStats[provider] = { total: 0, success: 0, model };
        }
        providerStats[provider].total++;
        if (success) providerStats[provider].success++;
        modelStats[model] = (modelStats[model] || 0) + 1;
        modeStats[mode] = (modeStats[mode] || 0) + 1;
      });
      const dailyTrend = [];
      for (let i = Math.min(days, 30) - 1; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1e3);
        const dateStr = date.toISOString().split("T")[0];
        const dayLogs = aiLogs.filter((log2) => {
          const logDate = new Date(log2.timestamp).toISOString().split("T")[0];
          return logDate === dateStr;
        });
        dailyTrend.push({
          date: dateStr,
          extractions: dayLogs.length,
          success: dayLogs.filter((log2) => log2.changes?.ok === true).length
        });
      }
      const fieldCounts = {};
      aiLogs.forEach((log2) => {
        if (log2.changes?.ok !== true) return;
        const entityId = log2.entity_id;
        if (entityId && entityId !== "vision" && entityId !== "pdf" && entityId !== "text") {
          fieldCounts["invoice_number"] = (fieldCounts["invoice_number"] || 0) + 1;
        }
      });
      const estimatedCost = aiLogs.reduce((sum8, log2) => {
        const changes = log2.changes;
        if (typeof changes?.estimated_cost_usd === "number") {
          return sum8 + changes.estimated_cost_usd;
        }
        const model = changes?.model || "";
        let costPer1k = 1e-4;
        if (model.includes("gpt-4o")) costPer1k = 0.01;
        else if (model.includes("gpt-4")) costPer1k = 0.03;
        else if (model.includes("claude-3-5")) costPer1k = 3e-3;
        else if (model.includes("gemini")) costPer1k = 5e-4;
        return sum8 + costPer1k * 0.5;
      }, 0);
      const recentExtractions = aiLogs.slice(0, 10).map((log2) => {
        const changes = log2.changes;
        return {
          id: log2.id,
          timestamp: log2.timestamp,
          entity_id: log2.entity_id,
          provider: changes?.provider || "unknown",
          model: changes?.model || "unknown",
          mode: changes?.mode || "text",
          success: changes?.ok === true,
          actor: log2.actor_name,
          cost: changes?.estimated_cost_usd,
          tokens: changes?.estimated_tokens_in && changes?.estimated_tokens_out ? { in: changes.estimated_tokens_in, out: changes.estimated_tokens_out } : void 0,
          error: changes?.error
        };
      });
      res.json({
        summary: {
          totalExtractions,
          successfulExtractions,
          failedExtractions,
          successRate: parseFloat(successRate),
          estimatedCost: parseFloat(estimatedCost.toFixed(4)),
          currency: "USD"
        },
        providers: Object.entries(providerStats).map(([name, stats]) => ({
          name,
          total: stats.total,
          success: stats.success,
          successRate: stats.total > 0 ? (stats.success / stats.total * 100).toFixed(1) : "0.0",
          model: stats.model
        })),
        models: Object.entries(modelStats).map(([name, count3]) => ({
          name,
          count: count3
        })).sort((a, b) => b.count - a.count),
        modes: Object.entries(modeStats).map(([name, count3]) => ({
          name,
          count: count3
        })),
        dailyTrend,
        recentExtractions
      });
    } catch (error) {
      logError("Error fetching AI analytics:", error);
      return serverError(res, "Failed to fetch AI analytics");
    }
  });
  app.post("/api/ai/extract/invoice", requireAuth, aiLimiter, checkCompanyAICap, async (req, res) => {
    try {
      const started = Date.now();
      const companyId = req.session.companyId;
      const userId = req.session.userId;
      const userName = req?.session?.userName || userId || "System";
      let { text: text2, image_base64, mime_type, provider_id, provider, model, prompt, page_range, pages, locale, refine_llm } = req.body || {};
      let pipelinePlan;
      try {
        const { selectPipeline: selectPipeline2, normalizeProviders: normalizeProviders2, adjustCandidatesWithFeedback: adjustCandidatesWithFeedback2 } = await Promise.resolve().then(() => (init_providerStrategy(), providerStrategy_exports));
        const rows = await db.select().from(ai_providers).where(eq49(ai_providers.company_id, companyId));
        let candidates = normalizeProviders2(rows);
        try {
          const feedbackStats = await db.execute(sql23`
            SELECT 
              (a.changes->>'provider') as provider,
              COUNT(*) as total,
              SUM(CASE WHEN f.accepted THEN 1 ELSE 0 END) as accepted
            FROM ai_feedback f
            JOIN audit_logs a ON a.entity_id = f.transaction_id AND a.entity_type = 'ai_invoice_extract'
            WHERE f.company_id = ${companyId}
            GROUP BY (a.changes->>'provider')
          `);
          const scores = (feedbackStats.rows || feedbackStats || []).map((r) => ({
            provider: String(r.provider || ""),
            acceptanceRate: Number(r.total) > 0 ? Number(r.accepted) / Number(r.total) : 0.5,
            totalFeedback: Number(r.total)
          })).filter((s) => s.provider);
          if (scores.length > 0) {
            candidates = adjustCandidatesWithFeedback2(candidates, scores);
          }
        } catch (err) {
          console.warn("Feedback adjustment skipped:", err);
        }
        const mt = (mime_type || "").toString().toLowerCase();
        const isPdf2 = /pdf/.test(mt);
        const imageProvided = !!image_base64;
        const pagesCount = Array.isArray(pages) ? pages.length : void 0;
        pipelinePlan = selectPipeline2({
          mimeType: mime_type,
          sizeBytes: typeof image_base64 === "string" ? image_base64.length : typeof text2 === "string" ? text2.length : void 0,
          pagesCount,
          imageProvided,
          wantsVision: true,
          locale: locale || req.headers["accept-language"] || "en",
          candidates
        });
      } catch (e) {
        pipelinePlan = void 0;
      }
      const tryParseJson = (s) => {
        try {
          return JSON.parse(s);
        } catch {
        }
        const m = s.match(/\{[\s\S]*\}/);
        if (m) {
          try {
            return JSON.parse(m[0]);
          } catch {
          }
        }
        return null;
      };
      if (pipelinePlan?.mode === "ocr+llm" && image_base64 && (!text2 || !text2.trim())) {
        try {
          const { performOCR: performOCR2 } = await Promise.resolve().then(() => (init_ocr(), ocr_exports));
          const ocrRes = await performOCR2(image_base64);
          if (ocrRes.text) {
            text2 = ocrRes.text;
            if (ocrRes.warnings?.length && pipelinePlan) {
              pipelinePlan.warnings = [...pipelinePlan.warnings || [], ...ocrRes.warnings];
            }
          }
        } catch (e) {
          console.error("OCR fallback failed:", e);
        }
      }
      const isPdf = image_base64 && typeof image_base64 === "string" && mime_type && /pdf/i.test(String(mime_type));
      const hasText = typeof text2 === "string" && text2.trim().length > 0;
      if (isPdf || hasText) {
        try {
          let pdfText = "";
          if (isPdf) {
            const pdfParse = __require("pdf-parse");
            const buf = Buffer.from(image_base64, "base64");
            if (buf.length > 10 * 1024 * 1024) {
              return badRequest(res, "PDF too large");
            }
            const toPageSet = () => {
              try {
                if (Array.isArray(pages) && pages.length) {
                  const s = /* @__PURE__ */ new Set();
                  for (const p of pages) {
                    const n = Number(p);
                    if (Number.isFinite(n) && n >= 1) s.add(Math.floor(n));
                  }
                  return s.size ? s : null;
                }
                if (typeof page_range === "string" && page_range.trim()) {
                  const s = /* @__PURE__ */ new Set();
                  for (const part of page_range.split(",")) {
                    const seg = part.trim();
                    if (!seg) continue;
                    const m = seg.match(/^(\d+)(?:\s*[-–]\s*(\d+))?$/);
                    if (m) {
                      const a = parseInt(m[1], 10);
                      const b = m[2] ? parseInt(m[2], 10) : a;
                      const start = Math.min(a, b);
                      const end = Math.max(a, b);
                      for (let i = start; i <= end; i++) s.add(i);
                    }
                  }
                  return s.size ? s : null;
                }
              } catch {
              }
              return null;
            };
            const selectedPages = toPageSet();
            let pageCounter = 0;
            const MAX_PAGES_DEFAULT = 2;
            const parsed = await pdfParse(buf, {
              pagerender: (pageData) => {
                pageCounter += 1;
                const currentPage = pageCounter;
                if (selectedPages && !selectedPages.has(currentPage)) {
                  return Promise.resolve("");
                }
                return pageData.getTextContent().then(
                  (tc) => tc.items.map((it) => it.str).join("\n") + "\n"
                );
              }
              // If no explicit selection and doc is huge, pdf-parse will still render all pages.
              // We implement a soft cap by trimming after parse below when needed.
            });
            pdfText = parsed?.text || "";
            if (!selectedPages && parsed?.numpages && parsed.numpages > 10) {
              const lines = pdfText.split("\n");
              const approxPerPage = Math.max(80, Math.floor(lines.length / parsed.numpages));
              pdfText = lines.slice(0, approxPerPage * MAX_PAGES_DEFAULT).join("\n");
            }
          } else {
            pdfText = text2 || "";
          }
          if (!pdfText.trim()) return badRequest(res, "Failed to read text content");
          const { extractInvoiceFromText: extractInvoiceFromText2 } = await Promise.resolve().then(() => (init_invoiceExtraction(), invoiceExtraction_exports));
          const extraction = await extractInvoiceFromText2(pdfText, companyId, {
            provider_id,
            provider,
            model,
            prompt,
            refine_llm
          });
          await logAudit({
            companyId,
            entityType: "ai_invoice_extract",
            entityId: extraction.result.invoice_number || "text",
            action: "create",
            changes: {
              mode: "text",
              provider: extraction.meta.provider,
              model: extraction.meta.model,
              text_size: pdfText.length,
              ok: true,
              estimated_cost_usd: extraction.meta.cost?.totalUSD,
              estimated_tokens_in: extraction.meta.cost?.inputTokens,
              estimated_tokens_out: extraction.meta.cost?.outputTokens
            },
            actorId: userId,
            actorName: userName,
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"]
          });
          let finalPipeline2 = pipelinePlan || void 0;
          if (refine_llm) {
            finalPipeline2 = finalPipeline2 ? { ...finalPipeline2, steps: Array.isArray(finalPipeline2.steps) ? [...finalPipeline2.steps, "llm-refine"] : ["llm-refine"] } : { mode: "text", reason: "Refined via LLM", steps: ["text-heuristics", "llm-refine"], warnings: [], estimated_cost_usd: 0 };
          }
          res.json({ ...extraction.result, meta: { ...extraction.meta, duration_ms: Date.now() - started, pipeline: finalPipeline2 } });
        } catch (e) {
          console.error("PDF processing error:", e);
          return serverError(res, "Failed to process PDF");
        }
      } else if (image_base64) {
        try {
          let rowLLM;
          if (provider_id) {
            const [r] = await db.select().from(ai_providers).where(and39(eq49(ai_providers.id, provider_id), eq49(ai_providers.company_id, companyId)));
            rowLLM = r;
          } else {
            const provName = (provider || "").toString().toLowerCase();
            const rows2 = await db.select().from(ai_providers).where(eq49(ai_providers.company_id, companyId));
            rowLLM = rows2.find((r) => (r.provider || "").toLowerCase() === (provName || "openai")) || rows2.find((r) => (r.provider || "").toLowerCase() === "openai") || rows2[0];
          }
          if (!rowLLM?.api_key) {
            return badRequest(res, "No AI provider configured for Vision extraction");
          }
          const baseUrl2 = (rowLLM.base_url || "https://api.openai.com").replace(/\/$/, "");
          const useModel2 = model || rowLLM.vision_model || rowLLM.default_model || "gpt-4o";
          const instructions2 = prompt || "Extract invoice fields and return strict JSON with keys: vendor_name, invoice_number, date, due_date, currency, subtotal, tax_total, total, notes. Dates must be ISO (YYYY-MM-DD). Currency as code if possible. Only output the JSON.";
          const { callAIProvider: callAIProvider2, buildInvoiceExtractionMessages: buildInvoiceExtractionMessages2 } = await Promise.resolve().then(() => (init_aiProviders(), aiProviders_exports));
          const cfgVision = { provider: (rowLLM.provider || "openai").toLowerCase(), apiKey: rowLLM.api_key, baseUrl: baseUrl2, model: useModel2 };
          const msgsVision = buildInvoiceExtractionMessages2(void 0, image_base64, mime_type || "image/jpeg", instructions2);
          const aiVision = await callAIProvider2(cfgVision, msgsVision);
          let result = {};
          const warnings = [];
          let costInfo;
          if (aiVision?.content != null) {
            const content2 = aiVision.content || "";
            const tryParse = (s) => {
              try {
                return JSON.parse(s);
              } catch {
                const m = s.match(/\{[\s\S]*\}/);
                if (m) {
                  try {
                    return JSON.parse(m[0]);
                  } catch {
                  }
                }
                return null;
              }
            };
            const json2 = typeof content2 === "string" ? tryParse(content2) : null;
            if (json2) {
              result = {
                vendor_name: json2.vendor_name || void 0,
                invoice_number: json2.invoice_number || void 0,
                date: json2.date || void 0,
                due_date: json2.due_date || void 0,
                currency: json2.currency || void 0,
                subtotal: json2.subtotal ? String(json2.subtotal) : void 0,
                tax_total: json2.tax_total ? String(json2.tax_total) : void 0,
                total: json2.total ? String(json2.total) : void 0,
                notes: json2.notes || void 0,
                line_items: Array.isArray(json2.line_items) ? json2.line_items : []
              };
              if (aiVision.cost?.totalUSD != null) {
                costInfo = {
                  totalUSD: aiVision.cost.totalUSD,
                  inputTokens: aiVision.usage?.prompt_tokens,
                  outputTokens: aiVision.usage?.completion_tokens
                };
              }
            } else {
              warnings.push("Vision LLM failed to parse JSON");
            }
          } else {
            warnings.push("Vision LLM upstream error");
          }
          await logAudit({
            companyId,
            entityType: "ai_invoice_extract",
            entityId: "vision",
            action: "create",
            changes: {
              mode: "vision",
              provider: rowLLM.provider,
              model: useModel2,
              image_size: image_base64.length,
              ok: !!result.invoice_number,
              estimated_cost_usd: costInfo?.totalUSD,
              estimated_tokens_in: costInfo?.inputTokens,
              estimated_tokens_out: costInfo?.outputTokens
            },
            actorId: userId,
            actorName: userName,
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"]
          });
          res.json({ ...result, meta: { mode: "vision", provider: rowLLM.provider, model: useModel2, warnings, duration_ms: Date.now() - started, cost: costInfo } });
        } catch (e) {
          console.error("Vision processing error:", e);
          try {
            const { performOCR: performOCR2 } = await Promise.resolve().then(() => (init_ocr(), ocr_exports));
            const ocrRes = await performOCR2(image_base64);
            if (ocrRes.text) {
              const { extractInvoiceFromText: extractInvoiceFromText2 } = await Promise.resolve().then(() => (init_invoiceExtraction(), invoiceExtraction_exports));
              const extraction = await extractInvoiceFromText2(ocrRes.text, companyId, {
                provider_id,
                provider,
                model,
                prompt,
                refine_llm: true
              });
              await logAudit({
                companyId,
                entityType: "ai_invoice_extract",
                entityId: extraction.result.invoice_number || "ocr-fallback",
                action: "create",
                changes: {
                  mode: "ocr+llm",
                  fallback: true,
                  provider: extraction.meta.provider,
                  model: extraction.meta.model,
                  ok: true,
                  estimated_cost_usd: extraction.meta.cost?.totalUSD
                },
                actorId: userId,
                actorName: userName,
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"]
              });
              return res.json({ ...extraction.result, meta: { ...extraction.meta, mode: "ocr+llm", warnings: [...extraction.meta.warnings || [], "Vision failed, fell back to OCR"], duration_ms: Date.now() - started } });
            }
          } catch (fallbackErr) {
            console.error("Fallback OCR failed:", fallbackErr);
          }
          return serverError(res, "Failed to process image via Vision API: " + e.message);
        }
      }
    } catch (error) {
      console.error("Error extracting invoice fields:", error);
      try {
        const companyId = req.session.companyId;
        const userId = req.session.userId;
        const userName = req?.session?.userName || userId || "System";
        const { text: text2, image_base64, mime_type, provider_id, provider, model } = req.body || {};
        await logAudit({
          companyId,
          entityType: "ai_invoice_extract",
          entityId: image_base64 ? "vision" : "text",
          action: "create",
          changes: {
            mode: image_base64 ? "vision" : "text",
            provider: provider || void 0,
            model: model || void 0,
            mime_type: mime_type || void 0,
            size: image_base64 ? image_base64.length : typeof text2 === "string" ? text2.length : 0,
            ok: false,
            error: error?.message || String(error)
          },
          actorId: userId,
          actorName: userName,
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"]
        });
      } catch {
      }
      return serverError(res, "Failed to extract invoice fields");
    }
  });
  app.get("/api/contacts", requireAuth, async (req, res) => {
    try {
      const companyId = req.session.companyId;
      const contacts2 = await storage.getContactsByCompany(companyId);
      res.json(contacts2);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      return serverError(res, "Failed to fetch contacts");
    }
  });
  app.post("/api/contacts", requireAuth, async (req, res) => {
    try {
      const companyId = req.session.companyId;
      const body = normalize(req.body);
      if (!body.type) body.type = "customer";
      if (!body.currency) body.currency = "USD";
      if (body.payment_terms_days === void 0) body.payment_terms_days = 30;
      if (body.is_active === void 0) body.is_active = true;
      const validatedData = insertContactSchema.parse({
        ...body,
        company_id: companyId
      });
      const contact = await storage.createContact(validatedData);
      const userId = req.session.userId;
      await logCreate({
        companyId,
        entityType: "contact",
        entityId: contact.id,
        createdData: { name: contact.name, type: contact.type, email: contact.email },
        actorId: userId,
        actorName: req.session?.userName || "User",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
      });
      res.status(201).json(contact);
    } catch (error) {
      if (error.name === "ZodError") {
        const validationError = fromZodError13(error);
        return badRequest(res, validationError.message);
      } else {
        console.error("Error creating contact:", error);
        return serverError(res, "Failed to create contact");
      }
    }
  });
  app.put("/api/contacts/:id", requireAuth, requireRole(["owner", "admin", "accountant"]), async (req, res) => {
    try {
      const companyId = req.session.companyId;
      const userId = req.session.userId;
      const update = sanitizeUpdate(req.body);
      const validated = insertContactSchema.partial().parse(update);
      const contact = await storage.updateContact(req.params.id, validated);
      if (!contact) return notFound(res, "Contact not found");
      await logUpdate({
        companyId,
        entityType: "contact",
        entityId: contact.id,
        oldData: {},
        newData: validated,
        actorId: userId,
        actorName: req.session?.userName || "User",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
      });
      res.json(contact);
    } catch (error) {
      console.error("Error updating contact:", error);
      return serverError(res, "Failed to update contact");
    }
  });
  app.delete("/api/contacts/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const companyId = req.session.companyId;
      const userId = req.session.userId;
      const success = await storage.deleteContact(companyId, id);
      if (!success) return notFound(res, "Contact not found");
      await logDelete({
        companyId,
        entityType: "contact",
        entityId: id,
        deletedData: { id },
        actorId: userId,
        actorName: req.session?.userName || "User",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting contact:", error);
      return serverError(res, "Failed to delete contact");
    }
  });
  app.get("/api/items", requireAuth, async (req, res) => {
    try {
      const companyId = req.session.companyId;
      const items3 = await storage.getItemsByCompany(companyId);
      res.json(items3);
    } catch (error) {
      console.error("Error fetching items:", error);
      return serverError(res, "Failed to fetch items");
    }
  });
  app.post("/api/items", requireAuth, async (req, res) => {
    try {
      const companyId = req.session.companyId;
      if (!companyId) {
        return unauthorized(res, "No company context for user");
      }
      const body = normalize(req.body);
      const decimalFields = [
        "sales_price",
        "cost_price",
        "stock_quantity",
        "reorder_level"
      ];
      for (const f of decimalFields) {
        if (typeof body[f] === "number") {
          body[f] = body[f].toString();
        }
      }
      if (!body.sku) body.sku = "SKU-" + Date.now().toString(36);
      if (!body.type) body.type = "service";
      if (body.stock_quantity === void 0) body.stock_quantity = "0";
      if (!body.unit_of_measure) body.unit_of_measure = "pcs";
      const defaultWarehouseId = body.default_warehouse_id;
      delete body.default_warehouse_id;
      const validatedData = insertItemSchema.parse({
        ...body,
        company_id: companyId
      });
      try {
        if (validatedData.default_tax_id) {
          const tax = await storage.getTaxById(validatedData.default_tax_id);
          if (!tax || tax.company_id !== companyId) {
            delete validatedData.default_tax_id;
          }
        }
        if (validatedData.sales_account_id) {
          const acc = await storage.getAccountById(validatedData.sales_account_id);
          if (!acc || acc.company_id !== companyId) {
            delete validatedData.sales_account_id;
          }
        }
        if (validatedData.cost_account_id) {
          const acc = await storage.getAccountById(validatedData.cost_account_id);
          if (!acc || acc.company_id !== companyId) {
            delete validatedData.cost_account_id;
          }
        }
        if (validatedData.inventory_account_id) {
          const acc = await storage.getAccountById(validatedData.inventory_account_id);
          if (!acc || acc.company_id !== companyId) {
            delete validatedData.inventory_account_id;
          }
        }
      } catch (e) {
      }
      const item = await storage.createItem(validatedData);
      const stockQty = parseFloat(body.stock_quantity || "0");
      const costPrice = parseFloat(body.cost_price || "0");
      const isProduct = item.type === "product" || item.type === "inventory";
      if (isProduct && stockQty > 0 && defaultWarehouseId) {
        await recordStockMovement({
          company_id: companyId,
          item_id: item.id,
          warehouse_id: defaultWarehouseId,
          transaction_type: "adjustment",
          transaction_date: /* @__PURE__ */ new Date(),
          quantity: stockQty,
          unit_cost: costPrice,
          reference_type: "opening_balance",
          notes: "Opening stock balance",
          created_by: req.session.userId
        });
      }
      const userId = req.session.userId;
      await logCreate({
        companyId,
        entityType: "item",
        entityId: item.id,
        createdData: { sku: item.sku, name: item.name, type: item.type },
        actorId: userId,
        actorName: req.session?.userName || "User",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
      });
      res.status(201).json(item);
    } catch (error) {
      if (error.name === "ZodError") {
        const validationError = fromZodError13(error);
        return badRequest(res, validationError.message);
      } else {
        console.error("Error creating item:", error?.message || error);
        return serverError(res, "Failed to create item");
      }
    }
  });
  app.put("/api/items/:id", requireAuth, requireRole(["owner", "admin", "accountant"]), async (req, res) => {
    try {
      const companyId = req.session.companyId;
      const userId = req.session.userId;
      const update = sanitizeUpdate(req.body, ["company_id", "created_by", "id"], ["sales_price", "cost_price", "stock_quantity", "reorder_level"]);
      const validated = insertItemSchema.partial().parse(update);
      const item = await storage.updateItem(req.params.id, validated);
      if (!item) return notFound(res, "Item not found");
      await logUpdate({
        companyId,
        entityType: "item",
        entityId: item.id,
        oldData: {},
        newData: validated,
        actorId: userId,
        actorName: req.session?.userName || "User",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
      });
      res.json(item);
    } catch (error) {
      console.error("Error updating item:", error);
      return serverError(res, "Failed to update item");
    }
  });
  app.delete("/api/items/:id", requireAuth, async (req, res) => {
    try {
      const companyId = req.session.companyId;
      const userId = req.session.userId;
      const success = await storage.deleteItem(req.params.id);
      if (!success) return notFound(res, "Item not found");
      await logDelete({
        companyId,
        entityType: "item",
        entityId: req.params.id,
        deletedData: { id: req.params.id },
        actorId: userId,
        actorName: req.session?.userName || "User",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting item:", error);
      return serverError(res, "Failed to delete item");
    }
  });
  app.use("/api/landed-cost", requireAuth, landedCost_default);
  app.use("/api/portal", portal_default);
  app.use("/api/approvals", approvals_default);
  app.use("/api/ai-cfo", ai_cfo_default);
  app.use("/api/esg", esg_default);
  app.use("/api/archiving", archiving_default);
  app.use("/api/api-keys", requireAuth, api_keys_default);
  app.use("/api/public", public_api_default);
  app.use("/api/2fa", two_factor_default);
  const httpServer = createServer(app);
  return httpServer;
}

// server/bootstrap/schemaUpgrade.ts
async function ensureSchemaUpgrades(pool3) {
  const result = {
    success: true,
    applied: [],
    errors: []
  };
  console.log("[Migration] Starting schema upgrades...");
  try {
    await pool3.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        legal_name text,
        tax_number text,
        registration_number text,
        logo_url text,
        address jsonb,
        contacts jsonb,
        base_currency varchar(3) NOT NULL DEFAULT 'USD',
        fiscal_year_start integer NOT NULL DEFAULT 1,
        date_format text NOT NULL DEFAULT 'dd/MM/yyyy',
        number_format text NOT NULL DEFAULT '1,234.56',
        declaration_text text,
        firebase_user_id text,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push("companies table (core)");
  } catch (e) {
    console.error(`[Migration] Failed to create companies: ${e.message}`);
    result.errors.push(`companies: ${e.message}`);
  }
  try {
    await pool3.query(`
      CREATE TABLE IF NOT EXISTS users (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        username text NOT NULL UNIQUE,
        email text,
        password_hash text NOT NULL,
        full_name text NOT NULL,
        role text NOT NULL DEFAULT 'viewer',
        language text NOT NULL DEFAULT 'en',
        timezone text NOT NULL DEFAULT 'UTC',
        theme text NOT NULL DEFAULT 'auto',
        is_active boolean NOT NULL DEFAULT true,
        legal_consent_accepted boolean NOT NULL DEFAULT false,
        legal_consent_date timestamp,
        legal_consent_version text,
        last_login_at timestamp,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push("users table (core)");
  } catch (e) {
    console.error(`[Migration] Failed to create users: ${e.message}`);
    result.errors.push(`users: ${e.message}`);
  }
  try {
    const checkUsersTable = await pool3.query(
      "SELECT 1 FROM information_schema.tables WHERE table_name='users' LIMIT 1"
    );
    const hasUsersTable = (checkUsersTable.rowCount || 0) > 0;
    if (hasUsersTable) {
      const checkEmailCol = await pool3.query(
        "SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='email' LIMIT 1"
      );
      const hasEmailCol = (checkEmailCol.rowCount || 0) > 0;
      if (!hasEmailCol) {
        console.log("[Migration] Adding users.email column...");
        await pool3.query("ALTER TABLE users ADD COLUMN email text");
        await pool3.query(
          "UPDATE users SET email = CASE WHEN position('@' in username) > 1 THEN username ELSE username END WHERE email IS NULL"
        );
        await pool3.query("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)");
        await pool3.query("CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx ON users(email) WHERE email IS NOT NULL");
        result.applied.push("users.email column with indexes");
        console.log("[Migration] \u2705 users.email column added successfully");
      } else {
        console.log("[Migration] \u2713 users.email column already exists");
      }
    } else {
      console.warn("[Migration] \u26A0\uFE0F  users table not found - skipping email migration");
    }
  } catch (error) {
    const errMsg = `Failed to add users.email: ${error.message} (code: ${error.code})`;
    console.error(`[Migration] \u274C ${errMsg}`);
    result.errors.push(errMsg);
    result.success = false;
    if (process.env.NODE_ENV === "production") {
      throw new Error(`CRITICAL: ${errMsg}`);
    }
  }
  try {
    const checkCol = await pool3.query(
      "SELECT 1 FROM information_schema.columns WHERE table_name='document_lines' AND column_name='tax_id' LIMIT 1"
    );
    const hasTaxId = (checkCol.rowCount || 0) > 0;
    if (!hasTaxId) {
      console.log("[Migration] Adding document_lines.tax_id column...");
      await pool3.query("ALTER TABLE document_lines ADD COLUMN tax_id varchar");
      try {
        await pool3.query("ALTER TABLE document_lines ADD CONSTRAINT document_lines_tax_id_fkey FOREIGN KEY (tax_id) REFERENCES taxes(id)");
      } catch (e) {
        console.warn("[Migration] FK constraint already exists or failed - continuing");
      }
      await pool3.query("CREATE INDEX IF NOT EXISTS idx_document_lines_tax_id ON document_lines(tax_id)");
      const backfillResult = await pool3.query(
        `UPDATE document_lines dl
         SET tax_id = i.default_tax_id
         FROM items i
         WHERE dl.item_id = i.id AND dl.tax_id IS NULL`
      );
      result.applied.push(`document_lines.tax_id (backfilled ${backfillResult.rowCount || 0} rows)`);
      console.log(`[Migration] \u2705 document_lines.tax_id added and backfilled`);
    } else {
      console.log("[Migration] \u2713 document_lines.tax_id already exists");
    }
  } catch (error) {
    const errMsg = `Failed to add document_lines.tax_id: ${error.message}`;
    console.error(`[Migration] \u274C ${errMsg}`);
    result.errors.push(errMsg);
  }
  try {
    const checkTable = await pool3.query(
      "SELECT 1 FROM information_schema.tables WHERE table_name='ai_providers' LIMIT 1"
    );
    const hasTable = (checkTable.rowCount || 0) > 0;
    if (!hasTable) {
      console.log("[Migration] Creating ai_providers table...");
      await pool3.query(`
        CREATE TABLE IF NOT EXISTS ai_providers (
          id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
          company_id varchar REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
          provider varchar(64) NOT NULL,
          label varchar(128),
          base_url text,
          api_key text,
          organization varchar(128),
          default_model varchar(256),
          embeddings_model varchar(256),
          vision_model varchar(256),
          created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await pool3.query("CREATE INDEX IF NOT EXISTS idx_ai_providers_company ON ai_providers(company_id)");
      await pool3.query("CREATE INDEX IF NOT EXISTS idx_ai_providers_provider ON ai_providers(provider)");
      result.applied.push("ai_providers table");
      console.log("[Migration] \u2705 ai_providers table created");
    } else {
      console.log("[Migration] \u2713 ai_providers table already exists");
    }
  } catch (error) {
    const errMsg = `Failed to create ai_providers table: ${error.message}`;
    console.error(`[Migration] \u274C ${errMsg}`);
    result.errors.push(errMsg);
  }
  try {
    const checkTable = await pool3.query(
      "SELECT 1 FROM information_schema.tables WHERE table_name='ai_feedback' LIMIT 1"
    );
    const hasTable = (checkTable.rowCount || 0) > 0;
    if (!hasTable) {
      console.log("[Migration] Creating ai_feedback table...");
      await pool3.query(`
        CREATE TABLE IF NOT EXISTS ai_feedback (
          id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
          company_id varchar REFERENCES companies(id) ON DELETE CASCADE,
          user_id varchar REFERENCES users(id),
          source text,
          transaction_id varchar,
          accepted boolean NOT NULL,
          category text,
          confidence numeric(10,6),
          suggested_accounts jsonb,
          notes text,
          description text,
          amount numeric(15,2),
          created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await pool3.query("CREATE INDEX IF NOT EXISTS idx_ai_feedback_company_created ON ai_feedback(company_id, created_at)");
      result.applied.push("ai_feedback table");
      console.log("[Migration] \u2705 ai_feedback table created");
    } else {
      console.log("[Migration] \u2713 ai_feedback table already exists");
    }
  } catch (error) {
    const errMsg = `Failed to create ai_feedback table: ${error.message}`;
    console.error(`[Migration] \u274C ${errMsg}`);
    result.errors.push(errMsg);
  }
  try {
    const checkTable = await pool3.query(
      "SELECT 1 FROM information_schema.tables WHERE table_name='legal_consent_logs' LIMIT 1"
    );
    const hasTable = (checkTable.rowCount || 0) > 0;
    if (!hasTable) {
      console.log("[Migration] Creating legal_consent_logs table...");
      await pool3.query(`
        CREATE TABLE IF NOT EXISTS legal_consent_logs (
          id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
          consent_version text NOT NULL,
          terms_accepted boolean NOT NULL DEFAULT true,
          privacy_accepted boolean NOT NULL DEFAULT true,
          disclaimer_accepted boolean NOT NULL DEFAULT true,
          ip_address text,
          user_agent text,
          accepted_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await pool3.query("CREATE INDEX IF NOT EXISTS legal_consent_logs_user_id_idx ON legal_consent_logs(user_id)");
      await pool3.query("CREATE INDEX IF NOT EXISTS legal_consent_logs_company_id_idx ON legal_consent_logs(company_id)");
      await pool3.query("CREATE INDEX IF NOT EXISTS legal_consent_logs_accepted_at_idx ON legal_consent_logs(accepted_at)");
      result.applied.push("legal_consent_logs table");
      console.log("[Migration] \u2705 legal_consent_logs table created");
    } else {
      console.log("[Migration] \u2713 legal_consent_logs table already exists");
    }
  } catch (error) {
    const errMsg = `Failed to create legal_consent_logs table: ${error.message}`;
    console.error(`[Migration] \u274C ${errMsg}`);
    result.errors.push(errMsg);
  }
  try {
    const checkTable = await pool3.query(
      "SELECT 1 FROM information_schema.tables WHERE table_name='user_permissions' LIMIT 1"
    );
    const hasTable = (checkTable.rowCount || 0) > 0;
    if (!hasTable) {
      console.log("[Migration] Creating user_permissions table...");
      await pool3.query(`
        CREATE TABLE IF NOT EXISTS user_permissions (
          id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          resource varchar(100) NOT NULL,
          action varchar(50) NOT NULL,
          allowed boolean DEFAULT true,
          created_at timestamp DEFAULT CURRENT_TIMESTAMP,
          updated_at timestamp DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT unique_user_permission UNIQUE(user_id, resource, action)
        );
      `);
      await pool3.query("CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id)");
      await pool3.query("CREATE INDEX IF NOT EXISTS idx_user_permissions_lookup ON user_permissions(user_id, resource, action)");
      result.applied.push("user_permissions table");
      console.log("[Migration] \u2705 user_permissions table created");
    } else {
      console.log("[Migration] \u2713 user_permissions table already exists");
    }
  } catch (error) {
    const errMsg = `Failed to create user_permissions table: ${error.message}`;
    console.error(`[Migration] \u274C ${errMsg}`);
    result.errors.push(errMsg);
  }
  try {
    const checkCol = await pool3.query(
      "SELECT 1 FROM information_schema.columns WHERE table_name='items' AND column_name='tracking_type' LIMIT 1"
    );
    if ((checkCol.rowCount || 0) === 0) {
      console.log("[Migration] Adding items.tracking_type column...");
      await pool3.query("ALTER TABLE items ADD COLUMN tracking_type text NOT NULL DEFAULT 'none'");
      result.applied.push("items.tracking_type");
    }
  } catch (e) {
    console.error(`[Migration] Failed to add items.tracking_type: ${e.message}`);
    result.errors.push(`items.tracking_type: ${e.message}`);
  }
  try {
    await pool3.query(`
      CREATE TABLE IF NOT EXISTS cost_centers (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        code text NOT NULL,
        name text NOT NULL,
        parent_id varchar,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push("cost_centers table");
  } catch (e) {
    console.error(`[Migration] Failed to create cost_centers: ${e.message}`);
    result.errors.push(`cost_centers: ${e.message}`);
  }
  try {
    await pool3.query(`
      CREATE TABLE IF NOT EXISTS checks (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        type text NOT NULL,
        check_number text NOT NULL,
        bank_name text,
        amount numeric(15,2) NOT NULL,
        currency varchar(3) NOT NULL DEFAULT 'USD',
        issue_date timestamp NOT NULL,
        due_date timestamp NOT NULL,
        contact_id varchar REFERENCES contacts(id),
        status text NOT NULL DEFAULT 'on_hand',
        description text,
        image_url text,
        bank_account_id varchar REFERENCES bank_accounts(id),
        journal_id varchar REFERENCES journals(id),
        created_by varchar REFERENCES users(id),
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push("checks table");
  } catch (e) {
    console.error(`[Migration] Failed to create checks: ${e.message}`);
    result.errors.push(`checks: ${e.message}`);
  }
  try {
    await pool3.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        name text NOT NULL,
        manager_id varchar,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push("departments table");
  } catch (e) {
    console.error(`[Migration] Failed to create departments: ${e.message}`);
    result.errors.push(`departments: ${e.message}`);
  }
  try {
    await pool3.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        first_name text NOT NULL,
        last_name text NOT NULL,
        email text,
        phone text,
        department_id varchar REFERENCES departments(id),
        job_title text,
        hire_date timestamp NOT NULL,
        salary numeric(15,2) NOT NULL DEFAULT 0,
        status text NOT NULL DEFAULT 'active',
        user_id varchar REFERENCES users(id),
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push("employees table");
  } catch (e) {
    console.error(`[Migration] Failed to create employees: ${e.message}`);
    result.errors.push(`employees: ${e.message}`);
  }
  try {
    await pool3.query(`
      CREATE TABLE IF NOT EXISTS payroll_runs (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        period_start timestamp NOT NULL,
        period_end timestamp NOT NULL,
        payment_date timestamp NOT NULL,
        status text NOT NULL DEFAULT 'draft',
        total_amount numeric(15,2) NOT NULL DEFAULT 0,
        journal_id varchar REFERENCES journals(id),
        created_by varchar REFERENCES users(id),
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push("payroll_runs table");
  } catch (e) {
    console.error(`[Migration] Failed to create payroll_runs: ${e.message}`);
    result.errors.push(`payroll_runs: ${e.message}`);
  }
  try {
    await pool3.query(`
      CREATE TABLE IF NOT EXISTS payslips (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        payroll_run_id varchar NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
        employee_id varchar NOT NULL REFERENCES employees(id),
        basic_salary numeric(15,2) NOT NULL,
        allowances numeric(15,2) NOT NULL DEFAULT 0,
        deductions numeric(15,2) NOT NULL DEFAULT 0,
        net_salary numeric(15,2) NOT NULL,
        details jsonb,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push("payslips table");
  } catch (e) {
    console.error(`[Migration] Failed to create payslips: ${e.message}`);
    result.errors.push(`payslips: ${e.message}`);
  }
  try {
    await pool3.query(`
      CREATE TABLE IF NOT EXISTS manufacturing_boms (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        item_id varchar NOT NULL REFERENCES items(id),
        name text NOT NULL,
        version text NOT NULL DEFAULT '1.0',
        is_active boolean NOT NULL DEFAULT true,
        labor_cost numeric(15,2) DEFAULT 0,
        overhead_cost numeric(15,2) DEFAULT 0,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push("manufacturing_boms table");
  } catch (e) {
    console.error(`[Migration] Failed to create manufacturing_boms: ${e.message}`);
    result.errors.push(`manufacturing_boms: ${e.message}`);
  }
  try {
    await pool3.query(`
      CREATE TABLE IF NOT EXISTS manufacturing_bom_items (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        bom_id varchar NOT NULL REFERENCES manufacturing_boms(id) ON DELETE CASCADE,
        item_id varchar NOT NULL REFERENCES items(id),
        quantity numeric(15,4) NOT NULL,
        wastage_percent numeric(5,2) DEFAULT 0
      );
    `);
    result.applied.push("manufacturing_bom_items table");
  } catch (e) {
    console.error(`[Migration] Failed to create manufacturing_bom_items: ${e.message}`);
    result.errors.push(`manufacturing_bom_items: ${e.message}`);
  }
  try {
    await pool3.query(`
      CREATE TABLE IF NOT EXISTS production_orders (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        order_number text NOT NULL,
        bom_id varchar REFERENCES manufacturing_boms(id),
        item_id varchar NOT NULL REFERENCES items(id),
        quantity numeric(15,4) NOT NULL,
        start_date timestamp NOT NULL,
        due_date timestamp,
        status text NOT NULL DEFAULT 'planned',
        warehouse_id varchar REFERENCES warehouses(id),
        created_by varchar REFERENCES users(id),
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push("production_orders table");
  } catch (e) {
    console.error(`[Migration] Failed to create production_orders: ${e.message}`);
    result.errors.push(`production_orders: ${e.message}`);
  }
  try {
    await pool3.query(`
      CREATE TABLE IF NOT EXISTS inventory_batches (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        item_id varchar NOT NULL REFERENCES items(id),
        batch_number text NOT NULL,
        expiry_date timestamp,
        quantity numeric(15,4) NOT NULL DEFAULT 0,
        warehouse_id varchar REFERENCES warehouses(id),
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push("inventory_batches table");
  } catch (e) {
    console.error(`[Migration] Failed to create inventory_batches: ${e.message}`);
    result.errors.push(`inventory_batches: ${e.message}`);
  }
  try {
    await pool3.query(`
      CREATE TABLE IF NOT EXISTS inventory_serials (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        item_id varchar NOT NULL REFERENCES items(id),
        serial_number text NOT NULL,
        status text NOT NULL DEFAULT 'available',
        warehouse_id varchar REFERENCES warehouses(id),
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push("inventory_serials table");
  } catch (e) {
    console.error(`[Migration] Failed to create inventory_serials: ${e.message}`);
    result.errors.push(`inventory_serials: ${e.message}`);
  }
  try {
    await pool3.query(`
      CREATE TABLE IF NOT EXISTS approval_workflows (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        entity_type text NOT NULL,
        trigger_amount numeric(15,2) NOT NULL DEFAULT 0,
        approver_role text NOT NULL DEFAULT 'admin',
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push("approval_workflows table");
  } catch (e) {
    console.error(`[Migration] Failed to create approval_workflows: ${e.message}`);
    result.errors.push(`approval_workflows: ${e.message}`);
  }
  try {
    await pool3.query(`
      CREATE TABLE IF NOT EXISTS approval_requests (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        workflow_id varchar REFERENCES approval_workflows(id),
        entity_type text NOT NULL,
        entity_id varchar NOT NULL,
        requester_id varchar REFERENCES users(id),
        status text NOT NULL DEFAULT 'pending',
        approver_id varchar REFERENCES users(id),
        comments text,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push("approval_requests table");
  } catch (e) {
    console.error(`[Migration] Failed to create approval_requests: ${e.message}`);
    result.errors.push(`approval_requests: ${e.message}`);
  }
  try {
    const checkCol = await pool3.query(
      "SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='reconciliation_id' LIMIT 1"
    );
    if ((checkCol.rowCount || 0) === 0) {
      console.log("[Migration] Adding payments.reconciliation_id column...");
      await pool3.query("ALTER TABLE payments ADD COLUMN reconciliation_id varchar");
      result.applied.push("payments.reconciliation_id");
    }
  } catch (e) {
    console.error(`[Migration] Failed to add payments.reconciliation_id: ${e.message}`);
    result.errors.push(`payments.reconciliation_id: ${e.message}`);
  }
  try {
    const checkCol = await pool3.query(
      "SELECT 1 FROM information_schema.columns WHERE table_name='receipts' AND column_name='reconciliation_id' LIMIT 1"
    );
    if ((checkCol.rowCount || 0) === 0) {
      console.log("[Migration] Adding receipts.reconciliation_id column...");
      await pool3.query("ALTER TABLE receipts ADD COLUMN reconciliation_id varchar");
      result.applied.push("receipts.reconciliation_id");
    }
  } catch (e) {
    console.error(`[Migration] Failed to add receipts.reconciliation_id: ${e.message}`);
    result.errors.push(`receipts.reconciliation_id: ${e.message}`);
  }
  try {
    await pool3.query(`
      CREATE TABLE IF NOT EXISTS currencies (
        code varchar(3) PRIMARY KEY,
        name text NOT NULL,
        symbol text NOT NULL,
        is_active boolean NOT NULL DEFAULT true
      );
    `);
    await pool3.query(`
      INSERT INTO currencies (code, name, symbol) VALUES 
      ('USD', 'US Dollar', '$'),
      ('EUR', 'Euro', '\u20AC'),
      ('GBP', 'British Pound', '\xA3'),
      ('SAR', 'Saudi Riyal', '\uFDFC'),
      ('AED', 'UAE Dirham', '\u062F.\u0625')
      ON CONFLICT (code) DO NOTHING;
    `);
    result.applied.push("currencies table");
  } catch (e) {
    console.error(`[Migration] Failed to create currencies: ${e.message}`);
    result.errors.push(`currencies: ${e.message}`);
  }
  try {
    await pool3.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        code text NOT NULL,
        name text NOT NULL,
        account_type text NOT NULL,
        account_subtype text NOT NULL,
        parent_id varchar,
        is_system boolean NOT NULL DEFAULT false,
        is_active boolean NOT NULL DEFAULT true,
        description text,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push("accounts table");
  } catch (e) {
    console.error(`[Migration] Failed to create accounts: ${e.message}`);
    result.errors.push(`accounts: ${e.message}`);
  }
  try {
    await pool3.query(`
      CREATE TABLE IF NOT EXISTS taxes (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        code text NOT NULL,
        name text NOT NULL,
        rate numeric(10,4) NOT NULL,
        tax_type text NOT NULL,
        calculation_type text NOT NULL,
        liability_account_id varchar REFERENCES accounts(id),
        jurisdiction text,
        threshold_amount numeric(15,2),
        threshold_period text,
        threshold_applies_to text,
        effective_from timestamp NOT NULL,
        effective_to timestamp,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push("taxes table");
  } catch (e) {
    console.error(`[Migration] Failed to create taxes: ${e.message}`);
    result.errors.push(`taxes: ${e.message}`);
  }
  try {
    await pool3.query(`
      CREATE TABLE IF NOT EXISTS items (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        type text NOT NULL,
        sku text NOT NULL,
        name text NOT NULL,
        description text,
        unit_of_measure text NOT NULL DEFAULT 'pcs',
        sales_price numeric(15,2),
        cost_price numeric(15,2),
        stock_quantity numeric(15,4) NOT NULL DEFAULT 0,
        reorder_level numeric(15,4) DEFAULT 0,
        sales_account_id varchar REFERENCES accounts(id),
        cost_account_id varchar REFERENCES accounts(id),
        inventory_account_id varchar REFERENCES accounts(id),
        default_tax_id varchar REFERENCES taxes(id),
        is_active boolean NOT NULL DEFAULT true,
        tracking_type text NOT NULL DEFAULT 'none',
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push("items table");
  } catch (e) {
    console.error(`[Migration] Failed to create items: ${e.message}`);
    result.errors.push(`items: ${e.message}`);
  }
  try {
    await pool3.query(`
      CREATE TABLE IF NOT EXISTS exchange_rates (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        from_currency varchar(3) NOT NULL REFERENCES currencies(code),
        to_currency varchar(3) NOT NULL REFERENCES currencies(code),
        rate numeric(15,6) NOT NULL,
        date timestamp NOT NULL,
        source text,
        created_by varchar REFERENCES users(id),
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push("exchange_rates table");
  } catch (e) {
    console.error(`[Migration] Failed to create exchange_rates: ${e.message}`);
    result.errors.push(`exchange_rates: ${e.message}`);
  }
  try {
    await pool3.query(`
      CREATE TABLE IF NOT EXISTS warehouses (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        code text NOT NULL,
        name text NOT NULL,
        address jsonb,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push("warehouses table");
  } catch (e) {
    console.error(`[Migration] Failed to create warehouses: ${e.message}`);
    result.errors.push(`warehouses: ${e.message}`);
  }
  try {
    await pool3.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        type text NOT NULL,
        code text,
        name text NOT NULL,
        display_name text,
        email text,
        phone text,
        website text,
        tax_number text,
        registration_number text,
        billing_address jsonb,
        shipping_address jsonb,
        currency varchar(3) NOT NULL DEFAULT 'USD',
        payment_terms_days integer NOT NULL DEFAULT 30,
        credit_limit numeric(15,2),
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push("contacts table");
  } catch (e) {
    console.error(`[Migration] Failed to create contacts: ${e.message}`);
    result.errors.push(`contacts: ${e.message}`);
  }
  try {
    await pool3.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        code text NOT NULL,
        name text NOT NULL,
        description text,
        budget numeric(15,2),
        start_date timestamp,
        end_date timestamp,
        status text NOT NULL DEFAULT 'active',
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push("projects table");
  } catch (e) {
    console.error(`[Migration] Failed to create projects: ${e.message}`);
    result.errors.push(`projects: ${e.message}`);
  }
  try {
    await pool3.query(`
      CREATE TABLE IF NOT EXISTS bank_accounts (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        account_id varchar NOT NULL REFERENCES accounts(id),
        name text NOT NULL,
        bank_name text,
        account_number text,
        currency varchar(3) NOT NULL DEFAULT 'USD',
        opening_balance numeric(15,2) NOT NULL DEFAULT 0,
        opening_balance_date timestamp NOT NULL,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push("bank_accounts table");
  } catch (e) {
    console.error(`[Migration] Failed to create bank_accounts: ${e.message}`);
    result.errors.push(`bank_accounts: ${e.message}`);
  }
  try {
    await pool3.query(`
      CREATE TABLE IF NOT EXISTS bank_reconciliations (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        bank_account_id varchar NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
        reconciliation_date timestamp NOT NULL,
        statement_balance numeric(15,2) NOT NULL,
        book_balance numeric(15,2) NOT NULL,
        difference numeric(15,2) NOT NULL DEFAULT 0,
        status text NOT NULL DEFAULT 'in_progress',
        notes text,
        created_by varchar REFERENCES users(id),
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push("bank_reconciliations table");
  } catch (e) {
    console.error(`[Migration] Failed to create bank_reconciliations: ${e.message}`);
    result.errors.push(`bank_reconciliations: ${e.message}`);
  }
  try {
    await pool3.query(`
      CREATE TABLE IF NOT EXISTS journals (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        journal_number text NOT NULL,
        date timestamp NOT NULL,
        description text,
        reference text,
        source_type text,
        source_id varchar,
        total_amount numeric(15,2) NOT NULL,
        created_by varchar REFERENCES users(id),
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push("journals table");
  } catch (e) {
    console.error(`[Migration] Failed to create journals: ${e.message}`);
    result.errors.push(`journals: ${e.message}`);
  }
  try {
    await pool3.query(`
      CREATE TABLE IF NOT EXISTS sales_quotes (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        quote_number text NOT NULL,
        customer_id varchar NOT NULL REFERENCES contacts(id),
        date timestamp NOT NULL,
        valid_until timestamp,
        status text NOT NULL DEFAULT 'draft',
        currency varchar(3) NOT NULL,
        fx_rate numeric(10,6) NOT NULL DEFAULT 1,
        subtotal numeric(15,2) NOT NULL DEFAULT 0,
        tax_total numeric(15,2) NOT NULL DEFAULT 0,
        total numeric(15,2) NOT NULL DEFAULT 0,
        notes text,
        created_by varchar REFERENCES users(id),
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push("sales_quotes table");
  } catch (e) {
    console.error(`[Migration] Failed to create sales_quotes: ${e.message}`);
    result.errors.push(`sales_quotes: ${e.message}`);
  }
  try {
    await pool3.query(`
      CREATE TABLE IF NOT EXISTS sales_orders (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        order_number text NOT NULL,
        quote_id varchar REFERENCES sales_quotes(id),
        customer_id varchar NOT NULL REFERENCES contacts(id),
        date timestamp NOT NULL,
        delivery_date timestamp,
        status text NOT NULL DEFAULT 'pending',
        currency varchar(3) NOT NULL,
        fx_rate numeric(10,6) NOT NULL DEFAULT 1,
        subtotal numeric(15,2) NOT NULL DEFAULT 0,
        tax_total numeric(15,2) NOT NULL DEFAULT 0,
        total numeric(15,2) NOT NULL DEFAULT 0,
        notes text,
        created_by varchar REFERENCES users(id),
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push("sales_orders table");
  } catch (e) {
    console.error(`[Migration] Failed to create sales_orders: ${e.message}`);
    result.errors.push(`sales_orders: ${e.message}`);
  }
  try {
    await pool3.query(`
      CREATE TABLE IF NOT EXISTS sales_invoices (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        invoice_number text NOT NULL,
        order_id varchar REFERENCES sales_orders(id),
        customer_id varchar NOT NULL REFERENCES contacts(id),
        date timestamp NOT NULL,
        due_date timestamp NOT NULL,
        status text NOT NULL DEFAULT 'draft',
        currency varchar(3) NOT NULL,
        fx_rate numeric(10,6) NOT NULL DEFAULT 1,
        subtotal numeric(15,2) NOT NULL DEFAULT 0,
        tax_total numeric(15,2) NOT NULL DEFAULT 0,
        total numeric(15,2) NOT NULL DEFAULT 0,
        paid_amount numeric(15,2) NOT NULL DEFAULT 0,
        notes text,
        journal_id varchar REFERENCES journals(id),
        created_by varchar REFERENCES users(id),
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push("sales_invoices table");
  } catch (e) {
    console.error(`[Migration] Failed to create sales_invoices: ${e.message}`);
    result.errors.push(`sales_invoices: ${e.message}`);
  }
  try {
    await pool3.query(`
      CREATE TABLE IF NOT EXISTS document_lines (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        document_type text NOT NULL,
        document_id varchar NOT NULL,
        item_id varchar REFERENCES items(id),
        tax_id varchar REFERENCES taxes(id),
        description text NOT NULL,
        quantity numeric(15,4) NOT NULL,
        unit_price numeric(15,2) NOT NULL,
        discount_percentage numeric(5,2) NOT NULL DEFAULT 0,
        line_total numeric(15,2) NOT NULL,
        tax_amount numeric(15,2) NOT NULL DEFAULT 0,
        line_number integer NOT NULL,
        project_id varchar REFERENCES projects(id)
      );
    `);
    result.applied.push("document_lines table");
  } catch (e) {
    console.error(`[Migration] Failed to create document_lines: ${e.message}`);
    result.errors.push(`document_lines: ${e.message}`);
  }
  try {
    await pool3.query(`
      CREATE TABLE IF NOT EXISTS bills (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        bill_number text NOT NULL,
        supplier_reference text,
        po_id varchar REFERENCES purchase_orders(id),
        supplier_id varchar NOT NULL REFERENCES contacts(id),
        date timestamp NOT NULL,
        due_date timestamp NOT NULL,
        status text NOT NULL DEFAULT 'draft',
        currency varchar(3) NOT NULL,
        fx_rate numeric(10,6) NOT NULL DEFAULT 1,
        subtotal numeric(15,2) NOT NULL DEFAULT 0,
        tax_total numeric(15,2) NOT NULL DEFAULT 0,
        total numeric(15,2) NOT NULL DEFAULT 0,
        paid_amount numeric(15,2) NOT NULL DEFAULT 0,
        notes text,
        journal_id varchar REFERENCES journals(id),
        created_by varchar REFERENCES users(id),
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push("bills table");
  } catch (e) {
    console.error(`[Migration] Failed to create bills: ${e.message}`);
    result.errors.push(`bills: ${e.message}`);
  }
  try {
    await pool3.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        expense_number text NOT NULL,
        payee text NOT NULL,
        date timestamp NOT NULL,
        amount numeric(15,2) NOT NULL,
        tax_amount numeric(15,2) NOT NULL DEFAULT 0,
        category text,
        description text,
        paid_from_account_id varchar REFERENCES bank_accounts(id),
        expense_account_id varchar REFERENCES accounts(id),
        project_id varchar REFERENCES projects(id),
        status text NOT NULL DEFAULT 'pending',
        journal_id varchar REFERENCES journals(id),
        created_by varchar REFERENCES users(id),
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push("expenses table");
  } catch (e) {
    console.error(`[Migration] Failed to create expenses: ${e.message}`);
    result.errors.push(`expenses: ${e.message}`);
  }
  try {
    await pool3.query(`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        po_number text NOT NULL,
        supplier_id varchar NOT NULL REFERENCES contacts(id),
        date timestamp NOT NULL,
        delivery_date timestamp,
        status text NOT NULL DEFAULT 'pending',
        currency varchar(3) NOT NULL,
        fx_rate numeric(10,6) NOT NULL DEFAULT 1,
        subtotal numeric(15,2) NOT NULL DEFAULT 0,
        tax_total numeric(15,2) NOT NULL DEFAULT 0,
        total numeric(15,2) NOT NULL DEFAULT 0,
        notes text,
        created_by varchar REFERENCES users(id),
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push("purchase_orders table");
  } catch (e) {
    console.error(`[Migration] Failed to create purchase_orders: ${e.message}`);
    result.errors.push(`purchase_orders: ${e.message}`);
  }
  try {
    await pool3.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        payment_number text NOT NULL,
        vendor_id varchar NOT NULL REFERENCES contacts(id),
        vendor_name text NOT NULL,
        date timestamp NOT NULL,
        amount numeric(15,2) NOT NULL,
        payment_method text NOT NULL,
        reference text,
        description text,
        bank_account_id varchar REFERENCES bank_accounts(id),
        status text NOT NULL DEFAULT 'pending',
        currency varchar(3) NOT NULL DEFAULT 'USD',
        fx_rate numeric(10,6) NOT NULL DEFAULT 1,
        reconciled boolean NOT NULL DEFAULT false,
        reconciliation_id varchar REFERENCES bank_reconciliations(id),
        journal_id varchar REFERENCES journals(id),
        created_by varchar REFERENCES users(id),
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push("payments table");
  } catch (e) {
    console.error(`[Migration] Failed to create payments: ${e.message}`);
    result.errors.push(`payments: ${e.message}`);
  }
  try {
    await pool3.query(`
      CREATE TABLE IF NOT EXISTS receipts (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        receipt_number text NOT NULL,
        customer_id varchar NOT NULL REFERENCES contacts(id),
        customer_name text NOT NULL,
        date timestamp NOT NULL,
        amount numeric(15,2) NOT NULL,
        payment_method text NOT NULL,
        reference text,
        description text,
        bank_account_id varchar REFERENCES bank_accounts(id),
        status text NOT NULL DEFAULT 'received',
        currency varchar(3) NOT NULL DEFAULT 'USD',
        fx_rate numeric(10,6) NOT NULL DEFAULT 1,
        reconciled boolean NOT NULL DEFAULT false,
        reconciliation_id varchar REFERENCES bank_reconciliations(id),
        journal_id varchar REFERENCES journals(id),
        created_by varchar REFERENCES users(id),
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    result.applied.push("receipts table");
  } catch (e) {
    console.error(`[Migration] Failed to create receipts: ${e.message}`);
    result.errors.push(`receipts: ${e.message}`);
  }
  console.log(`[Migration] Completed: ${result.applied.length} upgrades applied, ${result.errors.length} errors`);
  if (result.applied.length > 0) {
    console.log("[Migration] Applied:", result.applied.join(", "));
  }
  if (result.errors.length > 0) {
    console.error("[Migration] Errors:", result.errors.join("; "));
  }
  return result;
}

// server/serverless.ts
init_db();

// server/utils/sanitization.ts
function sanitizeString(input) {
  if (!input || typeof input !== "string") return "";
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "").replace(/on\w+\s*=\s*["'][^"']*["']/gi, "").replace(/javascript:/gi, "").trim();
}
function sanitizeObject(obj) {
  const sanitized = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      if (typeof value === "string") {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        sanitized[key] = sanitizeObject(value);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(
          (item) => typeof item === "string" ? sanitizeString(item) : item
        );
      } else {
        sanitized[key] = value;
      }
    }
  }
  return sanitized;
}

// server/middleware/sanitize.ts
init_sendError();
function sanitizeMiddleware(req, res, next) {
  try {
    if (req.body && typeof req.body === "object") {
      req.body = sanitizeObject(req.body);
    }
    if (req.query && typeof req.query === "object") {
      req.query = sanitizeObject(req.query);
    }
    if (req.params && typeof req.params === "object") {
      req.params = sanitizeObject(req.params);
    }
    next();
  } catch (error) {
    console.error("Sanitization error:", error);
    serverError(res, "Request processing error");
    return;
  }
}

// server/middleware/successEnvelope.ts
function successEnvelopeMiddleware(_req, res, next) {
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    try {
      const status = res.statusCode || 200;
      const isSuccess = status >= 200 && status < 300;
      if (!isSuccess) {
        return originalJson(body);
      }
      const isObject = body !== null && typeof body === "object";
      const hasData = isObject && Object.prototype.hasOwnProperty.call(body, "data");
      const isSuccessAck = isObject && Object.keys(body).length === 1 && body.success === true;
      const isErrorShape = isObject && Object.prototype.hasOwnProperty.call(body, "error");
      if (hasData || isSuccessAck || isErrorShape) {
        return originalJson(body);
      }
      return originalJson({ data: body });
    } catch {
      return originalJson(body);
    }
  };
  next();
}

// server/serverless.ts
init_sendError();
async function createApp() {
  const app = express();
  app.use((req, res, next) => {
    const allowedOrigins = [
      "https://logledger-pro.com",
      "https://www.logledger-pro.com",
      "http://localhost:5173",
      "http://localhost:3000",
      // Capacitor mobile apps
      "capacitor://localhost",
      "ionic://localhost",
      "http://localhost",
      "https://localhost"
    ];
    const origin = req.headers.origin;
    if (!origin || origin === "null" || allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin || "*");
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, X-CSRF-Token");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
    next();
  });
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    // Disable COOP to allow Firebase popup auth to work properly
    crossOriginOpenerPolicy: false
  }));
  const authLimiter = rateLimit2({
    windowMs: 15 * 60 * 1e3,
    max: 5,
    message: "Too many authentication attempts, please try again later",
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", authLimiter);
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(sanitizeMiddleware);
  app.use(successEnvelopeMiddleware);
  app.use(session2({
    secret: process.env.SESSION_SECRET || "log-ledger-secret-key-change-in-production",
    name: "ledger.sid",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1e3,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      // In production we need cross-site cookie for frontend on different domain
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    }
  }));
  try {
    await ensureSchemaUpgrades(pool);
  } catch {
  }
  await registerRoutes(app);
  app.all("/api/*", (_req, res) => {
    return notFound(res, "API endpoint not found");
  });
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("Error:", err);
    return sendError(res, status, message);
  });
  return app;
}
var appPromise = null;
async function handler(req, res) {
  console.log(`[Vercel] ${req.method} ${req.url}`);
  console.log("[Vercel] Environment check:", {
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasFirebaseKey: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
    nodeEnv: process.env.NODE_ENV
  });
  try {
    if (!appPromise) {
      console.log("[Vercel] Initializing Express app...");
      appPromise = createApp().catch((err) => {
        console.error("[Vercel] Failed to create app:", err);
        appPromise = null;
        throw err;
      });
    }
    const app = await appPromise;
    console.log("[Vercel] App ready, handling request...");
    return app(req, res);
  } catch (error) {
    console.error("[Vercel] Handler error:", error);
    console.error("[Vercel] Error stack:", error instanceof Error ? error.stack : "No stack");
    if (!res.headersSent) {
      return serverError(res, error instanceof Error ? error.message : "Unknown error", {
        details: process.env.NODE_ENV === "development" ? error instanceof Error ? error.stack : String(error) : void 0
      });
    }
  }
}
export {
  handler as default
};
