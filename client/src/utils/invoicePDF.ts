/**
 * Professional Invoice PDF Generator
 * Enterprise-grade PDF generation with multi-language support including Arabic
 * Uses html2canvas for proper Arabic text rendering
 */

type Language = 'en' | 'ar' | string;

export interface InvoicePDFData {
  // Invoice Details
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status?: string;
  poNumber?: string;
  reference?: string;
  
  // Company Details
  company: {
    name: string;
    legalName?: string;
    taxNumber?: string;
    registrationNumber?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
    phone?: string;
    email?: string;
    website?: string;
    logoUrl?: string;
  };
  
  // Customer Details
  customer: {
    name: string;
    email?: string;
    phone?: string;
    taxNumber?: string;
    billingAddress?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
    shippingAddress?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
  };
  
  // Line Items
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    taxRate: number;
    amount: number;
    itemCode?: string;
  }>;
  
  // Totals
  subtotal: number;
  discountTotal?: number;
  taxTotal: number;
  shippingFee?: number;
  handlingFee?: number;
  total: number;
  paidAmount?: number;
  outstanding?: number;
  
  // Currency
  currency: string;
  
  // Base currency conversion (for multi-currency invoices)
  baseCurrency?: string;
  fxRate?: number;
  totalInBaseCurrency?: number;
  
  // Additional
  notes?: string;
  termsAndConditions?: string;
  paymentInstructions?: string;
  bankDetails?: {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    iban?: string;
    swift?: string;
    routingNumber?: string;
  };
}

// Translation labels for PDF
const LABELS: Record<Language, Record<string, string>> = {
  en: {
    invoice: 'INVOICE',
    taxInvoice: 'TAX INVOICE',
    proforma: 'PROFORMA INVOICE',
    invoiceNumber: 'Invoice #',
    date: 'Date',
    dueDate: 'Due Date',
    poNumber: 'PO #',
    reference: 'Reference',
    billTo: 'Bill To',
    shipTo: 'Ship To',
    from: 'From',
    description: 'Description',
    itemCode: 'Item Code',
    quantity: 'Qty',
    unitPrice: 'Unit Price',
    discount: 'Discount',
    tax: 'Tax',
    amount: 'Amount',
    subtotal: 'Subtotal',
    discountTotal: 'Discount',
    taxTotal: 'Tax',
    shipping: 'Shipping',
    handling: 'Handling',
    total: 'Total',
    paid: 'Paid',
    balanceDue: 'Balance Due',
    amountDue: 'Amount Due',
    notes: 'Notes',
    termsAndConditions: 'Terms and Conditions',
    paymentInstructions: 'Payment Instructions',
    bankDetails: 'Bank Details',
    bankName: 'Bank',
    accountName: 'Account Name',
    accountNumber: 'Account Number',
    iban: 'IBAN',
    swift: 'SWIFT/BIC',
    taxNumber: 'Tax ID',
    regNumber: 'Reg. No.',
    thankYou: 'Thank you for your business!',
    page: 'Page',
    of: 'of',
    draft: 'DRAFT',
    paid_status: 'PAID',
    overdue: 'OVERDUE',
    generatedOn: 'Generated on',
    equivalentAmount: 'Equivalent in',
    exchangeRate: 'Exchange Rate',
  },
  ar: {
    invoice: 'فاتورة',
    taxInvoice: 'فاتورة ضريبية',
    proforma: 'فاتورة مبدئية',
    invoiceNumber: 'رقم الفاتورة',
    date: 'التاريخ',
    dueDate: 'تاريخ الاستحقاق',
    poNumber: 'رقم أمر الشراء',
    reference: 'المرجع',
    billTo: 'فاتورة إلى',
    shipTo: 'شحن إلى',
    from: 'من',
    description: 'الوصف',
    itemCode: 'رمز الصنف',
    quantity: 'الكمية',
    unitPrice: 'سعر الوحدة',
    discount: 'خصم',
    tax: 'الضريبة',
    amount: 'المبلغ',
    subtotal: 'المجموع الفرعي',
    discountTotal: 'إجمالي الخصم',
    taxTotal: 'إجمالي الضريبة',
    shipping: 'الشحن',
    handling: 'المناولة',
    total: 'الإجمالي',
    paid: 'المدفوع',
    balanceDue: 'الرصيد المستحق',
    amountDue: 'المبلغ المستحق',
    notes: 'ملاحظات',
    termsAndConditions: 'الشروط والأحكام',
    paymentInstructions: 'تعليمات الدفع',
    bankDetails: 'التفاصيل المصرفية',
    bankName: 'البنك',
    accountName: 'اسم الحساب',
    accountNumber: 'رقم الحساب',
    iban: 'رقم الآيبان',
    swift: 'رمز السويفت',
    taxNumber: 'الرقم الضريبي',
    regNumber: 'رقم السجل',
    thankYou: 'شكراً لتعاملكم معنا!',
    page: 'صفحة',
    of: 'من',
    draft: 'مسودة',
    paid_status: 'مدفوعة',
    overdue: 'متأخرة',
    generatedOn: 'تم الإنشاء في',
    equivalentAmount: 'المقابل بـ',
    exchangeRate: 'سعر الصرف',
  }
};

