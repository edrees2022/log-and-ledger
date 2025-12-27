/**
 * ZATCA E-Invoicing Integration for Saudi Arabia
 * 
 * This module handles the integration with ZATCA (Zakat, Tax and Customs Authority)
 * for electronic invoicing compliance in Saudi Arabia.
 * 
 * Features:
 * - QR Code generation for simplified invoices
 * - XML invoice generation (UBL 2.1 format)
 * - Digital signature support
 * - Invoice hash calculation
 * - Clearance and reporting modes
 */

import { z } from 'zod';

// ZATCA Invoice Types
export type ZatcaInvoiceType = 
  | '388' // Standard Tax Invoice
  | '381' // Credit Note
  | '383'; // Debit Note

export type ZatcaInvoiceSubType = 
  | '01' // Standard Invoice
  | '02'; // Simplified Invoice

// ZATCA Compliance Status
export type ZatcaComplianceStatus = 
  | 'pending'
  | 'submitted'
  | 'cleared'
  | 'reported'
  | 'rejected';

// ZATCA QR Code Data (TLV Format)
export interface ZatcaQRData {
  sellerName: string;           // Tag 1
  vatNumber: string;            // Tag 2
  timestamp: string;            // Tag 3 (ISO 8601)
  totalWithVat: string;         // Tag 4
  vatAmount: string;            // Tag 5
  invoiceHash?: string;         // Tag 6 (for Phase 2)
  ecdsaSignature?: string;      // Tag 7 (for Phase 2)
  ecdsaPublicKey?: string;      // Tag 8 (for Phase 2)
}

// Invoice Party
export interface ZatcaParty {
  name: string;
  vatNumber?: string;
  address: {
    street: string;
    buildingNumber?: string;
    additionalNumber?: string;
    district: string;
    city: string;
    postalCode: string;
    countryCode: string; // ISO 3166-1 alpha-2
  };
  registrationNumber?: string;
}

// Invoice Line Item
export interface ZatcaLineItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitCode: string; // UN/ECE Recommendation 20 (PCE, KGM, etc.)
  unitPrice: number;
  discount?: number;
  discountReason?: string;
  taxCategory: ZatcaTaxCategory;
  taxRate: number;
  lineExtensionAmount: number;
  taxAmount: number;
  roundingAmount?: number;
}

// Tax Categories
export type ZatcaTaxCategory = 
  | 'S'  // Standard Rate (15%)
  | 'Z'  // Zero Rate
  | 'E'  // Exempt
  | 'O'; // Out of Scope

// Tax Category Reasons for exemption
export const taxExemptionReasons: Record<string, string> = {
  'VATEX-SA-29': 'Financial services',
  'VATEX-SA-29-7': 'Life insurance services',
  'VATEX-SA-30': 'Real estate transactions',
  'VATEX-SA-32': 'Qualifying metals',
  'VATEX-SA-33': 'Private education',
  'VATEX-SA-34-1': 'Private healthcare',
  'VATEX-SA-34-2': 'Medical equipment',
  'VATEX-SA-34-3': 'Medicines',
  'VATEX-SA-34-4': 'Medical devices',
  'VATEX-SA-34-5': 'Medical products',
  'VATEX-SA-35': 'Government purchases',
  'VATEX-SA-36': 'Diplomatic supplies',
  'VATEX-SA-EDU': 'Private education to citizen',
  'VATEX-SA-HEA': 'Private healthcare to citizen',
  'VATEX-SA-MLTRY': 'Military supplies',
};

// Full Invoice Structure
export interface ZatcaInvoice {
  uuid: string;
  invoiceNumber: string;
  invoiceType: ZatcaInvoiceType;
  invoiceSubType: ZatcaInvoiceSubType;
  issueDate: Date;
  issueTime: string;
  dueDate?: Date;
  
  // Payment
  paymentMeansCode: string; // 10=Cash, 30=Credit, 42=Bank, 48=Card
  paymentTerms?: string;
  
