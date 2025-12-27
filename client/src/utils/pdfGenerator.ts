/**
 * PDF Generator Utility
 * Generates professional PDF documents for invoices, reports, and statements
 */

import { formatCurrency, formatDate } from './formatters';

// PDF Page sizes
export const PAGE_SIZES = {
  A4: { width: 595.28, height: 841.89 },
  A5: { width: 419.53, height: 595.28 },
  LETTER: { width: 612, height: 792 },
} as const;

type PageSize = { width: number; height: number };

// PDF Colors
export const PDF_COLORS = {
  primary: '#2563eb',
  secondary: '#64748b',
  success: '#16a34a',
  warning: '#ea580c',
  danger: '#dc2626',
  dark: '#1e293b',
  light: '#f8fafc',
  border: '#e2e8f0',
};

// Arabic font support
const ARABIC_FONTS = {
  regular: 'Cairo-Regular',
  bold: 'Cairo-Bold',
  light: 'Cairo-Light',
};

interface CompanyInfo {
  name: string;
  nameEn?: string;
  taxNumber?: string;
  registrationNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  taxRate?: number;
  total: number;
}

interface InvoiceData {
  number: string;
  date: string;
  dueDate?: string;
  type: 'invoice' | 'credit_note' | 'debit_note' | 'quote' | 'receipt';
  status?: string;
  customer: {
    name: string;
    taxNumber?: string;
    address?: string;
    email?: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount?: number;
  total: number;
  amountPaid?: number;
  amountDue?: number;
  notes?: string;
  terms?: string;
  qrCode?: string;
  currency: string;
  language: 'ar' | 'en';
}

interface ReportData {
  title: string;
  subtitle?: string;
  date: string;
  period?: { from: string; to: string };
  data: any[];
  columns: { key: string; label: string; labelAr: string; type?: 'number' | 'date' | 'currency' }[];
  summary?: { label: string; labelAr: string; value: number | string }[];
  currency?: string;
  language: 'ar' | 'en';
}

interface StatementData {
  title: string;
  contact: {
    name: string;
    address?: string;
  };
  asOfDate: string;
  openingBalance: number;
  transactions: {
    date: string;
    reference: string;
    description: string;
    debit: number;
    credit: number;
    balance: number;
  }[];
  closingBalance: number;
  currency: string;
  language: 'ar' | 'en';
}

/**
 * PDFDocument class for generating PDF documents
 */
export class PDFGenerator {
  private content: string[] = [];
  private pageSize: PageSize = PAGE_SIZES.A4;
  private margin = 50;
  private currentY = 0;
  private language: 'ar' | 'en' = 'ar';

  constructor(options?: { pageSize?: keyof typeof PAGE_SIZES; language?: 'ar' | 'en' }) {
    if (options?.pageSize) {
      this.pageSize = { ...PAGE_SIZES[options.pageSize] };
    }
    if (options?.language) {
      this.language = options.language;
    }
    this.currentY = this.pageSize.height - this.margin;
  }

  private getText(ar: string, en: string): string {
    return this.language === 'ar' ? ar : en;
  }

  private isRTL(): boolean {
    return this.language === 'ar';
  }

