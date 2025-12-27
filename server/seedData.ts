// Seed data for demo/testing purposes
// بيانات تجريبية للعرض والاختبار

export const demoAccounts = [
  // Assets - الأصول
  { code: '1010', name: 'Cash in Hand', name_ar: 'النقد في الصندوق', type: 'asset', subtype: 'cash', balance: 50000 },
  { code: '1020', name: 'Bank Account - Main', name_ar: 'البنك - الحساب الرئيسي', type: 'asset', subtype: 'cash', balance: 250000 },
  { code: '1030', name: 'Accounts Receivable', name_ar: 'الذمم المدينة', type: 'asset', subtype: 'accountsReceivable', balance: 75000 },
  { code: '1040', name: 'Inventory', name_ar: 'المخزون', type: 'asset', subtype: 'inventory', balance: 120000 },
  { code: '1050', name: 'Furniture & Fixtures', name_ar: 'الأثاث والتجهيزات', type: 'asset', subtype: 'fixedAsset', balance: 85000 },
  { code: '1060', name: 'Computers & Equipment', name_ar: 'الأجهزة والمعدات', type: 'asset', subtype: 'fixedAsset', balance: 45000 },
  
  // Liabilities - الخصوم
  { code: '2010', name: 'Accounts Payable', name_ar: 'الذمم الدائنة', type: 'liability', subtype: 'accountsPayable', balance: 55000 },
  { code: '2020', name: 'Credit Card Payable', name_ar: 'بطاقة الائتمان', type: 'liability', subtype: 'creditCard', balance: 12000 },
  { code: '2030', name: 'Salaries Payable', name_ar: 'الرواتب المستحقة', type: 'liability', subtype: 'currentLiability', balance: 35000 },
  { code: '2040', name: 'Taxes Payable', name_ar: 'الضرائب المستحقة', type: 'liability', subtype: 'currentLiability', balance: 18000 },
  
  // Equity - حقوق الملكية
  { code: '3010', name: 'Owner Capital', name_ar: 'رأس المال', type: 'equity', subtype: 'shareCapital', balance: 400000 },
  { code: '3020', name: 'Retained Earnings', name_ar: 'الأرباح المحتجزة', type: 'equity', subtype: 'retainedEarnings', balance: 105000 },
  
  // Revenue - الإيرادات
  { code: '4010', name: 'Sales Revenue', name_ar: 'إيرادات المبيعات', type: 'revenue', subtype: 'salesRevenue', balance: 0 },
  { code: '4020', name: 'Service Revenue', name_ar: 'إيرادات الخدمات', type: 'revenue', subtype: 'serviceRevenue', balance: 0 },
  { code: '4030', name: 'Other Income', name_ar: 'إيرادات أخرى', type: 'revenue', subtype: 'otherRevenue', balance: 0 },
  
  // Expenses - المصروفات
  { code: '5010', name: 'Cost of Goods Sold', name_ar: 'تكلفة البضاعة المباعة', type: 'expense', subtype: 'costOfGoods', balance: 0 },
  { code: '5020', name: 'Salaries Expense', name_ar: 'مصروف الرواتب', type: 'expense', subtype: 'salaryExpense', balance: 0 },
  { code: '5030', name: 'Rent Expense', name_ar: 'مصروف الإيجار', type: 'expense', subtype: 'rentExpense', balance: 0 },
  { code: '5040', name: 'Utilities Expense', name_ar: 'مصروف المرافق', type: 'expense', subtype: 'utilityExpense', balance: 0 },
  { code: '5050', name: 'Marketing Expense', name_ar: 'مصروف التسويق', type: 'expense', subtype: 'operatingExpense', balance: 0 },
  { code: '5060', name: 'Office Supplies', name_ar: 'اللوازم المكتبية', type: 'expense', subtype: 'operatingExpense', balance: 0 },
];

