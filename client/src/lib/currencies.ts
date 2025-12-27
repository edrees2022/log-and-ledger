// Comprehensive list of currency codes - single source of truth
export const CURRENCY_CODES = [
  // Major World Currencies
  'USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'NZD',
  
  // Arabic & Middle Eastern Currencies
  'AED', 'SAR', 'EGP', 'SYP', 'LBP', 'IQD', 'JOD', 'KWD', 
  'QAR', 'BHD', 'OMR', 'YER', 'MAD', 'DZD', 'TND', 'LYD', 
  'SDG', 'ILS', 'IRR', 'TRY',
  
  // Asian Currencies
  'PHP', 'CNY', 'KRW', 'INR', 'IDR', 'THB', 'MYR', 'SGD', 
  'VND', 'BDT', 'PKR', 'LKR', 'MMK', 'KHR', 'LAK', 'NPR', 
  'BTN', 'MNT', 'KZT', 'UZS', 'TJS', 'KGS', 'TMT', 'AFN',
  
  // European Currencies
  'NOK', 'SEK', 'DKK', 'ISK', 'PLN', 'CZK', 'HUF', 'RON', 
  'BGN', 'HRK', 'RSD', 'BAM', 'MKD', 'ALL', 'MDL', 'UAH', 
  'BYN', 'RUB',
  
  // African Currencies
  'ZAR', 'NGN', 'GHS', 'KES', 'UGX', 'TZS', 'ETB', 'RWF', 
  'XOF', 'XAF', 'MZN', 'BWP', 'NAD', 'SZL', 'LSL',
  
  // American Currencies
  'MXN', 'BRL', 'ARS', 'CLP', 'COP', 'PEN', 'UYU', 'PYG', 
  'BOB', 'VED', 'GYD', 'SRD'
];

/**
 * Maps currency codes to objects with code and translated name
 * @param t - Translation function from react-i18next
 * @param ns - Translation namespace (default: 'currencies')
 * @returns Array of currency objects with code and name
 */
export function mapCurrencies(t: any, ns: string = 'currencies') {
  return CURRENCY_CODES.map(code => ({
    code,
    name: t(`${ns}.${code}`, { defaultValue: code })
  }));
}

/**
 * Sort currencies by name alphabetically
 * @param currencies - Array of currency objects
 * @returns Sorted array of currencies
 */
export function sortByName(currencies: { code: string; name: string }[]) {
  return [...currencies].sort((a, b) => a.name.localeCompare(b.name));
}