  // Parties
  seller: ZatcaParty;
  buyer?: ZatcaParty; // Required for standard invoices
  
  // Currency
  currencyCode: string;
  exchangeRate?: number;
  
  // Lines
  lines: ZatcaLineItem[];
  
  // Totals
  lineExtensionAmount: number;
  taxExclusiveAmount: number;
  taxInclusiveAmount: number;
  allowanceTotalAmount: number;
  chargeTotalAmount: number;
  prepaidAmount: number;
  payableAmount: number;
  
  // Tax
  taxTotal: {
    taxAmount: number;
    taxSubtotals: {
      taxableAmount: number;
      taxAmount: number;
      taxCategory: ZatcaTaxCategory;
      taxPercent: number;
      exemptionReasonCode?: string;
      exemptionReason?: string;
    }[];
  };
  
  // References (for credit/debit notes)
  billingReference?: {
    invoiceNumber: string;
    issueDate: Date;
  };
  
  // Notes
  notes?: string[];
  
  // ZATCA Compliance
  previousInvoiceHash?: string;
  invoiceHash?: string;
  signature?: string;
  qrCode?: string;
  complianceStatus?: ZatcaComplianceStatus;
}

/**
 * Generate TLV (Tag-Length-Value) encoded data for QR code
 */
export function generateTLV(tag: number, value: string): Uint8Array {
  const encoder = new TextEncoder();
  const valueBytes = encoder.encode(value);
  const result = new Uint8Array(2 + valueBytes.length);
  result[0] = tag;
  result[1] = valueBytes.length;
  result.set(valueBytes, 2);
  return result;
}

/**
 * Generate ZATCA QR Code data (Base64 encoded TLV)
 */
export function generateZatcaQR(data: ZatcaQRData): string {
  const tlvParts: Uint8Array[] = [
    generateTLV(1, data.sellerName),
    generateTLV(2, data.vatNumber),
    generateTLV(3, data.timestamp),
    generateTLV(4, data.totalWithVat),
    generateTLV(5, data.vatAmount),
  ];
  
  // Phase 2 additional fields
  if (data.invoiceHash) {
    tlvParts.push(generateTLV(6, data.invoiceHash));
  }
  if (data.ecdsaSignature) {
    tlvParts.push(generateTLV(7, data.ecdsaSignature));
  }
  if (data.ecdsaPublicKey) {
    tlvParts.push(generateTLV(8, data.ecdsaPublicKey));
  }
  
  // Combine all TLV parts
  const totalLength = tlvParts.reduce((sum, part) => sum + part.length, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of tlvParts) {
    combined.set(part, offset);
    offset += part.length;
  }
  
  // Convert to Base64
  let binary = '';
  for (let i = 0; i < combined.length; i++) {
    binary += String.fromCharCode(combined[i]);
  }
  return btoa(binary);
}

/**
 * Parse ZATCA QR Code (Base64 TLV to data)
 */
export function parseZatcaQR(base64: string): ZatcaQRData | null {
  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    
    const decoder = new TextDecoder();
    const result: Partial<ZatcaQRData> = {};
    
    let offset = 0;
    while (offset < bytes.length) {
      const tag = bytes[offset];
      const length = bytes[offset + 1];
      const value = decoder.decode(bytes.slice(offset + 2, offset + 2 + length));
      
      switch (tag) {
        case 1: result.sellerName = value; break;
        case 2: result.vatNumber = value; break;
        case 3: result.timestamp = value; break;
        case 4: result.totalWithVat = value; break;
        case 5: result.vatAmount = value; break;
        case 6: result.invoiceHash = value; break;
        case 7: result.ecdsaSignature = value; break;
        case 8: result.ecdsaPublicKey = value; break;
      }
      
      offset += 2 + length;
    }
    
    return result as ZatcaQRData;
  } catch (error) {
    console.error('Failed to parse ZATCA QR:', error);
    return null;
  }
}

