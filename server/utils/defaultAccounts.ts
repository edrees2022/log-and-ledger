/**
 * Default Chart of Accounts
 * Standard accounts created automatically when a new company is registered
 * Following international accounting standards with Arabic support
 */

export interface DefaultAccount {
  code: string;
  name: string;
  name_ar: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  account_subtype: string;
  parent_code?: string;
  is_system: boolean;
  description?: string;
}

export const DEFAULT_ACCOUNTS: DefaultAccount[] = [
  // ================== ASSETS (الأصول) ==================
  // Current Assets (الأصول المتداولة)
  { code: '1000', name: 'Current Assets', name_ar: 'الأصول المتداولة', account_type: 'asset', account_subtype: 'current_asset', is_system: true },
  { code: '1010', name: 'Cash on Hand', name_ar: 'النقد في الصندوق', account_type: 'asset', account_subtype: 'cash', parent_code: '1000', is_system: true },
  { code: '1020', name: 'Cash in Bank', name_ar: 'النقد في البنك', account_type: 'asset', account_subtype: 'cash', parent_code: '1000', is_system: true },
  { code: '1030', name: 'Petty Cash', name_ar: 'صندوق المصروفات النثرية', account_type: 'asset', account_subtype: 'cash', parent_code: '1000', is_system: true },
  { code: '1040', name: 'Foreign Currency Cash', name_ar: 'النقد بالعملات الأجنبية', account_type: 'asset', account_subtype: 'cash', parent_code: '1000', is_system: false },
  { code: '1050', name: 'Foreign Currency Bank Accounts', name_ar: 'حسابات بنكية بالعملات الأجنبية', account_type: 'asset', account_subtype: 'cash', parent_code: '1000', is_system: false },
  { code: '1100', name: 'Accounts Receivable', name_ar: 'الذمم المدينة', account_type: 'asset', account_subtype: 'accounts_receivable', parent_code: '1000', is_system: true },
  { code: '1110', name: 'Trade Receivables', name_ar: 'ذمم تجارية مدينة', account_type: 'asset', account_subtype: 'accounts_receivable', parent_code: '1100', is_system: false },
  { code: '1120', name: 'Notes Receivable', name_ar: 'أوراق القبض', account_type: 'asset', account_subtype: 'accounts_receivable', parent_code: '1100', is_system: false },
  { code: '1130', name: 'Employee Advances', name_ar: 'سلف الموظفين', account_type: 'asset', account_subtype: 'accounts_receivable', parent_code: '1100', is_system: false },
  { code: '1140', name: 'Allowance for Doubtful Accounts', name_ar: 'مخصص الديون المشكوك فيها', account_type: 'asset', account_subtype: 'accounts_receivable', parent_code: '1100', is_system: true },
  { code: '1200', name: 'Inventory', name_ar: 'المخزون', account_type: 'asset', account_subtype: 'inventory', parent_code: '1000', is_system: true },
  { code: '1210', name: 'Raw Materials', name_ar: 'المواد الخام', account_type: 'asset', account_subtype: 'inventory', parent_code: '1200', is_system: false },
  { code: '1220', name: 'Work in Progress', name_ar: 'الإنتاج تحت التشغيل', account_type: 'asset', account_subtype: 'inventory', parent_code: '1200', is_system: false },
  { code: '1230', name: 'Finished Goods', name_ar: 'البضاعة الجاهزة', account_type: 'asset', account_subtype: 'inventory', parent_code: '1200', is_system: false },
  { code: '1300', name: 'Prepaid Expenses', name_ar: 'المصروفات المدفوعة مقدماً', account_type: 'asset', account_subtype: 'other_asset', parent_code: '1000', is_system: true },
  { code: '1310', name: 'Prepaid Rent', name_ar: 'إيجار مدفوع مقدماً', account_type: 'asset', account_subtype: 'other_asset', parent_code: '1300', is_system: false },
  { code: '1320', name: 'Prepaid Insurance', name_ar: 'تأمين مدفوع مقدماً', account_type: 'asset', account_subtype: 'other_asset', parent_code: '1300', is_system: false },
  { code: '1400', name: 'VAT Receivable', name_ar: 'ضريبة القيمة المضافة المستردة', account_type: 'asset', account_subtype: 'other_asset', parent_code: '1000', is_system: true },
  
  // Fixed Assets (الأصول الثابتة)
  { code: '1500', name: 'Fixed Assets', name_ar: 'الأصول الثابتة', account_type: 'asset', account_subtype: 'fixed_asset', is_system: true },
  { code: '1510', name: 'Land', name_ar: 'الأراضي', account_type: 'asset', account_subtype: 'fixed_asset', parent_code: '1500', is_system: false },
  { code: '1520', name: 'Buildings', name_ar: 'المباني', account_type: 'asset', account_subtype: 'fixed_asset', parent_code: '1500', is_system: false },
  { code: '1530', name: 'Machinery & Equipment', name_ar: 'الآلات والمعدات', account_type: 'asset', account_subtype: 'fixed_asset', parent_code: '1500', is_system: false },
  { code: '1540', name: 'Furniture & Fixtures', name_ar: 'الأثاث والتجهيزات', account_type: 'asset', account_subtype: 'fixed_asset', parent_code: '1500', is_system: false },
  { code: '1550', name: 'Vehicles', name_ar: 'المركبات', account_type: 'asset', account_subtype: 'fixed_asset', parent_code: '1500', is_system: false },
  { code: '1560', name: 'Computer Equipment', name_ar: 'أجهزة الحاسوب', account_type: 'asset', account_subtype: 'fixed_asset', parent_code: '1500', is_system: false },
  { code: '1600', name: 'Accumulated Depreciation', name_ar: 'مجمع الإهلاك', account_type: 'asset', account_subtype: 'fixed_asset', parent_code: '1500', is_system: true },
  { code: '1610', name: 'Accum. Dep. - Buildings', name_ar: 'مجمع إهلاك المباني', account_type: 'asset', account_subtype: 'fixed_asset', parent_code: '1600', is_system: false },
  { code: '1620', name: 'Accum. Dep. - Equipment', name_ar: 'مجمع إهلاك المعدات', account_type: 'asset', account_subtype: 'fixed_asset', parent_code: '1600', is_system: false },
  { code: '1630', name: 'Accum. Dep. - Vehicles', name_ar: 'مجمع إهلاك المركبات', account_type: 'asset', account_subtype: 'fixed_asset', parent_code: '1600', is_system: false },
  
  // Intangible Assets (الأصول غير الملموسة)
  { code: '1700', name: 'Intangible Assets', name_ar: 'الأصول غير الملموسة', account_type: 'asset', account_subtype: 'other_asset', is_system: true },
  { code: '1710', name: 'Goodwill', name_ar: 'الشهرة', account_type: 'asset', account_subtype: 'other_asset', parent_code: '1700', is_system: false },
  { code: '1720', name: 'Patents & Trademarks', name_ar: 'براءات الاختراع والعلامات التجارية', account_type: 'asset', account_subtype: 'other_asset', parent_code: '1700', is_system: false },

  // ================== LIABILITIES (الالتزامات) ==================
  // Current Liabilities (الالتزامات المتداولة)
  { code: '2000', name: 'Current Liabilities', name_ar: 'الالتزامات المتداولة', account_type: 'liability', account_subtype: 'current_liability', is_system: true },
  { code: '2100', name: 'Accounts Payable', name_ar: 'الذمم الدائنة', account_type: 'liability', account_subtype: 'accounts_payable', parent_code: '2000', is_system: true },
  { code: '2110', name: 'Trade Payables', name_ar: 'ذمم تجارية دائنة', account_type: 'liability', account_subtype: 'accounts_payable', parent_code: '2100', is_system: false },
  { code: '2120', name: 'Notes Payable', name_ar: 'أوراق الدفع', account_type: 'liability', account_subtype: 'accounts_payable', parent_code: '2100', is_system: false },
  { code: '2200', name: 'Accrued Expenses', name_ar: 'المصروفات المستحقة', account_type: 'liability', account_subtype: 'current_liability', parent_code: '2000', is_system: true },
  { code: '2210', name: 'Accrued Salaries', name_ar: 'رواتب مستحقة', account_type: 'liability', account_subtype: 'current_liability', parent_code: '2200', is_system: false },
  { code: '2220', name: 'Accrued Utilities', name_ar: 'خدمات مستحقة', account_type: 'liability', account_subtype: 'current_liability', parent_code: '2200', is_system: false },
  { code: '2300', name: 'VAT Payable', name_ar: 'ضريبة القيمة المضافة المستحقة', account_type: 'liability', account_subtype: 'current_liability', parent_code: '2000', is_system: true },
  { code: '2310', name: 'Output VAT', name_ar: 'ضريبة المخرجات', account_type: 'liability', account_subtype: 'current_liability', parent_code: '2300', is_system: true },
  { code: '2320', name: 'Input VAT', name_ar: 'ضريبة المدخلات', account_type: 'liability', account_subtype: 'current_liability', parent_code: '2300', is_system: true },
  { code: '2400', name: 'Unearned Revenue', name_ar: 'الإيرادات غير المكتسبة', account_type: 'liability', account_subtype: 'current_liability', parent_code: '2000', is_system: true },
  { code: '2500', name: 'Short-term Loans', name_ar: 'قروض قصيرة الأجل', account_type: 'liability', account_subtype: 'current_liability', parent_code: '2000', is_system: false },
  { code: '2600', name: 'Credit Cards Payable', name_ar: 'بطاقات ائتمان مستحقة', account_type: 'liability', account_subtype: 'credit_card', parent_code: '2000', is_system: false },
  
  // Long-term Liabilities (الالتزامات طويلة الأجل)
  { code: '2700', name: 'Long-term Liabilities', name_ar: 'الالتزامات طويلة الأجل', account_type: 'liability', account_subtype: 'long_term_liability', is_system: true },
  { code: '2710', name: 'Long-term Loans', name_ar: 'قروض طويلة الأجل', account_type: 'liability', account_subtype: 'long_term_liability', parent_code: '2700', is_system: false },
  { code: '2720', name: 'Mortgage Payable', name_ar: 'رهن عقاري مستحق', account_type: 'liability', account_subtype: 'long_term_liability', parent_code: '2700', is_system: false },
  { code: '2800', name: 'Employee Benefits Payable', name_ar: 'مستحقات نهاية الخدمة', account_type: 'liability', account_subtype: 'long_term_liability', parent_code: '2700', is_system: true },

  // ================== EQUITY (حقوق الملكية) ==================
  { code: '3000', name: 'Equity', name_ar: 'حقوق الملكية', account_type: 'equity', account_subtype: 'owners_equity', is_system: true },
  { code: '3100', name: 'Share Capital', name_ar: 'رأس المال', account_type: 'equity', account_subtype: 'share_capital', parent_code: '3000', is_system: true },
  { code: '3200', name: 'Additional Paid-in Capital', name_ar: 'علاوة إصدار أسهم', account_type: 'equity', account_subtype: 'share_capital', parent_code: '3000', is_system: false },
  { code: '3300', name: 'Retained Earnings', name_ar: 'الأرباح المحتجزة', account_type: 'equity', account_subtype: 'retained_earnings', parent_code: '3000', is_system: true },
  { code: '3400', name: 'Current Year Earnings', name_ar: 'أرباح السنة الحالية', account_type: 'equity', account_subtype: 'retained_earnings', parent_code: '3000', is_system: true },
  { code: '3500', name: 'Owner Drawings', name_ar: 'مسحوبات المالك', account_type: 'equity', account_subtype: 'dividends', parent_code: '3000', is_system: false },
  { code: '3600', name: 'Dividends', name_ar: 'توزيعات الأرباح', account_type: 'equity', account_subtype: 'dividends', parent_code: '3000', is_system: false },
  { code: '3700', name: 'Treasury Stock', name_ar: 'أسهم الخزينة', account_type: 'equity', account_subtype: 'owners_equity', parent_code: '3000', is_system: false },
  { code: '3800', name: 'Reserves', name_ar: 'الاحتياطيات', account_type: 'equity', account_subtype: 'retained_earnings', parent_code: '3000', is_system: false },
  { code: '3810', name: 'Legal Reserve', name_ar: 'الاحتياطي القانوني', account_type: 'equity', account_subtype: 'retained_earnings', parent_code: '3800', is_system: false },
  { code: '3820', name: 'General Reserve', name_ar: 'الاحتياطي العام', account_type: 'equity', account_subtype: 'retained_earnings', parent_code: '3800', is_system: false },

  // ================== REVENUE (الإيرادات) ==================
  { code: '4000', name: 'Revenue', name_ar: 'الإيرادات', account_type: 'revenue', account_subtype: 'sales_revenue', is_system: true },
  { code: '4100', name: 'Sales Revenue', name_ar: 'إيرادات المبيعات', account_type: 'revenue', account_subtype: 'sales_revenue', parent_code: '4000', is_system: true },
  { code: '4110', name: 'Product Sales', name_ar: 'مبيعات المنتجات', account_type: 'revenue', account_subtype: 'sales_revenue', parent_code: '4100', is_system: false },
  { code: '4120', name: 'Service Revenue', name_ar: 'إيرادات الخدمات', account_type: 'revenue', account_subtype: 'service_revenue', parent_code: '4100', is_system: false },
  { code: '4130', name: 'Sales Returns & Allowances', name_ar: 'مردودات ومسموحات المبيعات', account_type: 'revenue', account_subtype: 'sales_revenue', parent_code: '4100', is_system: true },
  { code: '4140', name: 'Sales Discounts', name_ar: 'خصومات المبيعات', account_type: 'revenue', account_subtype: 'sales_revenue', parent_code: '4100', is_system: true },
  { code: '4200', name: 'Other Income', name_ar: 'إيرادات أخرى', account_type: 'revenue', account_subtype: 'other_revenue', parent_code: '4000', is_system: true },
  { code: '4210', name: 'Interest Income', name_ar: 'إيرادات الفوائد', account_type: 'revenue', account_subtype: 'interest_income', parent_code: '4200', is_system: false },
  { code: '4220', name: 'Rental Income', name_ar: 'إيرادات الإيجار', account_type: 'revenue', account_subtype: 'other_revenue', parent_code: '4200', is_system: false },
  { code: '4230', name: 'Gain on Asset Sale', name_ar: 'أرباح بيع الأصول', account_type: 'revenue', account_subtype: 'other_revenue', parent_code: '4200', is_system: false },
  { code: '4240', name: 'Foreign Exchange Gain', name_ar: 'أرباح تحويل العملات', account_type: 'revenue', account_subtype: 'other_revenue', parent_code: '4200', is_system: true },

  // ================== EXPENSES (المصروفات) ==================
  // Cost of Goods Sold (تكلفة البضاعة المباعة)
  { code: '5000', name: 'Cost of Goods Sold', name_ar: 'تكلفة البضاعة المباعة', account_type: 'expense', account_subtype: 'cost_of_goods', is_system: true },
  { code: '5100', name: 'Direct Materials', name_ar: 'المواد المباشرة', account_type: 'expense', account_subtype: 'cost_of_goods', parent_code: '5000', is_system: false },
  { code: '5200', name: 'Direct Labor', name_ar: 'العمالة المباشرة', account_type: 'expense', account_subtype: 'cost_of_goods', parent_code: '5000', is_system: false },
  { code: '5300', name: 'Manufacturing Overhead', name_ar: 'تكاليف التصنيع غير المباشرة', account_type: 'expense', account_subtype: 'cost_of_goods', parent_code: '5000', is_system: false },
  { code: '5400', name: 'Purchase Discounts', name_ar: 'خصومات المشتريات', account_type: 'expense', account_subtype: 'cost_of_goods', parent_code: '5000', is_system: true },
  { code: '5500', name: 'Purchase Returns', name_ar: 'مردودات المشتريات', account_type: 'expense', account_subtype: 'cost_of_goods', parent_code: '5000', is_system: true },
  
  // Project Costs (تكاليف المشاريع)
  { code: '5600', name: 'Project Costs', name_ar: 'تكاليف المشاريع', account_type: 'expense', account_subtype: 'cost_of_goods', is_system: true },
  { code: '5610', name: 'Project Materials', name_ar: 'مواد المشاريع', account_type: 'expense', account_subtype: 'cost_of_goods', parent_code: '5600', is_system: false },
  { code: '5620', name: 'Project Labor', name_ar: 'أجور المشاريع', account_type: 'expense', account_subtype: 'cost_of_goods', parent_code: '5600', is_system: false },
  { code: '5630', name: 'Project Subcontractors', name_ar: 'مقاولين من الباطن', account_type: 'expense', account_subtype: 'cost_of_goods', parent_code: '5600', is_system: false },
  { code: '5640', name: 'Project Equipment Rental', name_ar: 'إيجار معدات المشاريع', account_type: 'expense', account_subtype: 'cost_of_goods', parent_code: '5600', is_system: false },
  { code: '5650', name: 'Project Overhead', name_ar: 'مصاريف غير مباشرة للمشاريع', account_type: 'expense', account_subtype: 'cost_of_goods', parent_code: '5600', is_system: false },
  
  // Operating Expenses (المصروفات التشغيلية)
  { code: '6000', name: 'Operating Expenses', name_ar: 'المصروفات التشغيلية', account_type: 'expense', account_subtype: 'operating_expense', is_system: true },
  { code: '6100', name: 'Salaries & Wages', name_ar: 'الرواتب والأجور', account_type: 'expense', account_subtype: 'salary_expense', parent_code: '6000', is_system: true },
  { code: '6110', name: 'Employee Salaries', name_ar: 'رواتب الموظفين', account_type: 'expense', account_subtype: 'salary_expense', parent_code: '6100', is_system: false },
  { code: '6120', name: 'Employee Benefits', name_ar: 'مزايا الموظفين', account_type: 'expense', account_subtype: 'salary_expense', parent_code: '6100', is_system: false },
  { code: '6130', name: 'Social Insurance', name_ar: 'التأمينات الاجتماعية', account_type: 'expense', account_subtype: 'salary_expense', parent_code: '6100', is_system: false },
  { code: '6200', name: 'Rent Expense', name_ar: 'مصروف الإيجار', account_type: 'expense', account_subtype: 'rent_expense', parent_code: '6000', is_system: true },
  { code: '6300', name: 'Utilities Expense', name_ar: 'مصروف الخدمات', account_type: 'expense', account_subtype: 'utility_expense', parent_code: '6000', is_system: true },
  { code: '6310', name: 'Electricity', name_ar: 'الكهرباء', account_type: 'expense', account_subtype: 'utility_expense', parent_code: '6300', is_system: false },
  { code: '6320', name: 'Water', name_ar: 'المياه', account_type: 'expense', account_subtype: 'utility_expense', parent_code: '6300', is_system: false },
  { code: '6330', name: 'Internet & Phone', name_ar: 'الإنترنت والهاتف', account_type: 'expense', account_subtype: 'utility_expense', parent_code: '6300', is_system: false },
  { code: '6400', name: 'Office Supplies', name_ar: 'اللوازم المكتبية', account_type: 'expense', account_subtype: 'operating_expense', parent_code: '6000', is_system: false },
  { code: '6500', name: 'Insurance Expense', name_ar: 'مصروف التأمين', account_type: 'expense', account_subtype: 'operating_expense', parent_code: '6000', is_system: false },
  { code: '6600', name: 'Depreciation Expense', name_ar: 'مصروف الإهلاك', account_type: 'expense', account_subtype: 'operating_expense', parent_code: '6000', is_system: true },
  { code: '6700', name: 'Advertising & Marketing', name_ar: 'الإعلان والتسويق', account_type: 'expense', account_subtype: 'operating_expense', parent_code: '6000', is_system: false },
  { code: '6800', name: 'Professional Fees', name_ar: 'أتعاب مهنية', account_type: 'expense', account_subtype: 'operating_expense', parent_code: '6000', is_system: false },
  { code: '6810', name: 'Legal Fees', name_ar: 'أتعاب قانونية', account_type: 'expense', account_subtype: 'operating_expense', parent_code: '6800', is_system: false },
  { code: '6820', name: 'Accounting Fees', name_ar: 'أتعاب محاسبية', account_type: 'expense', account_subtype: 'operating_expense', parent_code: '6800', is_system: false },
  { code: '6900', name: 'Travel & Transportation', name_ar: 'السفر والمواصلات', account_type: 'expense', account_subtype: 'operating_expense', parent_code: '6000', is_system: false },
  
  // Administrative Expenses
  { code: '7000', name: 'Administrative Expenses', name_ar: 'المصروفات الإدارية', account_type: 'expense', account_subtype: 'operating_expense', is_system: true },
  { code: '7100', name: 'Bank Charges', name_ar: 'عمولات بنكية', account_type: 'expense', account_subtype: 'other_expense', parent_code: '7000', is_system: true },
  { code: '7200', name: 'Interest Expense', name_ar: 'مصروف الفوائد', account_type: 'expense', account_subtype: 'other_expense', parent_code: '7000', is_system: true },
  { code: '7300', name: 'Bad Debt Expense', name_ar: 'مصروف الديون المعدومة', account_type: 'expense', account_subtype: 'other_expense', parent_code: '7000', is_system: true },
  { code: '7400', name: 'Loss on Asset Sale', name_ar: 'خسائر بيع الأصول', account_type: 'expense', account_subtype: 'other_expense', parent_code: '7000', is_system: false },
  { code: '7500', name: 'Foreign Exchange Loss', name_ar: 'خسائر تحويل العملات', account_type: 'expense', account_subtype: 'other_expense', parent_code: '7000', is_system: true },
  { code: '7600', name: 'Miscellaneous Expense', name_ar: 'مصروفات متنوعة', account_type: 'expense', account_subtype: 'other_expense', parent_code: '7000', is_system: false },
  
  // Tax Expenses
  { code: '8000', name: 'Tax Expenses', name_ar: 'مصروفات الضرائب', account_type: 'expense', account_subtype: 'other_expense', is_system: true },
  { code: '8100', name: 'Corporate Tax', name_ar: 'ضريبة الشركات', account_type: 'expense', account_subtype: 'other_expense', parent_code: '8000', is_system: false },
  { code: '8200', name: 'Withholding Tax', name_ar: 'ضريبة الخصم والإضافة', account_type: 'expense', account_subtype: 'other_expense', parent_code: '8000', is_system: false },
  { code: '8300', name: 'Zakat', name_ar: 'الزكاة', account_type: 'expense', account_subtype: 'other_expense', parent_code: '8000', is_system: false },
  { code: '8400', name: 'Municipal Tax', name_ar: 'رسوم البلدية', account_type: 'expense', account_subtype: 'other_expense', parent_code: '8000', is_system: false },
  { code: '8500', name: 'Customs Duties', name_ar: 'الرسوم الجمركية', account_type: 'expense', account_subtype: 'other_expense', parent_code: '8000', is_system: false },
];

