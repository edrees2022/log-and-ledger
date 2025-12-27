import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, integer, boolean, jsonb, foreignKey, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ==== SESSION ====
export const session = pgTable("session", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire", { precision: 6 }).notNull(),
});

// ==== CURRENCIES ====
export const currencies = pgTable("currencies", {
  code: varchar("code", { length: 3 }).primaryKey(), // USD, EUR, SAR, etc
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  is_active: boolean("is_active").notNull().default(true),
});

// ==== EXCHANGE RATES ====
export const exchange_rates = pgTable("exchange_rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  from_currency: varchar("from_currency", { length: 3 }).notNull().references(() => currencies.code),
  to_currency: varchar("to_currency", { length: 3 }).notNull().references(() => currencies.code),
  rate: decimal("rate", { precision: 15, scale: 6 }).notNull(),
  date: timestamp("date").notNull(),
  source: text("source"), // manual, api, etc
  created_by: varchar("created_by").references(() => users.id),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ==== COMPANIES ====
export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  legal_name: text("legal_name"),
  tax_number: text("tax_number"),
  registration_number: text("registration_number"),
  logo_url: text("logo_url"),
  address: jsonb("address"),
  contacts: jsonb("contacts"), // phone, email, etc
  country: text("country").default("United Arab Emirates"),
  city: text("city"),
  zip: text("zip"),
  zip_code: text("zip_code"),
  email: text("email"),
  phone: text("phone"),
  base_currency: varchar("base_currency", { length: 3 }).notNull().default("USD"),
  fiscal_year_start: integer("fiscal_year_start").notNull().default(1), // 1=Jan, 4=Apr, etc
  date_format: text("date_format").notNull().default("DD/MM/YYYY"),
  timezone: text("timezone").notNull().default("Asia/Dubai"),
  number_format: text("number_format").notNull().default("1,234.56"),
  declaration_text: text("declaration_text"),
  firebase_user_id: text("firebase_user_id"), // Firebase UID for linking to Firebase users
  parent_company_id: varchar("parent_company_id"), // For multi-entity structure
  // Invoice settings
  invoice_prefix: text("invoice_prefix").default("INV-"),
  next_invoice_number: integer("next_invoice_number").default(1),
  payment_terms_days: integer("payment_terms_days").default(30),
  default_tax_rate: decimal("default_tax_rate", { precision: 5, scale: 2 }).default("5.00"),
  // Quotation settings
  quote_prefix: text("quote_prefix").default("QT-"),
  next_quote_number: integer("next_quote_number").default(1),
  quote_validity_days: integer("quote_validity_days").default(30),
  // Notification settings
  email_notifications: boolean("email_notifications").default(true),
  sms_notifications: boolean("sms_notifications").default(false),
  invoice_reminders: boolean("invoice_reminders").default(true),
  payment_alerts: boolean("payment_alerts").default(true),
  low_stock_alerts: boolean("low_stock_alerts").default(true),
  // Security settings
  two_factor_required: boolean("two_factor_required").default(false),
  session_timeout_minutes: integer("session_timeout_minutes").default(480), // 8 hours
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
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  parentCompanyFk: foreignKey({
    columns: [table.parent_company_id],
    foreignColumns: [table.id],
  }),
  parentCompanyIdx: index("companies_parent_company_idx").on(table.parent_company_id),
}));

// ==== USERS ====
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  full_name: text("full_name").notNull(),
  role: text("role").notNull().default("viewer"), // owner, accountant, sales, viewer
  language: text("language").notNull().default("en"),
  timezone: text("timezone").notNull().default("UTC"),
  theme: text("theme").notNull().default("auto"), // light, dark, auto
  is_active: boolean("is_active").notNull().default(true),
  legal_consent_accepted: boolean("legal_consent_accepted").notNull().default(false),
  legal_consent_date: timestamp("legal_consent_date"),
  legal_consent_version: text("legal_consent_version"),
  last_login_at: timestamp("last_login_at"),
  two_factor_secret: text("two_factor_secret"), // Base32 secret for TOTP
  two_factor_enabled: boolean("two_factor_enabled").notNull().default(false),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  companyIdx: index("users_company_idx").on(table.company_id),
  emailIdx: index("users_email_idx").on(table.email),
  usernameIdx: index("users_username_idx").on(table.username),
}));

// ==== API KEYS ====
export const api_keys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // e.g., "Zapier Integration"
  key_hash: text("key_hash").notNull(), // Store hashed key, never plain text
  prefix: text("prefix").notNull(), // Store first few chars for display
  scopes: jsonb("scopes").notNull().default([]), // ["read:journals", "write:invoices"]
  last_used_at: timestamp("last_used_at"),
  expires_at: timestamp("expires_at"),
  is_active: boolean("is_active").notNull().default(true),
  created_by: varchar("created_by").references(() => users.id),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ==== USER PERMISSIONS ====
export const user_permissions = pgTable("user_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  module: text("module").notNull(), // dashboard, sales, purchases, banking, reports, settings, accounts, contacts, items
  can_view: boolean("can_view").notNull().default(false),
  can_create: boolean("can_create").notNull().default(false),
  can_edit: boolean("can_edit").notNull().default(false),
  can_delete: boolean("can_delete").notNull().default(false),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ==== CHART OF ACCOUNTS ====
export const accounts = pgTable("accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  name: text("name").notNull(),
  name_ar: text("name_ar"), // Arabic name for bilingual display
  account_type: text("account_type").notNull(), // asset, liability, equity, revenue, expense
  account_subtype: text("account_subtype").notNull(), // current_asset, fixed_asset, current_liability, etc
  parent_id: varchar("parent_id"),
  is_system: boolean("is_system").notNull().default(false),
  is_active: boolean("is_active").notNull().default(true),
  description: text("description"),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  companyIdx: index("accounts_company_idx").on(table.company_id),
  codeIdx: index("accounts_code_idx").on(table.code),
  parentIdIdx: index("accounts_parent_id_idx").on(table.parent_id),
}));

// ==== TAXES ====
export const taxes = pgTable("taxes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  name: text("name").notNull(),
  rate: decimal("rate", { precision: 10, scale: 4 }).notNull(),
  tax_type: text("tax_type").notNull(), // vat, sales_tax, corporate_tax, withholding, custom
  calculation_type: text("calculation_type").notNull(), // inclusive, exclusive
  liability_account_id: varchar("liability_account_id").references(() => accounts.id),
  jurisdiction: text("jurisdiction"),
  // Optional threshold settings (global, user-defined)
  threshold_amount: decimal("threshold_amount", { precision: 15, scale: 2 }),
  threshold_period: text("threshold_period"), // annual, monthly, rolling12 (free text allowed)
  threshold_applies_to: text("threshold_applies_to"), // turnover, income, other
  effective_from: timestamp("effective_from").notNull(),
  effective_to: timestamp("effective_to"),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ==== CONTACTS (Customers/Suppliers) ====
export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // customer, supplier, both
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
  linked_company_id: varchar("linked_company_id"), // For inter-company transactions
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  linkedCompanyFk: foreignKey({
    columns: [table.linked_company_id],
    foreignColumns: [companies.id],
  }),
  companyIdx: index("contacts_company_idx").on(table.company_id),
  emailIdx: index("contacts_email_idx").on(table.email),
  typeIdx: index("contacts_type_idx").on(table.type),
}));

export const contact_portal_users = pgTable("contact_portal_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contact_id: varchar("contact_id").notNull().references(() => contacts.id, { onDelete: "cascade" }),
  email: text("email").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  status: text("status").notNull().default("active"), // active, inactive
  last_login_at: timestamp("last_login_at"),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ==== ITEMS (Products/Services) ====
export const items = pgTable("items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // inventory, service
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
  tracking_type: text("tracking_type").notNull().default("none"), // none, batch, serial
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  companyIdx: index("items_company_idx").on(table.company_id),
  skuIdx: index("items_sku_idx").on(table.sku),
  typeIdx: index("items_type_idx").on(table.type),
}));