  /**
   * Generate Invoice PDF
   */
  static async generateInvoice(company: CompanyInfo, invoice: InvoiceData): Promise<Blob> {
    const doc = new PDFGenerator({ language: invoice.language });
    
    // Use jsPDF or similar library in actual implementation
    // This is a structure/template for the PDF content
    
    const pdfContent = {
      // Header
      header: {
        logo: company.logoUrl,
        companyName: invoice.language === 'ar' ? company.name : (company.nameEn || company.name),
        taxNumber: company.taxNumber,
        address: `${company.address || ''} ${company.city || ''} ${company.country || ''}`,
        contact: `${company.phone || ''} | ${company.email || ''}`,
      },
      
      // Invoice info
      invoiceInfo: {
        title: doc.getInvoiceTitle(invoice.type, invoice.language),
        number: invoice.number,
        date: invoice.date,
        dueDate: invoice.dueDate,
        status: invoice.status,
      },
      
      // Customer info
      customer: {
        title: invoice.language === 'ar' ? 'فاتورة إلى' : 'Bill To',
        name: invoice.customer.name,
        taxNumber: invoice.customer.taxNumber,
        address: invoice.customer.address,
      },
      
      // Items table
      itemsTable: {
        headers: invoice.language === 'ar' 
          ? ['#', 'الوصف', 'الكمية', 'السعر', 'الخصم', 'الضريبة', 'الإجمالي']
          : ['#', 'Description', 'Qty', 'Price', 'Discount', 'Tax', 'Total'],
        rows: invoice.items.map((item, index) => [
          (index + 1).toString(),
          item.description,
          item.quantity.toString(),
          formatCurrency(item.unitPrice, invoice.currency),
          item.discount ? formatCurrency(item.discount, invoice.currency) : '-',
          item.taxRate ? `${item.taxRate}%` : '-',
          formatCurrency(item.total, invoice.currency),
        ]),
      },
      
      // Totals
      totals: [
        {
          label: invoice.language === 'ar' ? 'المجموع الفرعي' : 'Subtotal',
          value: formatCurrency(invoice.subtotal, invoice.currency),
        },
        ...(invoice.discountAmount ? [{
          label: invoice.language === 'ar' ? 'الخصم' : 'Discount',
          value: `-${formatCurrency(invoice.discountAmount, invoice.currency)}`,
        }] : []),
        {
          label: invoice.language === 'ar' ? 'ضريبة القيمة المضافة' : 'VAT',
          value: formatCurrency(invoice.taxAmount, invoice.currency),
        },
        {
          label: invoice.language === 'ar' ? 'الإجمالي' : 'Total',
          value: formatCurrency(invoice.total, invoice.currency),
          highlight: true,
        },
        ...(invoice.amountPaid !== undefined ? [{
          label: invoice.language === 'ar' ? 'المبلغ المدفوع' : 'Amount Paid',
          value: formatCurrency(invoice.amountPaid, invoice.currency),
        }] : []),
        ...(invoice.amountDue !== undefined ? [{
          label: invoice.language === 'ar' ? 'المبلغ المستحق' : 'Amount Due',
          value: formatCurrency(invoice.amountDue, invoice.currency),
          highlight: true,
        }] : []),
      ],
      
      // Footer
      footer: {
        notes: invoice.notes,
        terms: invoice.terms,
        qrCode: invoice.qrCode,
        bankDetails: invoice.language === 'ar' 
          ? 'معلومات البنك: سيتم إضافتها'
          : 'Bank Details: To be added',
      },
    };

    // In actual implementation, use jsPDF or pdfmake to generate PDF
    // For now, return a mock blob
    const jsonString = JSON.stringify(pdfContent, null, 2);
    return new Blob([jsonString], { type: 'application/json' });
  }

  private getInvoiceTitle(type: string, language: 'ar' | 'en'): string {
    const titles: Record<string, { ar: string; en: string }> = {
      invoice: { ar: 'فاتورة ضريبية', en: 'Tax Invoice' },
      credit_note: { ar: 'إشعار دائن', en: 'Credit Note' },
      debit_note: { ar: 'إشعار مدين', en: 'Debit Note' },
      quote: { ar: 'عرض سعر', en: 'Quotation' },
      receipt: { ar: 'إيصال', en: 'Receipt' },
    };
    return titles[type]?.[language] || titles.invoice[language];
  }

  /**
   * Generate Financial Report PDF
   */
  static async generateReport(company: CompanyInfo, report: ReportData): Promise<Blob> {
    const pdfContent = {
      // Header
      header: {
        companyName: report.language === 'ar' ? company.name : (company.nameEn || company.name),
        reportTitle: report.title,
        subtitle: report.subtitle,
        generatedDate: report.date,
        period: report.period,
      },
      
      // Data table
      table: {
        headers: report.columns.map(col => 
          report.language === 'ar' ? col.labelAr : col.label
        ),
        rows: report.data.map(row => 
          report.columns.map(col => {
            const value = row[col.key];
            if (col.type === 'currency') {
              return formatCurrency(value, report.currency || 'SAR');
            }
            if (col.type === 'date') {
              return formatDate(value, report.language);
            }
            return value?.toString() || '';
          })
        ),
      },
      
      // Summary section
      summary: report.summary?.map(item => ({
        label: report.language === 'ar' ? item.labelAr : item.label,
        value: typeof item.value === 'number' 
          ? formatCurrency(item.value, report.currency || 'SAR')
          : item.value,
      })),
      
      // Footer
      footer: {
        generatedBy: report.language === 'ar' 
          ? 'تم إنشاء هذا التقرير بواسطة نظام Log & Ledger'
          : 'This report was generated by Log & Ledger System',
        timestamp: new Date().toISOString(),
      },
    };

    const jsonString = JSON.stringify(pdfContent, null, 2);
    return new Blob([jsonString], { type: 'application/json' });
  }

