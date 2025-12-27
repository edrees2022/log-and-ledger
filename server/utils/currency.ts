import { db } from "../db";
import { currencies, exchange_rates, companies } from "@shared/schema";
import { eq, and, desc, lte } from "drizzle-orm";

/**
 * Seed default currencies
 */
export async function seedCurrencies() {
  const defaultCurrencies = [
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "SAR", name: "Saudi Riyal", symbol: "SAR" },
    { code: "AED", name: "UAE Dirham", symbol: "AED" },
    { code: "KWD", name: "Kuwaiti Dinar", symbol: "KWD" },
    { code: "QAR", name: "Qatari Riyal", symbol: "QAR" },
    { code: "BHD", name: "Bahraini Dinar", symbol: "BHD" },
    { code: "OMR", name: "Omani Rial", symbol: "OMR" },
    { code: "JOD", name: "Jordanian Dinar", symbol: "JOD" },
    { code: "EGP", name: "Egyptian Pound", symbol: "EGP" },
    { code: "TRY", name: "Turkish Lira", symbol: "₺" },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
    { code: "AUD", name: "Australian Dollar", symbol: "A$" },
    { code: "JPY", name: "Japanese Yen", symbol: "¥" },
    { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
    { code: "INR", name: "Indian Rupee", symbol: "₹" },
  ];

  for (const currency of defaultCurrencies) {
    await db
      .insert(currencies)
      .values(currency)
      .onConflictDoNothing()
      .execute();
  }
}

/**
 * Get exchange rate for a specific date
 * If no exact match, gets the latest rate before or on that date
 */
export async function getExchangeRate(
  companyId: string,
  fromCurrency: string,
  toCurrency: string,
  date: Date = new Date()
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return 1;
  }

  // Try to find direct rate
  const rate = await db
    .select()
    .from(exchange_rates)
    .where(
      and(
        eq(exchange_rates.company_id, companyId),
        eq(exchange_rates.from_currency, fromCurrency),
        eq(exchange_rates.to_currency, toCurrency),
        lte(exchange_rates.date, date)
      )
    )
    .orderBy(desc(exchange_rates.date))
    .limit(1);

  if (rate.length > 0) {
    return parseFloat(rate[0].rate);
  }

  // Try to find inverse rate
  const inverseRate = await db
    .select()
    .from(exchange_rates)
    .where(
      and(
        eq(exchange_rates.company_id, companyId),
        eq(exchange_rates.from_currency, toCurrency),
        eq(exchange_rates.to_currency, fromCurrency),
        lte(exchange_rates.date, date)
      )
    )
    .orderBy(desc(exchange_rates.date))
    .limit(1);

  if (inverseRate.length > 0) {
    return 1 / parseFloat(inverseRate[0].rate);
  }

  // If no rate found, return 1 (assuming 1:1 if not defined, or throw error)
  // For now, we'll return 1 but log a warning
  console.warn(`No exchange rate found for ${fromCurrency} -> ${toCurrency} on ${date}`);
  return 1;
}

/**
 * Fetch live exchange rate from external API
 */
export async function fetchLiveExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
  try {
    const response = await fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch rates: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (data.result !== "success") {
      throw new Error("Failed to fetch rates from API");
    }

    const rate = data.rates[toCurrency];
    if (!rate) {
      throw new Error(`Rate for ${toCurrency} not found`);
    }

    return rate;
  } catch (error) {
    console.error("Error fetching live rate:", error);
    throw error;
  }
}

/**
 * Convert amount between currencies
 */
export async function convertCurrency(
  companyId: string,
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  date: Date = new Date()
): Promise<number> {
  const rate = await getExchangeRate(companyId, fromCurrency, toCurrency, date);
  return amount * rate;
}

/**
 * Get company base currency
 */
export async function getCompanyBaseCurrency(companyId: string): Promise<string> {
  const company = await db
    .select({ base_currency: companies.base_currency })
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1);

  return company[0]?.base_currency || "USD";
}