export const demoContacts = [
  // Customers - العملاء
  {
    name: 'Tech Solutions LLC',
    name_ar: 'شركة الحلول التقنية',
    type: 'customer',
    email: 'sales@techsolutions.com',
    phone: '+966501234567',
    address: '123 Business St, Riyadh',
    tax_number: '300123456789012',
    balance: 25000,
    credit_limit: 50000,
  },
  {
    name: 'Global Trading Co.',
    name_ar: 'شركة التجارة العالمية',
    type: 'customer',
    email: 'info@globaltrading.com',
    phone: '+966507654321',
    address: '456 Commerce Ave, Jeddah',
    tax_number: '300987654321098',
    balance: 18000,
    credit_limit: 40000,
  },
  {
    name: 'Modern Enterprises',
    name_ar: 'المؤسسة الحديثة',
    type: 'customer',
    email: 'contact@modernent.com',
    phone: '+966509876543',
    address: '789 Industrial Rd, Dammam',
    tax_number: '300456789012345',
    balance: 32000,
    credit_limit: 60000,
  },
  
  // Suppliers - الموردون
  {
    name: 'Office Supplies Inc.',
    name_ar: 'مؤسسة اللوازم المكتبية',
    type: 'supplier',
    email: 'orders@officesupplies.com',
    phone: '+966502345678',
    address: '321 Supply St, Riyadh',
    tax_number: '300234567890123',
    balance: 15000,
    credit_limit: 30000,
  },
  {
    name: 'Tech Equipment Ltd.',
    name_ar: 'شركة المعدات التقنية المحدودة',
    type: 'supplier',
    email: 'sales@techequip.com',
    phone: '+966508765432',
    address: '654 Tech Park, Jeddah',
    tax_number: '300876543210987',
    balance: 22000,
    credit_limit: 45000,
  },
  {
    name: 'Furniture World',
    name_ar: 'عالم الأثاث',
    type: 'supplier',
    email: 'info@furnitureworld.com',
    phone: '+966503456789',
    address: '987 Furniture Blvd, Dammam',
    tax_number: '300345678901234',
    balance: 18000,
    credit_limit: 35000,
  },
];

export const demoItems = [
  // Products - المنتجات
  {
    name: 'Wireless Mouse',
    name_ar: 'ماوس لاسلكي',
    type: 'product',
    sku: 'TECH-001',
    description: 'High-quality wireless mouse',
    description_ar: 'ماوس لاسلكي عالي الجودة',
    unit_price: 150,
    cost_price: 90,
    quantity_in_stock: 50,
    reorder_level: 10,
    unit_of_measure: 'piece',
    category: 'Electronics',
  },
  {
    name: 'USB Keyboard',
    name_ar: 'لوحة مفاتيح USB',
    type: 'product',
    sku: 'TECH-002',
    description: 'Mechanical gaming keyboard',
    description_ar: 'لوحة مفاتيح ميكانيكية للألعاب',
    unit_price: 350,
    cost_price: 210,
    quantity_in_stock: 30,
    reorder_level: 5,
    unit_of_measure: 'piece',
    category: 'Electronics',
  },
  {
    name: 'Office Chair',
    name_ar: 'كرسي مكتب',
    type: 'product',
    sku: 'FURN-001',
    description: 'Ergonomic office chair',
    description_ar: 'كرسي مكتب مريح',
    unit_price: 1200,
    cost_price: 750,
    quantity_in_stock: 15,
    reorder_level: 3,
    unit_of_measure: 'piece',
    category: 'Furniture',
  },
  {
    name: 'Desk Lamp',
    name_ar: 'مصباح مكتب',
    type: 'product',
    sku: 'FURN-002',
    description: 'LED desk lamp',
    description_ar: 'مصباح مكتب LED',
    unit_price: 280,
    cost_price: 170,
    quantity_in_stock: 25,
    reorder_level: 8,
    unit_of_measure: 'piece',
    category: 'Furniture',
  },
  {
    name: 'Printer Paper A4',
    name_ar: 'ورق طابعة A4',
    type: 'product',
    sku: 'SUPP-001',
    description: 'A4 printing paper (500 sheets)',
    description_ar: 'ورق طباعة A4 (500 ورقة)',
    unit_price: 45,
    cost_price: 28,
    quantity_in_stock: 100,
    reorder_level: 20,
    unit_of_measure: 'pack',
    category: 'Office Supplies',
  },
  
  // Services - الخدمات
  {
    name: 'IT Consulting',
    name_ar: 'استشارات تقنية المعلومات',
    type: 'service',
    sku: 'SERV-001',
    description: 'Professional IT consulting services',
    description_ar: 'خدمات استشارات تقنية احترافية',
    unit_price: 500,
    cost_price: 0,
    quantity_in_stock: null,
    reorder_level: null,
    unit_of_measure: 'hour',
    category: 'Services',
  },
  {
    name: 'Software Development',
    name_ar: 'تطوير البرمجيات',
    type: 'service',
    sku: 'SERV-002',
    description: 'Custom software development',
    description_ar: 'تطوير برمجيات مخصصة',
    unit_price: 800,
    cost_price: 0,
    quantity_in_stock: null,
    reorder_level: null,
    unit_of_measure: 'hour',
    category: 'Services',
  },
  {
    name: 'Website Design',
    name_ar: 'تصميم المواقع',
    type: 'service',
    sku: 'SERV-003',
    description: 'Professional website design',
    description_ar: 'تصميم مواقع احترافي',
    unit_price: 3500,
    cost_price: 0,
    quantity_in_stock: null,
    reorder_level: null,
    unit_of_measure: 'project',
    category: 'Services',
  },
];