  /**
   * Generate Account Statement PDF
   */
  static async generateStatement(company: CompanyInfo, statement: StatementData): Promise<Blob> {
    const labels = {
      date: { ar: 'التاريخ', en: 'Date' },
      reference: { ar: 'المرجع', en: 'Reference' },
      description: { ar: 'الوصف', en: 'Description' },
      debit: { ar: 'مدين', en: 'Debit' },
      credit: { ar: 'دائن', en: 'Credit' },
      balance: { ar: 'الرصيد', en: 'Balance' },
      openingBalance: { ar: 'الرصيد الافتتاحي', en: 'Opening Balance' },
      closingBalance: { ar: 'الرصيد الختامي', en: 'Closing Balance' },
    };

    const getText = (key: keyof typeof labels) => 
      statement.language === 'ar' ? labels[key].ar : labels[key].en;

    const pdfContent = {
      header: {
        companyName: statement.language === 'ar' ? company.name : (company.nameEn || company.name),
        title: statement.title,
        asOfDate: statement.asOfDate,
      },
      
      contact: {
        name: statement.contact.name,
        address: statement.contact.address,
      },
      
      openingBalance: {
        label: getText('openingBalance'),
        value: formatCurrency(statement.openingBalance, statement.currency),
      },
      
      transactions: {
        headers: [
          getText('date'),
          getText('reference'),
          getText('description'),
          getText('debit'),
          getText('credit'),
          getText('balance'),
        ],
        rows: statement.transactions.map(tx => [
          tx.date,
          tx.reference,
          tx.description,
          tx.debit ? formatCurrency(tx.debit, statement.currency) : '-',
          tx.credit ? formatCurrency(tx.credit, statement.currency) : '-',
          formatCurrency(tx.balance, statement.currency),
        ]),
      },
      
      closingBalance: {
        label: getText('closingBalance'),
        value: formatCurrency(statement.closingBalance, statement.currency),
      },
    };

    const jsonString = JSON.stringify(pdfContent, null, 2);
    return new Blob([jsonString], { type: 'application/json' });
  }

  /**
   * Generate Profit & Loss Report PDF
   */
  static async generateProfitLoss(
    company: CompanyInfo,
    data: {
      period: { from: string; to: string };
      revenue: { account: string; amount: number }[];
      expenses: { account: string; amount: number }[];
      totalRevenue: number;
      totalExpenses: number;
      netIncome: number;
      language: 'ar' | 'en';
      currency: string;
    }
  ): Promise<Blob> {
    const labels = {
      title: { ar: 'قائمة الأرباح والخسائر', en: 'Profit & Loss Statement' },
      revenue: { ar: 'الإيرادات', en: 'Revenue' },
      expenses: { ar: 'المصروفات', en: 'Expenses' },
      totalRevenue: { ar: 'إجمالي الإيرادات', en: 'Total Revenue' },
      totalExpenses: { ar: 'إجمالي المصروفات', en: 'Total Expenses' },
      netIncome: { ar: 'صافي الدخل', en: 'Net Income' },
      netLoss: { ar: 'صافي الخسارة', en: 'Net Loss' },
    };

    const getText = (key: keyof typeof labels) => 
      data.language === 'ar' ? labels[key].ar : labels[key].en;

    const pdfContent = {
      header: {
        companyName: data.language === 'ar' ? company.name : (company.nameEn || company.name),
        title: getText('title'),
        period: `${data.period.from} - ${data.period.to}`,
      },
      
      sections: [
        {
          title: getText('revenue'),
          items: data.revenue.map(r => ({
            account: r.account,
            amount: formatCurrency(r.amount, data.currency),
          })),
          total: {
            label: getText('totalRevenue'),
            value: formatCurrency(data.totalRevenue, data.currency),
          },
        },
        {
          title: getText('expenses'),
          items: data.expenses.map(e => ({
            account: e.account,
            amount: formatCurrency(e.amount, data.currency),
          })),
          total: {
            label: getText('totalExpenses'),
            value: formatCurrency(data.totalExpenses, data.currency),
          },
        },
      ],
      
      netResult: {
        label: data.netIncome >= 0 ? getText('netIncome') : getText('netLoss'),
        value: formatCurrency(Math.abs(data.netIncome), data.currency),
        isProfit: data.netIncome >= 0,
      },
    };

    const jsonString = JSON.stringify(pdfContent, null, 2);
    return new Blob([jsonString], { type: 'application/json' });
  }

