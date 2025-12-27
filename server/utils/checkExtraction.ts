import { db } from "../db";
import { ai_providers } from "@shared/schema";
import { eq } from "drizzle-orm";
import { callAIProvider } from "./aiProviders";

export async function extractCheckFromImage(
  companyId: string,
  imageBase64: string
) {
  try {
    // Fetch active AI provider
    const providers = await db.select().from(ai_providers).where(eq(ai_providers.company_id, companyId));
    // Use the first provider as default since is_active column might not exist
    const activeProvider = providers[0];

    if (!activeProvider || !activeProvider.api_key) {
      throw new Error('No AI provider configured');
    }

    const prompt = `
      Analyze this image of a bank check. Extract the following details into a strict JSON format:
      - check_number: The check number (usually at top right or bottom MICR).
      - bank_name: Name of the bank.
      - amount: The numerical amount.
      - currency: The currency code (e.g., USD, SAR, EUR). Infer from symbol if needed.
      - date: The date on the check (YYYY-MM-DD format).
      - payee: The name of the person or entity being paid (Pay to the order of).
      - memo: Any notes or memo written on the check.
      
      If a field is illegible or missing, return null for that field.
      Handle handwritten text carefully.
    `;

    // Prepare message with image
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
        console.warn('Failed to parse AI check extraction', e);
        throw new Error('Failed to parse AI response');
      }
    }
  } catch (e) {
    console.error('AI check extraction failed', e);
    throw e;
  }

  return null;
}
