/**
 * Professional Contact Statement PDF Generator
 * Enterprise-grade PDF generation with Arabic support
 * Uses html2canvas for proper Arabic text rendering
 */

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

type Language = 'en' | 'ar' | string;

export interface ContactStatementPDFData {
  // Contact Details
  contact: {
    name: string;
    email?: string;
    phone?: string;
    type: string;
    address?: string;
    taxNumber?: string;
  };
  
  // Company Details (your company)
  company?: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    taxNumber?: string;
    logoUrl?: string;
  };
  
  // Statement Period
  startDate: string;
  endDate: string;
  
  // Balances
  openingBalance: number;
  closingBalance: number;
  totalDebits: number;
  totalCredits: number;
  
  // Entries
  entries: Array<{
    id: string;
    date: string;
    documentType: string;
    documentNumber: string;
    description: string;
    debit: number;
    credit: number;
    balance: number;
  }>;
  
  // Currency
  currency: string;
}

// Translation labels for PDF
const LABELS: Record<Language, Record<string, string>> = {
  en: {
    statementTitle: 'ACCOUNT STATEMENT',
    customerStatement: 'Customer Statement',
    supplierStatement: 'Supplier Statement',
    period: 'Period',
    from: 'From',
    to: 'To',
    date: 'Date',
    type: 'Type',
    documentNumber: 'Document #',
    description: 'Description',
    debit: 'Debit',
    credit: 'Credit',
    balance: 'Balance',
    openingBalance: 'Opening Balance',
    closingBalance: 'Closing Balance',
    totalDebits: 'Total Debits',
    totalCredits: 'Total Credits',
    balanceForward: 'Balance Brought Forward',
    invoice: 'Invoice',
    bill: 'Bill',
    payment: 'Payment',
    receipt: 'Receipt',
    creditNote: 'Credit Note',
    debitNote: 'Debit Note',
    opening: 'Opening Balance',
    customer: 'Customer',
    supplier: 'Supplier',
    contact: 'Contact',
    email: 'Email',
    phone: 'Phone',
    taxNumber: 'Tax ID',
    owes: 'Amount Owing',
    owed: 'Amount Owed',
    prepaid: 'Prepaid',
    noTransactions: 'No transactions in this period',
    generatedOn: 'Generated on',
    page: 'Page',
    of: 'of',
    summaryTitle: 'Summary',
    transactionsTitle: 'Transactions',
  },
  ar: {
    statementTitle: 'كشف حساب',
    customerStatement: 'كشف حساب العميل',
    supplierStatement: 'كشف حساب المورد',
    period: 'الفترة',
    from: 'من',
    to: 'إلى',
    date: 'التاريخ',
    type: 'النوع',
    documentNumber: 'رقم المستند',
    description: 'الوصف',
    debit: 'مدين',
    credit: 'دائن',
    balance: 'الرصيد',
    openingBalance: 'الرصيد الافتتاحي',
    closingBalance: 'الرصيد الختامي',
    totalDebits: 'إجمالي المدين',
    totalCredits: 'إجمالي الدائن',
    balanceForward: 'رصيد مرحل',
    invoice: 'فاتورة',
    bill: 'مشتريات',
    payment: 'دفعة',
    receipt: 'إيصال قبض',
    creditNote: 'إشعار دائن',
    debitNote: 'إشعار مدين',
    opening: 'رصيد افتتاحي',
    customer: 'عميل',
    supplier: 'مورد',
    contact: 'جهة الاتصال',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    taxNumber: 'الرقم الضريبي',
    owes: 'مدين لنا',
    owed: 'مستحق لهم',
    prepaid: 'مدفوع مقدماً',
    noTransactions: 'لا توجد حركات في هذه الفترة',
    generatedOn: 'تم الإنشاء في',
    page: 'صفحة',
    of: 'من',
    summaryTitle: 'ملخص',
    transactionsTitle: 'الحركات',
  }
};

function getLabels(lang: Language): Record<string, string> {
  return LABELS[lang] || LABELS.en;
}

/**
 * Format money value
 */