  /**
   * Generate Balance Sheet PDF
   */
  static async generateBalanceSheet(
    company: CompanyInfo,
    data: {
      asOfDate: string;
      assets: { current: { account: string; amount: number }[]; nonCurrent: { account: string; amount: number }[] };
      liabilities: { current: { account: string; amount: number }[]; nonCurrent: { account: string; amount: number }[] };
      equity: { account: string; amount: number }[];
      totals: {
        currentAssets: number;
        nonCurrentAssets: number;
        totalAssets: number;
        currentLiabilities: number;
        nonCurrentLiabilities: number;
        totalLiabilities: number;
        totalEquity: number;
        totalLiabilitiesAndEquity: number;
      };
      language: 'ar' | 'en';
      currency: string;
    }
  ): Promise<Blob> {
    const labels = {
      title: { ar: 'قائمة المركز المالي', en: 'Balance Sheet' },
      assets: { ar: 'الأصول', en: 'Assets' },
      currentAssets: { ar: 'الأصول المتداولة', en: 'Current Assets' },
      nonCurrentAssets: { ar: 'الأصول غير المتداولة', en: 'Non-Current Assets' },
      totalAssets: { ar: 'إجمالي الأصول', en: 'Total Assets' },
      liabilities: { ar: 'الالتزامات', en: 'Liabilities' },
      currentLiabilities: { ar: 'الالتزامات المتداولة', en: 'Current Liabilities' },
      nonCurrentLiabilities: { ar: 'الالتزامات غير المتداولة', en: 'Non-Current Liabilities' },
      totalLiabilities: { ar: 'إجمالي الالتزامات', en: 'Total Liabilities' },
      equity: { ar: 'حقوق الملكية', en: 'Equity' },
      totalEquity: { ar: 'إجمالي حقوق الملكية', en: 'Total Equity' },
      totalLiabilitiesAndEquity: { ar: 'إجمالي الالتزامات وحقوق الملكية', en: 'Total Liabilities & Equity' },
    };

    const getText = (key: keyof typeof labels) => 
      data.language === 'ar' ? labels[key].ar : labels[key].en;

    const fmt = (amount: number) => formatCurrency(amount, data.currency);

    const pdfContent = {
      header: {
        companyName: data.language === 'ar' ? company.name : (company.nameEn || company.name),
        title: getText('title'),
        asOfDate: data.asOfDate,
      },
      
      assets: {
        title: getText('assets'),
        sections: [
          {
            title: getText('currentAssets'),
            items: data.assets.current.map(a => ({ account: a.account, amount: fmt(a.amount) })),
            total: fmt(data.totals.currentAssets),
          },
          {
            title: getText('nonCurrentAssets'),
            items: data.assets.nonCurrent.map(a => ({ account: a.account, amount: fmt(a.amount) })),
            total: fmt(data.totals.nonCurrentAssets),
          },
        ],
        grandTotal: {
          label: getText('totalAssets'),
          value: fmt(data.totals.totalAssets),
        },
      },
      
      liabilitiesAndEquity: {
        liabilities: {
          title: getText('liabilities'),
          sections: [
            {
              title: getText('currentLiabilities'),
              items: data.liabilities.current.map(l => ({ account: l.account, amount: fmt(l.amount) })),
              total: fmt(data.totals.currentLiabilities),
            },
            {
              title: getText('nonCurrentLiabilities'),
              items: data.liabilities.nonCurrent.map(l => ({ account: l.account, amount: fmt(l.amount) })),
              total: fmt(data.totals.nonCurrentLiabilities),
            },
          ],
          grandTotal: {
            label: getText('totalLiabilities'),
            value: fmt(data.totals.totalLiabilities),
          },
        },
        equity: {
          title: getText('equity'),
          items: data.equity.map(e => ({ account: e.account, amount: fmt(e.amount) })),
          total: {
            label: getText('totalEquity'),
            value: fmt(data.totals.totalEquity),
          },
        },
        grandTotal: {
          label: getText('totalLiabilitiesAndEquity'),
          value: fmt(data.totals.totalLiabilitiesAndEquity),
        },
      },
    };

    const jsonString = JSON.stringify(pdfContent, null, 2);
    return new Blob([jsonString], { type: 'application/json' });
  }

  /**
   * Download PDF in browser
   */
  static downloadPDF(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Print PDF in browser
   */
  static printPDF(blob: Blob): void {
    const url = URL.createObjectURL(blob);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
        URL.revokeObjectURL(url);
      }, 1000);
    };
  }
}

export default PDFGenerator;
