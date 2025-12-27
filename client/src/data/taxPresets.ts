// Tax Types - أنواع الضرائب
export type TaxType = 
  | 'vat' | 'vat_reduced' | 'vat_zero' | 'vat_super_reduced'
  | 'sales_tax' | 'corporate_tax' | 'withholding' | 'payroll'
  | 'capital_gains' | 'property' | 'customs' | 'excise'
  | 'stamp_duty' | 'solidarity' | 'trade_tax' | 'church_tax'
  | 'social_security' | 'municipal' | 'other';

export type TaxPreset = {
  countryCode: string;
  countryName: string;
  countryNameAr: string;
  currency: string;
  presets: Array<{
    type: TaxType;
    name: string;
    nameAr: string;
    code: string;
    rate: number;
    calculation_type?: 'inclusive' | 'exclusive';
    notes?: string;
    notesAr?: string;
    category?: 'goods' | 'services' | 'both' | 'income' | 'property';
  }>;
};

export const TAX_PRESETS: TaxPreset[] = [
  // === دول الخليج العربي ===
  {
    countryCode: 'AE',
    countryName: 'United Arab Emirates',
    countryNameAr: 'الإمارات العربية المتحدة',
    currency: 'AED',
    presets: [
      { type: 'vat', name: 'VAT Standard', nameAr: 'ضريبة القيمة المضافة', code: 'VAT-5', rate: 5, category: 'both', notes: 'Standard rate on most goods and services' },
      { type: 'vat_zero', name: 'VAT Zero Rate', nameAr: 'ضريبة صفرية', code: 'VAT-0', rate: 0, category: 'both', notes: 'Exports, international transport, precious metals' },
      { type: 'corporate_tax', name: 'Corporate Tax', nameAr: 'ضريبة الشركات', code: 'CT-9', rate: 9, category: 'income', notes: 'On taxable income above AED 375,000' },
      { type: 'excise', name: 'Excise Tax - Tobacco', nameAr: 'ضريبة انتقائية - تبغ', code: 'EX-TOB', rate: 100, category: 'goods', notes: 'On tobacco products' },
      { type: 'excise', name: 'Excise Tax - Energy Drinks', nameAr: 'ضريبة انتقائية - مشروبات طاقة', code: 'EX-ENR', rate: 100, category: 'goods', notes: 'On energy drinks' },
      { type: 'excise', name: 'Excise Tax - Carbonated Drinks', nameAr: 'ضريبة انتقائية - مشروبات غازية', code: 'EX-CARB', rate: 50, category: 'goods', notes: 'On carbonated drinks' },
      { type: 'customs', name: 'Customs Duty', nameAr: 'رسوم جمركية', code: 'CUST-5', rate: 5, category: 'goods', notes: 'General import duty' },
    ],
  },
  {
    countryCode: 'SA',
    countryName: 'Saudi Arabia',
    countryNameAr: 'المملكة العربية السعودية',
    currency: 'SAR',
    presets: [
      { type: 'vat', name: 'VAT Standard', nameAr: 'ضريبة القيمة المضافة', code: 'VAT-15', rate: 15, category: 'both' },
      { type: 'vat_zero', name: 'VAT Zero Rate', nameAr: 'ضريبة صفرية', code: 'VAT-0', rate: 0, category: 'both', notes: 'Exports, international transport' },
      { type: 'corporate_tax', name: 'Corporate Tax (Foreign)', nameAr: 'ضريبة دخل الشركات الأجنبية', code: 'CT-20', rate: 20, category: 'income' },
      { type: 'withholding', name: 'Withholding Tax - Dividends', nameAr: 'ضريبة استقطاع - أرباح', code: 'WHT-5', rate: 5, category: 'income' },
      { type: 'withholding', name: 'Withholding Tax - Royalties', nameAr: 'ضريبة استقطاع - إتاوات', code: 'WHT-15', rate: 15, category: 'income' },
      { type: 'excise', name: 'Excise - Tobacco', nameAr: 'ضريبة انتقائية - تبغ', code: 'EX-100', rate: 100, category: 'goods' },
      { type: 'excise', name: 'Excise - Soft Drinks', nameAr: 'ضريبة انتقائية - مشروبات', code: 'EX-50', rate: 50, category: 'goods' },
      { type: 'social_security', name: 'GOSI Employer', nameAr: 'تأمينات اجتماعية - صاحب العمل', code: 'GOSI-E', rate: 12, category: 'income', notes: 'Employer contribution' },
      { type: 'social_security', name: 'GOSI Employee', nameAr: 'تأمينات اجتماعية - موظف', code: 'GOSI-EE', rate: 10, category: 'income', notes: 'Employee contribution' },
    ],
  },
  {
    countryCode: 'KW',
    countryName: 'Kuwait',
    countryNameAr: 'الكويت',
    currency: 'KWD',
    presets: [
      { type: 'corporate_tax', name: 'Corporate Tax (Foreign)', nameAr: 'ضريبة الشركات الأجنبية', code: 'CT-15', rate: 15, category: 'income', notes: 'Only for foreign companies' },
      { type: 'social_security', name: 'Social Security - Employer', nameAr: 'تأمينات - صاحب العمل', code: 'SS-E', rate: 11.5, category: 'income' },
      { type: 'social_security', name: 'Social Security - Employee', nameAr: 'تأمينات - موظف', code: 'SS-EE', rate: 8, category: 'income' },
      { type: 'customs', name: 'Customs Duty', nameAr: 'رسوم جمركية', code: 'CUST-5', rate: 5, category: 'goods' },
    ],
  },
  {
    countryCode: 'QA',
    countryName: 'Qatar',
    countryNameAr: 'قطر',
    currency: 'QAR',
    presets: [
      { type: 'corporate_tax', name: 'Corporate Tax', nameAr: 'ضريبة الشركات', code: 'CT-10', rate: 10, category: 'income' },
      { type: 'withholding', name: 'Withholding Tax', nameAr: 'ضريبة الاستقطاع', code: 'WHT-5', rate: 5, category: 'income' },
      { type: 'customs', name: 'Customs Duty', nameAr: 'رسوم جمركية', code: 'CUST-5', rate: 5, category: 'goods' },
    ],
  },
  {
    countryCode: 'BH',
    countryName: 'Bahrain',
    countryNameAr: 'البحرين',
    currency: 'BHD',
    presets: [
      { type: 'vat', name: 'VAT Standard', nameAr: 'ضريبة القيمة المضافة', code: 'VAT-10', rate: 10, category: 'both' },
      { type: 'vat_zero', name: 'VAT Zero Rate', nameAr: 'ضريبة صفرية', code: 'VAT-0', rate: 0, category: 'both' },
      { type: 'social_security', name: 'SIO Employer', nameAr: 'تأمينات - صاحب العمل', code: 'SIO-E', rate: 12, category: 'income' },
      { type: 'social_security', name: 'SIO Employee', nameAr: 'تأمينات - موظف', code: 'SIO-EE', rate: 7, category: 'income' },
    ],
  },
  {
    countryCode: 'OM',
    countryName: 'Oman',
    countryNameAr: 'عمان',
    currency: 'OMR',
    presets: [
      { type: 'vat', name: 'VAT Standard', nameAr: 'ضريبة القيمة المضافة', code: 'VAT-5', rate: 5, category: 'both' },
      { type: 'corporate_tax', name: 'Corporate Tax', nameAr: 'ضريبة الشركات', code: 'CT-15', rate: 15, category: 'income' },
      { type: 'withholding', name: 'Withholding Tax', nameAr: 'ضريبة الاستقطاع', code: 'WHT-10', rate: 10, category: 'income' },
    ],
  },

  // === ألمانيا - نظام ضريبي معقد ===
  {
    countryCode: 'DE',
    countryName: 'Germany',
    countryNameAr: 'ألمانيا',
    currency: 'EUR',
    presets: [
      { type: 'vat', name: 'MwSt Standard (Mehrwertsteuer)', nameAr: 'ضريبة القيمة المضافة العادية', code: 'MWST-19', rate: 19, category: 'both' },
      { type: 'vat_reduced', name: 'MwSt Reduced', nameAr: 'ضريبة مخفضة', code: 'MWST-7', rate: 7, category: 'goods', notes: 'Food, books, newspapers, public transport' },
      { type: 'corporate_tax', name: 'Körperschaftsteuer', nameAr: 'ضريبة الشركات', code: 'KOST-15', rate: 15, category: 'income' },
      { type: 'solidarity', name: 'Solidaritätszuschlag', nameAr: 'رسم التضامن', code: 'SOLI-5.5', rate: 5.5, category: 'income', notes: '5.5% of corporate/income tax' },
      { type: 'trade_tax', name: 'Gewerbesteuer (Trade Tax)', nameAr: 'ضريبة التجارة', code: 'GEW-14', rate: 14, category: 'income', notes: 'Varies 7-17% by municipality' },
      { type: 'church_tax', name: 'Kirchensteuer', nameAr: 'ضريبة الكنيسة', code: 'KIRCH-9', rate: 9, category: 'income', notes: '8-9% of income tax, optional' },
      { type: 'withholding', name: 'Kapitalertragsteuer', nameAr: 'ضريبة أرباح رأس المال', code: 'KAP-25', rate: 25, category: 'income' },
      { type: 'payroll', name: 'Lohnsteuer Class I', nameAr: 'ضريبة الرواتب الفئة 1', code: 'LST-1', rate: 14, category: 'income', notes: 'Progressive 14-45%' },
      { type: 'social_security', name: 'Pension Insurance', nameAr: 'تأمين المعاشات', code: 'RV-9.3', rate: 9.3, category: 'income', notes: 'Employee share' },
      { type: 'social_security', name: 'Health Insurance', nameAr: 'تأمين صحي', code: 'KV-7.3', rate: 7.3, category: 'income', notes: 'Employee share' },
      { type: 'social_security', name: 'Unemployment Insurance', nameAr: 'تأمين البطالة', code: 'AV-1.3', rate: 1.3, category: 'income', notes: 'Employee share' },
      { type: 'social_security', name: 'Care Insurance', nameAr: 'تأمين الرعاية', code: 'PV-1.7', rate: 1.7, category: 'income', notes: 'Employee share' },
      { type: 'property', name: 'Grundsteuer (Property Tax)', nameAr: 'ضريبة العقارات', code: 'GRUND', rate: 0.35, category: 'property', notes: 'Varies by municipality' },
      { type: 'stamp_duty', name: 'Grunderwerbsteuer', nameAr: 'رسم نقل الملكية', code: 'GREST-6', rate: 6, category: 'property', notes: 'Real estate transfer, varies 3.5-6.5%' },
    ],
  },

  // === المملكة المتحدة ===
  {
    countryCode: 'GB',
    countryName: 'United Kingdom',
    countryNameAr: 'المملكة المتحدة',
    currency: 'GBP',
    presets: [
      { type: 'vat', name: 'VAT Standard', nameAr: 'ضريبة القيمة المضافة', code: 'VAT-20', rate: 20, category: 'both' },
      { type: 'vat_reduced', name: 'VAT Reduced', nameAr: 'ضريبة مخفضة', code: 'VAT-5', rate: 5, category: 'both', notes: 'Domestic fuel, child car seats' },
      { type: 'vat_zero', name: 'VAT Zero Rate', nameAr: 'ضريبة صفرية', code: 'VAT-0', rate: 0, category: 'goods', notes: 'Food, books, children clothes' },
      { type: 'corporate_tax', name: 'Corporation Tax (Main)', nameAr: 'ضريبة الشركات الرئيسية', code: 'CT-25', rate: 25, category: 'income', notes: 'Profits over £250,000' },
      { type: 'corporate_tax', name: 'Corporation Tax (Small)', nameAr: 'ضريبة الشركات الصغيرة', code: 'CT-19', rate: 19, category: 'income', notes: 'Profits under £50,000' },
      { type: 'payroll', name: 'PAYE Basic Rate', nameAr: 'ضريبة الدخل الأساسية', code: 'PAYE-20', rate: 20, category: 'income', notes: '£12,571 to £50,270' },
      { type: 'payroll', name: 'PAYE Higher Rate', nameAr: 'ضريبة الدخل المرتفعة', code: 'PAYE-40', rate: 40, category: 'income', notes: '£50,271 to £125,140' },
      { type: 'payroll', name: 'PAYE Additional Rate', nameAr: 'ضريبة الدخل الإضافية', code: 'PAYE-45', rate: 45, category: 'income', notes: 'Over £125,140' },
      { type: 'social_security', name: 'NI Employer', nameAr: 'تأمين وطني - صاحب العمل', code: 'NI-E-13.8', rate: 13.8, category: 'income' },
      { type: 'social_security', name: 'NI Employee', nameAr: 'تأمين وطني - موظف', code: 'NI-EE-12', rate: 12, category: 'income' },
      { type: 'capital_gains', name: 'CGT Basic', nameAr: 'ضريبة أرباح رأس المال', code: 'CGT-10', rate: 10, category: 'income' },
      { type: 'capital_gains', name: 'CGT Higher', nameAr: 'ضريبة أرباح رأس المال المرتفعة', code: 'CGT-20', rate: 20, category: 'income' },
      { type: 'stamp_duty', name: 'SDLT Standard', nameAr: 'رسم الدمغة العقارية', code: 'SDLT', rate: 5, category: 'property', notes: 'On properties £250,001-£925,000' },
    ],
  },

  // === فرنسا ===
  {
    countryCode: 'FR',
    countryName: 'France',
    countryNameAr: 'فرنسا',
    currency: 'EUR',
    presets: [
      { type: 'vat', name: 'TVA Normal', nameAr: 'ضريبة القيمة المضافة العادية', code: 'TVA-20', rate: 20, category: 'both' },
      { type: 'vat_reduced', name: 'TVA Intermédiaire', nameAr: 'ضريبة متوسطة', code: 'TVA-10', rate: 10, category: 'both', notes: 'Restaurants, transport, renovation' },
      { type: 'vat_reduced', name: 'TVA Réduit', nameAr: 'ضريبة مخفضة', code: 'TVA-5.5', rate: 5.5, category: 'goods', notes: 'Food, books, energy' },
      { type: 'vat_super_reduced', name: 'TVA Super Réduit', nameAr: 'ضريبة مخفضة جداً', code: 'TVA-2.1', rate: 2.1, category: 'goods', notes: 'Medicines, newspapers' },
      { type: 'corporate_tax', name: 'IS (Impôt sur les Sociétés)', nameAr: 'ضريبة الشركات', code: 'IS-25', rate: 25, category: 'income' },
      { type: 'corporate_tax', name: 'IS Reduced (PME)', nameAr: 'ضريبة الشركات الصغيرة', code: 'IS-15', rate: 15, category: 'income', notes: 'First €42,500 for SMEs' },
      { type: 'payroll', name: 'IR Bracket 11%', nameAr: 'ضريبة الدخل 11%', code: 'IR-11', rate: 11, category: 'income' },
      { type: 'payroll', name: 'IR Bracket 30%', nameAr: 'ضريبة الدخل 30%', code: 'IR-30', rate: 30, category: 'income' },
      { type: 'payroll', name: 'IR Bracket 41%', nameAr: 'ضريبة الدخل 41%', code: 'IR-41', rate: 41, category: 'income' },
      { type: 'payroll', name: 'IR Bracket 45%', nameAr: 'ضريبة الدخل 45%', code: 'IR-45', rate: 45, category: 'income' },
      { type: 'social_security', name: 'CSG', nameAr: 'مساهمة اجتماعية عامة', code: 'CSG-9.2', rate: 9.2, category: 'income' },
      { type: 'social_security', name: 'CRDS', nameAr: 'مساهمة سداد الدين', code: 'CRDS-0.5', rate: 0.5, category: 'income' },
      { type: 'social_security', name: 'Employer Social Charges', nameAr: 'أعباء اجتماعية - صاحب العمل', code: 'SOC-E-45', rate: 45, category: 'income', notes: 'Approximate total' },
      { type: 'property', name: 'Taxe Foncière', nameAr: 'ضريبة عقارية', code: 'TF', rate: 1, category: 'property', notes: 'Varies by location' },
      { type: 'stamp_duty', name: 'Droits de Mutation', nameAr: 'رسوم نقل الملكية', code: 'DM-5.8', rate: 5.8, category: 'property' },
    ],
  },

  // === السويد ===
  {
    countryCode: 'SE',
    countryName: 'Sweden',
    countryNameAr: 'السويد',
    currency: 'SEK',
    presets: [
      { type: 'vat', name: 'Moms Standard', nameAr: 'ضريبة القيمة المضافة', code: 'MOMS-25', rate: 25, category: 'both' },
      { type: 'vat_reduced', name: 'Moms Reduced', nameAr: 'ضريبة مخفضة', code: 'MOMS-12', rate: 12, category: 'both', notes: 'Food, hotels, restaurants' },
      { type: 'vat_reduced', name: 'Moms Low', nameAr: 'ضريبة منخفضة', code: 'MOMS-6', rate: 6, category: 'services', notes: 'Books, newspapers, culture, transport' },
      { type: 'corporate_tax', name: 'Bolagsskatt', nameAr: 'ضريبة الشركات', code: 'BOL-20.6', rate: 20.6, category: 'income' },
      { type: 'payroll', name: 'Municipal Tax', nameAr: 'ضريبة البلدية', code: 'KOM-32', rate: 32, category: 'income', notes: 'Average, varies 29-35%' },
      { type: 'payroll', name: 'State Tax', nameAr: 'ضريبة الدولة', code: 'STAT-20', rate: 20, category: 'income', notes: 'On income above SEK 540,700' },
      { type: 'social_security', name: 'Arbetsgivaravgift', nameAr: 'رسوم صاحب العمل', code: 'ARB-31.42', rate: 31.42, category: 'income', notes: 'Employer social contributions' },
      { type: 'capital_gains', name: 'Kapitalvinstskatt', nameAr: 'ضريبة أرباح رأس المال', code: 'KAP-30', rate: 30, category: 'income' },
      { type: 'property', name: 'Fastighetsavgift', nameAr: 'رسم العقار', code: 'FAST', rate: 0.75, category: 'property', notes: 'Max SEK 8,874/year for houses' },
    ],
  },

  // === هولندا ===
  {
    countryCode: 'NL',
    countryName: 'Netherlands',
    countryNameAr: 'هولندا',
    currency: 'EUR',
    presets: [
      { type: 'vat', name: 'BTW Hoog', nameAr: 'ضريبة القيمة المضافة', code: 'BTW-21', rate: 21, category: 'both' },
      { type: 'vat_reduced', name: 'BTW Laag', nameAr: 'ضريبة مخفضة', code: 'BTW-9', rate: 9, category: 'goods', notes: 'Food, medicines, books, hotels' },
      { type: 'corporate_tax', name: 'Vennootschapsbelasting Low', nameAr: 'ضريبة شركات منخفضة', code: 'VPB-19', rate: 19, category: 'income', notes: 'First €200,000' },
      { type: 'corporate_tax', name: 'Vennootschapsbelasting High', nameAr: 'ضريبة شركات مرتفعة', code: 'VPB-25.8', rate: 25.8, category: 'income', notes: 'Above €200,000' },
      { type: 'payroll', name: 'Inkomstenbelasting Box 1', nameAr: 'ضريبة الدخل', code: 'IB-36.93', rate: 36.93, category: 'income', notes: 'Up to €73,031' },
      { type: 'payroll', name: 'Inkomstenbelasting High', nameAr: 'ضريبة الدخل المرتفعة', code: 'IB-49.5', rate: 49.5, category: 'income', notes: 'Above €73,031' },
      { type: 'social_security', name: 'Premies Werknemersverzekeringen', nameAr: 'تأمينات الموظفين', code: 'WV', rate: 27.65, category: 'income', notes: 'Included in income tax' },
      { type: 'withholding', name: 'Dividendbelasting', nameAr: 'ضريبة الأرباح', code: 'DIV-15', rate: 15, category: 'income' },
      { type: 'stamp_duty', name: 'Overdrachtsbelasting', nameAr: 'ضريبة نقل الملكية', code: 'OVB-2', rate: 2, category: 'property', notes: 'Residential property' },
    ],
  },

  // === مصر ===
  {
    countryCode: 'EG',
    countryName: 'Egypt',
    countryNameAr: 'مصر',
    currency: 'EGP',
    presets: [
      { type: 'vat', name: 'VAT Standard', nameAr: 'ضريبة القيمة المضافة', code: 'VAT-14', rate: 14, category: 'both' },
      { type: 'vat_reduced', name: 'VAT - Professional Services', nameAr: 'خدمات مهنية', code: 'VAT-10', rate: 10, category: 'services' },
      { type: 'vat_zero', name: 'VAT Exempt', nameAr: 'معفى من الضريبة', code: 'VAT-0', rate: 0, category: 'goods', notes: 'Basic food, education, health' },
      { type: 'corporate_tax', name: 'Corporate Tax', nameAr: 'ضريبة الشركات', code: 'CT-22.5', rate: 22.5, category: 'income' },
      { type: 'withholding', name: 'WHT - Dividends', nameAr: 'استقطاع أرباح', code: 'WHT-10', rate: 10, category: 'income' },
      { type: 'withholding', name: 'WHT - Interest', nameAr: 'استقطاع فوائد', code: 'WHT-20', rate: 20, category: 'income' },
      { type: 'payroll', name: 'Personal Income Tax', nameAr: 'ضريبة الدخل', code: 'PIT-25', rate: 25, category: 'income', notes: 'Top bracket' },
      { type: 'social_security', name: 'Social Insurance - Employer', nameAr: 'تأمينات - صاحب العمل', code: 'SI-E-18.75', rate: 18.75, category: 'income' },
      { type: 'social_security', name: 'Social Insurance - Employee', nameAr: 'تأمينات - موظف', code: 'SI-EE-11', rate: 11, category: 'income' },
      { type: 'stamp_duty', name: 'Stamp Duty', nameAr: 'رسم دمغة', code: 'SD-0.5', rate: 0.5, category: 'both' },
      { type: 'customs', name: 'Customs Duty', nameAr: 'رسوم جمركية', code: 'CUST', rate: 5, category: 'goods', notes: 'Varies by product' },
    ],
  },

  // === الأردن ===
  {
    countryCode: 'JO',
    countryName: 'Jordan',
    countryNameAr: 'الأردن',
    currency: 'JOD',
    presets: [
      { type: 'sales_tax', name: 'GST Standard', nameAr: 'ضريبة المبيعات العامة', code: 'GST-16', rate: 16, category: 'both' },
      { type: 'sales_tax', name: 'GST - Special', nameAr: 'ضريبة خاصة', code: 'GST-8', rate: 8, category: 'services' },
      { type: 'corporate_tax', name: 'Corporate Tax - General', nameAr: 'ضريبة الشركات', code: 'CT-20', rate: 20, category: 'income' },
      { type: 'corporate_tax', name: 'Corporate Tax - Banks', nameAr: 'ضريبة البنوك', code: 'CT-35', rate: 35, category: 'income' },
      { type: 'payroll', name: 'Personal Income Tax', nameAr: 'ضريبة الدخل', code: 'PIT-25', rate: 25, category: 'income', notes: 'Top bracket' },
      { type: 'social_security', name: 'SSC Employer', nameAr: 'ضمان اجتماعي - صاحب العمل', code: 'SSC-E-14.25', rate: 14.25, category: 'income' },
      { type: 'social_security', name: 'SSC Employee', nameAr: 'ضمان اجتماعي - موظف', code: 'SSC-EE-7.5', rate: 7.5, category: 'income' },
    ],
  },

  // === الولايات المتحدة ===
  {
    countryCode: 'US',
    countryName: 'United States',
    countryNameAr: 'الولايات المتحدة',
    currency: 'USD',
    presets: [
      { type: 'sales_tax', name: 'Sales Tax (Average)', nameAr: 'ضريبة مبيعات متوسطة', code: 'ST-7.5', rate: 7.5, category: 'goods', notes: 'Varies by state 0-10%' },
      { type: 'sales_tax', name: 'Sales Tax - California', nameAr: 'ضريبة كاليفورنيا', code: 'ST-CA-7.25', rate: 7.25, category: 'goods' },
      { type: 'sales_tax', name: 'Sales Tax - New York', nameAr: 'ضريبة نيويورك', code: 'ST-NY-8', rate: 8, category: 'goods' },
      { type: 'sales_tax', name: 'Sales Tax - Texas', nameAr: 'ضريبة تكساس', code: 'ST-TX-6.25', rate: 6.25, category: 'goods' },
      { type: 'corporate_tax', name: 'Federal Corporate Tax', nameAr: 'ضريبة شركات اتحادية', code: 'CT-FED-21', rate: 21, category: 'income' },
      { type: 'payroll', name: 'Federal Income Tax (10%)', nameAr: 'ضريبة دخل 10%', code: 'FIT-10', rate: 10, category: 'income' },
      { type: 'payroll', name: 'Federal Income Tax (22%)', nameAr: 'ضريبة دخل 22%', code: 'FIT-22', rate: 22, category: 'income' },
      { type: 'payroll', name: 'Federal Income Tax (37%)', nameAr: 'ضريبة دخل 37%', code: 'FIT-37', rate: 37, category: 'income', notes: 'Top bracket' },
      { type: 'social_security', name: 'Social Security (FICA)', nameAr: 'الضمان الاجتماعي', code: 'FICA-SS-6.2', rate: 6.2, category: 'income' },
      { type: 'social_security', name: 'Medicare', nameAr: 'التأمين الصحي', code: 'FICA-MED-1.45', rate: 1.45, category: 'income' },
      { type: 'capital_gains', name: 'Long-term Capital Gains', nameAr: 'أرباح رأس المال طويلة', code: 'LTCG-20', rate: 20, category: 'income' },
      { type: 'property', name: 'Property Tax (Average)', nameAr: 'ضريبة عقارية', code: 'PROP-1.1', rate: 1.1, category: 'property', notes: 'Annual, varies by state' },
    ],
  },

  // === كندا ===
  {
    countryCode: 'CA',
    countryName: 'Canada',
    countryNameAr: 'كندا',
    currency: 'CAD',
    presets: [
      { type: 'vat', name: 'GST (Federal)', nameAr: 'ضريبة السلع والخدمات', code: 'GST-5', rate: 5, category: 'both' },
      { type: 'sales_tax', name: 'HST - Ontario', nameAr: 'ضريبة منسقة - أونتاريو', code: 'HST-ON-13', rate: 13, category: 'both' },
      { type: 'sales_tax', name: 'PST - British Columbia', nameAr: 'ضريبة المقاطعة - بريتش كولومبيا', code: 'PST-BC-7', rate: 7, category: 'both' },
      { type: 'sales_tax', name: 'QST - Quebec', nameAr: 'ضريبة كيبيك', code: 'QST-9.975', rate: 9.975, category: 'both' },
      { type: 'corporate_tax', name: 'Federal Corporate Tax', nameAr: 'ضريبة شركات اتحادية', code: 'CT-FED-15', rate: 15, category: 'income' },
      { type: 'corporate_tax', name: 'Small Business Rate', nameAr: 'ضريبة الشركات الصغيرة', code: 'CT-SB-9', rate: 9, category: 'income' },
      { type: 'payroll', name: 'Federal Income Tax', nameAr: 'ضريبة دخل اتحادية', code: 'FIT', rate: 33, category: 'income', notes: 'Top bracket' },
      { type: 'social_security', name: 'CPP Employer', nameAr: 'خطة المعاشات - صاحب العمل', code: 'CPP-E-5.95', rate: 5.95, category: 'income' },
      { type: 'social_security', name: 'EI Employer', nameAr: 'تأمين البطالة - صاحب العمل', code: 'EI-E-2.21', rate: 2.21, category: 'income' },
    ],
  },

  // === أستراليا ===
  {
    countryCode: 'AU',
    countryName: 'Australia',
    countryNameAr: 'أستراليا',
    currency: 'AUD',
    presets: [
      { type: 'vat', name: 'GST', nameAr: 'ضريبة السلع والخدمات', code: 'GST-10', rate: 10, category: 'both' },
      { type: 'vat_zero', name: 'GST Free', nameAr: 'معفى من الضريبة', code: 'GST-0', rate: 0, category: 'goods', notes: 'Basic food, education, health' },
      { type: 'corporate_tax', name: 'Company Tax', nameAr: 'ضريبة الشركات', code: 'CT-30', rate: 30, category: 'income' },
      { type: 'corporate_tax', name: 'Small Business Tax', nameAr: 'ضريبة الشركات الصغيرة', code: 'CT-25', rate: 25, category: 'income' },
      { type: 'payroll', name: 'Income Tax 19%', nameAr: 'ضريبة الدخل 19%', code: 'IT-19', rate: 19, category: 'income' },
      { type: 'payroll', name: 'Income Tax 32.5%', nameAr: 'ضريبة الدخل 32.5%', code: 'IT-32.5', rate: 32.5, category: 'income' },
      { type: 'payroll', name: 'Income Tax 37%', nameAr: 'ضريبة الدخل 37%', code: 'IT-37', rate: 37, category: 'income' },
      { type: 'payroll', name: 'Income Tax 45%', nameAr: 'ضريبة الدخل 45%', code: 'IT-45', rate: 45, category: 'income' },
      { type: 'social_security', name: 'Superannuation', nameAr: 'صندوق التقاعد', code: 'SUPER-11', rate: 11, category: 'income', notes: 'Employer contribution' },
      { type: 'capital_gains', name: 'CGT', nameAr: 'ضريبة أرباح رأس المال', code: 'CGT', rate: 23.5, category: 'income', notes: '50% discount for assets held >1 year' },
    ],
  },

  // === الهند ===
  {
    countryCode: 'IN',
    countryName: 'India',
    countryNameAr: 'الهند',
    currency: 'INR',
    presets: [
      { type: 'vat', name: 'GST 5%', nameAr: 'ضريبة السلع 5%', code: 'GST-5', rate: 5, category: 'goods', notes: 'Essential items' },
      { type: 'vat', name: 'GST 12%', nameAr: 'ضريبة السلع 12%', code: 'GST-12', rate: 12, category: 'both' },
      { type: 'vat', name: 'GST 18%', nameAr: 'ضريبة السلع 18%', code: 'GST-18', rate: 18, category: 'both', notes: 'Standard rate' },
      { type: 'vat', name: 'GST 28%', nameAr: 'ضريبة السلع 28%', code: 'GST-28', rate: 28, category: 'goods', notes: 'Luxury items' },
      { type: 'corporate_tax', name: 'Corporate Tax (New)', nameAr: 'ضريبة الشركات الجديدة', code: 'CT-22', rate: 22, category: 'income', notes: 'New manufacturing companies' },
      { type: 'corporate_tax', name: 'Corporate Tax (Existing)', nameAr: 'ضريبة الشركات القائمة', code: 'CT-30', rate: 30, category: 'income' },
      { type: 'payroll', name: 'Income Tax 30%', nameAr: 'ضريبة الدخل 30%', code: 'IT-30', rate: 30, category: 'income', notes: 'Above ₹15 lakh' },
      { type: 'withholding', name: 'TDS - Professional', nameAr: 'خصم المنبع - مهني', code: 'TDS-10', rate: 10, category: 'income' },
      { type: 'social_security', name: 'EPF Employer', nameAr: 'صندوق التوفير - صاحب العمل', code: 'EPF-E-12', rate: 12, category: 'income' },
      { type: 'social_security', name: 'ESI Employer', nameAr: 'تأمين الموظفين', code: 'ESI-E-3.25', rate: 3.25, category: 'income' },
    ],
  },

  // === إيطاليا ===
  {
    countryCode: 'IT',
    countryName: 'Italy',
    countryNameAr: 'إيطاليا',
    currency: 'EUR',
    presets: [
      { type: 'vat', name: 'IVA Ordinaria', nameAr: 'ضريبة القيمة المضافة العادية', code: 'IVA-22', rate: 22, category: 'both' },
      { type: 'vat_reduced', name: 'IVA Ridotta', nameAr: 'ضريبة مخفضة', code: 'IVA-10', rate: 10, category: 'both', notes: 'Medicines, hotels, restaurants' },
      { type: 'vat_reduced', name: 'IVA Super Ridotta', nameAr: 'ضريبة منخفضة جداً', code: 'IVA-5', rate: 5, category: 'goods', notes: 'Essential food' },
      { type: 'vat_super_reduced', name: 'IVA Minima', nameAr: 'ضريبة دنيا', code: 'IVA-4', rate: 4, category: 'goods', notes: 'Basic necessities' },
      { type: 'corporate_tax', name: 'IRES', nameAr: 'ضريبة دخل الشركات', code: 'IRES-24', rate: 24, category: 'income' },
      { type: 'municipal', name: 'IRAP', nameAr: 'ضريبة الإنتاج الإقليمية', code: 'IRAP-3.9', rate: 3.9, category: 'income' },
      { type: 'payroll', name: 'IRPEF 43%', nameAr: 'ضريبة الدخل 43%', code: 'IRPEF-43', rate: 43, category: 'income', notes: 'Top bracket' },
      { type: 'social_security', name: 'INPS Employer', nameAr: 'تأمينات - صاحب العمل', code: 'INPS-E-30', rate: 30, category: 'income', notes: 'Approximate' },
      { type: 'social_security', name: 'INPS Employee', nameAr: 'تأمينات - موظف', code: 'INPS-EE-9.19', rate: 9.19, category: 'income' },
    ],
  },

  // === إسبانيا ===
  {
    countryCode: 'ES',
    countryName: 'Spain',
    countryNameAr: 'إسبانيا',
    currency: 'EUR',
    presets: [
      { type: 'vat', name: 'IVA General', nameAr: 'ضريبة القيمة المضافة العامة', code: 'IVA-21', rate: 21, category: 'both' },
      { type: 'vat_reduced', name: 'IVA Reducido', nameAr: 'ضريبة مخفضة', code: 'IVA-10', rate: 10, category: 'both', notes: 'Hotels, restaurants, transport' },
      { type: 'vat_super_reduced', name: 'IVA Superreducido', nameAr: 'ضريبة منخفضة جداً', code: 'IVA-4', rate: 4, category: 'goods', notes: 'Basic food, books, medicines' },
      { type: 'corporate_tax', name: 'Impuesto de Sociedades', nameAr: 'ضريبة الشركات', code: 'IS-25', rate: 25, category: 'income' },
      { type: 'corporate_tax', name: 'IS - New Companies', nameAr: 'ضريبة الشركات الجديدة', code: 'IS-15', rate: 15, category: 'income', notes: 'First 2 years' },
      { type: 'payroll', name: 'IRPF 47%', nameAr: 'ضريبة الدخل 47%', code: 'IRPF-47', rate: 47, category: 'income', notes: 'Top bracket' },
      { type: 'social_security', name: 'SS Employer', nameAr: 'ضمان اجتماعي - صاحب العمل', code: 'SS-E-30', rate: 30, category: 'income', notes: 'Approximate total' },
      { type: 'social_security', name: 'SS Employee', nameAr: 'ضمان اجتماعي - موظف', code: 'SS-EE-6.35', rate: 6.35, category: 'income' },
    ],
  },
];