/**
 * Create default accounts for a new company
 * Skips accounts that already exist (by code) to allow merging
 */
export async function createDefaultAccounts(
  companyId: string,
  storage: any,
  existingAccounts: { code: string; id: string }[] = []
): Promise<{ created: number; skipped: number }> {
  // Create a map of existing codes -> id
  const existingCodes = new Map<string, string>();
  for (const acc of existingAccounts) {
    existingCodes.set(acc.code, acc.id);
  }
  
  // Create a map of code -> id for parent references
  const codeToId = new Map<string, string>(existingCodes);
  
  // Sort accounts by code to ensure parents are created before children
  const sortedAccounts = [...DEFAULT_ACCOUNTS].sort((a, b) => a.code.localeCompare(b.code));
  
  let created = 0;
  let skipped = 0;
  
  for (const account of sortedAccounts) {
    // Skip if account with this code already exists
    if (existingCodes.has(account.code)) {
      skipped++;
      continue;
    }
    
    const parentId = account.parent_code ? codeToId.get(account.parent_code) : null;
    
    try {
      // Build account data - conditionally include name_ar if supported
      const accountData: any = {
        company_id: companyId,
        code: account.code,
        name: account.name,
        account_type: account.account_type,
        account_subtype: account.account_subtype,
        parent_id: parentId,
        is_system: account.is_system,
        is_active: true,
        description: account.description || null,
      };
      
      // Add name_ar if available (migration may not have run yet)
      if (account.name_ar) {
        accountData.name_ar = account.name_ar;
      }
      
      const createdAccount = await storage.createAccount(accountData);
      
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

/**
 * Get account by code for a company (useful for auto-linking)
 */
export function getDefaultAccountCode(type: 'cash' | 'receivable' | 'payable' | 'sales' | 'cogs' | 'vat_output' | 'vat_input'): string {
  const codeMap: Record<string, string> = {
    cash: '1020',           // Cash in Bank
    receivable: '1100',     // Accounts Receivable
    payable: '2100',        // Accounts Payable
    sales: '4100',          // Sales Revenue
    cogs: '5000',           // Cost of Goods Sold
    vat_output: '2310',     // Output VAT
    vat_input: '2320',      // Input VAT
  };
  return codeMap[type] || '1000';
}