// ==== WAREHOUSES ====
export const warehouses = pgTable("warehouses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  name: text("name").notNull(),
  location: text("location"),
  address: jsonb("address"),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ==== BATCHES (Lot Tracking) ====
export const batches = pgTable("batches", {
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
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ==== STOCK TRANSFERS ====
export const stock_transfers = pgTable("stock_transfers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  transfer_number: text("transfer_number").notNull(),
  from_warehouse_id: varchar("from_warehouse_id").notNull().references(() => warehouses.id),
  to_warehouse_id: varchar("to_warehouse_id").notNull().references(() => warehouses.id),
  date: timestamp("date").notNull(),
  status: text("status").notNull().default("draft"), // draft, in_transit, completed, cancelled
  notes: text("notes"),
  created_by: varchar("created_by").references(() => users.id),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const stock_transfer_items = pgTable("stock_transfer_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transfer_id: varchar("transfer_id").notNull().references(() => stock_transfers.id, { onDelete: "cascade" }),
  item_id: varchar("item_id").notNull().references(() => items.id),
  batch_id: varchar("batch_id").references(() => batches.id), // Optional: if item is batch-tracked
  quantity: decimal("quantity", { precision: 15, scale: 4 }).notNull(),
});

// ==== BANK/CASH ACCOUNTS ====
export const bank_accounts = pgTable("bank_accounts", {
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
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ==== BANK STATEMENT LINES ====
export const bank_statement_lines = pgTable("bank_statement_lines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  bank_account_id: varchar("bank_account_id").references(() => bank_accounts.id),
  date: timestamp("date").notNull(),
  description: text("description"),
  reference: text("reference"),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(), // positive deposit, negative withdrawal
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  matched: boolean("matched").notNull().default(false),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ==== BANK RECONCILIATIONS ====
export const bank_reconciliations = pgTable("bank_reconciliations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  bank_account_id: varchar("bank_account_id").notNull().references(() => bank_accounts.id, { onDelete: "cascade" }),
  reconciliation_date: timestamp("reconciliation_date").notNull(),
  statement_balance: decimal("statement_balance", { precision: 15, scale: 2 }).notNull(),
  book_balance: decimal("book_balance", { precision: 15, scale: 2 }).notNull(),
  difference: decimal("difference", { precision: 15, scale: 2 }).notNull().default("0"),
  status: text("status").notNull().default("in_progress"), // in_progress, completed, cancelled
  notes: text("notes"),
  created_by: varchar("created_by").references(() => users.id),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ==== BANK RECONCILIATION ITEMS ====
export const bank_reconciliation_items = pgTable("bank_reconciliation_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reconciliation_id: varchar("reconciliation_id").notNull().references(() => bank_reconciliations.id, { onDelete: "cascade" }),
  transaction_type: text("transaction_type").notNull(), // payment, receipt, bank_charge, bank_interest, adjustment
  transaction_id: varchar("transaction_id"), // Reference to payment or receipt
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  transaction_date: timestamp("transaction_date").notNull(),
  description: text("description"),
  cleared: boolean("cleared").notNull().default(false),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ==== COST CENTERS ====
export const cost_centers = pgTable("cost_centers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  name: text("name").notNull(),
  parent_id: varchar("parent_id"), // Self-referencing for hierarchy
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ==== JOURNALS (General Ledger Entries) ====
export const journals = pgTable("journals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  journal_number: text("journal_number").notNull(),
  date: timestamp("date").notNull(),
  description: text("description"),
  reference: text("reference"),
  source_type: text("source_type"), // invoice, bill, payment, manual, etc
  source_id: varchar("source_id"),
  total_amount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  created_by: varchar("created_by").references(() => users.id),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  companyIdx: index("journals_company_idx").on(table.company_id),
  dateIdx: index("journals_date_idx").on(table.date),
  journalNumberIdx: index("journals_journal_number_idx").on(table.journal_number),
}));

export const journal_lines = pgTable("journal_lines", {
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
  cost_center_id: varchar("cost_center_id").references(() => cost_centers.id),
}, (table) => ({
  journalIdx: index("journal_lines_journal_idx").on(table.journal_id),
  accountIdx: index("journal_lines_account_idx").on(table.account_id),
}));

// ==== ARCHIVED JOURNALS (Partitioning Strategy) ====
export const journals_archive = pgTable("journals_archive", {
  id: varchar("id").primaryKey(), // Keep original ID
  company_id: varchar("company_id").notNull(), // No FK constraint to allow detaching
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
  fiscal_year: integer("fiscal_year").notNull(),
});

export const journal_lines_archive = pgTable("journal_lines_archive", {
  id: varchar("id").primaryKey(), // Keep original ID
  journal_id: varchar("journal_id").notNull().references(() => journals_archive.id, { onDelete: "cascade" }),
  account_id: varchar("account_id").notNull(), // No FK to allow account deletion if needed (though unlikely)
  description: text("description"),
  debit: decimal("debit", { precision: 15, scale: 2 }).notNull().default("0"),
  credit: decimal("credit", { precision: 15, scale: 2 }).notNull().default("0"),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  fx_rate: decimal("fx_rate", { precision: 10, scale: 6 }).notNull().default("1"),
  base_debit: decimal("base_debit", { precision: 15, scale: 2 }).notNull().default("0"),
  base_credit: decimal("base_credit", { precision: 15, scale: 2 }).notNull().default("0"),
  project_id: varchar("project_id"),
  cost_center_id: varchar("cost_center_id"),
});

// ==== SALES DOCUMENTS ====
export const sales_quotes = pgTable("sales_quotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  quote_number: text("quote_number").notNull(),
  customer_id: varchar("customer_id").notNull().references(() => contacts.id),
  project_id: varchar("project_id").references(() => projects.id),
  date: timestamp("date").notNull(),
  valid_until: timestamp("valid_until"),
  status: text("status").notNull().default("draft"), // draft, sent, accepted, rejected, expired
  currency: varchar("currency", { length: 3 }).notNull(),
  fx_rate: decimal("fx_rate", { precision: 10, scale: 6 }).notNull().default("1"),
  subtotal: decimal("subtotal", { precision: 15, scale: 2 }).notNull().default("0"),
  tax_total: decimal("tax_total", { precision: 15, scale: 2 }).notNull().default("0"),
  total: decimal("total", { precision: 15, scale: 2 }).notNull().default("0"),
  notes: text("notes"),
  terms: text("terms"),
  created_by: varchar("created_by").references(() => users.id),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const sales_orders = pgTable("sales_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  order_number: text("order_number").notNull(),
  quote_id: varchar("quote_id").references(() => sales_quotes.id),
  customer_id: varchar("customer_id").notNull().references(() => contacts.id),
  date: timestamp("date").notNull(),
  delivery_date: timestamp("delivery_date"),
  status: text("status").notNull().default("pending"), // pending, confirmed, shipped, delivered, cancelled
  currency: varchar("currency", { length: 3 }).notNull(),
  fx_rate: decimal("fx_rate", { precision: 10, scale: 6 }).notNull().default("1"),
  subtotal: decimal("subtotal", { precision: 15, scale: 2 }).notNull().default("0"),
  tax_total: decimal("tax_total", { precision: 15, scale: 2 }).notNull().default("0"),
  total: decimal("total", { precision: 15, scale: 2 }).notNull().default("0"),
  notes: text("notes"),
  created_by: varchar("created_by").references(() => users.id),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const sales_invoices = pgTable("sales_invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  invoice_number: text("invoice_number").notNull(),
  order_id: varchar("order_id").references(() => sales_orders.id),
  customer_id: varchar("customer_id").notNull().references(() => contacts.id),
  date: timestamp("date").notNull(),
  due_date: timestamp("due_date").notNull(),
  status: text("status").notNull().default("draft"), // draft, sent, paid, overdue, cancelled
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
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  companyIdx: index("sales_invoices_company_idx").on(table.company_id),
  customerIdx: index("sales_invoices_customer_idx").on(table.customer_id),
  dateIdx: index("sales_invoices_date_idx").on(table.date),
  statusIdx: index("sales_invoices_status_idx").on(table.status),
}));

// ==== DOCUMENT LINES (shared for quotes, orders, invoices) ====
export const document_lines = pgTable("document_lines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  document_type: text("document_type").notNull(), // quote, order, invoice, bill
  document_id: varchar("document_id").notNull(),
  item_id: varchar("item_id").references(() => items.id),
  warehouse_id: varchar("warehouse_id").references(() => warehouses.id), // For inventory tracking
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
  project_id: varchar("project_id").references(() => projects.id),
});

// ==== PURCHASE DOCUMENTS ====
export const purchase_orders = pgTable("purchase_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  po_number: text("po_number").notNull(),
  supplier_id: varchar("supplier_id").notNull().references(() => contacts.id),
  date: timestamp("date").notNull(),
  delivery_date: timestamp("delivery_date"),
  status: text("status").notNull().default("pending"), // pending, confirmed, received, cancelled
  currency: varchar("currency", { length: 3 }).notNull(),
  fx_rate: decimal("fx_rate", { precision: 10, scale: 6 }).notNull().default("1"),
  subtotal: decimal("subtotal", { precision: 15, scale: 2 }).notNull().default("0"),
  tax_total: decimal("tax_total", { precision: 15, scale: 2 }).notNull().default("0"),
  total: decimal("total", { precision: 15, scale: 2 }).notNull().default("0"),
  notes: text("notes"),
  created_by: varchar("created_by").references(() => users.id),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const bills = pgTable("bills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  bill_number: text("bill_number").notNull(),
  supplier_reference: text("supplier_reference"),
  po_id: varchar("po_id").references(() => purchase_orders.id),
  supplier_id: varchar("supplier_id").notNull().references(() => contacts.id),
  date: timestamp("date").notNull(),
  due_date: timestamp("due_date").notNull(),
  status: text("status").notNull().default("draft"), // draft, approved, paid, overdue
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
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  companyIdx: index("bills_company_idx").on(table.company_id),
  supplierIdx: index("bills_supplier_idx").on(table.supplier_id),
  dateIdx: index("bills_date_idx").on(table.date),
  statusIdx: index("bills_status_idx").on(table.status),
}));

// ==== EXPENSES ====
export const expenses = pgTable("expenses", {
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
  unit: text("unit"), // kWh, Liters, Gallons
  carbon_factor: decimal("carbon_factor", { precision: 10, scale: 4 }), // kgCO2 per unit
  description: text("description"),
  paid_from_account_id: varchar("paid_from_account_id").references(() => bank_accounts.id),
  expense_account_id: varchar("expense_account_id").references(() => accounts.id),
  project_id: varchar("project_id"), // will be defined later
  status: text("status").notNull().default("pending"), // pending, approved, paid
  journal_id: varchar("journal_id").references(() => journals.id),
  created_by: varchar("created_by").references(() => users.id),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  companyIdx: index("expenses_company_idx").on(table.company_id),
  dateIdx: index("expenses_date_idx").on(table.date),
  statusIdx: index("expenses_status_idx").on(table.status),
}));

// ==== PAYMENTS ====
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  payment_number: text("payment_number").notNull(),
  vendor_id: varchar("vendor_id").notNull().references(() => contacts.id),
  vendor_name: text("vendor_name").notNull(), // denormalized for performance
  date: timestamp("date").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  payment_method: text("payment_method").notNull(), // bank_transfer, credit_card, check, cash, online_payment
  reference: text("reference"), // related bill/expense reference
  description: text("description"),
  bank_account_id: varchar("bank_account_id").references(() => bank_accounts.id),
  status: text("status").notNull().default("pending"), // pending, scheduled, completed, failed, cancelled
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  fx_rate: decimal("fx_rate", { precision: 10, scale: 6 }).notNull().default("1"),
  reconciled: boolean("reconciled").notNull().default(false),
  reconciliation_id: varchar("reconciliation_id").references(() => bank_reconciliations.id),
  journal_id: varchar("journal_id").references(() => journals.id),
  created_by: varchar("created_by").references(() => users.id),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  companyIdx: index("payments_company_idx").on(table.company_id),
  vendorIdx: index("payments_vendor_idx").on(table.vendor_id),
  dateIdx: index("payments_date_idx").on(table.date),
}));

// ==== RECEIPTS ====
export const receipts = pgTable("receipts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  receipt_number: text("receipt_number").notNull(),
  customer_id: varchar("customer_id").notNull().references(() => contacts.id),
  customer_name: text("customer_name").notNull(), // denormalized for performance
  date: timestamp("date").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  payment_method: text("payment_method").notNull(), // bank_transfer, credit_card, check, cash, online_payment
  reference: text("reference"), // related invoice/sales reference
  description: text("description"),
  bank_account_id: varchar("bank_account_id").references(() => bank_accounts.id),
  status: text("status").notNull().default("received"), // received, pending, cleared, bounced
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  fx_rate: decimal("fx_rate", { precision: 10, scale: 6 }).notNull().default("1"),
  reconciled: boolean("reconciled").notNull().default(false),
  reconciliation_id: varchar("reconciliation_id").references(() => bank_reconciliations.id),
  journal_id: varchar("journal_id").references(() => journals.id),
  created_by: varchar("created_by").references(() => users.id),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  companyIdx: index("receipts_company_idx").on(table.company_id),
  customerIdx: index("receipts_customer_idx").on(table.customer_id),
  dateIdx: index("receipts_date_idx").on(table.date),
}));