export function getCountryList() {
  return TAX_PRESETS.map(c => ({ 
    code: c.countryCode, 
    name: c.countryName,
    nameAr: c.countryNameAr 
  }));
}

export function getPresetsForCountry(code: string) {
  return TAX_PRESETS.find(c => c.countryCode === code);
}

export function getTaxTypeLabel(type: TaxType): { en: string; ar: string } {
  const labels: Record<TaxType, { en: string; ar: string }> = {
    vat: { en: 'VAT', ar: 'ضريبة القيمة المضافة' },
    vat_reduced: { en: 'VAT Reduced', ar: 'ضريبة مخفضة' },
    vat_zero: { en: 'VAT Zero', ar: 'ضريبة صفرية' },
    vat_super_reduced: { en: 'VAT Super Reduced', ar: 'ضريبة منخفضة جداً' },
    sales_tax: { en: 'Sales Tax', ar: 'ضريبة المبيعات' },
    corporate_tax: { en: 'Corporate Tax', ar: 'ضريبة الشركات' },
    withholding: { en: 'Withholding Tax', ar: 'ضريبة الاستقطاع' },
    payroll: { en: 'Payroll Tax', ar: 'ضريبة الرواتب' },
    capital_gains: { en: 'Capital Gains Tax', ar: 'ضريبة أرباح رأس المال' },
    property: { en: 'Property Tax', ar: 'ضريبة العقارات' },
    customs: { en: 'Customs Duty', ar: 'رسوم جمركية' },
    excise: { en: 'Excise Tax', ar: 'ضريبة انتقائية' },
    stamp_duty: { en: 'Stamp Duty', ar: 'رسم الدمغة' },
    solidarity: { en: 'Solidarity Tax', ar: 'ضريبة التضامن' },
    trade_tax: { en: 'Trade Tax', ar: 'ضريبة التجارة' },
    church_tax: { en: 'Church Tax', ar: 'ضريبة الكنيسة' },
    social_security: { en: 'Social Security', ar: 'التأمينات الاجتماعية' },
    municipal: { en: 'Municipal Tax', ar: 'ضريبة البلدية' },
    other: { en: 'Other', ar: 'أخرى' },
  };
  return labels[type] || labels.other;
}
