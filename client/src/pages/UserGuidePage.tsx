import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Book,
  Search,
  Home,
  ShoppingCart,
  ShoppingBag,
  Building2,
  Package,
  FileText,
  BarChart3,
  Users,
  Landmark,
  Settings,
  HelpCircle,
  ChevronRight,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Play,
  Clock,
  Star,
  Zap
} from 'lucide-react';

interface GuideSection {
  id: string;
  icon: React.ReactNode;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  topics: GuideTopic[];
}

interface GuideTopic {
  id: string;
  title: string;
  titleAr: string;
  content: string;
  contentAr: string;
  tips?: string[];
  tipsAr?: string[];
}

const guideSections: GuideSection[] = [
  {
    id: 'getting-started',
    icon: <Play className="h-5 w-5" />,
    title: 'Getting Started',
    titleAr: 'البدء السريع',
    description: 'Learn the basics and set up your account',
    descriptionAr: 'تعلم الأساسيات وأعد حسابك',
    topics: [
      {
        id: 'register',
        title: 'Creating an Account',
        titleAr: 'إنشاء حساب',
        content: `To create a new account:
1. Open the app and click "Create Account"
2. Enter your company information (name, email, password)
3. Select your base currency and country
4. Click "Register" to complete setup`,
        contentAr: `لإنشاء حساب جديد:
1. افتح التطبيق واضغط على "إنشاء حساب"
2. أدخل معلومات شركتك (الاسم، البريد الإلكتروني، كلمة المرور)
3. اختر العملة الأساسية والبلد
4. اضغط "تسجيل" لإكمال الإعداد`,
        tips: ['Use a strong password with letters, numbers, and symbols', 'Verify your email to enable all features'],
        tipsAr: ['استخدم كلمة مرور قوية تحتوي على حروف وأرقام ورموز', 'تحقق من بريدك الإلكتروني لتفعيل جميع الميزات']
      },
      {
        id: 'dashboard',
        title: 'Understanding the Dashboard',
        titleAr: 'فهم لوحة التحكم',
        content: `The dashboard shows your key financial metrics:
• Total Revenue - Your total sales
• Total Expenses - Your costs and purchases
• Net Profit - Revenue minus expenses
• Cash Balance - Available cash in accounts`,
        contentAr: `لوحة التحكم تعرض مؤشراتك المالية الرئيسية:
• إجمالي الإيرادات - مجموع مبيعاتك
• إجمالي المصروفات - تكاليفك ومشترياتك
• صافي الربح - الإيرادات ناقص المصروفات
• الرصيد النقدي - النقد المتاح في حساباتك`,
        tips: ['Review your dashboard daily for quick insights', 'Click on any metric to see detailed breakdown'],
        tipsAr: ['راجع لوحة التحكم يومياً للحصول على رؤى سريعة', 'اضغط على أي مؤشر لرؤية التفاصيل']
      },
      {
        id: 'switch-company',
        title: 'Switching Companies',
        titleAr: 'التبديل بين الشركات',
        content: `If you manage multiple companies:
1. Click on the company name in the sidebar
2. Select the company you want to switch to
3. All data will update to the selected company`,
        contentAr: `إذا كنت تدير عدة شركات:
1. اضغط على اسم الشركة في الشريط الجانبي
2. اختر الشركة التي تريد التبديل إليها
3. ستُحدَّث جميع البيانات للشركة المختارة`
      }
    ]
  },
  {
    id: 'sales',
    icon: <ShoppingCart className="h-5 w-5" />,
    title: 'Sales Management',
    titleAr: 'إدارة المبيعات',
    description: 'Manage quotations, orders, invoices, and credit notes',
    descriptionAr: 'إدارة عروض الأسعار والطلبات والفواتير وإشعارات الدائن',
    topics: [
      {
        id: 'quotations',
        title: 'Creating Quotations',
        titleAr: 'إنشاء عروض الأسعار',
        content: `Quotations are sent to customers before issuing invoices.

To create a quotation:
1. Go to Sales → Quotations
2. Click "+ New Quotation"
3. Select the customer
4. Add products/services with quantities and prices
5. Set the validity date
6. Click "Save" or "Send"

You can convert a quotation to a sales order or invoice.`,
        contentAr: `عروض الأسعار تُرسل للعملاء قبل إصدار الفاتورة.

لإنشاء عرض سعر:
1. اذهب إلى المبيعات ← عروض الأسعار
2. اضغط "+ عرض سعر جديد"
3. اختر العميل
4. أضف المنتجات/الخدمات مع الكميات والأسعار
5. حدد تاريخ الصلاحية
6. اضغط "حفظ" أو "إرسال"

يمكنك تحويل العرض إلى طلب مبيعات أو فاتورة.`,
        tips: ['Set realistic validity dates', 'Include all terms and conditions'],
        tipsAr: ['حدد تواريخ صلاحية واقعية', 'أضف جميع الشروط والأحكام']
      },
      {
        id: 'invoices',
        title: 'Creating Invoices',
        titleAr: 'إنشاء الفواتير',
        content: `Invoices are official documents for payment requests.

To create an invoice:
1. Go to Sales → Invoices
2. Click "+ New Invoice"
3. Select the customer
4. Add items (products or services)
5. Set the tax rate (if applicable)
6. Define payment terms (e.g., Net 30)
7. Click "Save" or "Save and Send"

Invoice statuses:
• Draft - Being prepared
• Sent - Sent to customer
• Partially Paid - Part payment received
• Paid - Fully paid
• Overdue - Past due date`,
        contentAr: `الفواتير هي المستندات الرسمية للمطالبة بالدفع.

لإنشاء فاتورة:
1. اذهب إلى المبيعات ← الفواتير
2. اضغط "+ فاتورة جديدة"
3. اختر العميل
4. أضف البنود (منتجات أو خدمات)
5. حدد نسبة الضريبة (إن وجدت)
6. حدد شروط الدفع (مثل: 30 يوم)
7. اضغط "حفظ" أو "حفظ وإرسال"

حالات الفاتورة:
• مسودة - قيد الإعداد
• مُرسلة - أُرسلت للعميل
• مدفوعة جزئياً - تم دفع جزء منها
• مدفوعة - تم السداد الكامل
• متأخرة - تجاوزت تاريخ الاستحقاق`
      },
      {
        id: 'credit-notes',
        title: 'Credit Notes',
        titleAr: 'إشعارات الدائن',
        content: `Credit notes are used for returns or invoice corrections.

To create a credit note:
1. Go to Sales → Credit Notes
2. Click "+ New Credit Note"
3. Link to the original invoice (optional)
4. Specify the returned items and amounts
5. Write the reason for return
6. Click "Save"`,
        contentAr: `إشعارات الدائن تُستخدم عند إرجاع بضاعة أو تصحيح فاتورة.

لإنشاء إشعار دائن:
1. اذهب إلى المبيعات ← إشعارات الدائن
2. اضغط "+ إشعار دائن جديد"
3. اربطه بالفاتورة الأصلية (اختياري)
4. حدد البنود المُرجعة والمبالغ
5. اكتب سبب الإرجاع
6. اضغط "حفظ"`
      }
    ]
  },
  {
    id: 'purchases',
    icon: <ShoppingBag className="h-5 w-5" />,
    title: 'Purchases Management',
    titleAr: 'إدارة المشتريات',
    description: 'Manage purchase orders, bills, and expenses',
    descriptionAr: 'إدارة طلبات الشراء والفواتير والمصروفات',
    topics: [
      {
        id: 'purchase-orders',
        title: 'Purchase Orders',
        titleAr: 'طلبات الشراء',
        content: `Purchase orders are sent to suppliers to order goods.

To create a purchase order:
1. Go to Purchases → Purchase Orders
2. Click "+ New Purchase Order"
3. Select the supplier
4. Add the products you need
5. Set the expected delivery date
6. Click "Send to Supplier"`,
        contentAr: `طلبات الشراء تُرسل للموردين لطلب البضائع.

لإنشاء طلب شراء:
1. اذهب إلى المشتريات ← طلبات الشراء
2. اضغط "+ طلب شراء جديد"
3. اختر المورد
4. أضف المنتجات المطلوبة
5. حدد تاريخ التسليم المتوقع
6. اضغط "إرسال للمورد"`
      },
      {
        id: 'bills',
        title: 'Recording Bills',
        titleAr: 'تسجيل فواتير الشراء',
        content: `Bills are purchase invoices received from suppliers.

To record a bill:
1. Go to Purchases → Bills
2. Click "+ New Bill"
3. Select the supplier
4. Enter the supplier's invoice number
5. Add items and amounts
6. Set the due date
7. Click "Save"`,
        contentAr: `فواتير الشراء هي الفواتير الواردة من الموردين.

لتسجيل فاتورة شراء:
1. اذهب إلى المشتريات ← الفواتير
2. اضغط "+ فاتورة جديدة"
3. اختر المورد
4. أدخل رقم فاتورة المورد
5. أضف البنود والمبالغ
6. حدد تاريخ الاستحقاق
7. اضغط "حفظ"`
      },
      {
        id: 'expenses',
        title: 'Recording Expenses',
        titleAr: 'تسجيل المصروفات',
        content: `Expenses are operational costs (rent, utilities, fuel, etc.).

To record an expense:
1. Go to Purchases → Expenses
2. Click "+ New Expense"
3. Select the expense category
4. Enter the amount and description
5. Attach a receipt (optional)
6. Select the payment method
7. Click "Save"`,
        contentAr: `المصروفات هي التكاليف التشغيلية (إيجار، كهرباء، وقود...).

لتسجيل مصروف:
1. اذهب إلى المشتريات ← المصروفات
2. اضغط "+ مصروف جديد"
3. اختر فئة المصروف
4. أدخل المبلغ والوصف
5. أرفق الإيصال (اختياري)
6. حدد طريقة الدفع
7. اضغط "حفظ"`
      }
    ]
  },
  {
    id: 'banking',
    icon: <Building2 className="h-5 w-5" />,
    title: 'Banking & Payments',
    titleAr: 'البنوك والمدفوعات',
    description: 'Manage bank accounts, payments, and receipts',
    descriptionAr: 'إدارة الحسابات البنكية والمدفوعات والمقبوضات',
    topics: [
      {
        id: 'bank-accounts',
        title: 'Bank Accounts',
        titleAr: 'الحسابات البنكية',
        content: `Add and manage your bank accounts.

To add a bank account:
1. Go to Banking → Accounts
2. Click "+ New Account"
3. Enter the bank name and account number
4. Set the currency and opening balance
5. Click "Save"`,
        contentAr: `أضف وأدر حساباتك البنكية.

لإضافة حساب بنكي:
1. اذهب إلى البنوك ← الحسابات
2. اضغط "+ حساب جديد"
3. أدخل اسم البنك ورقم الحساب
4. حدد العملة والرصيد الافتتاحي
5. اضغط "حفظ"`
      },
      {
        id: 'payments',
        title: 'Recording Payments',
        titleAr: 'تسجيل المدفوعات',
        content: `Payments are amounts paid to suppliers.

To record a payment:
1. Go to Banking → Payments
2. Click "+ New Payment"
3. Select the supplier
4. Enter the amount and payment method
5. Link to outstanding bills (optional)
6. Click "Save"

Payment methods:
• Cash
• Bank Transfer
• Credit Card
• Check`,
        contentAr: `المدفوعات هي المبالغ المدفوعة للموردين.

لتسجيل دفعة:
1. اذهب إلى البنوك ← المدفوعات
2. اضغط "+ دفعة جديدة"
3. اختر المورد
4. حدد المبلغ وطريقة الدفع
5. اربطها بالفواتير المستحقة (اختياري)
6. اضغط "حفظ"

طرق الدفع:
• نقداً
• تحويل بنكي
• بطاقة ائتمان
• شيك`
      },
      {
        id: 'receipts',
        title: 'Recording Receipts',
        titleAr: 'تسجيل المقبوضات',
        content: `Receipts are amounts received from customers.

To record a receipt:
1. Go to Banking → Receipts
2. Click "+ New Receipt"
3. Select the customer
4. Enter the amount and payment method
5. Link to outstanding invoices
6. Click "Save"`,
        contentAr: `المقبوضات هي المبالغ المستلمة من العملاء.

لتسجيل مقبوض:
1. اذهب إلى البنوك ← المقبوضات
2. اضغط "+ مقبوض جديد"
3. اختر العميل
4. حدد المبلغ وطريقة الاستلام
5. اربطه بالفواتير المستحقة
6. اضغط "حفظ"`
      },
      {
        id: 'reconciliation',
        title: 'Bank Reconciliation',
        titleAr: 'التسوية البنكية',
        content: `Reconciliation matches your records with the bank statement.

Steps:
1. Go to Banking → Reconciliation
2. Select the bank account
3. Enter the bank statement balance
4. Match transactions with the statement
5. Mark matched transactions
6. Click "Complete Reconciliation"`,
        contentAr: `التسوية تطابق سجلاتك مع كشف حساب البنك.

الخطوات:
1. اذهب إلى البنوك ← التسوية البنكية
2. اختر الحساب البنكي
3. أدخل رصيد كشف البنك
4. طابق العمليات مع كشف الحساب
5. حدد العمليات المتطابقة
6. اضغط "إتمام التسوية"`
      }
    ]
  },
  {
    id: 'inventory',
    icon: <Package className="h-5 w-5" />,
    title: 'Inventory Management',
    titleAr: 'إدارة المخزون',
    description: 'Manage warehouses, items, and stock movements',
    descriptionAr: 'إدارة المستودعات والأصناف وحركة المخزون',
    topics: [
      {
        id: 'items',
        title: 'Managing Items',
        titleAr: 'إدارة الأصناف',
        content: `Items are your products and services.

To add an item:
1. Go to Items
2. Click "+ New Item"
3. Enter item details:
   - Name and SKU code
   - Category
   - Sale price and cost price
   - Unit (piece, kg, meter, etc.)
4. For inventory items: set quantity and minimum level
5. Click "Save"

Item types:
• Inventory - Stockable products
• Service - Non-stockable services
• Non-inventory - Direct purchases`,
        contentAr: `الأصناف هي منتجاتك وخدماتك.

لإضافة صنف:
1. اذهب إلى الأصناف
2. اضغط "+ صنف جديد"
3. أدخل تفاصيل الصنف:
   - الاسم ورمز SKU
   - الفئة
   - سعر البيع وسعر التكلفة
   - الوحدة (قطعة، كيلو، متر...)
4. للمخزون: حدد الكمية والحد الأدنى
5. اضغط "حفظ"

أنواع الأصناف:
• مخزون - منتجات قابلة للتخزين
• خدمة - خدمات لا تُخزّن
• غير مخزني - مشتريات مباشرة`
      },
      {
        id: 'warehouses',
        title: 'Managing Warehouses',
        titleAr: 'إدارة المستودعات',
        content: `Warehouses store your inventory.

To add a warehouse:
1. Go to Inventory → Warehouses
2. Click "+ New Warehouse"
3. Enter the name and location
4. Assign a manager
5. Click "Save"`,
        contentAr: `المستودعات تخزن مخزونك.

لإضافة مستودع:
1. اذهب إلى المخزون ← المستودعات
2. اضغط "+ مستودع جديد"
3. أدخل الاسم والموقع
4. حدد المسؤول
5. اضغط "حفظ"`
      },
      {
        id: 'stock-transfer',
        title: 'Stock Transfers',
        titleAr: 'تحويل المخزون',
        content: `Transfer items between warehouses.

To create a transfer:
1. Go to Inventory → Stock Transfer
2. Click "+ New Transfer"
3. Select source and destination warehouses
4. Add items and quantities
5. Click "Execute Transfer"`,
        contentAr: `نقل الأصناف بين المستودعات.

لإنشاء تحويل:
1. اذهب إلى المخزون ← تحويل المخزون
2. اضغط "+ تحويل جديد"
3. اختر المستودع المصدر والوجهة
4. أضف الأصناف والكميات
5. اضغط "تنفيذ التحويل"`
      },
      {
        id: 'stock-adjustment',
        title: 'Stock Adjustments',
        titleAr: 'تعديل المخزون',
        content: `Adjust quantities for counting, damage, or loss.

To create an adjustment:
1. Go to Inventory → Stock Adjustments
2. Click "+ New Adjustment"
3. Select the warehouse
4. Choose the item and new quantity
5. Write the reason for adjustment
6. Click "Save"`,
        contentAr: `تعديل الكميات للجرد أو التلف أو الضياع.

لإنشاء تعديل:
1. اذهب إلى المخزون ← تعديل المخزون
2. اضغط "+ تعديل جديد"
3. اختر المستودع
4. حدد الصنف والكمية الجديدة
5. اكتب سبب التعديل
6. اضغط "حفظ"`
      }
    ]
  },
  {
    id: 'accounting',
    icon: <FileText className="h-5 w-5" />,
    title: 'Accounting',
    titleAr: 'المحاسبة',
    description: 'Journal entries and chart of accounts',
    descriptionAr: 'القيود المحاسبية ودليل الحسابات',
    topics: [
      {
        id: 'chart-of-accounts',
        title: 'Chart of Accounts',
        titleAr: 'دليل الحسابات',
        content: `The chart of accounts organizes your financial accounts.

Account types:
• Assets - Cash, bank, receivables, inventory
• Liabilities - Payables, loans, taxes payable
• Equity - Capital, retained earnings
• Revenue - Sales, other income
• Expenses - Salaries, rent, operating costs

To add an account:
1. Go to Accounts
2. Click "+ New Account"
3. Select the type (assets/liabilities/etc.)
4. Enter the account name and number
5. Set the parent account (for sub-accounts)
6. Click "Save"`,
        contentAr: `دليل الحسابات ينظم حساباتك المالية.

أنواع الحسابات:
• الأصول - النقد، البنك، المدينون، المخزون
• الالتزامات - الدائنون، القروض، الضرائب المستحقة
• حقوق الملكية - رأس المال، الأرباح المحتجزة
• الإيرادات - المبيعات، إيرادات أخرى
• المصروفات - الرواتب، الإيجار، المصاريف التشغيلية

لإضافة حساب:
1. اذهب إلى الحسابات
2. اضغط "+ حساب جديد"
3. اختر النوع (أصول/التزامات/...)
4. أدخل اسم الحساب ورقمه
5. حدد الحساب الأب (للحسابات الفرعية)
6. اضغط "حفظ"`
      },
      {
        id: 'journal-entries',
        title: 'Journal Entries',
        titleAr: 'القيود المحاسبية',
        content: `Journal entries record financial transactions.

To create a manual entry:
1. Go to Accounting → Journal Entries
2. Click "+ New Entry"
3. Enter the date and description
4. Add lines with:
   - Account
   - Debit or Credit
   - Amount
5. Ensure total debits = total credits
6. Click "Save"

Note: Most entries are created automatically when you issue invoices and payments.`,
        contentAr: `القيود المحاسبية تسجل المعاملات المالية.

لإنشاء قيد يدوي:
1. اذهب إلى المحاسبة ← القيود
2. اضغط "+ قيد جديد"
3. أدخل التاريخ والوصف
4. أضف السطور:
   - الحساب
   - مدين أو دائن
   - المبلغ
5. تأكد أن المجموع المدين = المجموع الدائن
6. اضغط "حفظ"

ملاحظة: معظم القيود تُنشأ تلقائياً عند إصدار الفواتير والمدفوعات.`
      }
    ]
  },
  {
    id: 'reports',
    icon: <BarChart3 className="h-5 w-5" />,
    title: 'Financial Reports',
    titleAr: 'التقارير المالية',
    description: 'Generate and analyze financial reports',
    descriptionAr: 'إنشاء وتحليل التقارير المالية',
    topics: [
      {
        id: 'profit-loss',
        title: 'Profit & Loss Report',
        titleAr: 'قائمة الأرباح والخسائر',
        content: `Shows your profitability over a period.

Includes:
• Total Revenue
• Cost of Sales
• Gross Profit
• Operating Expenses
• Net Profit/Loss

Options:
- Select the period (this month, year, custom)
- Compare with previous periods
- Export to Excel or PDF`,
        contentAr: `تُظهر ربحيتك خلال فترة معينة.

تشمل:
• إجمالي الإيرادات
• تكلفة المبيعات
• إجمالي الربح
• المصروفات التشغيلية
• صافي الربح/الخسارة

الخيارات:
- تحديد الفترة (هذا الشهر، السنة، مخصص)
- المقارنة مع فترات سابقة
- التصدير إلى Excel أو PDF`
      },
      {
        id: 'balance-sheet',
        title: 'Balance Sheet',
        titleAr: 'الميزانية العمومية',
        content: `Shows your financial position at a point in time.

Sections:
• Assets - What your company owns
• Liabilities - What your company owes
• Equity - Net worth to owners`,
        contentAr: `تُظهر مركزك المالي في وقت معين.

الأقسام:
• الأصول - ما تملكه الشركة
• الالتزامات - ما عليها من ديون
• حقوق الملكية - صافي ملكية أصحاب الشركة`
      },
      {
        id: 'cash-flow',
        title: 'Cash Flow Statement',
        titleAr: 'قائمة التدفق النقدي',
        content: `Tracks the movement of cash in your business.

Categories:
• Operating Activities - Cash from daily operations
• Investing Activities - Buying/selling assets
• Financing Activities - Loans and distributions`,
        contentAr: `تتتبع حركة النقد في شركتك.

الفئات:
• الأنشطة التشغيلية - النقد من العمليات اليومية
• الأنشطة الاستثمارية - شراء/بيع الأصول
• الأنشطة التمويلية - القروض والتوزيعات`
      },
      {
        id: 'tax-report',
        title: 'Tax Report',
        titleAr: 'تقرير الضرائب',
        content: `Summarizes your tax obligations.

Shows:
• Sales tax collected
• Purchase tax paid
• Net tax due`,
        contentAr: `يلخص التزاماتك الضريبية.

يعرض:
• ضريبة المبيعات المحصلة
• ضريبة المشتريات المدفوعة
• صافي الضريبة المستحقة`
      }
    ]
  },
  {
    id: 'settings',
    icon: <Settings className="h-5 w-5" />,
    title: 'Settings',
    titleAr: 'الإعدادات',
    description: 'Configure your account and preferences',
    descriptionAr: 'تكوين حسابك وتفضيلاتك',
    topics: [
      {
        id: 'general-settings',
        title: 'General Settings',
        titleAr: 'الإعدادات العامة',
        content: `Configure your company settings.

Options:
• Company name and logo
• Address and contact info
• Fiscal year
• Base currency`,
        contentAr: `تكوين إعدادات شركتك.

الخيارات:
• اسم الشركة والشعار
• العنوان ومعلومات الاتصال
• السنة المالية
• العملة الأساسية`
      },
      {
        id: 'users',
        title: 'User Management',
        titleAr: 'إدارة المستخدمين',
        content: `Add and manage users with different roles.

To add a user:
1. Go to Settings → Users
2. Click "+ New User"
3. Enter email and name
4. Assign permissions
5. Click "Invite"

Roles:
• Admin - Full access
• Accountant - Financial transactions and reports
• Sales - Sales and customers only
• Viewer - View only`,
        contentAr: `إضافة وإدارة المستخدمين بأدوار مختلفة.

لإضافة مستخدم:
1. اذهب إلى الإعدادات ← المستخدمين
2. اضغط "+ مستخدم جديد"
3. أدخل البريد والاسم
4. حدد الصلاحيات
5. اضغط "دعوة"

الصلاحيات:
• مدير - وصول كامل
• محاسب - المعاملات المالية والتقارير
• موظف مبيعات - المبيعات والعملاء فقط
• مشاهد - عرض فقط`
      },
      {
        id: 'backup',
        title: 'Backup & Restore',
        titleAr: 'النسخ الاحتياطي',
        content: `Protect your data with regular backups.

To create a backup:
1. Go to Settings → Backup
2. Click "Backup Now"
3. Wait for completion
4. Download the file

To restore:
1. Click "Restore"
2. Select the backup file
3. Confirm restoration`,
        contentAr: `احمِ بياناتك بنسخ احتياطية منتظمة.

لإنشاء نسخة احتياطية:
1. اذهب إلى الإعدادات ← النسخ الاحتياطي
2. اضغط "نسخ احتياطي الآن"
3. انتظر اكتمال العملية
4. قم بتنزيل الملف

للاستعادة:
1. اضغط "استعادة"
2. اختر ملف النسخة الاحتياطية
3. أكد الاستعادة`
      }
    ]
  }
];