function formatMoney(amount: number, currency: string, language: string = 'en'): string {
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date
 */
function formatDate(dateStr: string, language: string = 'en'): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Get document type label
 */
function getDocumentTypeLabel(type: string, labels: Record<string, string>): string {
  const typeMap: Record<string, string> = {
    invoice: labels.invoice,
    bill: labels.bill,
    payment: labels.payment,
    receipt: labels.receipt,
    credit_note: labels.creditNote,
    debit_note: labels.debitNote,
    opening: labels.opening,
  };
  return typeMap[type] || type;
}

/**
 * Get balance status text
 */
function getBalanceStatus(balance: number, contactType: string, labels: Record<string, string>): string {
  if (balance === 0) return '';
  if (contactType === 'customer') {
    return balance > 0 ? labels.owes : labels.prepaid;
  } else {
    return balance > 0 ? labels.owed : labels.prepaid;
  }
}

/**
 * Create HTML template for statement
 */
function createStatementHTML(
  data: ContactStatementPDFData,
  labels: Record<string, string>,
  isRTL: boolean,
  language: string
): string {
  const direction = isRTL ? 'rtl' : 'ltr';
  const fontFamily = isRTL ? '"Cairo", "Noto Sans Arabic", Arial, sans-serif' : '"Inter", Arial, sans-serif';
  
  const title = data.contact.type === 'supplier' ? labels.supplierStatement : labels.customerStatement;
  const balanceStatus = getBalanceStatus(data.closingBalance, data.contact.type, labels);
  
  // Build entries rows
  let entriesHTML = '';
  
  // Opening balance row
  entriesHTML += `
    <tr class="opening-row">
      <td>${formatDate(data.startDate, language)}</td>
      <td>${labels.balanceForward}</td>
      <td>-</td>
      <td>${labels.openingBalance}</td>
      <td class="amount">${data.openingBalance >= 0 ? formatMoney(data.openingBalance, data.currency, language) : '-'}</td>
      <td class="amount">${data.openingBalance < 0 ? formatMoney(Math.abs(data.openingBalance), data.currency, language) : '-'}</td>
      <td class="amount balance">${formatMoney(data.openingBalance, data.currency, language)}</td>
    </tr>
  `;
  
  // Transaction entries
  if (data.entries.length === 0) {
    entriesHTML += `
      <tr>
        <td colspan="7" style="text-align: center; padding: 20px; color: #6b7280;">
          ${labels.noTransactions}
        </td>
      </tr>
    `;
  } else {
    data.entries.forEach((entry, index) => {
      const rowClass = index % 2 === 0 ? 'even' : 'odd';
      entriesHTML += `
        <tr class="${rowClass}">
          <td>${formatDate(entry.date, language)}</td>
          <td>${getDocumentTypeLabel(entry.documentType, labels)}</td>
          <td>${entry.documentNumber || '-'}</td>
          <td>${entry.description || '-'}</td>
          <td class="amount ${entry.debit > 0 ? 'debit' : ''}">${entry.debit > 0 ? formatMoney(entry.debit, data.currency, language) : '-'}</td>
          <td class="amount ${entry.credit > 0 ? 'credit' : ''}">${entry.credit > 0 ? formatMoney(entry.credit, data.currency, language) : '-'}</td>
          <td class="amount balance">${formatMoney(entry.balance, data.currency, language)}</td>
        </tr>
      `;
    });
  }
  
  // Totals row
  entriesHTML += `
    <tr class="totals-row">
      <td colspan="4" style="font-weight: 700;">${labels.closingBalance}</td>
      <td class="amount" style="font-weight: 700;">${formatMoney(data.totalDebits, data.currency, language)}</td>
      <td class="amount" style="font-weight: 700;">${formatMoney(data.totalCredits, data.currency, language)}</td>
      <td class="amount balance" style="font-weight: 700;">${formatMoney(data.closingBalance, data.currency, language)}</td>
    </tr>
  `;

  return `
    <!DOCTYPE html>
    <html lang="${language}" dir="${direction}">
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: ${fontFamily};
          font-size: 11px;
          line-height: 1.5;
          color: #1f2937;
          background: white;
          direction: ${direction};
          padding: 50px 40px 40px 40px;
        }
        .statement-container {
          max-width: 100%;
          margin: 0 auto;
          background: white;
          padding: 10px;
        }
        
        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 3px solid #059669;
        }
        .company-info {
          flex: 1;
        }
        .company-name {
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 5px;
        }
        .company-details {
          color: #6b7280;
          font-size: 10px;
        }
        .company-details div {
          margin-bottom: 2px;
        }
        .statement-title-box {
          text-align: ${isRTL ? 'left' : 'right'};
        }
        .statement-title {
          font-size: 22px;
          font-weight: 700;
          color: #059669;
          margin-bottom: 8px;
        }
        .period-info {
          font-size: 11px;
          color: #6b7280;
        }
        .period-dates {
          font-weight: 600;
          color: #1f2937;
        }
        
        /* Contact Info */
        .contact-section {
          background: #f3f4f6;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
        }
        .contact-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .contact-name {
          font-size: 16px;
          font-weight: 700;
          color: #1f2937;
        }
        .contact-type {
          background: #059669;
          color: white;
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 600;
        }
        .contact-details {
          display: flex;
          gap: 20px;
          font-size: 10px;
          color: #6b7280;
        }
        .contact-details span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        /* Summary Cards */
        .summary-section {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 25px;
        }
        .summary-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 12px;
          text-align: center;
        }
        .summary-card.highlight {
          background: #ecfdf5;
          border-color: #059669;
        }
        .summary-card.negative {
          background: #fef2f2;
          border-color: #ef4444;
        }
        .summary-label {
          font-size: 10px;
          color: #6b7280;
          margin-bottom: 4px;
        }
        .summary-value {
          font-size: 14px;
          font-weight: 700;
          color: #1f2937;
        }
        .summary-card.highlight .summary-value {
          color: #059669;
        }
        .summary-card.negative .summary-value {
          color: #ef4444;
        }
        .balance-status {
          font-size: 9px;
          color: #6b7280;
          margin-top: 2px;
        }
        
        /* Table */
        .table-section {
          margin-bottom: 20px;
        }
        .section-title {
          font-size: 13px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 10px;
          padding-bottom: 5px;
          border-bottom: 2px solid #059669;
        }
        .entries-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10px;
        }
        .entries-table thead {
          background: #059669;
          color: white;
        }
        .entries-table th {
          padding: 10px 8px;
          text-align: ${isRTL ? 'right' : 'left'};
          font-weight: 600;
          font-size: 10px;
          white-space: nowrap;
        }
        .entries-table th.amount {
          text-align: ${isRTL ? 'left' : 'right'};
        }
        .entries-table td {
          padding: 8px;
          border-bottom: 1px solid #e5e7eb;
          text-align: ${isRTL ? 'right' : 'left'};
        }
        .entries-table td.amount {
          text-align: ${isRTL ? 'left' : 'right'};
          font-family: 'Inter', monospace;
          white-space: nowrap;
        }
        .entries-table tr.odd {
          background: #f9fafb;
        }
        .entries-table tr.even {
          background: white;
        }
        .entries-table tr.opening-row {
          background: #f0fdf4;
          font-weight: 500;
        }
        .entries-table tr.totals-row {
          background: #059669;
          color: white;
        }
        .entries-table tr.totals-row td {
          border-bottom: none;
        }
        .debit {
          color: #dc2626;
        }
        .credit {
          color: #059669;
        }
        .balance {
          font-weight: 600;
        }
        
        /* Footer */
        .footer {
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #9ca3af;
          font-size: 9px;
        }
        
        /* Print styles */
        @media print {
          body {
            padding: 15px;
          }
          .entries-table {
            font-size: 9px;
          }
          .entries-table th,
          .entries-table td {
            padding: 6px 4px;
          }
        }
      </style>
    </head>
    <body>
      <div class="statement-container">
        <!-- Header -->
        <div class="header">
          <div class="company-info">
            ${data.company ? `
              <div class="company-name">${data.company.name}</div>
              <div class="company-details">
                ${data.company.address ? `<div>${data.company.address}</div>` : ''}
                ${data.company.phone ? `<div>${labels.phone}: ${data.company.phone}</div>` : ''}
                ${data.company.email ? `<div>${labels.email}: ${data.company.email}</div>` : ''}
                ${data.company.taxNumber ? `<div>${labels.taxNumber}: ${data.company.taxNumber}</div>` : ''}
              </div>
            ` : ''}
          </div>
          <div class="statement-title-box">
            <div class="statement-title">${title}</div>
            <div class="period-info">
              ${labels.period}: <span class="period-dates">${formatDate(data.startDate, language)} - ${formatDate(data.endDate, language)}</span>
            </div>
          </div>
        </div>
        
        <!-- Contact Info -->
        <div class="contact-section">
          <div class="contact-header">
            <div class="contact-name">${data.contact.name}</div>
            <div class="contact-type">${data.contact.type === 'supplier' ? labels.supplier : labels.customer}</div>
          </div>
          <div class="contact-details">
            ${data.contact.email ? `<span>✉ ${data.contact.email}</span>` : ''}
            ${data.contact.phone ? `<span>📞 ${data.contact.phone}</span>` : ''}
            ${data.contact.taxNumber ? `<span>${labels.taxNumber}: ${data.contact.taxNumber}</span>` : ''}
          </div>
        </div>
        
        <!-- Summary Cards -->
        <div class="summary-section">
          <div class="summary-card">
            <div class="summary-label">${labels.openingBalance}</div>
            <div class="summary-value">${formatMoney(data.openingBalance, data.currency, language)}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">${labels.totalDebits}</div>
            <div class="summary-value" style="color: #dc2626;">${formatMoney(data.totalDebits, data.currency, language)}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">${labels.totalCredits}</div>
            <div class="summary-value" style="color: #059669;">${formatMoney(data.totalCredits, data.currency, language)}</div>
          </div>
          <div class="summary-card ${data.closingBalance > 0 ? 'highlight' : data.closingBalance < 0 ? 'negative' : ''}">
            <div class="summary-label">${labels.closingBalance}</div>
            <div class="summary-value">${formatMoney(Math.abs(data.closingBalance), data.currency, language)}</div>
            ${balanceStatus ? `<div class="balance-status">${balanceStatus}</div>` : ''}
          </div>
        </div>
        
        <!-- Transactions Table -->
        <div class="table-section">
          <div class="section-title">${labels.transactionsTitle} (${data.entries.length} ${language === 'ar' ? 'حركة' : 'entries'})</div>
          <table class="entries-table">
            <thead>
              <tr>
                <th>${labels.date}</th>
                <th>${labels.type}</th>
                <th>${labels.documentNumber}</th>
                <th>${labels.description}</th>
                <th class="amount">${labels.debit}</th>
                <th class="amount">${labels.credit}</th>
                <th class="amount">${labels.balance}</th>
              </tr>
            </thead>
            <tbody>
              ${entriesHTML}
            </tbody>
          </table>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          ${labels.generatedOn}: ${new Date().toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate PDF from Contact Statement data
 */
export async function generateContactStatementPDF(
  data: ContactStatementPDFData,
  language: Language = 'en'
): Promise<Blob> {
  const isRTL = language === 'ar';
  const labels = getLabels(language);
  
  // Create HTML content
  const htmlContent = createStatementHTML(data, labels, isRTL, language);
  
  // Create a hidden container for rendering
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: 210mm;
    min-height: 297mm;
    background: white;
    z-index: -1;
  `;
  container.innerHTML = htmlContent;
  document.body.appendChild(container);
  
  // Wait for fonts and styles to load
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    // Render to canvas using html2canvas
    const canvas = await html2canvas(container.querySelector('.statement-container') || container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: container.offsetWidth,
      windowWidth: container.offsetWidth,
    });
    
    // Calculate PDF dimensions (A4) with margins
    const marginX = 10; // horizontal margin in mm
    const marginY = 15; // vertical margin in mm
    const imgWidth = 210 - (marginX * 2); // A4 width minus margins
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: imgHeight > pageHeight ? 'portrait' : 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    // Handle multi-page if needed
    let heightLeft = imgHeight;
    let position = marginY;
    let page = 1;
    
    // Add first page
    pdf.addImage(
      canvas.toDataURL('image/png'),
      'PNG',
      marginX,
      position,
      imgWidth,
      imgHeight
    );
    heightLeft -= (pageHeight - marginY * 2);
    
    // Add additional pages if needed
    while (heightLeft > 0) {
      position = marginY - (pageHeight - marginY * 2) * page;
      pdf.addPage();
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        marginX,
        position,
        imgWidth,
        imgHeight
      );
      heightLeft -= (pageHeight - marginY * 2);
      page++;
    }
    
    // Generate blob
    return pdf.output('blob');
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
}

/**
 * Download Contact Statement PDF
 */
export async function downloadContactStatementPDF(
  data: ContactStatementPDFData,
  language: Language = 'en',
  filename?: string
): Promise<void> {
  const blob = await generateContactStatementPDF(data, language);
  
  const defaultFilename = `statement-${data.contact.name.replace(/\s+/g, '-')}-${data.startDate.split('T')[0]}.pdf`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || defaultFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
