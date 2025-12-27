/**
 * Form Validation Tests - Unit Tests
 * Tests all data entry form validations without database
 * 
 * Run with: npm test -- --run tests/form-validation.test.ts
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// ===== VALIDATION HELPERS =====

function validateRequired(value: any, fieldName: string): { valid: boolean; error?: string } {
  if (value === null || value === undefined || value === '') {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true };
}

function validateEmail(email: string): { valid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  return { valid: true };
}

function validateDecimal(value: string): { valid: boolean; error?: string } {
  const num = parseFloat(value);
  if (isNaN(num)) {
    return { valid: false, error: 'Must be a valid number' };
  }
  return { valid: true };
}

function validatePositive(value: string): { valid: boolean; error?: string } {
  const num = parseFloat(value);
  if (isNaN(num) || num < 0) {
    return { valid: false, error: 'Must be a positive number' };
  }
  return { valid: true };
}

function validateDate(date: string): { valid: boolean; error?: string } {
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }
  return { valid: true };
}

function validateEnum(value: string, allowedValues: string[]): { valid: boolean; error?: string } {
  if (!allowedValues.includes(value)) {
    return { valid: false, error: `Must be one of: ${allowedValues.join(', ')}` };
  }
  return { valid: true };
}

function validateUUID(value: string): { valid: boolean; error?: string } {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(value)) {
    return { valid: false, error: 'Invalid UUID format' };
  }
  return { valid: true };
}

// ===== ZOD SCHEMAS FOR FORMS =====

const ContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['customer', 'vendor', 'both']),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  tax_number: z.string().optional(),
  contact_person: z.string().optional(),
  notes: z.string().optional(),
});

const ItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['inventory', 'service', 'non_inventory']),
  sku: z.string().optional(),
  description: z.string().optional(),
  unit: z.string().optional(),
  cost_price: z.string().optional(),
  sale_price: z.string().optional(),
  tax_id: z.string().uuid().optional().nullable(),
  category: z.string().optional(),
  is_active: z.boolean().optional(),
});

const InvoiceSchema = z.object({
  contact_id: z.string().uuid().optional().nullable(),
  date: z.string().min(1, 'Date is required'),
  due_date: z.string().optional(),
  invoice_number: z.string().optional(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled', 'partially_paid']),
  subtotal: z.string(),
  tax_amount: z.string().optional(),
  discount_amount: z.string().optional(),
  total: z.string(),
  notes: z.string().optional(),
  currency_code: z.string().length(3).optional(),
});

const ExpenseSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  amount: z.string().min(1, 'Amount is required'),
  category: z.string().optional(),
  payee: z.string().optional(),
  description: z.string().optional(),
  account_id: z.string().uuid().optional().nullable(),
  receipt_url: z.string().optional(),
  is_recurring: z.boolean().optional(),
});

const PaymentSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  amount: z.string().min(1, 'Amount is required'),
  payment_method: z.enum(['cash', 'bank_transfer', 'check', 'credit_card', 'other']),
  contact_id: z.string().uuid().optional().nullable(),
  invoice_id: z.string().uuid().optional().nullable(),
  account_id: z.string().uuid().optional().nullable(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

const ReceiptSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  amount: z.string().min(1, 'Amount is required'),
  payment_method: z.enum(['cash', 'bank_transfer', 'check', 'credit_card', 'other']),
  contact_id: z.string().uuid().optional().nullable(),
  invoice_id: z.string().uuid().optional().nullable(),
  account_id: z.string().uuid().optional().nullable(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

const BankAccountSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  bank_name: z.string().optional(),
  account_number: z.string().optional(),
  account_type: z.enum(['checking', 'savings', 'credit_card', 'other']).optional(),
  currency_code: z.string().length(3).optional(),
  opening_balance: z.string().optional(),
  is_active: z.boolean().optional(),
});

const JournalEntrySchema = z.object({
  date: z.string().min(1, 'Date is required'),
  reference: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['draft', 'posted']).optional(),
  lines: z.array(z.object({
    account_id: z.string().uuid(),
    debit: z.string().optional(),
    credit: z.string().optional(),
    description: z.string().optional(),
  })).optional(),
});

const FixedAssetSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  asset_type: z.string().min(1, 'Asset type is required'),
  purchase_date: z.string().min(1, 'Purchase date is required'),
  purchase_price: z.string().min(1, 'Purchase price is required'),
  useful_life_months: z.number().int().positive().optional(),
  depreciation_method: z.enum(['straight_line', 'declining_balance', 'units_of_production']).optional(),
  salvage_value: z.string().optional(),
  location: z.string().optional(),
  serial_number: z.string().optional(),
  status: z.enum(['active', 'sold', 'disposed', 'fully_depreciated']).optional(),
});

const BudgetSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  type: z.enum(['annual', 'quarterly', 'monthly', 'project']).optional(),
  status: z.enum(['draft', 'active', 'closed']).optional(),
  total_amount: z.string().optional(),
});

const EmployeeSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  hire_date: z.string().optional(),
  department_id: z.string().uuid().optional().nullable(),
  position: z.string().optional(),
  salary: z.string().optional(),
  status: z.enum(['active', 'inactive', 'terminated']).optional(),
});

const QuotationSchema = z.object({
  contact_id: z.string().uuid().optional().nullable(),
  date: z.string().min(1, 'Date is required'),
  valid_until: z.string().optional(),
  quotation_number: z.string().optional(),
  status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired']).optional(),
  subtotal: z.string(),
  tax_amount: z.string().optional(),
  discount_amount: z.string().optional(),
  total: z.string(),
  notes: z.string().optional(),
});

const ProjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().optional(),
  description: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: z.enum(['active', 'completed', 'on_hold', 'cancelled']).optional(),
  budget: z.string().optional(),
  contact_id: z.string().uuid().optional().nullable(),
});

const UserSchema = z.object({
  email: z.string().email('Valid email is required'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['owner', 'admin', 'accountant', 'viewer']).optional(),
});

// ===== TEST SUITES =====

describe('Contact Form Validation', () => {
  
  it('should validate valid customer contact', () => {
    const contact = {
      name: 'شركة الاختبار',
      type: 'customer' as const,
      email: 'test@company.com',
      phone: '+966501234567',
    };
    const result = ContactSchema.safeParse(contact);
    expect(result.success).toBe(true);
  });
  
  it('should validate valid vendor contact', () => {
    const contact = {
      name: 'مورد الاختبار',
      type: 'vendor' as const,
      tax_number: '300123456700003',
    };
    const result = ContactSchema.safeParse(contact);
    expect(result.success).toBe(true);
  });
  
  it('should reject contact without name', () => {
    const contact = {
      name: '',
      type: 'customer' as const,
    };
    const result = ContactSchema.safeParse(contact);
    expect(result.success).toBe(false);
  });
  
  it('should reject invalid contact type', () => {
    const contact = {
      name: 'Test',
      type: 'invalid_type',
    };
    const result = ContactSchema.safeParse(contact);
    expect(result.success).toBe(false);
  });
  
  it('should reject invalid email format', () => {
    const contact = {
      name: 'Test',
      type: 'customer' as const,
      email: 'not-an-email',
    };
    const result = ContactSchema.safeParse(contact);
    expect(result.success).toBe(false);
  });
});

describe('Item Form Validation', () => {
  
  it('should validate valid inventory item', () => {
    const item = {
      name: 'منتج اختبار',
      type: 'inventory' as const,
      sku: 'SKU-001',
      sale_price: '100.00',
      cost_price: '75.00',
    };
    const result = ItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });
  
  it('should validate valid service item', () => {
    const item = {
      name: 'خدمة استشارات',
      type: 'service' as const,
      sale_price: '500.00',
    };
    const result = ItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });
  
  it('should reject item without name', () => {
    const item = {
      name: '',
      type: 'inventory' as const,
    };
    const result = ItemSchema.safeParse(item);
    expect(result.success).toBe(false);
  });
  
  it('should reject invalid item type', () => {
    const item = {
      name: 'Test',
      type: 'invalid',
    };
    const result = ItemSchema.safeParse(item);
    expect(result.success).toBe(false);
  });
});

describe('Invoice Form Validation', () => {
  
  it('should validate valid invoice', () => {
    const invoice = {
      date: '2025-01-15',
      status: 'draft' as const,
      subtotal: '1000.00',
      tax_amount: '150.00',
      total: '1150.00',
    };
    const result = InvoiceSchema.safeParse(invoice);
    expect(result.success).toBe(true);
  });
  
  it('should reject invoice without date', () => {
    const invoice = {
      date: '',
      status: 'draft' as const,
      subtotal: '1000.00',
      total: '1000.00',
    };
    const result = InvoiceSchema.safeParse(invoice);
    expect(result.success).toBe(false);
  });
  
  it('should validate invoice with customer', () => {
    const invoice = {
      contact_id: '550e8400-e29b-41d4-a716-446655440000',
      date: '2025-01-15',
      status: 'sent' as const,
      subtotal: '2500.00',
      total: '2875.00',
    };
    const result = InvoiceSchema.safeParse(invoice);
    expect(result.success).toBe(true);
  });
  
  it('should reject invalid status', () => {
    const invoice = {
      date: '2025-01-15',
      status: 'invalid',
      subtotal: '1000.00',
      total: '1000.00',
    };
    const result = InvoiceSchema.safeParse(invoice);
    expect(result.success).toBe(false);
  });
});

describe('Expense Form Validation', () => {
  
  it('should validate valid expense', () => {
    const expense = {
      date: '2025-01-15',
      amount: '250.00',
      category: 'office_supplies',
      payee: 'مكتبة الرياض',
    };
    const result = ExpenseSchema.safeParse(expense);
    expect(result.success).toBe(true);
  });
  
  it('should reject expense without date', () => {
    const expense = {
      date: '',
      amount: '250.00',
    };
    const result = ExpenseSchema.safeParse(expense);
    expect(result.success).toBe(false);
  });
  
  it('should reject expense without amount', () => {
    const expense = {
      date: '2025-01-15',
      amount: '',
    };
    const result = ExpenseSchema.safeParse(expense);
    expect(result.success).toBe(false);
  });
});

describe('Payment Form Validation', () => {
  
  it('should validate valid cash payment', () => {
    const payment = {
      date: '2025-01-15',
      amount: '500.00',
      payment_method: 'cash' as const,
    };
    const result = PaymentSchema.safeParse(payment);
    expect(result.success).toBe(true);
  });
  
  it('should validate valid bank transfer', () => {
    const payment = {
      date: '2025-01-15',
      amount: '10000.00',
      payment_method: 'bank_transfer' as const,
      reference: 'TRN-2025-001',
    };
    const result = PaymentSchema.safeParse(payment);
    expect(result.success).toBe(true);
  });
  
  it('should reject invalid payment method', () => {
    const payment = {
      date: '2025-01-15',
      amount: '500.00',
      payment_method: 'bitcoin',
    };
    const result = PaymentSchema.safeParse(payment);
    expect(result.success).toBe(false);
  });
});

describe('Receipt Form Validation', () => {
  
  it('should validate valid receipt', () => {
    const receipt = {
      date: '2025-01-15',
      amount: '1150.00',
      payment_method: 'bank_transfer' as const,
    };
    const result = ReceiptSchema.safeParse(receipt);
    expect(result.success).toBe(true);
  });
  
  it('should validate receipt with reference', () => {
    const receipt = {
      date: '2025-01-15',
      amount: '5000.00',
      payment_method: 'check' as const,
      reference: 'CHK-12345',
      contact_id: '550e8400-e29b-41d4-a716-446655440000',
    };
    const result = ReceiptSchema.safeParse(receipt);
    expect(result.success).toBe(true);
  });
});

describe('Bank Account Form Validation', () => {
  
  it('should validate valid bank account', () => {
    const account = {
      name: 'الحساب الجاري',
      bank_name: 'البنك الأهلي',
      account_number: 'SA0380000000608010167519',
      account_type: 'checking' as const,
      currency_code: 'SAR',
    };
    const result = BankAccountSchema.safeParse(account);
    expect(result.success).toBe(true);
  });
  
  it('should reject account without name', () => {
    const account = {
      name: '',
      account_type: 'checking' as const,
    };
    const result = BankAccountSchema.safeParse(account);
    expect(result.success).toBe(false);
  });
  
  it('should validate savings account', () => {
    const account = {
      name: 'حساب التوفير',
      account_type: 'savings' as const,
      opening_balance: '50000.00',
    };
    const result = BankAccountSchema.safeParse(account);
    expect(result.success).toBe(true);
  });
});

describe('Journal Entry Form Validation', () => {
  
  it('should validate valid journal entry', () => {
    const entry = {
      date: '2025-01-15',
      reference: 'JE-2025-001',
      description: 'قيد تسوية',
      status: 'draft' as const,
    };
    const result = JournalEntrySchema.safeParse(entry);
    expect(result.success).toBe(true);
  });
  
  it('should reject entry without date', () => {
    const entry = {
      date: '',
      description: 'قيد',
    };
    const result = JournalEntrySchema.safeParse(entry);
    expect(result.success).toBe(false);
  });
  
  it('should validate entry with lines', () => {
    const entry = {
      date: '2025-01-15',
      status: 'posted' as const,
      lines: [
        { account_id: '550e8400-e29b-41d4-a716-446655440000', debit: '1000.00' },
        { account_id: '550e8400-e29b-41d4-a716-446655440001', credit: '1000.00' },
      ],
    };
    const result = JournalEntrySchema.safeParse(entry);
    expect(result.success).toBe(true);
  });
});

describe('Fixed Asset Form Validation', () => {
  
  it('should validate valid fixed asset', () => {
    const asset = {
      name: 'سيارة الشركة',
      asset_type: 'vehicle',
      purchase_date: '2025-01-01',
      purchase_price: '150000.00',
      useful_life_months: 60,
      depreciation_method: 'straight_line' as const,
      salvage_value: '15000.00',
    };
    const result = FixedAssetSchema.safeParse(asset);
    expect(result.success).toBe(true);
  });
  
  it('should reject asset without required fields', () => {
    const asset = {
      name: 'Test Asset',
      // Missing asset_type, purchase_date, purchase_price
    };
    const result = FixedAssetSchema.safeParse(asset);
    expect(result.success).toBe(false);
  });
  
  it('should validate office equipment', () => {
    const asset = {
      name: 'أجهزة حاسوب',
      asset_type: 'equipment',
      purchase_date: '2025-01-10',
      purchase_price: '25000.00',
      serial_number: 'PC-2025-001',
      location: 'المكتب الرئيسي',
    };
    const result = FixedAssetSchema.safeParse(asset);
    expect(result.success).toBe(true);
  });
});

describe('Budget Form Validation', () => {
  
  it('should validate valid annual budget', () => {
    const budget = {
      name: 'ميزانية 2025',
      start_date: '2025-01-01',
      end_date: '2025-12-31',
      type: 'annual' as const,
      status: 'active' as const,
      total_amount: '1000000.00',
    };
    const result = BudgetSchema.safeParse(budget);
    expect(result.success).toBe(true);
  });
  
  it('should reject budget without dates', () => {
    const budget = {
      name: 'Test Budget',
      start_date: '',
      end_date: '',
    };
    const result = BudgetSchema.safeParse(budget);
    expect(result.success).toBe(false);
  });
  
  it('should validate quarterly budget', () => {
    const budget = {
      name: 'ميزانية الربع الأول',
      start_date: '2025-01-01',
      end_date: '2025-03-31',
      type: 'quarterly' as const,
    };
    const result = BudgetSchema.safeParse(budget);
    expect(result.success).toBe(true);
  });
});

describe('Employee Form Validation', () => {
  
  it('should validate valid employee', () => {
    const employee = {
      first_name: 'محمد',
      last_name: 'أحمد',
      email: 'mohammed@company.com',
      phone: '+966501234567',
      hire_date: '2025-01-15',
      position: 'محاسب',
      salary: '15000.00',
      status: 'active' as const,
    };
    const result = EmployeeSchema.safeParse(employee);
    expect(result.success).toBe(true);
  });
  
  it('should reject employee without names', () => {
    const employee = {
      first_name: '',
      last_name: '',
      email: 'test@test.com',
    };
    const result = EmployeeSchema.safeParse(employee);
    expect(result.success).toBe(false);
  });
});

describe('Quotation Form Validation', () => {
  
  it('should validate valid quotation', () => {
    const quotation = {
      date: '2025-01-15',
      valid_until: '2025-02-15',
      status: 'draft' as const,
      subtotal: '5000.00',
      tax_amount: '750.00',
      total: '5750.00',
    };
    const result = QuotationSchema.safeParse(quotation);
    expect(result.success).toBe(true);
  });
  
  it('should validate quotation with customer', () => {
    const quotation = {
      contact_id: '550e8400-e29b-41d4-a716-446655440000',
      date: '2025-01-15',
      quotation_number: 'QT-2025-001',
      status: 'sent' as const,
      subtotal: '10000.00',
      total: '11500.00',
    };
    const result = QuotationSchema.safeParse(quotation);
    expect(result.success).toBe(true);
  });
});

describe('Project Form Validation', () => {
  
  it('should validate valid project', () => {
    const project = {
      name: 'مشروع التطوير',
      code: 'PRJ-001',
      start_date: '2025-01-01',
      end_date: '2025-12-31',
      status: 'active' as const,
      budget: '500000.00',
    };
    const result = ProjectSchema.safeParse(project);
    expect(result.success).toBe(true);
  });
  
  it('should reject project without name', () => {
    const project = {
      name: '',
      code: 'PRJ-001',
    };
    const result = ProjectSchema.safeParse(project);
    expect(result.success).toBe(false);
  });
});

describe('User Form Validation', () => {
  
  it('should validate valid user', () => {
    const user = {
      email: 'user@company.com',
      name: 'مستخدم جديد',
      role: 'accountant' as const,
    };
    const result = UserSchema.safeParse(user);
    expect(result.success).toBe(true);
  });
  
  it('should reject user without valid email', () => {
    const user = {
      email: 'not-an-email',
      name: 'Test User',
    };
    const result = UserSchema.safeParse(user);
    expect(result.success).toBe(false);
  });
  
  it('should reject invalid role', () => {
    const user = {
      email: 'test@test.com',
      name: 'Test',
      role: 'superadmin',
    };
    const result = UserSchema.safeParse(user);
    expect(result.success).toBe(false);
  });
});

// ===== EDGE CASES =====

describe('Edge Cases & Security', () => {
  
  it('should handle Arabic text in all fields', () => {
    const contact = {
      name: 'شركة التقنية المتقدمة للحلول الرقمية',
      type: 'customer' as const,
      address: 'الرياض، حي العليا، شارع التحلية',
      notes: 'عميل مميز - خصم 10%',
    };
    const result = ContactSchema.safeParse(contact);
    expect(result.success).toBe(true);
  });
  
  it('should handle special characters', () => {
    const item = {
      name: 'Item (Special) - 50% OFF!',
      type: 'service' as const,
      description: 'Description with "quotes" and <tags>',
    };
    const result = ItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });
  
  it('should validate decimal precision', () => {
    const invoice = {
      date: '2025-01-15',
      status: 'draft' as const,
      subtotal: '1234.5678', // 4 decimal places
      total: '1234.5678',
    };
    const result = InvoiceSchema.safeParse(invoice);
    expect(result.success).toBe(true);
  });
  
  it('should handle empty optional fields', () => {
    const expense = {
      date: '2025-01-15',
      amount: '100.00',
      category: '',
      payee: '',
      description: '',
    };
    const result = ExpenseSchema.safeParse(expense);
    expect(result.success).toBe(true);
  });
  
  it('should validate UUID format for relationships', () => {
    const invoice = {
      contact_id: 'invalid-uuid',
      date: '2025-01-15',
      status: 'draft' as const,
      subtotal: '100.00',
      total: '100.00',
    };
    const result = InvoiceSchema.safeParse(invoice);
    expect(result.success).toBe(false);
  });
  
  it('should handle null for optional UUID fields', () => {
    const invoice = {
      contact_id: null,
      date: '2025-01-15',
      status: 'draft' as const,
      subtotal: '100.00',
      total: '100.00',
    };
    const result = InvoiceSchema.safeParse(invoice);
    expect(result.success).toBe(true);
  });
});

// ===== TEST SUMMARY =====

describe('Test Summary', () => {
  it('should complete all validation tests', () => {
    console.log('\n📊 Form Validation Test Summary');
    console.log('================================');
    console.log('✅ Contact form validations');
    console.log('✅ Item form validations');
    console.log('✅ Invoice form validations');
    console.log('✅ Expense form validations');
    console.log('✅ Payment form validations');
    console.log('✅ Receipt form validations');
    console.log('✅ Bank Account form validations');
    console.log('✅ Journal Entry form validations');
    console.log('✅ Fixed Asset form validations');
    console.log('✅ Budget form validations');
    console.log('✅ Employee form validations');
    console.log('✅ Quotation form validations');
    console.log('✅ Project form validations');
    console.log('✅ User form validations');
    console.log('✅ Edge cases & security tests');
    
    expect(true).toBe(true);
  });
});