const faqItems = [
  {
    question: 'How do I change my company currency?',
    questionAr: 'كيف أغير عملة الشركة؟',
    answer: 'Go to Settings → General → Base Currency.',
    answerAr: 'اذهب إلى الإعدادات ← عام ← العملة الأساسية.'
  },
  {
    question: 'Why can\'t I delete an invoice?',
    questionAr: 'لماذا لا أستطيع حذف فاتورة؟',
    answer: 'Invoices linked to payments or journal entries cannot be deleted. You can void them instead.',
    answerAr: 'الفواتير المرتبطة بمدفوعات أو قيود محاسبية لا يمكن حذفها. يمكنك إلغاؤها بدلاً من ذلك.'
  },
  {
    question: 'How do I send an invoice to a customer?',
    questionAr: 'كيف أرسل فاتورة للعميل؟',
    answer: 'Open the invoice → Click "Send by Email" → Enter customer email → Click "Send".',
    answerAr: 'افتح الفاتورة ← اضغط "إرسال بالبريد" ← أدخل بريد العميل ← اضغط "إرسال".'
  },
  {
    question: 'How do I reconcile my bank account?',
    questionAr: 'كيف أطابق حسابي مع البنك؟',
    answer: 'Go to Banking → Reconciliation → Follow the matching steps.',
    answerAr: 'اذهب إلى البنوك ← التسوية البنكية ← اتبع خطوات المطابقة.'
  },
  {
    question: 'Is my data secure?',
    questionAr: 'هل بياناتي آمنة؟',
    answer: 'Yes, all data is encrypted and protected. See our Privacy Policy for more details.',
    answerAr: 'نعم، جميع البيانات مشفرة ومحمية. راجع سياسة الخصوصية للمزيد.'
  }
];