export const demoBankAccounts = [
  {
    account_name: 'Main Business Account',
    account_name_ar: 'الحساب التجاري الرئيسي',
    bank_name: 'Al Rajhi Bank',
    bank_name_ar: 'مصرف الراجحي',
    account_number: 'SA1234567890123456789012',
    iban: 'SA1234567890123456789012',
    swift_code: 'RJHISARI',
    currency: 'SAR',
    opening_balance: 250000,
    current_balance: 250000,
    is_active: true,
  },
  {
    account_name: 'Payroll Account',
    account_name_ar: 'حساب الرواتب',
    bank_name: 'Saudi National Bank',
    bank_name_ar: 'البنك الأهلي السعودي',
    account_number: 'SA9876543210987654321098',
    iban: 'SA9876543210987654321098',
    swift_code: 'NCBKSAJE',
    currency: 'SAR',
    opening_balance: 100000,
    current_balance: 100000,
    is_active: true,
  },
];

// Function to seed all demo data
export async function seedDemoData(companyId: string, storage: any) {
  console.log('🌱 Seeding demo data for company:', companyId);
  
  try {
    // 1. Seed Accounts
    console.log('📊 Creating demo accounts...');
    for (const account of demoAccounts) {
      await storage.createAccount({
        ...account,
        company_id: companyId,
        currency: 'SAR',
        is_active: true,
      });
    }
    
    // 2. Seed Contacts
    console.log('👥 Creating demo contacts...');
    for (const contact of demoContacts) {
      await storage.createContact({
        ...contact,
        company_id: companyId,
        currency: 'SAR',
        payment_terms: 30,
        is_active: true,
      });
    }
    
    // 3. Seed Items
    console.log('📦 Creating demo items...');
    for (const item of demoItems) {
      await storage.createItem({
        ...item,
        company_id: companyId,
        is_taxable: true,
        tax_rate: 15,
        is_active: true,
      });
    }
    
    // 4. Seed Bank Accounts
    console.log('🏦 Creating demo bank accounts...');
    for (const bankAccount of demoBankAccounts) {
      await storage.createBankAccount({
        ...bankAccount,
        company_id: companyId,
      });
    }
    
    console.log('✅ Demo data seeded successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    return false;
  }
}
