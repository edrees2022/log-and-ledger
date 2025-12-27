import { db } from "../db";
import { accounts, ai_providers } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { callAIProvider } from "./aiProviders";

export async function draftJournalFromText(
  companyId: string,
  text: string,
  date: Date = new Date()
) {
  try {
    // Fetch active AI provider
    const providers = await db.select().from(ai_providers).where(eq(ai_providers.company_id, companyId));
    const activeProvider = providers[0];

    if (!activeProvider || !activeProvider.api_key) {
      throw new Error('No AI provider configured');
    }

    // Fetch Chart of Accounts context
    const allAccounts = await db.select({ 
      id: accounts.id, 
      name: accounts.name, 
      code: accounts.code,
      type: accounts.account_type 
    })
      .from(accounts)
      .where(eq(accounts.company_id, companyId));

    const accountsContext = allAccounts.map(a => `${a.code} - ${a.name} (${a.type})`).join('\n');

    const prompt = `
      You are an expert accountant. Create a balanced journal entry from this description:
      "${text}"
      
      Date: ${date.toISOString().split('T')[0]}
      
      Available Accounts:
      ${accountsContext}
      
      Rules:
      1. Total Debit must equal Total Credit.
      2. Use ONLY the provided accounts. If no exact match, pick the closest one.
      3. Return JSON only.
      
      Output Format:
      {
        "description": "Brief description of the transaction",
        "lines": [
          { "account_code": "CODE", "debit": 100.00, "credit": 0, "description": "Line description" },
          { "account_code": "CODE", "debit": 0, "credit": 100.00, "description": "Line description" }
        ],
        "warnings": ["Any assumptions made"]
      }
    `;

    const response = await callAIProvider({
      provider: (activeProvider.provider || 'openai').toLowerCase() as any,
      model: activeProvider.default_model || 'gpt-4o-mini',
      apiKey: activeProvider.api_key,
      baseUrl: activeProvider.base_url || undefined
    }, [{ role: 'user', content: prompt }]);

    if (response.content) {
      try {
        const json = JSON.parse(response.content.replace(/```json|```/g, '').trim());
        
        // Map codes back to IDs
        const lines = json.lines.map((l: any) => {
          const acc = allAccounts.find(a => a.code === l.account_code);
          return {
            ...l,
            account_id: acc?.id,
            account_name: acc?.name
          };
        });

        return {
          description: json.description,
          lines,
          warnings: json.warnings
        };
      } catch (e) {
        console.warn('Failed to parse AI journal draft', e);
        throw new Error('Failed to parse AI response');
      }
    }
  } catch (e) {
    console.error('AI journal drafting failed', e);
    throw e;
  }

  return null;
}