function getLabels(lang: Language): Record<string, string> {
  return LABELS[lang] || LABELS.en;
}

function formatAddress(address?: {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}): string[] {
  if (!address) return [];
  const lines: string[] = [];
  if (address.line1) lines.push(address.line1);
  if (address.line2) lines.push(address.line2);
  const cityLine = [address.city, address.state, address.postalCode].filter(Boolean).join(', ');
  if (cityLine) lines.push(cityLine);
  if (address.country) lines.push(address.country);
  return lines;
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
 * Create HTML template for invoice
 */
function createInvoiceHTML(
  data: InvoicePDFData,
  labels: Record<string, string>,
  isRTL: boolean,
  language: string
): string {
  const hasDiscount = data.items.some(item => (item.discount || 0) > 0);
  const hasItemCode = data.items.some(item => item.itemCode);
  
  const direction = isRTL ? 'rtl' : 'ltr';
  const textAlign = isRTL ? 'right' : 'left';
  const fontFamily = isRTL ? '"Cairo", "Noto Sans Arabic", Arial, sans-serif' : '"Inter", Arial, sans-serif';
  
  // Status badge colors
  const getStatusStyle = (status?: string) => {
    switch (status) {
      case 'paid': return 'background: #10b981; color: white;';
      case 'sent': return 'background: #3b82f6; color: white;';
      case 'draft': return 'background: #6b7280; color: white;';
      case 'overdue': return 'background: #ef4444; color: white;';
      default: return 'background: #9ca3af; color: white;';
    }
  };
  
  const statusLabel = data.status === 'paid' ? labels.paid_status : 
                      data.status === 'draft' ? labels.draft :
                      data.status === 'overdue' ? labels.overdue : data.status;
  
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
          line-height: 1.6;
          color: #1f2937;
          background: white;
          direction: ${direction};
          padding: 40px;
        }
        .invoice-container {
          max-width: 100%;
          margin: 0 auto;
          background: white;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 2px solid #2563eb;
        }
        .company-info {
          flex: 1;
        }
        .company-name {
          font-size: 22px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 6px;
        }
        .company-details {
          color: #6b7280;
          font-size: 10px;
        }
        .company-details div {
          margin-bottom: 2px;
        }
        .invoice-info {
          text-align: ${isRTL ? 'left' : 'right'};
        }
        .invoice-title {
          font-size: 24px;
          font-weight: 700;
          color: #2563eb;
          margin-bottom: 8px;
        }
        .invoice-meta {
          font-size: 10px;
        }
        .invoice-meta-row {
          display: flex;
          justify-content: ${isRTL ? 'flex-start' : 'flex-end'};
          gap: 8px;
          margin-bottom: 3px;
        }
        .meta-label {
          color: #6b7280;
        }
        .meta-value {
          font-weight: 600;
          color: #1f2937;
          min-width: 100px;
        }
        .status-badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
          ${getStatusStyle(data.status)}
          margin-top: 6px;
        }
        .customer-section {
          display: flex;
          gap: 30px;
          margin-bottom: 25px;
        }
        .customer-box {
          flex: 1;
        }
        .section-title {
          font-size: 11px;
          font-weight: 600;
          color: #2563eb;
          margin-bottom: 6px;
          padding-bottom: 4px;
          border-bottom: 1px solid #e5e7eb;
        }
        .customer-name {
          font-size: 13px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 3px;
        }
        .customer-details {
          color: #6b7280;
          font-size: 10px;
        }
        .customer-details div {
          margin-bottom: 2px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          font-size: 10px;
        }
        .items-table thead {
          background: #2563eb;
          color: white;
        }
        .items-table th {
          padding: 10px 8px;
          text-align: ${textAlign};
          font-size: 10px;
          font-weight: 600;
          white-space: nowrap;
        }
        .items-table th.text-center {
          text-align: center;
        }
        .items-table th.text-right {
          text-align: ${isRTL ? 'left' : 'right'};
        }
        .items-table td {
          padding: 10px 8px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 10px;
          vertical-align: middle;
        }
        .items-table td.text-center {
          text-align: center;
        }
        .items-table td.text-right {
          text-align: ${isRTL ? 'left' : 'right'};
        }
        .items-table tbody tr:nth-child(even) {
          background: #f9fafb;
        }
        .items-table .amount-col {
          text-align: ${isRTL ? 'left' : 'right'};
          font-weight: 600;
          white-space: nowrap;
        }
        .totals-section {
          display: flex;
          justify-content: ${isRTL ? 'flex-start' : 'flex-end'};
          margin-bottom: 25px;
        }
        .totals-box {
          width: 250px;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          border-bottom: 1px solid #e5e7eb;
          font-size: 10px;
        }
        .totals-row.total {
          background: #2563eb;
          color: white;
          margin: 6px -10px 0;
          padding: 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 700;
        }
        .totals-label {
          color: #6b7280;
        }
        .totals-row.total .totals-label {
          color: white;
        }
        .totals-value {
          font-weight: 600;
          white-space: nowrap;
        }
        .notes-section {
          margin-bottom: 15px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 4px;
          border-${isRTL ? 'right' : 'left'}: 3px solid #2563eb;
        }
        .notes-title {
          font-weight: 600;
          color: #2563eb;
          margin-bottom: 6px;
          font-size: 11px;
        }
        .notes-content {
          color: #6b7280;
          font-size: 10px;
        }
        .footer {
          text-align: center;
          padding-top: 15px;
          margin-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #9ca3af;
          font-size: 10px;
        }
        .thank-you {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 5px;
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header -->
        <div class="header">
          <div class="company-info">
            <div class="company-name">${data.company.name}</div>
            <div class="company-details">
              ${formatAddress(data.company.address).map(line => `<div>${line}</div>`).join('')}
              ${data.company.phone ? `<div>${data.company.phone}</div>` : ''}
              ${data.company.email ? `<div>${data.company.email}</div>` : ''}
              ${data.company.taxNumber ? `<div>${labels.taxNumber}: ${data.company.taxNumber}</div>` : ''}
            </div>
          </div>
          <div class="invoice-info">
            <div class="invoice-title">${labels.taxInvoice}</div>
            <div class="invoice-meta">
              <div class="invoice-meta-row">
                <span class="meta-label">${labels.invoiceNumber}:</span>
                <span class="meta-value">${data.invoiceNumber}</span>
              </div>
              <div class="invoice-meta-row">
                <span class="meta-label">${labels.date}:</span>
                <span class="meta-value">${data.issueDate}</span>
              </div>
              <div class="invoice-meta-row">
                <span class="meta-label">${labels.dueDate}:</span>
                <span class="meta-value">${data.dueDate}</span>
              </div>
              ${data.poNumber ? `
              <div class="invoice-meta-row">
                <span class="meta-label">${labels.poNumber}:</span>
                <span class="meta-value">${data.poNumber}</span>
              </div>
              ` : ''}
            </div>
            ${statusLabel ? `<div class="status-badge">${statusLabel}</div>` : ''}
          </div>
        </div>

        <!-- Customer Section -->
        <div class="customer-section">
          <div class="customer-box">
            <div class="section-title">${labels.billTo}</div>
            <div class="customer-name">${data.customer.name}</div>
            <div class="customer-details">
              ${formatAddress(data.customer.billingAddress).map(line => `<div>${line}</div>`).join('')}
              ${data.customer.phone ? `<div>${data.customer.phone}</div>` : ''}
              ${data.customer.email ? `<div>${data.customer.email}</div>` : ''}
              ${data.customer.taxNumber ? `<div>${labels.taxNumber}: ${data.customer.taxNumber}</div>` : ''}
            </div>
          </div>
          ${data.customer.shippingAddress ? `
          <div class="customer-box">
            <div class="section-title">${labels.shipTo}</div>
            <div class="customer-details">
              ${formatAddress(data.customer.shippingAddress).map(line => `<div>${line}</div>`).join('')}
            </div>
          </div>
          ` : ''}
        </div>

        <!-- Items Table -->
        <table class="items-table">
          <thead>
            <tr>
              ${hasItemCode ? `<th>${labels.itemCode}</th>` : ''}
              <th>${labels.description}</th>
              <th class="text-center">${labels.quantity}</th>
              <th class="text-right">${labels.unitPrice}</th>
              ${hasDiscount ? `<th class="text-center">${labels.discount}</th>` : ''}
              <th class="text-center">${labels.tax}</th>
              <th class="text-right">${labels.amount}</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map(item => `
              <tr>
                ${hasItemCode ? `<td>${item.itemCode || ''}</td>` : ''}
                <td>${item.description}</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">${formatMoney(item.unitPrice, data.currency, language)}</td>
                ${hasDiscount ? `<td class="text-center">${item.discount ? `${item.discount}%` : '-'}</td>` : ''}
                <td class="text-center">${item.taxRate}%</td>
                <td class="text-right">${formatMoney(item.amount, data.currency, language)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Totals Section -->
        <div class="totals-section">
          <div class="totals-box">
            <div class="totals-row">
              <span class="totals-label">${labels.subtotal}</span>
              <span class="totals-value">${formatMoney(data.subtotal, data.currency, language)}</span>
            </div>
            ${(data.discountTotal && data.discountTotal > 0) ? `
            <div class="totals-row">
              <span class="totals-label">${labels.discountTotal}</span>
              <span class="totals-value">-${formatMoney(data.discountTotal, data.currency, language)}</span>
            </div>
            ` : ''}
            ${data.taxTotal > 0 ? `
            <div class="totals-row">
              <span class="totals-label">${labels.taxTotal}</span>
              <span class="totals-value">${formatMoney(data.taxTotal, data.currency, language)}</span>
            </div>
            ` : ''}
            ${(data.shippingFee && data.shippingFee > 0) ? `
            <div class="totals-row">
              <span class="totals-label">${labels.shipping}</span>
              <span class="totals-value">${formatMoney(data.shippingFee, data.currency, language)}</span>
            </div>
            ` : ''}
            <div class="totals-row total">
              <span class="totals-label">${labels.total}</span>
              <span class="totals-value">${formatMoney(data.total, data.currency, language)}</span>
            </div>
            ${(data.paidAmount && data.paidAmount > 0) ? `
            <div class="totals-row">
              <span class="totals-label">${labels.paid}</span>
              <span class="totals-value">${formatMoney(data.paidAmount, data.currency, language)}</span>
            </div>
            ` : ''}
            ${(data.outstanding && data.outstanding > 0) ? `
            <div class="totals-row">
              <span class="totals-label">${labels.balanceDue}</span>
              <span class="totals-value" style="color: #ef4444; font-weight: 700;">${formatMoney(data.outstanding, data.currency, language)}</span>
            </div>
            ` : ''}
            ${(data.baseCurrency && data.baseCurrency !== data.currency && data.totalInBaseCurrency) ? `
            <div class="totals-row" style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #d1d5db;">
              <span class="totals-label">${labels.equivalentAmount} ${data.baseCurrency}</span>
              <span class="totals-value">${formatMoney(data.totalInBaseCurrency, data.baseCurrency, language)}</span>
            </div>
            <div class="totals-row" style="font-size: 9px;">
              <span class="totals-label">${labels.exchangeRate}</span>
              <span class="totals-value">1 ${data.currency} = ${data.fxRate?.toFixed(4)} ${data.baseCurrency}</span>
            </div>
            ` : ''}
          </div>
        </div>

        <!-- Notes -->
        ${data.notes ? `
        <div class="notes-section">
          <div class="notes-title">${labels.notes}</div>
          <div class="notes-content">${data.notes}</div>
        </div>
        ` : ''}

        <!-- Bank Details -->
        ${data.bankDetails ? `
        <div class="notes-section">
          <div class="notes-title">${labels.bankDetails}</div>
          <div class="notes-content">
            ${data.bankDetails.bankName ? `<div>${labels.bankName}: ${data.bankDetails.bankName}</div>` : ''}
            ${data.bankDetails.accountName ? `<div>${labels.accountName}: ${data.bankDetails.accountName}</div>` : ''}
            ${data.bankDetails.accountNumber ? `<div>${labels.accountNumber}: ${data.bankDetails.accountNumber}</div>` : ''}
            ${data.bankDetails.iban ? `<div>${labels.iban}: ${data.bankDetails.iban}</div>` : ''}
            ${data.bankDetails.swift ? `<div>${labels.swift}: ${data.bankDetails.swift}</div>` : ''}
          </div>
        </div>
        ` : ''}

        <!-- Terms -->
        ${data.termsAndConditions ? `
        <div class="notes-section">
          <div class="notes-title">${labels.termsAndConditions}</div>
          <div class="notes-content">${data.termsAndConditions}</div>
        </div>
        ` : ''}

        <!-- Payment Instructions -->
        ${data.paymentInstructions ? `
        <div class="notes-section">
          <div class="notes-title">${labels.paymentInstructions}</div>
          <div class="notes-content">${data.paymentInstructions}</div>
        </div>
        ` : ''}

        <!-- Footer -->
        <div class="footer">
          <div class="thank-you">${labels.thankYou}</div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate a professional invoice PDF with Arabic support
 */
export async function generateInvoicePDF(
  data: InvoicePDFData,
  options: {
    language?: Language;
    showShippingAddress?: boolean;
    showBankDetails?: boolean;
    showTerms?: boolean;
    showPaymentInstructions?: boolean;
    watermark?: string;
    filename?: string;
    download?: boolean;
  } = {}
): Promise<Blob> {
  const {
    language = 'en',
    filename = `invoice-${data.invoiceNumber}.pdf`,
    download = true,
  } = options;

  const isRTL = language === 'ar' || language === 'he' || language === 'fa';
  const labels = getLabels(language);

  // Dynamic import to reduce bundle size
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);

  // For Arabic, we rely on the Google Fonts CSS link in the HTML template
  // The font will be loaded via the stylesheet

  // Create hidden container for rendering
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: 750px;
    background: white;
    z-index: -1;
  `;
  
  // Generate HTML
  const html = createInvoiceHTML(data, labels, isRTL, language);
  container.innerHTML = html;
  document.body.appendChild(container);

  // Wait for fonts to load - important for Arabic text
  await document.fonts.ready;
  // Extra wait time for font rendering, especially for Arabic
  await new Promise(resolve => setTimeout(resolve, isRTL ? 300 : 100));

  try {
    // Render to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Calculate image dimensions to fit A4 with margins
    const margin = 10; // 10mm margins
    const availableWidth = pdfWidth - (margin * 2);
    const availableHeight = pdfHeight - (margin * 2);
    
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    // Calculate scale to fit within available area
    const scaleX = availableWidth / (imgWidth / 2);
    const scaleY = availableHeight / (imgHeight / 2);
    const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down if needed
    
    const scaledWidth = (imgWidth / 2) * scale;
    const scaledHeight = (imgHeight / 2) * scale;
    
    // Center horizontally
    const xOffset = margin + (availableWidth - scaledWidth) / 2;
    
    // Check if content fits on one page
    if (scaledHeight <= availableHeight) {
      pdf.addImage(imgData, 'PNG', xOffset, margin, scaledWidth, scaledHeight);
    } else {
      // Multi-page handling
      const pageHeight = availableHeight;
      let heightLeft = scaledHeight;
      let position = margin;
      let page = 1;
      
      while (heightLeft > 0) {
        if (page > 1) {
          pdf.addPage();
        }
        
        pdf.addImage(imgData, 'PNG', xOffset, position, scaledWidth, scaledHeight);
        heightLeft -= pageHeight;
        position -= pageHeight;
        page++;
      }
    }

    // Generate blob
    const pdfBlob = pdf.output('blob');

    // Download if requested
    if (download) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(pdfBlob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }

    return pdfBlob;
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
}

/**
 * Open invoice PDF in new tab for preview
 */
export async function previewInvoicePDF(data: InvoicePDFData, options?: Parameters<typeof generateInvoicePDF>[1]): Promise<void> {
  const blob = await generateInvoicePDF(data, { ...options, download: false });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  // Clean up URL after a delay
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

/**
 * Email invoice PDF (returns blob for attachment)
 */
export async function getInvoicePDFBlob(data: InvoicePDFData, options?: Parameters<typeof generateInvoicePDF>[1]): Promise<Blob> {
  return generateInvoicePDF(data, { ...options, download: false });
}
