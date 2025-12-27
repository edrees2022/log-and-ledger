import { 
  users, companies, accounts, contacts, items, taxes,
  sales_invoices, sales_quotes, sales_orders, bank_accounts,
  purchase_orders, bills, expenses, payments, receipts,
  journals, journal_lines, recurring_templates,
  type User, type InsertUser, type Company, type InsertCompany,
  type Account, type InsertAccount, type Contact, type InsertContact,
  type Item, type InsertItem, type Tax, type InsertTax,
  type SalesInvoice, type InsertSalesInvoice, type SalesQuote, type SalesOrder,
  type BankAccount, type InsertBankAccount, type PurchaseOrder, type Bill, type InsertBill,
  type Expense, type InsertExpense, type Payment, type InsertPayment,
  type Receipt, type InsertReceipt,
  sales_credit_notes, purchase_debit_notes,
  type SalesCreditNote, type InsertSalesCreditNote,
  type PurchaseDebitNote, type InsertPurchaseDebitNote,
  type RecurringTemplate, type InsertRecurringTemplate,
  document_lines,
  bank_statement_lines, type BankStatementLine, type InsertBankStatementLine,
  stock_movements,
  warehouses,
  ai_feedback,
  type Warehouse,
  type AIFeedback,
  type InsertAIFeedback,
  payment_allocations,
  type InsertPaymentAllocation
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, lte, gte, or } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import { getCache, setCache, deleteCache, deleteCachePattern, CacheKeys, CacheTTL } from './cache';

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Companies
  createCompany(company: InsertCompany): Promise<Company>;
  getCompanyById(id: string): Promise<Company | undefined>;
  getCompaniesByUserId(userId: string): Promise<Company[]>;
  getAllCompanies(): Promise<Company[]>;
  updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company | undefined>;
  deleteCompany(id: string): Promise<boolean>;
  switchUserCompany(userId: string, companyId: string): Promise<boolean>;
  getUsersByCompany(companyId: string): Promise<User[]>;
  
  // Accounts (Chart of Accounts)
  createAccount(account: InsertAccount): Promise<Account>;
  getAccountsByCompany(companyId: string): Promise<Account[]>;
  getAccountById(id: string): Promise<Account | undefined>;
  updateAccount(id: string, account: Partial<InsertAccount>): Promise<Account | undefined>;
  deleteAccount(id: string): Promise<boolean>;
  getAccountLedger(accountId: string, startDate: Date | null, endDate: Date | null): Promise<any[]>;
  getAccountBalanceBeforeDate(accountId: string, date: Date): Promise<number>;
  getJournalLinesWithAccounts(journalId: string): Promise<any[]>;
  
  // Contacts (Customers/Suppliers)
  createContact(contact: InsertContact): Promise<Contact>;
  getContactsByCompany(companyId: string): Promise<Contact[]>;
  getContactById(id: string): Promise<Contact | undefined>;
  updateContact(id: string, contact: Partial<InsertContact>): Promise<Contact | undefined>;
  deleteContact(companyId: string, id: string): Promise<boolean>;
  
  // Items (Products/Services)
  createItem(item: InsertItem): Promise<Item>;
  getItemsByCompany(companyId: string): Promise<Item[]>;
  getItemById(id: string): Promise<Item | undefined>;
  updateItem(id: string, item: Partial<InsertItem>): Promise<Item | undefined>;
  deleteItem(id: string): Promise<boolean>;
  
  // Taxes
  createTax(tax: InsertTax): Promise<Tax>;
  getTaxesByCompany(companyId: string): Promise<Tax[]>;
  getTaxById(id: string): Promise<Tax | undefined>;
  updateTax(id: string, tax: Partial<InsertTax>): Promise<Tax | undefined>;
  deleteTax(id: string): Promise<boolean>;
  
  // Sales Invoices
  createSalesInvoice(invoice: InsertSalesInvoice): Promise<SalesInvoice>;
  getSalesInvoicesByCompany(companyId: string): Promise<SalesInvoice[]>;
  getSalesInvoiceById(id: string): Promise<SalesInvoice | undefined>;
  updateSalesInvoice(id: string, invoice: Partial<InsertSalesInvoice>): Promise<SalesInvoice | undefined>;
  deleteSalesInvoice(id: string): Promise<boolean>;
  
  // Sales Quotes
  createSalesQuote(quote: any): Promise<SalesQuote>;
  getSalesQuotesByCompany(companyId: string): Promise<SalesQuote[]>;
  getSalesQuoteById(id: string): Promise<SalesQuote | undefined>;
  updateSalesQuote(id: string, quote: Partial<any>): Promise<SalesQuote | undefined>;
  deleteSalesQuote(id: string): Promise<boolean>;
  
  // Sales Orders
  createSalesOrder(order: any): Promise<SalesOrder>;
  getSalesOrdersByCompany(companyId: string): Promise<SalesOrder[]>;
  getSalesOrderById(id: string): Promise<SalesOrder | undefined>;
  updateSalesOrder(id: string, order: Partial<any>): Promise<SalesOrder | undefined>;
  deleteSalesOrder(companyId: string, id: string): Promise<boolean>;
  
  // Bank Accounts
  createBankAccount(bankAccount: InsertBankAccount): Promise<BankAccount>;
  getBankAccountsByCompany(companyId: string): Promise<BankAccount[]>;
  updateBankAccount(id: string, bankAccount: Partial<InsertBankAccount>): Promise<BankAccount | undefined>;
  deleteBankAccount(id: string): Promise<boolean>;
  
  // Bank Statement Lines
  createBankStatementLine(line: InsertBankStatementLine): Promise<BankStatementLine>;
  getBankStatementLinesByCompany(companyId: string, bankAccountId?: string): Promise<BankStatementLine[]>;
  updateBankStatementLine(id: string, data: Partial<InsertBankStatementLine>): Promise<BankStatementLine | undefined>;
  deleteBankStatementLine(companyId: string, id: string): Promise<boolean>;
  
  // Bills
  createBill(bill: InsertBill): Promise<Bill>;
  getBillsByCompany(companyId: string): Promise<Bill[]>;
  getBillById(id: string): Promise<Bill | undefined>;
  updateBill(id: string, bill: Partial<InsertBill>): Promise<Bill | undefined>;
  deleteBill(companyId: string, id: string): Promise<boolean>;
  
  // Purchase Orders
  createPurchaseOrder(order: any): Promise<PurchaseOrder>;
  getPurchaseOrdersByCompany(companyId: string): Promise<PurchaseOrder[]>;
  getPurchaseOrderById(id: string): Promise<PurchaseOrder | undefined>;
  updatePurchaseOrder(id: string, order: Partial<any>): Promise<PurchaseOrder | undefined>;
  deletePurchaseOrder(companyId: string, id: string): Promise<boolean>;
  
  // Expenses
  createExpense(expense: InsertExpense): Promise<Expense>;
  getExpensesByCompany(companyId: string): Promise<Expense[]>;
  
  // Payments
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentsByCompany(companyId: string): Promise<Payment[]>;
  deletePayment(companyId: string, id: string): Promise<boolean>;
  
  // Receipts
  createReceipt(receipt: InsertReceipt): Promise<Receipt>;
  getReceiptsByCompany(companyId: string): Promise<Receipt[]>;
  deleteReceipt(companyId: string, id: string): Promise<boolean>;

  // Warehouses
  getWarehousesByCompany(companyId: string): Promise<Warehouse[]>;

  // Sales Credit Notes
  createSalesCreditNote(note: InsertSalesCreditNote): Promise<SalesCreditNote>;
  getSalesCreditNotesByCompany(companyId: string): Promise<SalesCreditNote[]>;
  getSalesCreditNoteById(id: string): Promise<SalesCreditNote | undefined>;
  updateSalesCreditNote(id: string, data: Partial<InsertSalesCreditNote>): Promise<SalesCreditNote | undefined>;
  deleteSalesCreditNote(companyId: string, id: string): Promise<boolean>;
  applySalesCreditNote(allocation: InsertPaymentAllocation): Promise<boolean>;

  // Purchase Debit Notes
  createPurchaseDebitNote(note: InsertPurchaseDebitNote): Promise<PurchaseDebitNote>;
  getPurchaseDebitNotesByCompany(companyId: string): Promise<PurchaseDebitNote[]>;
  getPurchaseDebitNoteById(id: string): Promise<PurchaseDebitNote | undefined>;
  updatePurchaseDebitNote(id: string, data: Partial<InsertPurchaseDebitNote>): Promise<PurchaseDebitNote | undefined>;
  deletePurchaseDebitNote(companyId: string, id: string): Promise<boolean>;
  applyPurchaseDebitNote(allocation: InsertPaymentAllocation): Promise<boolean>;

  // Purchase Debit Notes
  createPurchaseDebitNote(note: InsertPurchaseDebitNote): Promise<PurchaseDebitNote>;
  getPurchaseDebitNotesByCompany(companyId: string): Promise<PurchaseDebitNote[]>;
  updatePurchaseDebitNote(id: string, data: Partial<InsertPurchaseDebitNote>): Promise<PurchaseDebitNote | undefined>;
  deletePurchaseDebitNote(companyId: string, id: string): Promise<boolean>;
  
  // Recurring Templates
  createRecurringTemplate(template: InsertRecurringTemplate): Promise<RecurringTemplate>;
  getRecurringTemplatesByCompany(companyId: string, documentType?: string): Promise<RecurringTemplate[]>;
  updateRecurringTemplate(id: string, template: Partial<InsertRecurringTemplate>): Promise<RecurringTemplate | undefined>;
  deleteRecurringTemplate(id: string): Promise<boolean>;
  
  // Reports
  getTrialBalance(companyId: string, endDate?: Date): Promise<any[]>;
  getBalanceSheet(companyId: string, endDate?: Date): Promise<any>;
  getProfitLoss(companyId: string, startDate?: Date, endDate?: Date): Promise<any>;
  getCashFlow(companyId: string, startDate?: Date, endDate?: Date): Promise<any>;
  getTaxReport(companyId: string, startDate?: Date, endDate?: Date, filters?: { customerId?: string; vendorId?: string; currency?: string; warehouseId?: string }): Promise<any>;
  getTaxReportByTaxId(companyId: string, taxId: string, startDate?: Date, endDate?: Date, filters?: { customerId?: string; vendorId?: string; currency?: string; warehouseId?: string }): Promise<any>;

  // AI Feedback
  createAIFeedback(entry: InsertAIFeedback): Promise<AIFeedback>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user || undefined;
    } catch (err: any) {
      // Fallback: if column missing (42703) try username match (legacy schema)
      if (err?.code === '42703') {
        try {
          const [user2] = await db.select().from(users).where(eq(users.username, email));
          return user2 || undefined;
        } catch {}
      }
      throw err;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash the password before storing
    const passwordHash = await bcrypt.hash(insertUser.password, 10);
    
    // Ensure company_id is provided (required by database)
    if (!insertUser.company_id) {
      throw new Error('company_id is required to create a user');
    }
    
    // Remove password and add password_hash for database insertion
    const { password, ...userDataWithoutPassword } = insertUser;
    const userDataForDB = {
      ...userDataWithoutPassword,
      company_id: insertUser.company_id, // Explicitly set (TypeScript knows it's not undefined now)
      password_hash: passwordHash
    };
    
    const [user] = await db
      .insert(users)
      .values(userDataForDB)
      .returning();
    return user;
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const [company] = await db
      .insert(companies)
      .values(insertCompany)
      .returning();
    return company;
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User | undefined> {
    // If password is being updated, hash it
    if (updateData.password) {
      const passwordHash = await bcrypt.hash(updateData.password, 10);
      const { password, ...dataWithoutPassword } = updateData;
      const dataForDB = {
        ...dataWithoutPassword,
        password_hash: passwordHash,
        updated_at: new Date()
      };
      
      const [user] = await db
        .update(users)
        .set(dataForDB)
        .where(eq(users.id, id))
        .returning();
      return user;
    }
    
    const [user] = await db
      .update(users)
      .set({ ...updateData, updated_at: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getCompanyById(id: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company || undefined;
  }

  async updateCompany(id: string, updateData: Partial<InsertCompany>): Promise<Company | undefined> {
    const [company] = await db
      .update(companies)
      .set({ ...updateData, updated_at: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return company;
  }

  async deleteCompany(id: string): Promise<boolean> {
    const result = await db.delete(companies).where(eq(companies.id, id));
    return true;
  }

  async switchUserCompany(userId: string, companyId: string): Promise<boolean> {
    // Verify company exists
    const company = await this.getCompanyById(companyId);
    if (!company) {
      return false;
    }
    
    // Update user's company_id
    const user = await this.updateUser(userId, { company_id: companyId });
    return !!user;
  }

  async getCompaniesByUserId(userId: string): Promise<Company[]> {
    console.log(`🔍 getCompaniesByUserId called with: ${userId}`);
    
    // First try Firebase user lookup (for Firebase authentication)
    try {
      const firebaseCompanies = await db.select().from(companies).where(eq(companies.firebase_user_id, userId));
      console.log(`📦 Firebase lookup found ${firebaseCompanies.length} companies`);
      if (firebaseCompanies.length > 0) {
        return firebaseCompanies;
      }
    } catch (fbError: any) {
      console.warn(`⚠️ Firebase companies lookup failed: ${fbError?.message}`);
    }
    
    // Fallback to session-based user lookup
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        console.log(`⚠️ No user found with ID: ${userId}`);
        return [];
      }
      
      // For now, return the company that the user belongs to
      // Later we can extend this to support multi-company access
      if (user.company_id) {
        const companyList = await db.select().from(companies).where(eq(companies.id, user.company_id));
        console.log(`📦 User's company lookup found ${companyList.length} companies`);
        return companyList;
      }
    } catch (userError: any) {
      console.warn(`⚠️ User lookup failed: ${userError?.message}`);
    }
    
    return [];
  }

  async getAllCompanies(): Promise<Company[]> {
    return await db.select().from(companies);
  }

  async getUsersByCompany(companyId: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.company_id, companyId));
  }

  // === Accounts Implementation ===
  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const [account] = await db
      .insert(accounts)
      .values(insertAccount)
      .returning();
    
    // Invalidate company accounts cache
    await deleteCache(CacheKeys.accounts(insertAccount.company_id));
    
    return account;
  }

  async getAccountsByCompany(companyId: string): Promise<Account[]> {
    // Try cache first
    const cached = await getCache<Account[]>(CacheKeys.accounts(companyId));
    if (cached) return cached;
    
    // Cache miss - fetch from DB
    const accountsData: Account[] = await db.select().from(accounts).where(eq(accounts.company_id, companyId));
    
    // Cache for 5 minutes (accounts rarely change)
    await setCache(CacheKeys.accounts(companyId), accountsData, CacheTTL.MEDIUM);
    
    return accountsData;
  }

  async getAccountById(id: string): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, id));
    return account || undefined;
  }

  async updateAccount(id: string, updateData: Partial<InsertAccount>): Promise<Account | undefined> {
    const [account] = await db
      .update(accounts)
      .set({ ...updateData, updated_at: new Date() })
      .where(eq(accounts.id, id))
      .returning();
    
    // Invalidate caches
    if (account) {
      await deleteCache(CacheKeys.accounts(account.company_id));
      await deleteCache(CacheKeys.accountById(account.company_id, id));
    }
    
    return account;
  }

  async deleteAccount(id: string): Promise<boolean> {
    // Get account first to know company_id for cache invalidation
    const account = await this.getAccountById(id);
    
    await db.delete(accounts).where(eq(accounts.id, id));
    
    // Invalidate cache
    if (account) {
      await deleteCache(CacheKeys.accounts(account.company_id));
      await deleteCache(CacheKeys.accountById(account.company_id, id));
    }
    
    return true;
  }

  async getAccountLedger(accountId: string, startDate: Date | null, endDate: Date | null): Promise<any[]> {
    // Get journal entry lines for this account
    // Build query to get journal entry lines with journal info
    const query = db
      .select({
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
        document_id: journals.source_id,
      })
      .from(journal_lines)
      .innerJoin(journals, eq(journal_lines.journal_id, journals.id))
      .where(eq(journal_lines.account_id, accountId));
    
    let results = await query;
    
    // Filter by date if provided
    if (startDate || endDate) {
      results = results.filter(entry => {
        const entryDate = new Date(entry.journal_date);
        if (startDate && entryDate < startDate) return false;
        if (endDate && entryDate > endDate) return false;
        return true;
      });
    }
    
    // Sort by date ascending
    results.sort((a, b) => {
      const dateA = new Date(a.journal_date);
      const dateB = new Date(b.journal_date);
      return dateA.getTime() - dateB.getTime();
    });
    
    return results;
  }

  async getAccountBalanceBeforeDate(accountId: string, date: Date): Promise<number> {
    // Get all journal entry lines for this account before the given date
    const entries = await db
      .select({
        debit_amount: journal_lines.debit,
        credit_amount: journal_lines.credit,
        journal_date: journals.date,
      })
      .from(journal_lines)
      .innerJoin(journals, eq(journal_lines.journal_id, journals.id))
      .where(eq(journal_lines.account_id, accountId));
    
    // Filter entries before the date and calculate balance
    let balance = 0;
    for (const entry of entries) {
      const entryDate = new Date(entry.journal_date);
      if (entryDate < date) {
        const debit = parseFloat(entry.debit_amount || '0');
        const credit = parseFloat(entry.credit_amount || '0');
        balance += debit - credit;
      }
    }
    
    return balance;
  }

  async getJournalLinesWithAccounts(journalId: string): Promise<any[]> {
    // Get journal lines with account info
    const lines = await db
      .select({
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
        cost_center_id: journal_lines.cost_center_id,
      })
      .from(journal_lines)
      .innerJoin(accounts, eq(journal_lines.account_id, accounts.id))
      .where(eq(journal_lines.journal_id, journalId));
    
    return lines;
  }

  // === Contacts Implementation ===
  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values(insertContact)
      .returning();
    return contact;
  }

  async getContactsByCompany(companyId: string): Promise<Contact[]> {
    return await db.select().from(contacts).where(eq(contacts.company_id, companyId));
  }

  async getContactById(id: string): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact || undefined;
  }

  async updateContact(id: string, updateData: Partial<InsertContact>): Promise<Contact | undefined> {
    const [contact] = await db
      .update(contacts)
      .set({ ...updateData, updated_at: new Date() })
      .where(eq(contacts.id, id))
      .returning();
    return contact;
  }

  async deleteContact(companyId: string, id: string): Promise<boolean> {
    const result = await db.delete(contacts).where(
      and(eq(contacts.id, id), eq(contacts.company_id, companyId))
    );
    return (result.rowCount ?? 0) > 0;
  }

  // === Items Implementation ===
  async createItem(insertItem: InsertItem): Promise<Item> {
    const [item] = await db
      .insert(items)
      .values(insertItem)
      .returning();
    return item;
  }

  async getItemsByCompany(companyId: string): Promise<Item[]> {
    return await db.select().from(items).where(eq(items.company_id, companyId));
  }

  async getItemById(id: string): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item || undefined;
  }

  async updateItem(id: string, updateData: Partial<InsertItem>): Promise<Item | undefined> {
    const [item] = await db
      .update(items)
      .set({ ...updateData, updated_at: new Date() })
      .where(eq(items.id, id))
      .returning();
    return item;
  }

  async deleteItem(id: string): Promise<boolean> {
    await db.delete(items).where(eq(items.id, id));
    return true;
  }

  // === Taxes Implementation ===
  async createTax(insertTax: InsertTax): Promise<Tax> {
    const [tax] = await db
      .insert(taxes)
      .values(insertTax)
      .returning();
    
    // Invalidate company taxes cache
    await deleteCache(CacheKeys.taxes(insertTax.company_id));
    
    return tax;
  }

  async getTaxesByCompany(companyId: string): Promise<Tax[]> {
    // Try cache first
    const cached = await getCache<Tax[]>(CacheKeys.taxes(companyId));
    if (cached) return cached;
    
    // Cache miss - fetch from DB
    const taxesList = await db.select().from(taxes).where(eq(taxes.company_id, companyId));
    
    // Cache for 30 minutes (taxes rarely change)
    await setCache(CacheKeys.taxes(companyId), taxesList, CacheTTL.LONG);
    
    return taxesList;
  }

  async getTaxById(id: string): Promise<Tax | undefined> {
    const [tax] = await db.select().from(taxes).where(eq(taxes.id, id));
    return tax || undefined;
  }

  async updateTax(id: string, updateData: Partial<InsertTax>): Promise<Tax | undefined> {
    const [tax] = await db
      .update(taxes)
      .set({ ...updateData, updated_at: new Date() })
      .where(eq(taxes.id, id))
      .returning();
    
    // Invalidate caches
    if (tax) {
      await deleteCache(CacheKeys.taxes(tax.company_id));
      await deleteCache(CacheKeys.taxById(tax.company_id, id));
    }
    
    return tax;
  }

  async deleteTax(id: string): Promise<boolean> {
    // Get tax first to know company_id for cache invalidation
    const tax = await this.getTaxById(id);
    
    await db.delete(taxes).where(eq(taxes.id, id));
    
    // Invalidate cache
    if (tax) {
      await deleteCache(CacheKeys.taxes(tax.company_id));
      await deleteCache(CacheKeys.taxById(tax.company_id, id));
    }
    
    return true;
  }

  // === Sales Invoices Implementation ===
  async createSalesInvoice(insertSalesInvoice: InsertSalesInvoice): Promise<SalesInvoice> {
    const [invoice] = await db
      .insert(sales_invoices)
      .values(insertSalesInvoice)
      .returning();
    return invoice;
  }

  async getSalesInvoicesByCompany(companyId: string): Promise<SalesInvoice[]> {
    return await db.select().from(sales_invoices).where(eq(sales_invoices.company_id, companyId));
  }

  async getSalesInvoiceById(id: string): Promise<(SalesInvoice & { lines?: any[], customer_name?: string }) | undefined> {
    const [invoice] = await db.select().from(sales_invoices).where(eq(sales_invoices.id, id));
    if (!invoice) return undefined;
    
    // Fetch lines for this invoice
    const lines = await db.select().from(document_lines).where(
      and(
        eq(document_lines.document_id, id),
        eq(document_lines.document_type, 'invoice')
      )
    );
    
    // Fetch customer name
    let customer_name = '';
    if (invoice.customer_id) {
      const [customer] = await db.select({ name: contacts.name }).from(contacts).where(eq(contacts.id, invoice.customer_id));
      customer_name = customer?.name || '';
    }
    
    return { ...invoice, lines, customer_name };
  }

  async updateSalesInvoice(id: string, updateData: Partial<InsertSalesInvoice>): Promise<SalesInvoice | undefined> {
    const [invoice] = await db
      .update(sales_invoices)
      .set({ ...updateData, updated_at: new Date() })
      .where(eq(sales_invoices.id, id))
      .returning();
    return invoice;
  }

  async deleteSalesInvoice(id: string): Promise<boolean> {
    await db.delete(sales_invoices).where(eq(sales_invoices.id, id));
    return true;
  }

  // === Sales Quotes Implementation ===
  async createSalesQuote(insertSalesQuote: any): Promise<SalesQuote> {
    const [quote] = await db
      .insert(sales_quotes)
      .values(insertSalesQuote)
      .returning();
    return quote;
  }

  async getSalesQuotesByCompany(companyId: string): Promise<SalesQuote[]> {
    return await db.select().from(sales_quotes).where(eq(sales_quotes.company_id, companyId));
  }

  async getSalesQuoteById(id: string): Promise<SalesQuote | undefined> {
    const [quote] = await db.select().from(sales_quotes).where(eq(sales_quotes.id, id));
    return quote || undefined;
  }

  async updateSalesQuote(id: string, updateData: Partial<any>): Promise<SalesQuote | undefined> {
    const [quote] = await db
      .update(sales_quotes)
      .set({ ...updateData, updated_at: new Date() })
      .where(eq(sales_quotes.id, id))
      .returning();
    return quote;
  }

  async deleteSalesQuote(id: string): Promise<boolean> {
    await db.delete(sales_quotes).where(eq(sales_quotes.id, id));
    return true;
  }

  // === Sales Orders Implementation ===
  async createSalesOrder(insertSalesOrder: any): Promise<SalesOrder> {
    const [order] = await db
      .insert(sales_orders)
      .values(insertSalesOrder)
      .returning();
    return order;
  }

  async getSalesOrdersByCompany(companyId: string): Promise<SalesOrder[]> {
    return await db.select().from(sales_orders).where(eq(sales_orders.company_id, companyId));
  }

  async getSalesOrderById(id: string): Promise<SalesOrder | undefined> {
    const result = await db.select().from(sales_orders).where(eq(sales_orders.id, id)).limit(1);
    return result[0];
  }

  async updateSalesOrder(id: string, updateData: Partial<any>): Promise<SalesOrder | undefined> {
    const [order] = await db
      .update(sales_orders)
      .set({ ...updateData, updated_at: new Date() })
      .where(eq(sales_orders.id, id))
      .returning();
    return order;
  }

  async deleteSalesOrder(companyId: string, id: string): Promise<boolean> {
    const result = await db
      .delete(sales_orders)
      .where(and(eq(sales_orders.id, id), eq(sales_orders.company_id, companyId)));
    return (result as any).rowCount ? (result as any).rowCount > 0 : true;
  }

  // === Bank Accounts Implementation ===
  async createBankAccount(insertBankAccount: InsertBankAccount): Promise<BankAccount> {
    // If no account_id provided, create a linked accounting account first
    if (!insertBankAccount.account_id) {
      // Create an accounting account for this bank account
      const accountCode = `1001-${Date.now().toString().slice(-6)}`; // Generate unique code
      const [newAccount] = await db
        .insert(accounts)
        .values({
          company_id: insertBankAccount.company_id,
          code: accountCode,
          name: insertBankAccount.name,
          account_type: 'asset',
          account_subtype: 'Cash',
          is_active: true,
        })
        .returning();
      
      insertBankAccount.account_id = newAccount.id;
    }
    
    // If no opening_balance_date provided, use current date
    if (!insertBankAccount.opening_balance_date) {
      insertBankAccount.opening_balance_date = new Date();
    }
    
    const [bankAccount] = await db
      .insert(bank_accounts)
      .values(insertBankAccount)
      .returning();
    return bankAccount;
  }

  async getBankAccountsByCompany(companyId: string): Promise<BankAccount[]> {
    return await db.select().from(bank_accounts).where(eq(bank_accounts.company_id, companyId));
  }

  async updateBankAccount(id: string, updateData: Partial<InsertBankAccount>): Promise<BankAccount | undefined> {
    const [bankAccount] = await db
      .update(bank_accounts)
      .set({ ...updateData, updated_at: new Date() })
      .where(eq(bank_accounts.id, id))
      .returning();
    return bankAccount;
  }

  async deleteBankAccount(id: string): Promise<boolean> {
    await db.delete(bank_accounts).where(eq(bank_accounts.id, id));
    return true;
  }

  // === Bank Statement Lines Implementation ===
  async createBankStatementLine(line: InsertBankStatementLine): Promise<BankStatementLine> {
    const [row] = await db.insert(bank_statement_lines).values(line).returning();
    return row;
  }

  async getBankStatementLinesByCompany(companyId: string, bankAccountId?: string): Promise<BankStatementLine[]> {
    if (bankAccountId) {
      return await db
        .select()
        .from(bank_statement_lines)
        .where(and(eq(bank_statement_lines.company_id, companyId), eq(bank_statement_lines.bank_account_id, bankAccountId)));
    }
    return await db
      .select()
      .from(bank_statement_lines)
      .where(eq(bank_statement_lines.company_id, companyId));
  }

  async updateBankStatementLine(id: string, data: Partial<InsertBankStatementLine>): Promise<BankStatementLine | undefined> {
    const [row] = await db
      .update(bank_statement_lines)
      .set({ ...data, updated_at: new Date() })
      .where(eq(bank_statement_lines.id, id))
      .returning();
    return row;
  }

  async deleteBankStatementLine(companyId: string, id: string): Promise<boolean> {
    await db
      .delete(bank_statement_lines)
      .where(and(eq(bank_statement_lines.company_id, companyId), eq(bank_statement_lines.id, id)));
    return true;
  }

  // === Bills Implementation ===
  async createBill(insertBill: InsertBill): Promise<Bill> {
    const [bill] = await db
      .insert(bills)
      .values(insertBill)
      .returning();
    return bill;
  }

  async getBillsByCompany(companyId: string): Promise<Bill[]> {
    return await db.select().from(bills).where(eq(bills.company_id, companyId));
  }

  async getBillById(id: string): Promise<Bill | undefined> {
    const result = await db.select().from(bills).where(eq(bills.id, id)).limit(1);
    return result[0];
  }

  async updateBill(id: string, updateData: Partial<InsertBill>): Promise<Bill | undefined> {
    const [bill] = await db
      .update(bills)
      .set({ ...updateData, updated_at: new Date() })
      .where(eq(bills.id, id))
      .returning();
    return bill;
  }

  async deleteBill(companyId: string, id: string): Promise<boolean> {
    const result = await db.delete(bills).where(
      and(eq(bills.id, id), eq(bills.company_id, companyId))
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // === Purchase Orders Implementation ===
  async createPurchaseOrder(insertPurchaseOrder: any): Promise<PurchaseOrder> {
    const [order] = await db
      .insert(purchase_orders)
      .values(insertPurchaseOrder)
      .returning();
    return order;
  }

  async getPurchaseOrdersByCompany(companyId: string): Promise<PurchaseOrder[]> {
    return await db.select().from(purchase_orders).where(eq(purchase_orders.company_id, companyId));
  }

  async getPurchaseOrderById(id: string): Promise<PurchaseOrder | undefined> {
    const result = await db.select().from(purchase_orders).where(eq(purchase_orders.id, id)).limit(1);
    return result[0];
  }

  async updatePurchaseOrder(id: string, updateData: Partial<any>): Promise<PurchaseOrder | undefined> {
    const [order] = await db
      .update(purchase_orders)
      .set({ ...updateData, updated_at: new Date() })
      .where(eq(purchase_orders.id, id))
      .returning();
    return order;
  }

  async deletePurchaseOrder(companyId: string, id: string): Promise<boolean> {
    const result = await db
      .delete(purchase_orders)
      .where(and(eq(purchase_orders.id, id), eq(purchase_orders.company_id, companyId)));
    return (result as any).rowCount ? (result as any).rowCount > 0 : true;
  }

  // === Expenses Implementation ===
  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const [expense] = await db
      .insert(expenses)
      .values(insertExpense)
      .returning();
    return expense;
  }

  async getExpensesByCompany(companyId: string): Promise<Expense[]> {
    return await db.select().from(expenses).where(eq(expenses.company_id, companyId));
  }

  // === Payments Implementation ===
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(insertPayment)
      .returning();
    return payment;
  }

  async getPaymentsByCompany(companyId: string): Promise<Payment[]> {
    // Explicitly select columns to avoid crashing if 'reconciled' column is missing in DB
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
      updated_at: payments.updated_at,
    }).from(payments).where(eq(payments.company_id, companyId)) as unknown as Payment[];
  }

  async deletePayment(companyId: string, id: string): Promise<boolean> {
    const result = await db
      .delete(payments)
      .where(and(eq(payments.id, id), eq(payments.company_id, companyId)));
    return (result as any).rowCount > 0;
  }

  // === Receipts Implementation ===
  async createReceipt(insertReceipt: InsertReceipt): Promise<Receipt> {
    const [receipt] = await db
      .insert(receipts)
      .values(insertReceipt)
      .returning();
    return receipt;
  }

  async getReceiptsByCompany(companyId: string): Promise<Receipt[]> {
    // Explicitly select columns to avoid crashing if 'reconciled' column is missing in DB
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
      updated_at: receipts.updated_at,
    }).from(receipts).where(eq(receipts.company_id, companyId)) as unknown as Receipt[];
  }

  async deleteReceipt(companyId: string, id: string): Promise<boolean> {
    const result = await db
      .delete(receipts)
      .where(and(eq(receipts.id, id), eq(receipts.company_id, companyId)));
    return (result as any).rowCount > 0;
  }

  // === Warehouses ===
  async getWarehousesByCompany(companyId: string): Promise<Warehouse[]> {
    return await db.select().from(warehouses).where(eq(warehouses.company_id, companyId));
  }

  // === Sales Credit Notes Implementation ===
  async createSalesCreditNote(insertNote: InsertSalesCreditNote): Promise<SalesCreditNote> {
    const [note] = await db
      .insert(sales_credit_notes)
      .values(insertNote)
      .returning();
    return note;
  }

  async getSalesCreditNotesByCompany(companyId: string): Promise<SalesCreditNote[]> {
    return await db.select().from(sales_credit_notes).where(eq(sales_credit_notes.company_id, companyId));
  }

  async getSalesCreditNoteById(id: string): Promise<SalesCreditNote | undefined> {
    const [note] = await db.select().from(sales_credit_notes).where(eq(sales_credit_notes.id, id));
    return note;
  }

  async updateSalesCreditNote(id: string, updateData: Partial<InsertSalesCreditNote>): Promise<SalesCreditNote | undefined> {
    const [note] = await db
      .update(sales_credit_notes)
      .set({ ...updateData, updated_at: new Date() })
      .where(eq(sales_credit_notes.id, id))
      .returning();
    return note;
  }

  async deleteSalesCreditNote(companyId: string, id: string): Promise<boolean> {
    const result = await db
      .delete(sales_credit_notes)
      .where(and(eq(sales_credit_notes.id, id), eq(sales_credit_notes.company_id, companyId)));
    return (result as any).rowCount > 0;
  }

  async applySalesCreditNote(allocation: InsertPaymentAllocation): Promise<boolean> {
    // 1. Create allocation
    await db.insert(payment_allocations).values(allocation);

    // 2. Update Invoice paid_amount
    const invoice = await this.getSalesInvoiceById(allocation.document_id);
    if (invoice) {
      const newPaid = (parseFloat(invoice.paid_amount || '0') + parseFloat(allocation.allocated_amount.toString())).toString();
      let status = invoice.status;
      if (parseFloat(newPaid) >= parseFloat(invoice.total)) {
        status = 'paid';
      } else if (parseFloat(newPaid) > 0) {
        status = 'partially_paid';
      }
      await this.updateSalesInvoice(invoice.id, { paid_amount: newPaid, status });
    }

    // 3. Update Credit Note remaining_amount
    const creditNote = await this.getSalesCreditNoteById(allocation.payment_id);
    if (creditNote) {
      const newRemaining = (parseFloat(creditNote.remaining_amount || creditNote.total) - parseFloat(allocation.allocated_amount.toString())).toString();
      let status = creditNote.status;
      if (parseFloat(newRemaining) <= 0) {
        status = 'applied';
      } else {
        status = 'partially_applied';
      }
      await this.updateSalesCreditNote(creditNote.id, { remaining_amount: newRemaining, status });
    }

    return true;
  }

  // === Purchase Debit Notes Implementation ===
  async createPurchaseDebitNote(insertNote: InsertPurchaseDebitNote): Promise<PurchaseDebitNote> {
    const [note] = await db
      .insert(purchase_debit_notes)
      .values(insertNote)
      .returning();
    return note;
  }

  async getPurchaseDebitNotesByCompany(companyId: string): Promise<PurchaseDebitNote[]> {
    return await db.select().from(purchase_debit_notes).where(eq(purchase_debit_notes.company_id, companyId));
  }

  async getPurchaseDebitNoteById(id: string): Promise<PurchaseDebitNote | undefined> {
    const [note] = await db.select().from(purchase_debit_notes).where(eq(purchase_debit_notes.id, id));
    return note;
  }

  async updatePurchaseDebitNote(id: string, updateData: Partial<InsertPurchaseDebitNote>): Promise<PurchaseDebitNote | undefined> {
    const [note] = await db
      .update(purchase_debit_notes)
      .set({ ...updateData, updated_at: new Date() })
      .where(eq(purchase_debit_notes.id, id))
      .returning();
    return note;
  }

  async deletePurchaseDebitNote(companyId: string, id: string): Promise<boolean> {
    const result = await db
      .delete(purchase_debit_notes)
      .where(and(eq(purchase_debit_notes.id, id), eq(purchase_debit_notes.company_id, companyId)));
    return (result as any).rowCount > 0;
  }

  async applyPurchaseDebitNote(allocation: InsertPaymentAllocation): Promise<boolean> {
    // 1. Create allocation
    await db.insert(payment_allocations).values(allocation);

    // 2. Update Bill paid_amount
    const bill = await this.getBillById(allocation.document_id);
    if (bill) {
      const newPaid = (parseFloat(bill.paid_amount || '0') + parseFloat(allocation.allocated_amount.toString())).toString();
      let status = bill.status;
      if (parseFloat(newPaid) >= parseFloat(bill.total)) {
        status = 'paid';
      } else if (parseFloat(newPaid) > 0) {
        status = 'partially_paid';
      }
      await this.updateBill(bill.id, { paid_amount: newPaid, status });
    }

    // 3. Update Debit Note remaining_amount
    const debitNote = await this.getPurchaseDebitNoteById(allocation.payment_id);
    if (debitNote) {
      const newRemaining = (parseFloat(debitNote.remaining_amount || debitNote.total) - parseFloat(allocation.allocated_amount.toString())).toString();
      let status = debitNote.status;
      if (parseFloat(newRemaining) <= 0) {
        status = 'applied';
      } else {
        status = 'partially_applied';
      }
      await this.updatePurchaseDebitNote(debitNote.id, { remaining_amount: newRemaining, status });
    }

    return true;
  }
  // === Recurring Templates Implementation ===
  async createRecurringTemplate(insertTemplate: InsertRecurringTemplate): Promise<RecurringTemplate> {
    const [template] = await db
      .insert(recurring_templates)
      .values(insertTemplate)
      .returning();
    return template;
  }

  async getRecurringTemplatesByCompany(companyId: string, documentType?: string): Promise<RecurringTemplate[]> {
    if (documentType) {
      return await db
        .select()
        .from(recurring_templates)
        .where(
          and(
            eq(recurring_templates.company_id, companyId),
            eq(recurring_templates.document_type, documentType)
          )
        );
    }
    return await db
      .select()
      .from(recurring_templates)
      .where(eq(recurring_templates.company_id, companyId));
  }

  async updateRecurringTemplate(id: string, updateData: Partial<InsertRecurringTemplate>): Promise<RecurringTemplate | undefined> {
    const [template] = await db
      .update(recurring_templates)
      .set({ ...updateData, updated_at: new Date() })
      .where(eq(recurring_templates.id, id))
      .returning();
    return template;
  }

  async deleteRecurringTemplate(id: string): Promise<boolean> {
    const result = await db
      .delete(recurring_templates)
      .where(eq(recurring_templates.id, id));
    return (result as any).rowCount > 0;
  }

  // Reports
  async getTrialBalance(companyId: string, endDate?: Date): Promise<any[]> {
    try {
      // Build base query with accounts
      let query = db
        .select({
          id: accounts.id,
          code: accounts.code,
          name: accounts.name,
          account_type: accounts.account_type,
          account_subtype: accounts.account_subtype,
          debit: sql<number>`COALESCE(SUM(${journal_lines.debit}), 0)`,
          credit: sql<number>`COALESCE(SUM(${journal_lines.credit}), 0)`
        })
        .from(accounts)
        .leftJoin(journal_lines, eq(accounts.id, journal_lines.account_id))
        .leftJoin(journals, eq(journal_lines.journal_id, journals.id))
        .where(
          and(
            eq(accounts.company_id, companyId),
            eq(accounts.is_active, true),
            endDate ? lte(journals.date, endDate) : undefined
          )
        )
        .groupBy(accounts.id, accounts.code, accounts.name, accounts.account_type, accounts.account_subtype)
        .having(sql`COALESCE(SUM(${journal_lines.debit}), 0) + COALESCE(SUM(${journal_lines.credit}), 0) > 0`)
        .orderBy(accounts.code, accounts.name);

      const result = await query;
      return result;
    } catch (error) {
      console.error('Error getting trial balance:', error);
      return [];
    }
  }

  async getBalanceSheet(companyId: string, endDate?: Date): Promise<any> {
    try {
      // Get all accounts with their balances
      const accountsData = await db
        .select({
          id: accounts.id,
          code: accounts.code,
          name: accounts.name,
          account_type: accounts.account_type,
          account_subtype: accounts.account_subtype,
          debit: sql<number>`COALESCE(SUM(${journal_lines.debit}), 0)`,
          credit: sql<number>`COALESCE(SUM(${journal_lines.credit}), 0)`
        })
        .from(accounts)
        .leftJoin(journal_lines, eq(accounts.id, journal_lines.account_id))
        .leftJoin(journals, eq(journal_lines.journal_id, journals.id))
        .where(
          and(
            eq(accounts.company_id, companyId),
            eq(accounts.is_active, true),
            endDate ? lte(journals.date, endDate) : undefined
          )
        )
        .groupBy(accounts.id, accounts.code, accounts.name, accounts.account_type, accounts.account_subtype)
        .orderBy(accounts.code, accounts.name);

      // Calculate net balance for each account based on account type
      const balancedAccounts = accountsData.map(account => {
        // For assets and expenses: debit increases balance
        // For liabilities, equity, and revenue: credit increases balance
        let balance = 0;
        if (account.account_type === 'asset' || account.account_type === 'expense') {
          balance = account.debit - account.credit;
        } else {
          balance = account.credit - account.debit;
        }
        
        return {
          ...account,
          balance
        };
      });

      // Filter accounts with non-zero balances for balance sheet
      const activeAccounts = balancedAccounts.filter(account => 
        Math.abs(account.balance) > 0.01 &&
        ['asset', 'liability', 'equity'].includes(account.account_type)
      );

      // Group accounts by type and subtype
      const assets = {
        current: activeAccounts.filter(acc => 
          acc.account_type === 'asset' && 
          (acc.account_subtype === 'current_asset' || acc.account_subtype?.includes('current'))
        ),
        nonCurrent: activeAccounts.filter(acc => 
          acc.account_type === 'asset' && 
          (!acc.account_subtype || 
           (!acc.account_subtype.includes('current') && acc.account_subtype !== 'current_asset'))
        )
      };

      const liabilities = {
        current: activeAccounts.filter(acc => 
          acc.account_type === 'liability' && 
          (acc.account_subtype === 'current_liability' || acc.account_subtype?.includes('current'))
        ),
        nonCurrent: activeAccounts.filter(acc => 
          acc.account_type === 'liability' && 
          (!acc.account_subtype || 
           (!acc.account_subtype.includes('current') && acc.account_subtype !== 'current_liability'))
        )
      };

      const equity = activeAccounts.filter(acc => acc.account_type === 'equity');

      return {
        assets,
        liabilities,
        equity,
        date: endDate || new Date()
      };
    } catch (error) {
      console.error('Error getting balance sheet:', error);
      return {
        assets: { current: [], nonCurrent: [] },
        liabilities: { current: [], nonCurrent: [] },
        equity: [],
        date: new Date()
      };
    }
  }

  // === AI Feedback ===
  async createAIFeedback(entry: InsertAIFeedback): Promise<AIFeedback> {
    const [row] = await db.insert(ai_feedback).values(entry).returning();
    return row;
  }

  async getProfitLoss(companyId: string, startDate?: Date, endDate?: Date): Promise<any> {
    try {
      // Get revenue and expense accounts with their balances for the period
      const accountsData = await db
        .select({
          id: accounts.id,
          code: accounts.code,
          name: accounts.name,
          account_type: accounts.account_type,
          account_subtype: accounts.account_subtype,
          debit: sql<number>`COALESCE(SUM(${journal_lines.debit}), 0)`,
          credit: sql<number>`COALESCE(SUM(${journal_lines.credit}), 0)`
        })
        .from(accounts)
        .leftJoin(journal_lines, eq(accounts.id, journal_lines.account_id))
        .leftJoin(journals, eq(journal_lines.journal_id, journals.id))
        .where(
          and(
            eq(accounts.company_id, companyId),
            eq(accounts.is_active, true),
            // Filter by date range if provided
            startDate ? gte(journals.date, startDate) : undefined,
            endDate ? lte(journals.date, endDate) : undefined,
            // Only include revenue and expense accounts for P&L
            or(
              eq(accounts.account_type, 'revenue'),
              eq(accounts.account_type, 'expense')
            )
          )
        )
        .groupBy(accounts.id, accounts.code, accounts.name, accounts.account_type, accounts.account_subtype)
        .orderBy(accounts.code, accounts.name);

      // Calculate net balance for each account based on account type
      const balancedAccounts = accountsData.map(account => {
        let balance = 0;
        // For revenue: credit increases balance (credit - debit)
        // For expenses: debit increases balance (debit - credit)
        if (account.account_type === 'revenue') {
          balance = account.credit - account.debit;
        } else if (account.account_type === 'expense') {
          balance = account.debit - account.credit;
        }
        
        return {
          ...account,
          balance
        };
      });

      // Filter accounts with non-zero balances
      const activeAccounts = balancedAccounts.filter(account => 
        Math.abs(account.balance) > 0.01
      );

      // Group accounts by type and subtype
      const revenue = {
        operating: activeAccounts.filter(acc => 
          acc.account_type === 'revenue' && 
          (acc.account_subtype === 'operating_revenue' || 
           acc.account_subtype === 'sales_revenue' ||
           acc.account_subtype?.includes('operating') ||
           !acc.account_subtype)
        ),
        nonOperating: activeAccounts.filter(acc => 
          acc.account_type === 'revenue' && 
          (acc.account_subtype === 'other_income' || 
           acc.account_subtype === 'non_operating_revenue' ||
           acc.account_subtype?.includes('other'))
        )
      };

      const expenses = {
        costOfGoodsSold: activeAccounts.filter(acc => 
          acc.account_type === 'expense' && 
          (acc.account_subtype === 'cost_of_goods_sold' || 
           acc.account_subtype === 'cogs' ||
           acc.account_subtype?.includes('cogs'))
        ),
        operating: activeAccounts.filter(acc => 
          acc.account_type === 'expense' && 
          (acc.account_subtype === 'operating_expense' || 
           acc.account_subtype === 'administrative' ||
           acc.account_subtype === 'selling' ||
           acc.account_subtype?.includes('operating') ||
           (!acc.account_subtype && !acc.account_subtype?.includes('cogs') && !acc.account_subtype?.includes('other')))
        ),
        nonOperating: activeAccounts.filter(acc => 
          acc.account_type === 'expense' && 
          (acc.account_subtype === 'other_expense' || 
           acc.account_subtype === 'non_operating_expense' ||
           acc.account_subtype === 'interest_expense' ||
           acc.account_subtype?.includes('other'))
        )
      };

      return {
        revenue,
        expenses,
        startDate: startDate || new Date(new Date().getFullYear(), 0, 1), // Default to year start
        endDate: endDate || new Date()
      };
    } catch (error) {
      console.error('Error getting profit loss:', error);
      return {
        revenue: { operating: [], nonOperating: [] },
        expenses: { costOfGoodsSold: [], operating: [], nonOperating: [] },
        startDate: new Date(new Date().getFullYear(), 0, 1),
        endDate: new Date()
      };
    }
  }

  async getCashFlow(companyId: string, startDate?: Date, endDate?: Date): Promise<any> {
    try {
      // Get company data for currency and name
      const company = await this.getCompanyById(companyId);
      const companyCurrency = company?.base_currency || 'USD';
      const companyName = company?.name || 'Company';

      // Get beginning cash balance from actual transactions
      const beginningCashBalance = await this.calculateBeginningCashBalance(companyId, startDate || new Date(new Date().getFullYear(), 0, 1));

      // Calculate operating cash flows from actual data
      const operatingActivities = await this.calculateOperatingCashFlows(companyId, startDate, endDate);
      
      // Calculate investing cash flows from actual data
      const investingActivities = await this.calculateInvestingCashFlows(companyId, startDate, endDate);
      
      // Calculate financing cash flows from actual data
      const financingActivities = await this.calculateFinancingCashFlows(companyId, startDate, endDate);

      // Calculate totals
      const operatingCashFlow = operatingActivities.reduce((sum, item) => sum + item.amount, 0);
      const investingCashFlow = investingActivities.reduce((sum, item) => sum + item.amount, 0);
      const financingCashFlow = financingActivities.reduce((sum, item) => sum + item.amount, 0);
      
      const netCashFlow = operatingCashFlow + investingCashFlow + financingCashFlow;
      const endingCash = beginningCashBalance + netCashFlow;

      return {
        period: endDate ? endDate.toISOString().substring(0, 7) : new Date().toISOString().substring(0, 7),
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
        startDate: startDate || new Date(new Date().getFullYear(), 0, 1),
        endDate: endDate || new Date()
      };
    } catch (error) {
      console.error('Error getting cash flow:', error);
      // Fallback to empty data - no mock values
      return {
        period: new Date().toISOString().substring(0, 7),
        company: 'Company',
        currency: 'USD', // Will be overridden by frontend's companyCurrency hook
        beginningCash: 0,
        endingCash: 0,
        netCashFlow: 0,
        operatingActivities: [],
        investingActivities: [],
        financingActivities: [],
        operatingCashFlow: 0,
        investingCashFlow: 0,
        financingCashFlow: 0,
        startDate: new Date(new Date().getFullYear(), 0, 1),
        endDate: new Date()
      };
    }
  }

  private async calculateBeginningCashBalance(companyId: string, startDate: Date): Promise<number> {
    try {
      // Get sum of all receipts (cash inflows) before start date
      const receiptsBeforeStart = await db
        .select({ total: sql<number>`COALESCE(SUM(CAST(${receipts.amount} AS DECIMAL)), 0)` })
        .from(receipts)
        .where(
          and(
            eq(receipts.company_id, companyId),
            lte(receipts.date, startDate)
          )
        );
      
      // Get sum of all payments (cash outflows) before start date
      const paymentsBeforeStart = await db
        .select({ total: sql<number>`COALESCE(SUM(CAST(${payments.amount} AS DECIMAL)), 0)` })
        .from(payments)
        .where(
          and(
            eq(payments.company_id, companyId),
            lte(payments.date, startDate)
          )
        );

      const totalReceipts = Number(receiptsBeforeStart[0]?.total || 0);
      const totalPayments = Number(paymentsBeforeStart[0]?.total || 0);

      return totalReceipts - totalPayments;
    } catch (error) {
      console.error('Error calculating beginning cash balance:', error);
      return 0;
    }
  }

  private async calculateOperatingCashFlows(companyId: string, startDate?: Date, endDate?: Date): Promise<any[]> {
    try {
      const activities: any[] = [];
      const start = startDate || new Date(new Date().getFullYear(), 0, 1);
      const end = endDate || new Date();

      // Calculate Net Income from receipts (revenue) minus payments for expenses
      const receiptsInPeriod = await db
        .select({ total: sql<number>`COALESCE(SUM(CAST(${receipts.amount} AS DECIMAL)), 0)` })
        .from(receipts)
        .where(
          and(
            eq(receipts.company_id, companyId),
            gte(receipts.date, start),
            lte(receipts.date, end)
          )
        );

      // Get payments for operating expenses (excluding investing/financing)
      const operatingPayments = await db
        .select({ total: sql<number>`COALESCE(SUM(CAST(${payments.amount} AS DECIMAL)), 0)` })
        .from(payments)
        .where(
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
          item: 'Net Income',
          description: 'Net Income',
          amount: netIncome,
          isInflow: netIncome > 0
        });
      }

      return activities;
    } catch (error) {
      console.error('Error calculating operating cash flows:', error);
      return [];
    }
  }

  private async calculateInvestingCashFlows(companyId: string, startDate?: Date, endDate?: Date): Promise<any[]> {
    // For now, return empty array - would need fixed assets module to track equipment purchases
    return [];
  }

  private async calculateFinancingCashFlows(companyId: string, startDate?: Date, endDate?: Date): Promise<any[]> {
    // For now, return empty array - would need loans module to track financing activities
    return [];
  }

  async getTaxReportByTaxId(
    companyId: string,
    taxId: string,
    startDate?: Date,
    endDate?: Date,
    filters?: { customerId?: string; vendorId?: string; currency?: string; warehouseId?: string }
  ): Promise<any> {
    // Aggregates sales and purchase lines whose item.default_tax_id matches taxId
    // Uses document_lines with document_type 'invoice' and 'bill'
    const toNumber = (v: any) => {
      const n = parseFloat((v as any)?.toString?.() || String(v || '0'));
      return Number.isFinite(n) ? n : 0;
    };

    // Sales (Invoices)
    const invConds: any[] = [
      eq(document_lines.document_type, 'invoice'),
      eq(sales_invoices.company_id, companyId),
    ];
    if (startDate) invConds.push(gte(sales_invoices.date, startDate));
    if (endDate) invConds.push(lte(sales_invoices.date, endDate));
    if (filters?.customerId) invConds.push(eq(sales_invoices.customer_id, filters.customerId));
    if (filters?.currency) invConds.push(eq(sales_invoices.currency, filters.currency));
    if (filters?.warehouseId) invConds.push(
      and(
        eq(stock_movements.reference_type, 'invoice'),
        eq(stock_movements.reference_id, sales_invoices.id),
        eq(stock_movements.item_id, document_lines.item_id),
        eq(stock_movements.warehouse_id, filters.warehouseId)
      )
    );

    const invoiceRows = await db
      .select({
        invoice_id: sales_invoices.id,
        invoice_number: sales_invoices.invoice_number,
        date: sales_invoices.date,
        line_total: document_lines.line_total,
        tax_amount: document_lines.tax_amount,
        item_id: document_lines.item_id,
        default_tax_id: items.default_tax_id,
        line_tax_id: document_lines.tax_id,
      })
      .from(document_lines)
      .leftJoin(sales_invoices, and(
        eq(document_lines.document_id, sales_invoices.id),
        eq(document_lines.document_type, 'invoice')
      ))
      .leftJoin(stock_movements, and(
        eq(stock_movements.reference_type, 'invoice'),
        eq(stock_movements.reference_id, sales_invoices.id),
        eq(stock_movements.item_id, document_lines.item_id)
      ))
      .leftJoin(items, eq(document_lines.item_id, items.id))
      .where(and(...(invConds as [any, any, ...any[]])));

    const invoiceLines = invoiceRows.filter(r => (r as any).line_tax_id ? (r as any).line_tax_id === taxId : r.default_tax_id === taxId);
    const salesTaxable = invoiceLines.reduce((s, r) => s + toNumber(r.line_total), 0);
    const salesTax = invoiceLines.reduce((s, r) => s + toNumber(r.tax_amount), 0);

    // Purchases (Bills)
    const billConds: any[] = [
      eq(document_lines.document_type, 'bill'),
      eq(bills.company_id, companyId),
    ];
    if (startDate) billConds.push(gte(bills.date, startDate));
    if (endDate) billConds.push(lte(bills.date, endDate));
    if (filters?.vendorId) billConds.push(eq(bills.supplier_id, filters.vendorId));
    if (filters?.currency) billConds.push(eq(bills.currency, filters.currency));
    if (filters?.warehouseId) billConds.push(
      and(
        eq(stock_movements.reference_type, 'bill'),
        eq(stock_movements.reference_id, bills.id),
        eq(stock_movements.item_id, document_lines.item_id),
        eq(stock_movements.warehouse_id, filters.warehouseId)
      )
    );

    const billRows = await db
      .select({
        bill_id: bills.id,
        bill_number: bills.bill_number,
        date: bills.date,
        line_total: document_lines.line_total,
        tax_amount: document_lines.tax_amount,
        item_id: document_lines.item_id,
        default_tax_id: items.default_tax_id,
        line_tax_id: document_lines.tax_id,
      })
      .from(document_lines)
      .leftJoin(bills, and(
        eq(document_lines.document_id, bills.id),
        eq(document_lines.document_type, 'bill')
      ))
      .leftJoin(stock_movements, and(
        eq(stock_movements.reference_type, 'bill'),
        eq(stock_movements.reference_id, bills.id),
        eq(stock_movements.item_id, document_lines.item_id)
      ))
      .leftJoin(items, eq(document_lines.item_id, items.id))
      .where(and(...(billConds as [any, any, ...any[]])));

    const billLines = billRows.filter(r => (r as any).line_tax_id ? (r as any).line_tax_id === taxId : r.default_tax_id === taxId);
    const purchaseTaxable = billLines.reduce((s, r) => s + toNumber(r.line_total), 0);
    const purchaseTax = billLines.reduce((s, r) => s + toNumber(r.tax_amount), 0);

    const tax = await this.getTaxById(taxId);
    const company = await this.getCompanyById(companyId);
    const period = startDate && endDate 
      ? `${startDate.toISOString().slice(0,10)}_${endDate.toISOString().slice(0,10)}` 
      : new Date().toISOString().substring(0,7);

    return {
      period,
      company: company?.name ?? 'Company',
      currency: company?.base_currency ?? 'USD',
      tax,
      sales: {
        count: invoiceLines.length,
        taxable: salesTaxable,
        tax: salesTax,
        lines: invoiceLines.map(r => ({
          id: r.invoice_id,
          number: r.invoice_number,
          date: r.date,
          line_total: toNumber(r.line_total),
          tax_amount: toNumber(r.tax_amount),
        })),
      },
      purchases: {
        count: billLines.length,
        taxable: purchaseTaxable,
        tax: purchaseTax,
        lines: billLines.map(r => ({
          id: r.bill_id,
          number: r.bill_number,
          date: r.date,
          line_total: toNumber(r.line_total),
          tax_amount: toNumber(r.tax_amount),
        })),
      },
      totals: {
        taxable: salesTaxable + purchaseTaxable,
        collected: salesTax,
        paid: purchaseTax,
        net: salesTax - purchaseTax,
      }
    };
  }

  async getTaxReport(
    companyId: string,
    startDate?: Date,
    endDate?: Date,
    filters?: { customerId?: string; vendorId?: string; currency?: string; warehouseId?: string }
  ): Promise<any> {
    try {
      // Get tax rates/configuration for the company
      const companyTaxRates = await db
        .select()
        .from(taxes)
        .where(
          and(
            eq(taxes.company_id, companyId),
            eq(taxes.is_active, true)
          )
        );

      // Calculate sales tax (from invoices and sales documents)
  const salesTaxData = await this.calculateSalesTax(companyId, startDate, endDate, filters);
      
      // Calculate purchase tax (from bills and expenses)
  const purchaseTaxData = await this.calculatePurchaseTax(companyId, startDate, endDate, filters);

      // Get tax filings data (mock for now - would come from a tax_filings table)
      const taxFilings = await this.getTaxFilings(companyId, startDate, endDate);

      // Calculate income tax estimates
      const incomeTaxData = await this.calculateIncomeTax(companyId, startDate, endDate);

      // Get company data
      const company = await this.getCompanyById(companyId);
      
      const period = startDate && endDate 
        ? `${startDate.toISOString().slice(0,10)}_${endDate.toISOString().slice(0,10)}` 
        : new Date().toISOString().substring(0, 7);
      
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
          totalPayrollTax: 0,
        },
        filings: taxFilings,
        startDate: startDate || new Date(new Date().getFullYear(), 0, 1),
        endDate: endDate || new Date()
      };
    } catch (error) {
      console.error('Error getting tax report:', error);
      return {
        period: new Date().toISOString().substring(0, 7),
        company: 'Company Name',
        currency: 'USD',
        salesTax: { totalSales: 0, taxableSales: 0, exemptSales: 0, collectedTax: 0, rates: [] },
        purchaseTax: { totalPurchases: 0, taxablePurchases: 0, exemptPurchases: 0, paidTax: 0, recoverable: 0 },
        incomeTax: { grossIncome: 0, deductions: 0, taxableIncome: 0, estimatedTax: 0, quarterlyPayments: [] },
        payrollTax: { grossWages: 0, federalWithholding: 0, stateWithholding: 0, socialSecurity: 0, medicare: 0, employerContributions: 0, totalPayrollTax: 0 },
        filings: [],
        startDate: new Date(new Date().getFullYear(), 0, 1),
        endDate: new Date()
      };
    }
  }

  private async calculateSalesTax(
    companyId: string,
    startDate?: Date,
    endDate?: Date,
    filters?: { customerId?: string; currency?: string; warehouseId?: string }
  ): Promise<any> {
    // If warehouse filter present, compute from document_lines joined to stock_movements
    if (filters?.warehouseId) {
      const conds: any[] = [
        eq(document_lines.document_type, 'invoice'),
        eq(sales_invoices.company_id, companyId),
        eq(stock_movements.reference_type, 'invoice'),
        eq(stock_movements.reference_id, sales_invoices.id),
        eq(stock_movements.item_id, document_lines.item_id),
        eq(stock_movements.warehouse_id, filters.warehouseId)
      ];
      if (startDate) conds.push(gte(sales_invoices.date, startDate));
      if (endDate) conds.push(lte(sales_invoices.date, endDate));
      if (filters.customerId) conds.push(eq(sales_invoices.customer_id, filters.customerId));
      if (filters.currency) conds.push(eq(sales_invoices.currency, filters.currency));

      const rows = await db
        .select({
          line_total: document_lines.line_total,
          tax_amount: document_lines.tax_amount,
        })
        .from(document_lines)
        .leftJoin(sales_invoices, and(
          eq(document_lines.document_id, sales_invoices.id),
          eq(document_lines.document_type, 'invoice')
        ))
        .leftJoin(stock_movements, and(
          eq(stock_movements.reference_type, 'invoice'),
          eq(stock_movements.reference_id, sales_invoices.id),
          eq(stock_movements.item_id, document_lines.item_id)
        ))
        .where(and(...(conds as [any, any, ...any[]])));

      const toNum = (v: any) => {
        const n = parseFloat((v as any)?.toString?.() || String(v || '0'));
        return Number.isFinite(n) ? n : 0;
      };
      const lineTotals = rows.reduce((s, r) => s + toNum(r.line_total), 0);
      const taxTotals = rows.reduce((s, r) => s + toNum(r.tax_amount), 0);
      const totalSales = lineTotals + taxTotals;
      const collectedTax = taxTotals;
      const taxableSales = lineTotals;

      return {
        totalSales,
        taxableSales,
        exemptSales: 0,
        collectedTax,
        rates: [
          { jurisdiction: 'Sales Tax', rate: 8.5, taxable: taxableSales, tax: collectedTax }
        ]
      };
    }

    // Default: aggregate at invoice level
    const conditions = [eq(sales_invoices.company_id, companyId)];
    if (startDate) conditions.push(gte(sales_invoices.date, startDate));
    if (endDate) conditions.push(lte(sales_invoices.date, endDate));
    if (filters?.customerId) conditions.push(eq(sales_invoices.customer_id, filters.customerId));
    if (filters?.currency) conditions.push(eq(sales_invoices.currency, filters.currency));
    const whereExpr = conditions.length === 1 ? conditions[0] : and(...conditions as [any, any, ...any[]]);

    const salesResults = await db
      .select({
        subtotal: sales_invoices.subtotal,
        tax_total: sales_invoices.tax_total,
        total: sales_invoices.total
      })
      .from(sales_invoices)
      .where(whereExpr);

    const totalSales = salesResults.reduce((sum, invoice) => sum + parseFloat(invoice.total || '0'), 0);
    const collectedTax = salesResults.reduce((sum, invoice) => sum + parseFloat(invoice.tax_total || '0'), 0);
    const taxableSales = totalSales - collectedTax;

    return {
      totalSales,
      taxableSales,
      exemptSales: 0, // Would require additional logic to determine exempt sales
      collectedTax,
      rates: [
        { jurisdiction: 'Sales Tax', rate: 8.5, taxable: taxableSales, tax: collectedTax }
      ]
    };
  }

  private async calculatePurchaseTax(
    companyId: string,
    startDate?: Date,
    endDate?: Date,
    filters?: { vendorId?: string; currency?: string; warehouseId?: string }
  ): Promise<any> {
    // If warehouse filter present, compute from document_lines joined to stock_movements
    if (filters?.warehouseId) {
      const conds: any[] = [
        eq(document_lines.document_type, 'bill'),
        eq(bills.company_id, companyId),
        eq(stock_movements.reference_type, 'bill'),
        eq(stock_movements.reference_id, bills.id),
        eq(stock_movements.item_id, document_lines.item_id),
        eq(stock_movements.warehouse_id, filters.warehouseId)
      ];
      if (startDate) conds.push(gte(bills.date, startDate));
      if (endDate) conds.push(lte(bills.date, endDate));
      if (filters.vendorId) conds.push(eq(bills.supplier_id, filters.vendorId));
      if (filters.currency) conds.push(eq(bills.currency, filters.currency));

      const rows = await db
        .select({
          line_total: document_lines.line_total,
          tax_amount: document_lines.tax_amount,
        })
        .from(document_lines)
        .leftJoin(bills, and(
          eq(document_lines.document_id, bills.id),
          eq(document_lines.document_type, 'bill')
        ))
        .leftJoin(stock_movements, and(
          eq(stock_movements.reference_type, 'bill'),
          eq(stock_movements.reference_id, bills.id),
          eq(stock_movements.item_id, document_lines.item_id)
        ))
        .where(and(...(conds as [any, any, ...any[]])));

      const toNum = (v: any) => {
        const n = parseFloat((v as any)?.toString?.() || String(v || '0'));
        return Number.isFinite(n) ? n : 0;
      };
      const lineTotals = rows.reduce((s, r) => s + toNum(r.line_total), 0);
      const taxTotals = rows.reduce((s, r) => s + toNum(r.tax_amount), 0);
      const totalPurchases = lineTotals + taxTotals;
      const paidTax = taxTotals;

      return {
        totalPurchases,
        taxablePurchases: lineTotals,
        exemptPurchases: 0,
        paidTax,
        recoverable: paidTax * 0.8
      };
    }

    // Default: aggregate at bill level
    const conditions = [eq(bills.company_id, companyId)];
    if (startDate) conditions.push(gte(bills.date, startDate));
    if (endDate) conditions.push(lte(bills.date, endDate));
    if (filters?.vendorId) conditions.push(eq(bills.supplier_id, filters.vendorId));
    if (filters?.currency) conditions.push(eq(bills.currency, filters.currency));
    const whereExpr = conditions.length === 1 ? conditions[0] : and(...conditions as [any, any, ...any[]]);

    const billsResults = await db
      .select({
        subtotal: bills.subtotal,
        tax_total: bills.tax_total,
        total: bills.total
      })
      .from(bills)
      .where(whereExpr);

    const totalPurchases = billsResults.reduce((sum, bill) => sum + parseFloat(bill.total || '0'), 0);
    const paidTax = billsResults.reduce((sum, bill) => sum + parseFloat(bill.tax_total || '0'), 0);

    return {
      totalPurchases,
      taxablePurchases: totalPurchases - paidTax,
      exemptPurchases: 0,
      paidTax,
      recoverable: paidTax * 0.8 // Simplified - 80% recoverable assumption
    };
  }

  private async calculateIncomeTax(companyId: string, startDate?: Date, endDate?: Date): Promise<any> {
    // Simplified income tax calculation based on P&L data
    const profitLossData = await this.getProfitLoss(companyId, startDate, endDate);
    
    // Extract revenue and expense totals for income tax calculation
    const revenue = profitLossData.revenue || { operating: [], nonOperating: [] };
    const expenses = profitLossData.expenses || { costOfGoodsSold: [], operating: [], nonOperating: [] };

    const totalRevenue = [...revenue.operating, ...revenue.nonOperating]
      .reduce((sum: number, account: any) => sum + account.balance, 0);
    
    const totalExpenses = [...expenses.costOfGoodsSold, ...expenses.operating, ...expenses.nonOperating]
      .reduce((sum: number, account: any) => sum + account.balance, 0);

    const taxableIncome = Math.max(0, totalRevenue - totalExpenses);
    const estimatedTax = taxableIncome * 0.25; // 25% corporate tax rate

    return {
      grossIncome: totalRevenue,
      deductions: totalExpenses,
      taxableIncome,
      estimatedTax,
      quarterlyPayments: [
        { quarter: 'Q1', dueDate: '2024-04-15', amount: estimatedTax / 4, status: 'pending' },
        { quarter: 'Q2', dueDate: '2024-06-15', amount: estimatedTax / 4, status: 'pending' },
        { quarter: 'Q3', dueDate: '2024-09-15', amount: estimatedTax / 4, status: 'pending' },
        { quarter: 'Q4', dueDate: '2025-01-15', amount: estimatedTax / 4, status: 'pending' },
      ]
    };
  }

  private async getTaxFilings(companyId: string, startDate?: Date, endDate?: Date): Promise<any[]> {
    // Mock tax filings - in real system would come from tax_filings table
    return [
      { form: 'Sales Tax Return', period: 'Q1 2024', dueDate: '2024-04-20', status: 'pending', amount: 4000.00 },
      { form: 'Corporate Tax Return', period: 'Q1 2024', dueDate: '2024-04-15', status: 'filed', amount: 2812.50 }
    ];
  }
}

export const storage = new DatabaseStorage();
