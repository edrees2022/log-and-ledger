import { db } from "../db";
import { ai_providers } from "@shared/schema";
import { eq } from "drizzle-orm";
import { callAIProvider } from "./aiProviders";

type DocumentType = 'invoice' | 'bill' | 'receipt' | 'check' | 'contact' | 'item';

export async function extractDocumentData(
  companyId: string,
  imageBase64: string,
  type: DocumentType
) {
  try {
    // Fetch active AI provider
    const providers = await db.select().from(ai_providers).where(eq(ai_providers.company_id, companyId));
    const activeProvider = providers[0]; // Default to first available

    if (!activeProvider || !activeProvider.api_key) {
      throw new Error('No AI provider configured');
    }

    let prompt = "";
    
    switch (type) {
      case 'invoice':
      case 'bill':
      case 'receipt':
        prompt = `
          Analyze this ${type} image. Extract the following details into a strict JSON format:
          - invoice_number: The invoice/bill number.
          - date: The date (YYYY-MM-DD).
          - due_date: The due date (YYYY-MM-DD).
          - contact_name: The name of the vendor/customer.
          - subtotal: The subtotal amount.
          - tax_total: The total tax amount.
          - total: The final total amount.
          - currency: The currency code (e.g., USD, SAR).
          - items: An array of objects with { description, quantity, unit_price, total }.
          
          If a field is missing, return null. Handle handwritten text carefully.
        `;
        break;
      case 'contact':
        prompt = `
          Analyze this business card or contact document. Extract details into JSON:
          - name: Full name or Company name.
          - email: Email address.
          - phone: Phone number.
          - address: Physical address.
          - tax_number: Tax ID or VAT number.
          - website: Website URL.
        `;
        break;
      case 'item':
        prompt = `
          Analyze this product image or spec sheet. Extract details into JSON:
          - name: Product name.
          - sku: SKU or barcode number.
          - description: Short description.
          - price: Retail price (if visible).
          - cost: Cost price (if visible).
          - category: Suggested category.
        `;
        break;
      case 'check':
        // Re-use the check logic or keep it separate. For now, include it here for completeness.
        prompt = `
          Analyze this bank check. Extract into JSON:
          - check_number
          - bank_name
          - amount
          - currency
          - date
          - payee
          - memo
        `;
        break;
      default:
        throw new Error(`Unsupported document type: ${type}`);
    }

    const messages = [
      {
        role: "user" as const,
        content: [
          { type: "text" as const, text: prompt },
          { type: "image_url" as const, image_url: { url: imageBase64 } }
        ]
      }
    ];

    const response = await callAIProvider({
      provider: (activeProvider.provider || 'openai').toLowerCase() as any,
      model: activeProvider.vision_model || activeProvider.default_model || 'gpt-4o',
      apiKey: activeProvider.api_key,
      baseUrl: activeProvider.base_url || undefined
    }, messages);

    if (response.content) {
      try {
        const json = JSON.parse(response.content.replace(/```json|```/g, '').trim());
        return json;
      } catch (e) {
        console.warn('Failed to parse AI extraction', e);
        throw new Error('Failed to parse AI response');
      }
    }
  } catch (e) {
    console.error('AI document extraction failed', e);
    throw e;
  }

  return null;
}
