/**
 * Email Service
 * Handles sending emails for invoices, bills, and other notifications
 */
import nodemailer from 'nodemailer';

// Email configuration from environment variables
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
};

// Create transporter
const createTransporter = () => {
  if (!emailConfig.auth.user || !emailConfig.auth.pass) {
    console.warn('Email service not configured. Set SMTP_USER and SMTP_PASS environment variables.');
    return null;
  }
  
  return nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: emailConfig.auth,
  });
};

export interface EmailOptions {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
  from?: string;
}

export interface SendInvoiceEmailOptions {
  to: string;
  cc?: string;
  invoiceNumber: string;
  customerName: string;
  companyName: string;
  amount: string;
  dueDate: string;
  currency: string;
  pdfBuffer?: Buffer;
  language?: 'en' | 'ar';
  customMessage?: string;
}

/**
 * Send a generic email
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string; messageId?: string }> {
  const transporter = createTransporter();
  
  if (!transporter) {
    return { 
      success: false, 
      error: 'Email service not configured. Please set SMTP credentials in environment variables.' 
    };
  }

  try {
    const info = await transporter.sendMail({
      from: options.from || `"${process.env.SMTP_FROM_NAME || 'Log & Ledger'}" <${emailConfig.auth.user}>`,
      to: options.to,
      cc: options.cc,
      bcc: options.bcc,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    });

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Failed to send email:', error);
    return { success: false, error: error.message || 'Failed to send email' };
  }
}

/**
 * Send an invoice email with PDF attachment
 */
export async function sendInvoiceEmail(options: SendInvoiceEmailOptions): Promise<{ success: boolean; error?: string; messageId?: string }> {
  const isArabic = options.language === 'ar';
  
  const subject = isArabic 
    ? `فاتورة رقم ${options.invoiceNumber} من ${options.companyName}`
    : `Invoice #${options.invoiceNumber} from ${options.companyName}`;
  
  const greeting = isArabic 
    ? `عزيزي ${options.customerName}،`
    : `Dear ${options.customerName},`;
  
  const intro = isArabic
    ? `مرفق فاتورتكم رقم ${options.invoiceNumber} بقيمة ${options.amount} ${options.currency}.`
    : `Please find attached invoice #${options.invoiceNumber} for ${options.amount} ${options.currency}.`;
  
  const dueInfo = isArabic
    ? `تاريخ الاستحقاق: ${options.dueDate}`
    : `Due Date: ${options.dueDate}`;
  
  const customMsg = options.customMessage 
    ? `<p style="margin: 20px 0;">${options.customMessage}</p>` 
    : '';
  
  const closing = isArabic
    ? `شكراً لتعاملكم معنا.<br><br>مع أطيب التحيات،<br>${options.companyName}`
    : `Thank you for your business.<br><br>Best regards,<br>${options.companyName}`;

  const html = `
    <!DOCTYPE html>
    <html dir="${isArabic ? 'rtl' : 'ltr'}" lang="${options.language || 'en'}">
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: ${isArabic ? "'Segoe UI', Tahoma, Arial" : "'Segoe UI', Tahoma, Arial"}, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          direction: ${isArabic ? 'rtl' : 'ltr'};
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 8px 8px 0 0;
          text-align: center;
        }
        .content {
          background: #f9fafb;
          padding: 30px;
          border: 1px solid #e5e7eb;
          border-top: none;
        }
        .invoice-box {
          background: white;
          border: 2px solid #667eea;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
        }
        .invoice-number {
          font-size: 24px;
          font-weight: bold;
          color: #667eea;
        }
        .amount {
          font-size: 28px;
          font-weight: bold;
          color: #1f2937;
          margin: 10px 0;
        }
        .due-date {
          color: #dc2626;
          font-weight: 600;
        }
        .footer {
          background: #1f2937;
          color: #9ca3af;
          padding: 20px;
          border-radius: 0 0 8px 8px;
          text-align: center;
          font-size: 12px;
        }
        p { margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="margin: 0;">${options.companyName}</h1>
        <p style="margin: 5px 0; opacity: 0.9;">${isArabic ? 'فاتورة' : 'Invoice'}</p>
      </div>
      
      <div class="content">
        <p>${greeting}</p>
        <p>${intro}</p>
        
        <div class="invoice-box">
          <div class="invoice-number">#${options.invoiceNumber}</div>
          <div class="amount">${options.amount} ${options.currency}</div>
          <div class="due-date">${dueInfo}</div>
        </div>
        
        ${customMsg}
        
        <p>${closing}</p>
      </div>
      
      <div class="footer">
        <p>${isArabic ? 'تم إرسال هذا البريد الإلكتروني من نظام Log & Ledger' : 'This email was sent from Log & Ledger'}</p>
      </div>
    </body>
    </html>
  `;

  const text = `
${greeting}

${intro}

${dueInfo}

${options.customMessage || ''}

${closing.replace(/<br>/g, '\n')}
  `.trim();

  const attachments: EmailOptions['attachments'] = [];
  
  if (options.pdfBuffer) {
    attachments.push({
      filename: `Invoice-${options.invoiceNumber}.pdf`,
      content: options.pdfBuffer,
      contentType: 'application/pdf',
    });
  }

  return sendEmail({
    to: options.to,
    cc: options.cc,
    subject,
    html,
    text,
    attachments,
  });
}