export default function UserGuidePage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const filteredSections = guideSections.filter(section => {
    const title = isRTL ? section.titleAr : section.title;
    const description = isRTL ? section.descriptionAr : section.description;
    const searchLower = searchQuery.toLowerCase();
    
    if (title.toLowerCase().includes(searchLower) || description.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    return section.topics.some(topic => {
      const topicTitle = isRTL ? topic.titleAr : topic.title;
      const topicContent = isRTL ? topic.contentAr : topic.content;
      return topicTitle.toLowerCase().includes(searchLower) || topicContent.toLowerCase().includes(searchLower);
    });
  });

  const selectedSectionData = selectedSection 
    ? guideSections.find(s => s.id === selectedSection) 
    : null;

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Book className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isRTL ? 'دليل المستخدم' : 'User Guide'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL ? 'تعلم كيفية استخدام جميع ميزات التطبيق' : 'Learn how to use all features of the application'}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground rtl:left-auto rtl:right-3" />
        <Input
          placeholder={isRTL ? 'ابحث في الدليل...' : 'Search the guide...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 rtl:pl-4 rtl:pr-10"
        />
      </div>

      {/* Quick Start Banner */}
      {!selectedSection && !searchQuery && (
        <Card className="mb-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">
                  {isRTL ? 'ابدأ بسرعة' : 'Quick Start'}
                </h3>
                <p className="text-muted-foreground text-sm mb-3">
                  {isRTL 
                    ? 'أكمل هذه الخطوات لبدء استخدام التطبيق:'
                    : 'Complete these steps to get started:'}
                </p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { icon: <Settings className="h-4 w-4" />, text: isRTL ? 'إعداد الشركة' : 'Set up company' },
                    { icon: <Users className="h-4 w-4" />, text: isRTL ? 'إضافة العملاء' : 'Add customers' },
                    { icon: <Package className="h-4 w-4" />, text: isRTL ? 'إضافة الأصناف' : 'Add items' },
                    { icon: <ShoppingCart className="h-4 w-4" />, text: isRTL ? 'إنشاء أول فاتورة' : 'Create first invoice' }
                  ].map((step, index) => (
                    <div key={index} className="flex items-center gap-2 bg-background/50 rounded-lg px-3 py-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                        {index + 1}
                      </div>
                      <span className="text-sm">{step.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sections List */}
        <div className={`lg:col-span-1 ${selectedSection ? 'hidden lg:block' : ''}`}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                {isRTL ? 'الأقسام' : 'Sections'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="p-4 pt-0 space-y-2">
                  {filteredSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setSelectedSection(section.id)}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg text-left rtl:text-right transition-colors ${
                        selectedSection === section.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className={`mt-0.5 ${selectedSection === section.id ? 'text-primary-foreground' : 'text-primary'}`}>
                        {section.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">
                          {isRTL ? section.titleAr : section.title}
                        </div>
                        <div className={`text-sm truncate ${
                          selectedSection === section.id 
                            ? 'text-primary-foreground/80' 
                            : 'text-muted-foreground'
                        }`}>
                          {isRTL ? section.descriptionAr : section.description}
                        </div>
                      </div>
                      <ChevronRight className={`h-4 w-4 mt-1 ${isRTL ? 'rotate-180' : ''}`} />
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Content Area */}
        <div className={`lg:col-span-2 ${!selectedSection && !searchQuery ? 'hidden lg:block' : ''}`}>
          {selectedSectionData ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedSection(null)}
                    className="lg:hidden"
                  >
                    <ChevronRight className={`h-4 w-4 ${isRTL ? '' : 'rotate-180'}`} />
                    {isRTL ? 'رجوع' : 'Back'}
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {selectedSectionData.icon}
                  </div>
                  <div>
                    <CardTitle>
                      {isRTL ? selectedSectionData.titleAr : selectedSectionData.title}
                    </CardTitle>
                    <CardDescription>
                      {isRTL ? selectedSectionData.descriptionAr : selectedSectionData.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {selectedSectionData.topics.map((topic) => (
                    <AccordionItem key={topic.id} value={topic.id}>
                      <AccordionTrigger className="text-left rtl:text-right">
                        {isRTL ? topic.titleAr : topic.title}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <div className="whitespace-pre-line text-muted-foreground">
                            {isRTL ? topic.contentAr : topic.content}
                          </div>
                          
                          {((isRTL ? topic.tipsAr : topic.tips) || []).length > 0 && (
                            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-medium mb-2">
                                <Lightbulb className="h-4 w-4" />
                                {isRTL ? 'نصائح' : 'Tips'}
                              </div>
                              <ul className="space-y-1">
                                {(isRTL ? topic.tipsAr : topic.tips)?.map((tip, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300">
                                    <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    {tip}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  {isRTL ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqItems.map((item, index) => (
                    <AccordionItem key={index} value={`faq-${index}`}>
                      <AccordionTrigger className="text-left rtl:text-right">
                        {isRTL ? item.questionAr : item.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground">
                          {isRTL ? item.answerAr : item.answer}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Support Section */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left rtl:sm:text-right">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <HelpCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">
                  {isRTL ? 'هل تحتاج مساعدة إضافية؟' : 'Need more help?'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'تواصل مع فريق الدعم الفني' : 'Contact our support team'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <BookOpen className="h-4 w-4 me-2" />
                {isRTL ? 'الوثائق الكاملة' : 'Full Documentation'}
              </Button>
              <Button>
                {isRTL ? 'تواصل معنا' : 'Contact Us'}
                <ArrowRight className={`h-4 w-4 ms-2 ${isRTL ? 'rotate-180' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