// ==== SALES CREDIT NOTES ====
export const sales_credit_notes = pgTable("sales_credit_notes", {
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
  status: text("status").notNull().default("draft"), // draft, pending, applied, partially_applied, void
  notes: text("notes"),
  created_by: varchar("created_by").references(() => users.id),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ==== PURCHASE DEBIT NOTES ====
export const purchase_debit_notes = pgTable("purchase_debit_notes", {
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
  status: text("status").notNull().default("draft"), // draft, pending, applied, partially_applied, void
  notes: text("notes"),
  created_by: varchar("created_by").references(() => users.id),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ==== FIXED ASSETS ====
export const fixed_assets = pgTable("fixed_assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  asset_code: text("asset_code").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  cost: decimal("cost", { precision: 15, scale: 2 }).notNull(),
  acquisition_date: timestamp("acquisition_date").notNull(),
  useful_life_years: integer("useful_life_years").notNull(),
  depreciation_method: text("depreciation_method").notNull().default("straight_line"), // straight_line, declining_balance
  salvage_value: decimal("salvage_value", { precision: 15, scale: 2 }).notNull().default("0"),
  accumulated_depreciation: decimal("accumulated_depreciation", { precision: 15, scale: 2 }).notNull().default("0"),
  asset_account_id: varchar("asset_account_id").references(() => accounts.id),
  depreciation_account_id: varchar("depreciation_account_id").references(() => accounts.id),
  expense_account_id: varchar("expense_account_id").references(() => accounts.id),
  disposal_date: timestamp("disposal_date"),
  disposal_proceeds: decimal("disposal_proceeds", { precision: 15, scale: 2 }),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ==== ASSET DEPRECIATION ENTRIES ====
export const asset_depreciation_entries = pgTable("asset_depreciation_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  asset_id: varchar("asset_id").notNull().references(() => fixed_assets.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  journal_id: varchar("journal_id").references(() => journals.id),
  fiscal_year: integer("fiscal_year"),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ==== PROJECTS (Optional) ====
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  budget: decimal("budget", { precision: 15, scale: 2 }),
  start_date: timestamp("start_date"),
  end_date: timestamp("end_date"),
  status: text("status").notNull().default("active"), // active, completed, on_hold, cancelled
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ==== PROJECT PHASES ====
export const project_phases = pgTable("project_phases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  project_id: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  order_index: integer("order_index").notNull().default(0),
  budget: decimal("budget", { precision: 15, scale: 2 }),
  start_date: timestamp("start_date"),
  end_date: timestamp("end_date"),
  status: text("status").notNull().default("pending"), // pending, in_progress, completed, cancelled
  progress_percent: integer("progress_percent").notNull().default(0),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ==== PROJECT TASKS ====
export const project_tasks = pgTable("project_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  project_id: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  phase_id: varchar("phase_id").references(() => project_phases.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  status: text("status").notNull().default("todo"), // todo, in_progress, review, completed, cancelled
  assigned_to: varchar("assigned_to").references(() => users.id, { onDelete: "set null" }),
  due_date: timestamp("due_date"),
  completed_at: timestamp("completed_at"),
  estimated_hours: decimal("estimated_hours", { precision: 8, scale: 2 }),
  actual_hours: decimal("actual_hours", { precision: 8, scale: 2 }),
  order_index: integer("order_index").notNull().default(0),
  created_by: varchar("created_by").references(() => users.id),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ==== PROJECT TIME ENTRIES ====
export const project_time_entries = pgTable("project_time_entries", {
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
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ==== ATTACHMENTS ====
export const attachments = pgTable("attachments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entity_type: text("entity_type").notNull(), // invoice, bill, expense, contact, item, etc
  entity_id: varchar("entity_id").notNull(),
  filename: text("filename").notNull(),
  original_filename: text("original_filename").notNull(),
  file_size: integer("file_size").notNull(),
  mime_type: text("mime_type").notNull(),
  file_path: text("file_path").notNull(),
  ocr_text: text("ocr_text"),
  uploaded_by: varchar("uploaded_by").references(() => users.id),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ==== AUDIT LOG ====
export const audit_logs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  entity_type: text("entity_type").notNull(),
  entity_id: varchar("entity_id").notNull(),
  action: text("action").notNull(), // create, update, delete, sync_conflict
  changes: jsonb("changes"),
  actor_id: varchar("actor_id").references(() => users.id),
  actor_name: text("actor_name"),
  timestamp: timestamp("timestamp").notNull().default(sql`CURRENT_TIMESTAMP`),
  ip_address: text("ip_address"),
  user_agent: text("user_agent"),
});

// ==== STOCK MOVEMENTS ====
export const stock_movements = pgTable("stock_movements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  item_id: varchar("item_id").notNull().references(() => items.id, { onDelete: "restrict" }),
  warehouse_id: varchar("warehouse_id").notNull().references(() => warehouses.id, { onDelete: "restrict" }),
  transaction_type: text("transaction_type").notNull(), // purchase, sale, adjustment, transfer_in, transfer_out
  transaction_date: timestamp("transaction_date").notNull(),
  quantity: decimal("quantity", { precision: 15, scale: 4 }).notNull(),
  unit_cost: decimal("unit_cost", { precision: 15, scale: 4 }).notNull(),
  total_cost: decimal("total_cost", { precision: 15, scale: 2 }).notNull(),
  reference_type: text("reference_type"), // invoice, bill, adjustment
  reference_id: varchar("reference_id"),
  batch_id: varchar("batch_id").references(() => batches.id), // Added for batch tracking
  notes: text("notes"),
  created_by: varchar("created_by").references(() => users.id),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ==== PAYMENT ALLOCATIONS ====
export const payment_allocations = pgTable("payment_allocations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  payment_type: text("payment_type").notNull(), // receipt, payment
  payment_id: varchar("payment_id").notNull(), // references receipts.id or payments.id
  document_type: text("document_type").notNull(), // invoice, bill
  document_id: varchar("document_id").notNull(), // references sales_invoices.id or bills.id
  allocated_amount: decimal("allocated_amount", { precision: 15, scale: 2 }).notNull(),
  allocation_date: timestamp("allocation_date").notNull().default(sql`CURRENT_TIMESTAMP`),
  created_by: varchar("created_by").references(() => users.id),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ==== DOCUMENT SEQUENCES ====
export const document_sequences = pgTable("document_sequences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  document_type: text("document_type").notNull(), // invoice, bill, quote, order, payment, receipt, expense
  prefix: text("prefix").notNull(), // INV-, BILL-, QT-, etc
  next_number: integer("next_number").notNull().default(1),
  fiscal_year: integer("fiscal_year").notNull(),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ==== FISCAL PERIODS ====
export const fiscal_periods = pgTable("fiscal_periods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  period_name: text("period_name").notNull(), // Jan 2025, Q1 2025, FY 2025
  period_type: text("period_type").notNull(), // month, quarter, year
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date").notNull(),
  fiscal_year: integer("fiscal_year").notNull(),
  is_closed: boolean("is_closed").notNull().default(false),
  closed_by: varchar("closed_by").references(() => users.id),
  closed_at: timestamp("closed_at"),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ==== RECURRING TEMPLATES ====
export const recurring_templates = pgTable("recurring_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  template_name: text("template_name").notNull(),
  document_type: text("document_type").notNull(), // invoice, bill, expense
  frequency: text("frequency").notNull(), // daily, weekly, monthly, quarterly, yearly
  interval: integer("interval").notNull().default(1), // every X frequency
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date"),
  next_run_date: timestamp("next_run_date").notNull(),
  last_run_date: timestamp("last_run_date"),
  template_data: jsonb("template_data").notNull(), // stores document structure
  is_active: boolean("is_active").notNull().default(true),
  created_by: varchar("created_by").references(() => users.id),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ==== BUDGETS ====
export const budgets = pgTable("budgets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  budget_name: text("budget_name").notNull(),
  fiscal_year: integer("fiscal_year").notNull(),
  account_id: varchar("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  period_type: text("period_type").notNull(), // monthly, quarterly, yearly
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
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ==== AI FEEDBACK (user votes on AI suggestions) ====
export const ai_feedback = pgTable("ai_feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").references(() => companies.id, { onDelete: "cascade" }),
  user_id: varchar("user_id").references(() => users.id),
  source: text("source"), // e.g., bank-statement, reconciliation, expenses-form, payments-form
  transaction_id: varchar("transaction_id"),
  accepted: boolean("accepted").notNull(),
  category: text("category"),
  confidence: decimal("confidence", { precision: 10, scale: 6 }),
  suggested_accounts: jsonb("suggested_accounts"), // { debit: string[]; credit: string[] }
  notes: text("notes"),
  description: text("description"),
  amount: decimal("amount", { precision: 15, scale: 2 }),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ==== AI PROVIDERS (per-company configurable AI backends and defaults) ====
export const ai_providers = pgTable("ai_providers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").references(() => companies.id, { onDelete: "cascade" }).notNull(),
  provider: varchar("provider", { length: 64 }).notNull(), // e.g., openai, azure-openai, google, anthropic, openrouter, groq, mistral, xai, together, cohere
  label: varchar("label", { length: 128 }), // Friendly name shown in UI
  base_url: text("base_url"), // Optional custom endpoint/base URL
  api_key: text("api_key"), // Stored encrypted at rest at the DB/storage layer (TBD)
  organization: varchar("organization", { length: 128 }), // Optional org or project id
  default_model: varchar("default_model", { length: 256 }),
  embeddings_model: varchar("embeddings_model", { length: 256 }),
  vision_model: varchar("vision_model", { length: 256 }),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ==== AI CONSENT (per-user/company persisted consent for AI processing) ====
export const ai_consent = pgTable("ai_consent", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").references(() => companies.id, { onDelete: "cascade" }).notNull(),
  user_id: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  consent_type: text("consent_type").notNull().default("ai"), // reserved for future types
  accepted: boolean("accepted").notNull().default(true),
  version: text("version"),
  accepted_at: timestamp("accepted_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ==== LEGAL CONSENT LOGS (audit trail for legal consent acceptance) ====
export const legal_consent_logs = pgTable("legal_consent_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  company_id: varchar("company_id").references(() => companies.id, { onDelete: "cascade" }).notNull(),
  consent_version: text("consent_version").notNull(),
  terms_accepted: boolean("terms_accepted").notNull().default(true),
  privacy_accepted: boolean("privacy_accepted").notNull().default(true),
  disclaimer_accepted: boolean("disclaimer_accepted").notNull().default(true),
  ip_address: text("ip_address"),
  user_agent: text("user_agent"),
  accepted_at: timestamp("accepted_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ==== ROLE PERMISSIONS (granular access control) ====
export const role_permissions = pgTable("role_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  role: varchar("role", { length: 50 }).notNull(),
  resource: varchar("resource", { length: 100 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  allowed: boolean("allowed").notNull().default(true),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertRolePermissionSchema = createInsertSchema(role_permissions).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// ==== ADD ADDITIONAL SCHEMAS ====
export const insertFixedAssetSchema = createInsertSchema(fixed_assets).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertAssetDepreciationEntrySchema = createInsertSchema(asset_depreciation_entries).omit({
  id: true,
  created_at: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertWarehouseSchema = createInsertSchema(warehouses).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertBankAccountSchema = createInsertSchema(bank_accounts).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertBankStatementLineSchema = createInsertSchema(bank_statement_lines).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertStockMovementSchema = createInsertSchema(stock_movements).omit({
  id: true,
  created_at: true,
});

export const insertPaymentAllocationSchema = createInsertSchema(payment_allocations).omit({
  id: true,
  created_at: true,
});

export const insertDocumentSequenceSchema = createInsertSchema(document_sequences).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertFiscalPeriodSchema = createInsertSchema(fiscal_periods).omit({
  id: true,
  created_at: true,
});

export const insertRecurringTemplateSchema = createInsertSchema(recurring_templates).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertBudgetSchema = createInsertSchema(budgets).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertAIFeedbackSchema = createInsertSchema(ai_feedback).omit({
  id: true,
  created_at: true,
});

export const insertAIProviderSchema = createInsertSchema(ai_providers).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertLegalConsentLogSchema = createInsertSchema(legal_consent_logs).omit({
  id: true,
  accepted_at: true,
});

export const insertAIConsentSchema = createInsertSchema(ai_consent).omit({
  id: true,
  accepted_at: true,
});

// ==== MANUFACTURING ====
export const manufacturing_boms = pgTable("manufacturing_boms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  item_id: varchar("item_id").notNull().references(() => items.id),
  name: text("name").notNull(),
  version: text("version").notNull().default("1.0"),
  is_active: boolean("is_active").notNull().default(true),
  labor_cost: decimal("labor_cost", { precision: 15, scale: 2 }).default("0"),
  overhead_cost: decimal("overhead_cost", { precision: 15, scale: 2 }).default("0"),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const manufacturing_bom_items = pgTable("manufacturing_bom_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bom_id: varchar("bom_id").notNull().references(() => manufacturing_boms.id, { onDelete: "cascade" }),
  item_id: varchar("item_id").notNull().references(() => items.id),
  quantity: decimal("quantity", { precision: 15, scale: 4 }).notNull(),
  wastage_percent: decimal("wastage_percent", { precision: 5, scale: 2 }).default("0"),
});

export const production_orders = pgTable("production_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  order_number: text("order_number").notNull(),
  bom_id: varchar("bom_id").references(() => manufacturing_boms.id),
  item_id: varchar("item_id").notNull().references(() => items.id, { onDelete: "cascade" }),
  quantity: decimal("quantity", { precision: 15, scale: 4 }).notNull(),
  start_date: timestamp("start_date").notNull(),
  due_date: timestamp("due_date"),
  status: text("status").notNull().default("planned"), // planned, in_progress, completed, cancelled
  warehouse_id: varchar("warehouse_id").references(() => warehouses.id),
  output_batch_number: text("output_batch_number"),
  output_expiry_date: timestamp("output_expiry_date"),
  created_by: varchar("created_by").references(() => users.id),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ==== INVENTORY BATCHES/SERIALS ====
export const inventory_batches = pgTable("inventory_batches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  item_id: varchar("item_id").notNull().references(() => items.id),
  batch_number: text("batch_number").notNull(),
  expiry_date: timestamp("expiry_date"),
  quantity: decimal("quantity", { precision: 15, scale: 4 }).notNull().default("0"),
  warehouse_id: varchar("warehouse_id").references(() => warehouses.id),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const inventory_serials = pgTable("inventory_serials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  item_id: varchar("item_id").notNull().references(() => items.id),
  serial_number: text("serial_number").notNull(),
  status: text("status").notNull().default("available"), // available, sold, returned, damaged
  warehouse_id: varchar("warehouse_id").references(() => warehouses.id),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ==== LANDED COST ====
export const landed_cost_vouchers = pgTable("landed_cost_vouchers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  voucher_number: text("voucher_number").notNull(),
  date: timestamp("date").notNull(),
  description: text("description"),
  status: text("status").notNull().default("draft"), // draft, posted
  allocation_method: text("allocation_method").notNull().default("value"), // value, quantity, weight, volume
  created_by: varchar("created_by").references(() => users.id),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const landed_cost_bills = pgTable("landed_cost_bills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  voucher_id: varchar("voucher_id").notNull().references(() => landed_cost_vouchers.id, { onDelete: "cascade" }),
  bill_id: varchar("bill_id").notNull().references(() => bills.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const landed_cost_items = pgTable("landed_cost_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  voucher_id: varchar("voucher_id").notNull().references(() => landed_cost_vouchers.id, { onDelete: "cascade" }),
  stock_movement_id: varchar("stock_movement_id").notNull().references(() => stock_movements.id),
  original_cost: decimal("original_cost", { precision: 15, scale: 2 }).notNull(),
  allocated_cost: decimal("allocated_cost", { precision: 15, scale: 2 }).notNull(),
  new_unit_cost: decimal("new_unit_cost", { precision: 15, scale: 4 }).notNull(),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ==== HR & PAYROLL ====
export const departments = pgTable("departments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  manager_id: varchar("manager_id"), // Self-reference to employees later
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const employees = pgTable("employees", {
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
  status: text("status").notNull().default("active"), // active, terminated, on_leave
  user_id: varchar("user_id").references(() => users.id),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const payroll_runs = pgTable("payroll_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  period_start: timestamp("period_start").notNull(),
  period_end: timestamp("period_end").notNull(),
  payment_date: timestamp("payment_date").notNull(),
  status: text("status").notNull().default("draft"), // draft, approved, paid
  total_amount: decimal("total_amount", { precision: 15, scale: 2 }).notNull().default("0"),
  journal_id: varchar("journal_id").references(() => journals.id),
  created_by: varchar("created_by").references(() => users.id),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const payslips = pgTable("payslips", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  payroll_run_id: varchar("payroll_run_id").notNull().references(() => payroll_runs.id, { onDelete: "cascade" }),
  employee_id: varchar("employee_id").notNull().references(() => employees.id),
  basic_salary: decimal("basic_salary", { precision: 15, scale: 2 }).notNull(),
  allowances: decimal("allowances", { precision: 15, scale: 2 }).notNull().default("0"),
  deductions: decimal("deductions", { precision:  15, scale: 2 }).notNull().default("0"),
  net_salary: decimal("net_salary", { precision: 15, scale: 2 }).notNull(),
  details: jsonb("details"), // Breakdown of allowances/deductions
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const checks = pgTable("checks", {
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
  status: text("status").notNull().default("pending"), // pending, printed, cleared, voided
  created_by: varchar("created_by").references(() => users.id),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  companyIdx: index("checks_company_idx").on(table.company_id),
  checkNumberIdx: index("checks_check_number_idx").on(table.check_number),
  dateIdx: index("checks_date_idx").on(table.date),
  contactIdx: index("checks_contact_idx").on(table.contact_id),
}));

// ==== APPROVAL WORKFLOWS ====
export const approval_workflows = pgTable("approval_workflows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  name: text("name").notNull().default("Standard Approval"),
  description: text("description"),
  entity_type: text("entity_type").notNull(), // expense, purchase_order, invoice
  trigger_amount: decimal("trigger_amount", { precision: 15, scale: 2 }).notNull().default("0"),
  approver_role: text("approver_role").default("admin"), 
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const approval_workflow_steps = pgTable("approval_workflow_steps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workflow_id: varchar("workflow_id").notNull().references(() => approval_workflows.id, { onDelete: "cascade" }),
  step_order: integer("step_order").notNull(),
  approver_role: text("approver_role").notNull(), // admin, manager, cfo, etc.
  approver_id: varchar("approver_id").references(() => users.id), // Optional specific user
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const approval_requests = pgTable("approval_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  workflow_id: varchar("workflow_id").references(() => approval_workflows.id),
  entity_type: text("entity_type").notNull(),
  entity_id: varchar("entity_id").notNull(),
  requester_id: varchar("requester_id").references(() => users.id),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  current_step: integer("current_step").notNull().default(1),
  approver_id: varchar("approver_id").references(() => users.id), // The final approver or current approver? Let's keep for backward compat
  comments: text("comments"),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const approval_request_actions = pgTable("approval_request_actions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  request_id: varchar("request_id").notNull().references(() => approval_requests.id, { onDelete: "cascade" }),
  step_order: integer("step_order").notNull(),
  approver_id: varchar("approver_id").notNull().references(() => users.id),
  action: text("action").notNull(), // approved, rejected
  comments: text("comments"),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ==== SCHEMAS ====

export const insertManufacturingBomSchema = createInsertSchema(manufacturing_boms).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertManufacturingBomItemSchema = createInsertSchema(manufacturing_bom_items).omit({
  id: true,
});

export const insertProductionOrderSchema = createInsertSchema(production_orders).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertInventoryBatchSchema = createInsertSchema(inventory_batches).omit({
  id: true,
  created_at: true,
});

export const insertInventorySerialSchema = createInsertSchema(inventory_serials).omit({
  id: true,
  created_at: true,
});

export const insertLandedCostVoucherSchema = createInsertSchema(landed_cost_vouchers);
export const insertLandedCostBillSchema = createInsertSchema(landed_cost_bills);
export const insertLandedCostItemSchema = createInsertSchema(landed_cost_items);

export const insertDepartmentSchema = createInsertSchema(departments).omit({
  id: true,
  created_at: true,
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertPayrollRunSchema = createInsertSchema(payroll_runs).omit({
  id: true,
  created_at: true,
});

export const insertPayslipSchema = createInsertSchema(payslips).omit({
  id: true,
  created_at: true,
});

export const insertCheckSchema = createInsertSchema(checks).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  password_hash: true, // Will be generated server-side from password
  created_at: true,
  updated_at: true,
  last_login_at: true,
}).extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
  company_id: z.string().optional(), // Make optional - will be set server-side if not provided
});

// ==== AUTHENTICATION SCHEMAS ====
// Login schema - only includes email and password
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  code: z.string().optional(), // 2FA code
});

// Registration schema - for creating user and company together
export const registrationSchema = z.object({
  // Company info
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  baseCurrency: z.string().length(3, "Currency must be 3 characters").default("USD"),
  fiscalYearStart: z.number().min(1).max(12).default(1),
  
  // User info  
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
});

export const insertCostCenterSchema = createInsertSchema(cost_centers).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertApprovalWorkflowSchema = createInsertSchema(approval_workflows).omit({
  id: true,
  created_at: true,
});

export const insertApprovalWorkflowStepSchema = createInsertSchema(approval_workflow_steps).omit({
  id: true,
  created_at: true,
});

export const insertApprovalRequestSchema = createInsertSchema(approval_requests).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertApprovalRequestActionSchema = createInsertSchema(approval_request_actions).omit({
  id: true,
  created_at: true,
});

export const insertUserPermissionSchema = createInsertSchema(user_permissions).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertTaxSchema = createInsertSchema(taxes).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertItemSchema = createInsertSchema(items).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertSalesInvoiceSchema = createInsertSchema(sales_invoices).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertSalesOrderSchema = createInsertSchema(sales_orders).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertBillSchema = createInsertSchema(bills).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertReceiptSchema = createInsertSchema(receipts).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertPurchaseOrderSchema = createInsertSchema(purchase_orders).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertSalesCreditNoteSchema = createInsertSchema(sales_credit_notes).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertPurchaseDebitNoteSchema = createInsertSchema(purchase_debit_notes).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertCurrencySchema = createInsertSchema(currencies);

export const insertExchangeRateSchema = createInsertSchema(exchange_rates).omit({
  id: true,
  created_at: true,
});

export const insertContactPortalUserSchema = createInsertSchema(contact_portal_users).omit({
  id: true,
  created_at: true,
  updated_at: true,
  last_login_at: true,
});

// ==== CORE RELATIONS ====

// Companies Relations
export const companiesRelations = relations(companies, ({ many }) => ({
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
  projects: many(projects),
}));

// Users Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.company_id],
    references: [companies.id],
  }),
  permissions: many(user_permissions),
  audit_logs: many(audit_logs),
  project_tasks: many(project_tasks),
  time_entries: many(project_time_entries),
}));

// User Permissions Relations
export const userPermissionsRelations = relations(user_permissions, ({ one }) => ({
  user: one(users, {
    fields: [user_permissions.user_id],
    references: [users.id],
  }),
}));

// Accounts Relations
export const accountsRelations = relations(accounts, ({ one, many }) => ({
  company: one(companies, {
    fields: [accounts.company_id],
    references: [companies.id],
  }),
  parent: one(accounts, {
    fields: [accounts.parent_id],
    references: [accounts.id],
    relationName: "parent_child",
  }),
  children: many(accounts, { relationName: "parent_child" }),
  journal_lines: many(journal_lines),
}));

// Taxes Relations
export const taxesRelations = relations(taxes, ({ one }) => ({
  company: one(companies, {
    fields: [taxes.company_id],
    references: [companies.id],
  }),
  liability_account: one(accounts, {
    fields: [taxes.liability_account_id],
    references: [accounts.id],
  }),
}));

// Items Relations
export const itemsRelations = relations(items, ({ one, many }) => ({
  company: one(companies, {
    fields: [items.company_id],
    references: [companies.id],
  }),
  sales_account: one(accounts, {
    fields: [items.sales_account_id],
    references: [accounts.id],
    relationName: "item_sales_account",
  }),
  cost_account: one(accounts, {
    fields: [items.cost_account_id],
    references: [accounts.id],
    relationName: "item_cost_account",
  }),
  inventory_account: one(accounts, {
    fields: [items.inventory_account_id],
    references: [accounts.id],
    relationName: "item_inventory_account",
  }),
  default_tax: one(taxes, {
    fields: [items.default_tax_id],
    references: [taxes.id],
  }),
  batches: many(batches),
  stock_movements: many(stock_movements),
}));

// Warehouses Relations
export const warehousesRelations = relations(warehouses, ({ one, many }) => ({
  company: one(companies, {
    fields: [warehouses.company_id],
    references: [companies.id],
  }),
  batches: many(batches),
  stock_movements: many(stock_movements),
}));

// Bank Accounts Relations
export const bankAccountsRelations = relations(bank_accounts, ({ one, many }) => ({
  company: one(companies, {
    fields: [bank_accounts.company_id],
    references: [companies.id],
  }),
  ledger_account: one(accounts, {
    fields: [bank_accounts.account_id],
    references: [accounts.id],
  }),
  statement_lines: many(bank_statement_lines),
}));

// Bank Statement Lines Relations
export const bankStatementLinesRelations = relations(bank_statement_lines, ({ one }) => ({
  bank_account: one(bank_accounts, {
    fields: [bank_statement_lines.bank_account_id],
    references: [bank_accounts.id],
  }),
}));

// Sales Invoices Relations
export const salesInvoicesRelations = relations(sales_invoices, ({ one, many }) => ({
  company: one(companies, {
    fields: [sales_invoices.company_id],
    references: [companies.id],
  }),
  customer: one(contacts, {
    fields: [sales_invoices.customer_id],
    references: [contacts.id],
  }),
  order: one(sales_orders, {
    fields: [sales_invoices.order_id],
    references: [sales_orders.id],
  }),
  journal: one(journals, {
    fields: [sales_invoices.journal_id],
    references: [journals.id],
  }),
  lines: many(document_lines),
}));

// Sales Quotes Relations
export const salesQuotesRelations = relations(sales_quotes, ({ one, many }) => ({
  company: one(companies, {
    fields: [sales_quotes.company_id],
    references: [companies.id],
  }),
  customer: one(contacts, {
    fields: [sales_quotes.customer_id],
    references: [contacts.id],
  }),
  lines: many(document_lines),
}));

// Sales Orders Relations
export const salesOrdersRelations = relations(sales_orders, ({ one, many }) => ({
  company: one(companies, {
    fields: [sales_orders.company_id],
    references: [companies.id],
  }),
  customer: one(contacts, {
    fields: [sales_orders.customer_id],
    references: [contacts.id],
  }),
  quote: one(sales_quotes, {
    fields: [sales_orders.quote_id],
    references: [sales_quotes.id],
  }),
  lines: many(document_lines),
}));

// Purchase Orders Relations
export const purchaseOrdersRelations = relations(purchase_orders, ({ one, many }) => ({
  company: one(companies, {
    fields: [purchase_orders.company_id],
    references: [companies.id],
  }),
  supplier: one(contacts, {
    fields: [purchase_orders.supplier_id],
    references: [contacts.id],
  }),
  lines: many(document_lines),
}));

// Bills Relations
export const billsRelations = relations(bills, ({ one, many }) => ({
  company: one(companies, {
    fields: [bills.company_id],
    references: [companies.id],
  }),
  supplier: one(contacts, {
    fields: [bills.supplier_id],
    references: [contacts.id],
  }),
  purchase_order: one(purchase_orders, {
    fields: [bills.po_id],
    references: [purchase_orders.id],
  }),
  journal: one(journals, {
    fields: [bills.journal_id],
    references: [journals.id],
  }),
  lines: many(document_lines),
}));

// Expenses Relations
export const expensesRelations = relations(expenses, ({ one }) => ({
  company: one(companies, {
    fields: [expenses.company_id],
    references: [companies.id],
  }),
  expense_account: one(accounts, {
    fields: [expenses.expense_account_id],
    references: [accounts.id],
  }),
  paid_from: one(bank_accounts, {
    fields: [expenses.paid_from_account_id],
    references: [bank_accounts.id],
  }),
  journal: one(journals, {
    fields: [expenses.journal_id],
    references: [journals.id],
  }),
}));

// Payments Relations
export const paymentsRelations = relations(payments, ({ one }) => ({
  company: one(companies, {
    fields: [payments.company_id],
    references: [companies.id],
  }),
  vendor: one(contacts, {
    fields: [payments.vendor_id],
    references: [contacts.id],
  }),
  bank_account: one(bank_accounts, {
    fields: [payments.bank_account_id],
    references: [bank_accounts.id],
  }),
  journal: one(journals, {
    fields: [payments.journal_id],
    references: [journals.id],
  }),
}));

// Receipts Relations
export const receiptsRelations = relations(receipts, ({ one }) => ({
  company: one(companies, {
    fields: [receipts.company_id],
    references: [companies.id],
  }),
  customer: one(contacts, {
    fields: [receipts.customer_id],
    references: [contacts.id],
  }),
  bank_account: one(bank_accounts, {
    fields: [receipts.bank_account_id],
    references: [bank_accounts.id],
  }),
  journal: one(journals, {
    fields: [receipts.journal_id],
    references: [journals.id],
  }),
}));

// Sales Credit Notes Relations
export const salesCreditNotesRelations = relations(sales_credit_notes, ({ one, many }) => ({
  company: one(companies, {
    fields: [sales_credit_notes.company_id],
    references: [companies.id],
  }),
  customer: one(contacts, {
    fields: [sales_credit_notes.customer_id],
    references: [contacts.id],
  }),
  original_invoice: one(sales_invoices, {
    fields: [sales_credit_notes.invoice_id],
    references: [sales_invoices.id],
  }),
  lines: many(document_lines),
}));

// Purchase Debit Notes Relations
export const purchaseDebitNotesRelations = relations(purchase_debit_notes, ({ one, many }) => ({
  company: one(companies, {
    fields: [purchase_debit_notes.company_id],
    references: [companies.id],
  }),
  vendor: one(contacts, {
    fields: [purchase_debit_notes.vendor_id],
    references: [contacts.id],
  }),
  original_bill: one(bills, {
    fields: [purchase_debit_notes.bill_id],
    references: [bills.id],
  }),
  lines: many(document_lines),
}));

// Document Lines Relations
export const documentLinesRelations = relations(document_lines, ({ one }) => ({
  item: one(items, {
    fields: [document_lines.item_id],
    references: [items.id],
  }),
  tax: one(taxes, {
    fields: [document_lines.tax_id],
    references: [taxes.id],
  }),
  account: one(accounts, {
    fields: [document_lines.account_id],
    references: [accounts.id],
  }),
}));

// Audit Logs Relations
export const auditLogsRelations = relations(audit_logs, ({ one }) => ({
  actor: one(users, {
    fields: [audit_logs.actor_id],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [audit_logs.company_id],
    references: [companies.id],
  }),
}));

// Recurring Templates Relations
export const recurringTemplatesRelations = relations(recurring_templates, ({ one }) => ({
  company: one(companies, {
    fields: [recurring_templates.company_id],
    references: [companies.id],
  }),
  creator: one(users, {
    fields: [recurring_templates.created_by],
    references: [users.id],
  }),
}));

// AI Feedback Relations
export const aiFeedbackRelations = relations(ai_feedback, ({ one }) => ({
  company: one(companies, {
    fields: [ai_feedback.company_id],
    references: [companies.id],
  }),
  user: one(users, {
    fields: [ai_feedback.user_id],
    references: [users.id],
  }),
}));

export const contactPortalUsersRelations = relations(contact_portal_users, ({ one }) => ({
  contact: one(contacts, {
    fields: [contact_portal_users.contact_id],
    references: [contacts.id],
  }),
}));

export const contactsRelations = relations(contacts, ({ many }) => ({
  portalUsers: many(contact_portal_users),
}));

export const journalsRelations = relations(journals, ({ many }) => ({
  lines: many(journal_lines),
}));

export const journalLinesRelations = relations(journal_lines, ({ one }) => ({
  journal: one(journals, {
    fields: [journal_lines.journal_id],
    references: [journals.id],
  }),
  account: one(accounts, {
    fields: [journal_lines.account_id],
    references: [accounts.id],
  }),
}));

export const stockTransfersRelations = relations(stock_transfers, ({ many, one }) => ({
  items: many(stock_transfer_items),
  from_warehouse: one(warehouses, {
    fields: [stock_transfers.from_warehouse_id],
    references: [warehouses.id],
    relationName: "from_warehouse",
  }),
  to_warehouse: one(warehouses, {
    fields: [stock_transfers.to_warehouse_id],
    references: [warehouses.id],
    relationName: "to_warehouse",
  }),
}));

export const batchesRelations = relations(batches, ({ one }) => ({
  item: one(items, {
    fields: [batches.item_id],
    references: [items.id],
  }),
  warehouse: one(warehouses, {
    fields: [batches.warehouse_id],
    references: [warehouses.id],
  }),
}));

export const stockTransferItemsRelations = relations(stock_transfer_items, ({ one }) => ({
  transfer: one(stock_transfers, {
    fields: [stock_transfer_items.transfer_id],
    references: [stock_transfers.id],
  }),
  item: one(items, {
    fields: [stock_transfer_items.item_id],
    references: [items.id],
  }),
  batch: one(batches, {
    fields: [stock_transfer_items.batch_id],
    references: [batches.id],
  }),
}));

export const stockMovementsRelations = relations(stock_movements, ({ one }) => ({
  item: one(items, {
    fields: [stock_movements.item_id],
    references: [items.id],
  }),
  warehouse: one(warehouses, {
    fields: [stock_movements.warehouse_id],
    references: [warehouses.id],
  }),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  company: one(companies, {
    fields: [budgets.company_id],
    references: [companies.id],
  }),
  account: one(accounts, {
    fields: [budgets.account_id],
    references: [accounts.id],
  }),
  creator: one(users, {
    fields: [budgets.created_by],
    references: [users.id],
  }),
}));

export const landedCostVouchersRelations = relations(landed_cost_vouchers, ({ many, one }) => ({
  company: one(companies, {
    fields: [landed_cost_vouchers.company_id],
    references: [companies.id],
  }),
  creator: one(users, {
    fields: [landed_cost_vouchers.created_by],
    references: [users.id],
  }),
  bills: many(landed_cost_bills),
  items: many(landed_cost_items),
}));

export const landedCostBillsRelations = relations(landed_cost_bills, ({ one }) => ({
  voucher: one(landed_cost_vouchers, {
    fields: [landed_cost_bills.voucher_id],
    references: [landed_cost_vouchers.id],
  }),
  bill: one(bills, {
    fields: [landed_cost_bills.bill_id],
    references: [bills.id],
  }),
}));

export const landedCostItemsRelations = relations(landed_cost_items, ({ one }) => ({
  voucher: one(landed_cost_vouchers, {
    fields: [landed_cost_items.voucher_id],
    references: [landed_cost_vouchers.id],
  }),
  stock_movement: one(stock_movements, {
    fields: [landed_cost_items.stock_movement_id],
    references: [stock_movements.id],
  }),
}));

// ==== PROJECT RELATIONS ====
export const projectsRelations = relations(projects, ({ one, many }) => ({
  company: one(companies, {
    fields: [projects.company_id],
    references: [companies.id],
  }),
  phases: many(project_phases),
  tasks: many(project_tasks),
  timeEntries: many(project_time_entries),
}));

export const projectPhasesRelations = relations(project_phases, ({ one, many }) => ({
  project: one(projects, {
    fields: [project_phases.project_id],
    references: [projects.id],
  }),
  tasks: many(project_tasks),
}));

export const projectTasksRelations = relations(project_tasks, ({ one }) => ({
  project: one(projects, {
    fields: [project_tasks.project_id],
    references: [projects.id],
  }),
  phase: one(project_phases, {
    fields: [project_tasks.phase_id],
    references: [project_phases.id],
  }),
  assignee: one(users, {
    fields: [project_tasks.assigned_to],
    references: [users.id],
  }),
  creator: one(users, {
    fields: [project_tasks.created_by],
    references: [users.id],
  }),
}));

export const projectTimeEntriesRelations = relations(project_time_entries, ({ one }) => ({
  project: one(projects, {
    fields: [project_time_entries.project_id],
    references: [projects.id],
  }),
  task: one(project_tasks, {
    fields: [project_time_entries.task_id],
    references: [project_tasks.id],
  }),
  user: one(users, {
    fields: [project_time_entries.user_id],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type InsertAccount = typeof accounts.$inferInsert;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;
export type Item = typeof items.$inferSelect;
export type InsertItem = typeof items.$inferInsert;
export type Tax = typeof taxes.$inferSelect;
export type InsertTax = typeof taxes.$inferInsert;
export type SalesInvoice = typeof sales_invoices.$inferSelect;
export type InsertSalesInvoice = typeof sales_invoices.$inferInsert;
export type SalesQuote = typeof sales_quotes.$inferSelect;
export type InsertSalesQuote = typeof sales_quotes.$inferInsert;
export type SalesOrder = typeof sales_orders.$inferSelect;
export type InsertSalesOrder = typeof sales_orders.$inferInsert;
export type PurchaseOrder = typeof purchase_orders.$inferSelect;
export type InsertPurchaseOrder = typeof purchase_orders.$inferInsert;
export type Bill = typeof bills.$inferSelect;
export type InsertBill = typeof bills.$inferInsert;
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
export type Receipt = typeof receipts.$inferSelect;
export type InsertReceipt = typeof receipts.$inferInsert;
export type SalesCreditNote = typeof sales_credit_notes.$inferSelect;
export type InsertSalesCreditNote = typeof sales_credit_notes.$inferInsert;
export type PurchaseDebitNote = typeof purchase_debit_notes.$inferSelect;
export type InsertPurchaseDebitNote = typeof purchase_debit_notes.$inferInsert;
export type RecurringTemplate = typeof recurring_templates.$inferSelect;
export type InsertRecurringTemplate = typeof recurring_templates.$inferInsert;
export type BankAccount = typeof bank_accounts.$inferSelect;
export type InsertBankAccount = typeof bank_accounts.$inferInsert;
export type BankStatementLine = typeof bank_statement_lines.$inferSelect;
export type InsertBankStatementLine = typeof bank_statement_lines.$inferInsert;
export type Warehouse = typeof warehouses.$inferSelect;
export type InsertWarehouse = typeof warehouses.$inferInsert;
export type AIFeedback = typeof ai_feedback.$inferSelect;
export type InsertAIFeedback = typeof ai_feedback.$inferInsert;
export type CostCenter = typeof cost_centers.$inferSelect;
export type InsertCostCenter = typeof cost_centers.$inferInsert;
export type AuditLog = typeof audit_logs.$inferSelect;
export type InsertAuditLog = typeof audit_logs.$inferInsert;
export type Check = typeof checks.$inferSelect;
export type InsertCheck = typeof checks.$inferInsert;
export type Department = typeof departments.$inferSelect;
export type InsertDepartment = typeof departments.$inferInsert;
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;
export type PayrollRun = typeof payroll_runs.$inferSelect;
export type InsertPayrollRun = typeof payroll_runs.$inferInsert;
export type ManufacturingBom = typeof manufacturing_boms.$inferSelect;
export type InsertManufacturingBom = typeof manufacturing_boms.$inferInsert;
export type ProductionOrder = typeof production_orders.$inferSelect;
export type InsertProductionOrder = typeof production_orders.$inferInsert;
export type Journal = typeof journals.$inferSelect;
export type InsertJournal = typeof journals.$inferInsert;
export type PaymentAllocation = typeof payment_allocations.$inferSelect;
export type InsertPaymentAllocation = typeof payment_allocations.$inferInsert;