/**
 * Send a payment reminder email
 */
export async function sendPaymentReminder(options: {
  to: string;
  invoiceNumber: string;
  customerName: string;
  companyName: string;
  amount: string;
  dueDate: string;
  daysOverdue: number;
  currency: string;
  language?: 'en' | 'ar';
}): Promise<{ success: boolean; error?: string; messageId?: string }> {
  const isArabic = options.language === 'ar';
  
  const subject = isArabic
    ? `تذكير بسداد الفاتورة رقم ${options.invoiceNumber}`
    : `Payment Reminder: Invoice #${options.invoiceNumber}`;
  
  const urgencyText = options.daysOverdue > 30
    ? (isArabic ? '(متأخر جداً)' : '(Severely Overdue)')
    : options.daysOverdue > 0
    ? (isArabic ? '(متأخر)' : '(Overdue)')
    : '';

  const html = `
    <!DOCTYPE html>
    <html dir="${isArabic ? 'rtl' : 'ltr'}">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .alert { background: #fef2f2; border: 1px solid #dc2626; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .amount { font-size: 24px; font-weight: bold; color: #dc2626; }
      </style>
    </head>
    <body>
      <h2>${isArabic ? 'تذكير بالدفع' : 'Payment Reminder'} ${urgencyText}</h2>
      
      <p>${isArabic ? `عزيزي ${options.customerName}،` : `Dear ${options.customerName},`}</p>
      
      <div class="alert">
        <p><strong>${isArabic ? 'فاتورة رقم:' : 'Invoice #:'}</strong> ${options.invoiceNumber}</p>
        <p class="amount">${isArabic ? 'المبلغ المستحق:' : 'Amount Due:'} ${options.amount} ${options.currency}</p>
        <p><strong>${isArabic ? 'تاريخ الاستحقاق:' : 'Due Date:'}</strong> ${options.dueDate}</p>
        ${options.daysOverdue > 0 ? `<p style="color: #dc2626;"><strong>${isArabic ? 'أيام التأخير:' : 'Days Overdue:'}</strong> ${options.daysOverdue}</p>` : ''}
      </div>
      
      <p>${isArabic 
        ? 'نرجو منكم سداد المبلغ المستحق في أقرب وقت ممكن.'
        : 'Please arrange payment at your earliest convenience.'}</p>
      
      <p>${isArabic ? 'مع أطيب التحيات،' : 'Best regards,'}<br>${options.companyName}</p>
    </body>
    </html>
  `;

  return sendEmail({ to: options.to, subject, html });
}

/**
 * Check if email service is configured
 */
export function isEmailServiceConfigured(): boolean {
  return !!(process.env.SMTP_USER && process.env.SMTP_PASS);
}