/**
 * Format VAT number for Saudi Arabia
 */
export function formatVatNumber(vatNumber: string): string {
  // Remove any non-digit characters
  const digits = vatNumber.replace(/\D/g, '');
  
  // Saudi VAT number should be 15 digits starting with 3
  if (digits.length === 15 && digits.startsWith('3')) {
    return digits;
  }
  
  // If 10 digits, it might be without prefix/suffix
  if (digits.length === 10) {
    return `3${digits}00003`;
  }
  
  return digits;
}

/**
 * Validate Saudi VAT number
 */
export function validateVatNumber(vatNumber: string): boolean {
  const formatted = formatVatNumber(vatNumber);
  
  // Must be 15 digits
  if (formatted.length !== 15) return false;
  
  // Must start with 3
  if (!formatted.startsWith('3')) return false;
  
  // Must end with 00003
  if (!formatted.endsWith('00003')) return false;
  
  return true;
}

/**
 * Generate invoice hash (SHA-256)
 */
export async function generateInvoiceHash(invoiceXml: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(invoiceXml);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return btoa(String.fromCharCode(...hashArray));
}

/**
 * Generate UBL 2.1 XML for ZATCA invoice
 */
export function generateZatcaXML(invoice: ZatcaInvoice): string {
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  const formatAmount = (amount: number) => amount.toFixed(2);
  
  const taxSubtotalsXml = invoice.taxTotal.taxSubtotals.map(sub => `
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${invoice.currencyCode}">${formatAmount(sub.taxableAmount)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${invoice.currencyCode}">${formatAmount(sub.taxAmount)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>${sub.taxCategory}</cbc:ID>
        <cbc:Percent>${sub.taxPercent}</cbc:Percent>
        ${sub.exemptionReasonCode ? `<cbc:TaxExemptionReasonCode>${sub.exemptionReasonCode}</cbc:TaxExemptionReasonCode>` : ''}
        ${sub.exemptionReason ? `<cbc:TaxExemptionReason>${sub.exemptionReason}</cbc:TaxExemptionReason>` : ''}
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  `).join('');
  
  const linesXml = invoice.lines.map((line, index) => `
    <cac:InvoiceLine>
      <cbc:ID>${index + 1}</cbc:ID>
      <cbc:InvoicedQuantity unitCode="${line.unitCode}">${line.quantity}</cbc:InvoicedQuantity>
      <cbc:LineExtensionAmount currencyID="${invoice.currencyCode}">${formatAmount(line.lineExtensionAmount)}</cbc:LineExtensionAmount>
      <cac:TaxTotal>
        <cbc:TaxAmount currencyID="${invoice.currencyCode}">${formatAmount(line.taxAmount)}</cbc:TaxAmount>
        ${line.roundingAmount ? `<cbc:RoundingAmount currencyID="${invoice.currencyCode}">${formatAmount(line.roundingAmount)}</cbc:RoundingAmount>` : ''}
      </cac:TaxTotal>
      <cac:Item>
        <cbc:Name>${escapeXml(line.name)}</cbc:Name>
        ${line.description ? `<cbc:Description>${escapeXml(line.description)}</cbc:Description>` : ''}
        <cac:ClassifiedTaxCategory>
          <cbc:ID>${line.taxCategory}</cbc:ID>
          <cbc:Percent>${line.taxRate}</cbc:Percent>
          <cac:TaxScheme>
            <cbc:ID>VAT</cbc:ID>
          </cac:TaxScheme>
        </cac:ClassifiedTaxCategory>
      </cac:Item>
      <cac:Price>
        <cbc:PriceAmount currencyID="${invoice.currencyCode}">${formatAmount(line.unitPrice)}</cbc:PriceAmount>
        ${line.discount ? `
        <cac:AllowanceCharge>
          <cbc:ChargeIndicator>false</cbc:ChargeIndicator>
          <cbc:AllowanceChargeReason>${line.discountReason || 'Discount'}</cbc:AllowanceChargeReason>
          <cbc:Amount currencyID="${invoice.currencyCode}">${formatAmount(line.discount)}</cbc:Amount>
        </cac:AllowanceCharge>
        ` : ''}
      </cac:Price>
    </cac:InvoiceLine>
  `).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
  
  <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
  <cbc:ID>${invoice.invoiceNumber}</cbc:ID>
  <cbc:UUID>${invoice.uuid}</cbc:UUID>
  <cbc:IssueDate>${formatDate(invoice.issueDate)}</cbc:IssueDate>
  <cbc:IssueTime>${invoice.issueTime}</cbc:IssueTime>
  ${invoice.dueDate ? `<cbc:DueDate>${formatDate(invoice.dueDate)}</cbc:DueDate>` : ''}
  <cbc:InvoiceTypeCode name="${invoice.invoiceSubType}">${invoice.invoiceType}</cbc:InvoiceTypeCode>
  ${invoice.notes?.map(note => `<cbc:Note>${escapeXml(note)}</cbc:Note>`).join('') || ''}
  <cbc:DocumentCurrencyCode>${invoice.currencyCode}</cbc:DocumentCurrencyCode>
  
  ${invoice.billingReference ? `
  <cac:BillingReference>
    <cac:InvoiceDocumentReference>
      <cbc:ID>${invoice.billingReference.invoiceNumber}</cbc:ID>
      <cbc:IssueDate>${formatDate(invoice.billingReference.issueDate)}</cbc:IssueDate>
    </cac:InvoiceDocumentReference>
  </cac:BillingReference>
  ` : ''}
  
  <!-- Additional Document Reference for QR Code -->
  <cac:AdditionalDocumentReference>
    <cbc:ID>QR</cbc:ID>
    <cac:Attachment>
      <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">${invoice.qrCode || ''}</cbc:EmbeddedDocumentBinaryObject>
    </cac:Attachment>
  </cac:AdditionalDocumentReference>
  
  <!-- Seller -->
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="CRN">${invoice.seller.registrationNumber || ''}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PostalAddress>
        <cbc:StreetName>${escapeXml(invoice.seller.address.street)}</cbc:StreetName>
        ${invoice.seller.address.buildingNumber ? `<cbc:BuildingNumber>${invoice.seller.address.buildingNumber}</cbc:BuildingNumber>` : ''}
        ${invoice.seller.address.additionalNumber ? `<cbc:PlotIdentification>${invoice.seller.address.additionalNumber}</cbc:PlotIdentification>` : ''}
        <cbc:CitySubdivisionName>${escapeXml(invoice.seller.address.district)}</cbc:CitySubdivisionName>
        <cbc:CityName>${escapeXml(invoice.seller.address.city)}</cbc:CityName>
        <cbc:PostalZone>${invoice.seller.address.postalCode}</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>${invoice.seller.address.countryCode}</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${invoice.seller.vatNumber || ''}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${escapeXml(invoice.seller.name)}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  
  ${invoice.buyer ? `
  <!-- Buyer -->
  <cac:AccountingCustomerParty>
    <cac:Party>
      ${invoice.buyer.registrationNumber ? `
      <cac:PartyIdentification>
        <cbc:ID schemeID="CRN">${invoice.buyer.registrationNumber}</cbc:ID>
      </cac:PartyIdentification>
      ` : ''}
      <cac:PostalAddress>
        <cbc:StreetName>${escapeXml(invoice.buyer.address.street)}</cbc:StreetName>
        ${invoice.buyer.address.buildingNumber ? `<cbc:BuildingNumber>${invoice.buyer.address.buildingNumber}</cbc:BuildingNumber>` : ''}
        <cbc:CitySubdivisionName>${escapeXml(invoice.buyer.address.district)}</cbc:CitySubdivisionName>
        <cbc:CityName>${escapeXml(invoice.buyer.address.city)}</cbc:CityName>
        <cbc:PostalZone>${invoice.buyer.address.postalCode}</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>${invoice.buyer.address.countryCode}</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      ${invoice.buyer.vatNumber ? `
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${invoice.buyer.vatNumber}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      ` : ''}
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${escapeXml(invoice.buyer.name)}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>
  ` : ''}
  
  <!-- Payment Means -->
  <cac:PaymentMeans>
    <cbc:PaymentMeansCode>${invoice.paymentMeansCode}</cbc:PaymentMeansCode>
    ${invoice.paymentTerms ? `<cbc:InstructionNote>${escapeXml(invoice.paymentTerms)}</cbc:InstructionNote>` : ''}
  </cac:PaymentMeans>
  
  <!-- Tax Total -->
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${invoice.currencyCode}">${formatAmount(invoice.taxTotal.taxAmount)}</cbc:TaxAmount>
    ${taxSubtotalsXml}
  </cac:TaxTotal>
  
  <!-- Legal Monetary Total -->
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${invoice.currencyCode}">${formatAmount(invoice.lineExtensionAmount)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${invoice.currencyCode}">${formatAmount(invoice.taxExclusiveAmount)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${invoice.currencyCode}">${formatAmount(invoice.taxInclusiveAmount)}</cbc:TaxInclusiveAmount>
    <cbc:AllowanceTotalAmount currencyID="${invoice.currencyCode}">${formatAmount(invoice.allowanceTotalAmount)}</cbc:AllowanceTotalAmount>
    <cbc:ChargeTotalAmount currencyID="${invoice.currencyCode}">${formatAmount(invoice.chargeTotalAmount)}</cbc:ChargeTotalAmount>
    <cbc:PrepaidAmount currencyID="${invoice.currencyCode}">${formatAmount(invoice.prepaidAmount)}</cbc:PrepaidAmount>
    <cbc:PayableAmount currencyID="${invoice.currencyCode}">${formatAmount(invoice.payableAmount)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  
  <!-- Invoice Lines -->
  ${linesXml}
  
</Invoice>`;
}

/**
 * Escape special XML characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * ZATCA Invoice Schema for validation
 */
export const zatcaInvoiceSchema = z.object({
  uuid: z.string().uuid(),
  invoiceNumber: z.string().min(1),
  invoiceType: z.enum(['388', '381', '383']),
  invoiceSubType: z.enum(['01', '02']),
  issueDate: z.date(),
  issueTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  seller: z.object({
    name: z.string().min(1),
    vatNumber: z.string().optional(),
    address: z.object({
      street: z.string().min(1),
      district: z.string().min(1),
      city: z.string().min(1),
      postalCode: z.string().min(5),
      countryCode: z.string().length(2),
    }),
  }),
  currencyCode: z.string().length(3),
  lines: z.array(z.object({
    name: z.string().min(1),
    quantity: z.number().positive(),
    unitCode: z.string().min(1),
    unitPrice: z.number().nonnegative(),
    taxCategory: z.enum(['S', 'Z', 'E', 'O']),
    taxRate: z.number().nonnegative(),
    lineExtensionAmount: z.number().nonnegative(),
    taxAmount: z.number().nonnegative(),
  })).min(1),
  taxTotal: z.object({
    taxAmount: z.number().nonnegative(),
    taxSubtotals: z.array(z.object({
      taxableAmount: z.number().nonnegative(),
      taxAmount: z.number().nonnegative(),
      taxCategory: z.enum(['S', 'Z', 'E', 'O']),
      taxPercent: z.number().nonnegative(),
    })),
  }),
  lineExtensionAmount: z.number().nonnegative(),
  taxExclusiveAmount: z.number().nonnegative(),
  taxInclusiveAmount: z.number().nonnegative(),
  payableAmount: z.number().nonnegative(),
});

/**
 * Validate ZATCA invoice
 */
export function validateZatcaInvoice(invoice: Partial<ZatcaInvoice>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Basic validation
  if (!invoice.invoiceNumber) errors.push('Invoice number is required');
  if (!invoice.seller?.name) errors.push('Seller name is required');
  if (!invoice.seller?.vatNumber && invoice.invoiceSubType === '01') {
    errors.push('Seller VAT number is required for standard invoices');
  }
  if (invoice.seller?.vatNumber && !validateVatNumber(invoice.seller.vatNumber)) {
    errors.push('Invalid seller VAT number format');
  }
  if (!invoice.lines || invoice.lines.length === 0) {
    errors.push('At least one invoice line is required');
  }
  if (invoice.invoiceSubType === '01' && !invoice.buyer) {
    errors.push('Buyer information is required for standard invoices');
  }
  
  // Tax validation
  if (invoice.lines) {
    for (const line of invoice.lines) {
      if (line.taxCategory === 'S' && line.taxRate !== 15) {
        errors.push(`Standard rate (S) must be 15%, found ${line.taxRate}%`);
      }
      if (line.taxCategory === 'Z' && line.taxRate !== 0) {
        errors.push(`Zero rate (Z) must be 0%, found ${line.taxRate}%`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Convert standard invoice to ZATCA format
 */
export function convertToZatcaInvoice(standardInvoice: any, seller: ZatcaParty, isSimplified = false): ZatcaInvoice {
  const lines: ZatcaLineItem[] = standardInvoice.items.map((item: any, index: number) => {
    const taxRate = item.taxRate || 15;
    const taxAmount = (item.total * taxRate) / 100;
    
    return {
      id: `${index + 1}`,
      name: item.description || item.name,
      quantity: item.quantity,
      unitCode: item.unitCode || 'PCE',
      unitPrice: item.unitPrice || item.price,
      taxCategory: taxRate > 0 ? 'S' : 'Z',
      taxRate,
      lineExtensionAmount: item.total,
      taxAmount,
    };
  });
  
  const lineExtensionAmount = lines.reduce((sum, l) => sum + l.lineExtensionAmount, 0);
  const totalTax = lines.reduce((sum, l) => sum + l.taxAmount, 0);
  
  return {
    uuid: crypto.randomUUID(),
    invoiceNumber: standardInvoice.number,
    invoiceType: '388',
    invoiceSubType: isSimplified ? '02' : '01',
    issueDate: new Date(standardInvoice.date),
    issueTime: new Date().toTimeString().slice(0, 8),
    dueDate: standardInvoice.dueDate ? new Date(standardInvoice.dueDate) : undefined,
    paymentMeansCode: '10',
    seller,
    buyer: !isSimplified && standardInvoice.customer ? {
      name: standardInvoice.customer.name,
      vatNumber: standardInvoice.customer.vatNumber,
      address: {
        street: standardInvoice.customer.address || 'N/A',
        district: standardInvoice.customer.district || 'N/A',
        city: standardInvoice.customer.city || 'N/A',
        postalCode: standardInvoice.customer.postalCode || '00000',
        countryCode: 'SA',
      },
    } : undefined,
    currencyCode: standardInvoice.currency || 'SAR',
    lines,
    lineExtensionAmount,
    taxExclusiveAmount: lineExtensionAmount,
    taxInclusiveAmount: lineExtensionAmount + totalTax,
    allowanceTotalAmount: 0,
    chargeTotalAmount: 0,
    prepaidAmount: 0,
    payableAmount: lineExtensionAmount + totalTax,
    taxTotal: {
      taxAmount: totalTax,
      taxSubtotals: [
        {
          taxableAmount: lineExtensionAmount,
          taxAmount: totalTax,
          taxCategory: 'S',
          taxPercent: 15,
        },
      ],
    },
  };
}

export default {
  generateZatcaQR,
  parseZatcaQR,
  generateZatcaXML,
  generateInvoiceHash,
  validateZatcaInvoice,
  validateVatNumber,
  formatVatNumber,
  convertToZatcaInvoice,
  taxExemptionReasons,
};
