/**
 * Formatting Utilities
 * Common formatting functions for currency, dates, and numbers
 */

// Currency codes and symbols
export const CURRENCY_SYMBOLS: Record<string, string> = {
  SAR: 'ر.س',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'د.إ',
  KWD: 'د.ك',
  BHD: 'د.ب',
  QAR: 'ر.ق',
  OMR: 'ر.ع',
  JOD: 'د.أ',
  EGP: 'ج.م',
  LBP: 'ل.ل',
  SYP: 'ل.س',
  IQD: 'د.ع',
  YER: 'ر.ي',
  TND: 'د.ت',
  MAD: 'د.م',
  DZD: 'د.ج',
  SDG: 'ج.س',
  LYD: 'د.ل',
};

// Locale mappings
export const LOCALES: Record<string, string> = {
  ar: 'ar-SA',
  en: 'en-US',
};

/**
 * Format currency with proper symbol and locale
 */
export function formatCurrency(
  amount: number | undefined | null,
  currency: string = 'SAR',
  locale: string = 'ar'
): string {
  if (amount === undefined || amount === null) {
    return '-';
  }

  const localeCode = LOCALES[locale] || locale;
  
  try {
    // Try native Intl.NumberFormat first
    return new Intl.NumberFormat(localeCode, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback for unsupported currencies
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    const formattedNumber = new Intl.NumberFormat(localeCode, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));
    
    const sign = amount < 0 ? '-' : '';
    return locale === 'ar' 
      ? `${sign}${formattedNumber} ${symbol}`
      : `${sign}${symbol}${formattedNumber}`;
  }
}

/**
 * Format number with locale-aware separators
 */
export function formatNumber(
  value: number | undefined | null,
  options?: {
    decimals?: number;
    locale?: string;
    showSign?: boolean;
  }
): string {
  if (value === undefined || value === null) {
    return '-';
  }

  const { decimals = 2, locale = 'ar', showSign = false } = options || {};
  const localeCode = LOCALES[locale] || locale;
  
  const formatted = new Intl.NumberFormat(localeCode, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    signDisplay: showSign ? 'exceptZero' : 'auto',
  }).format(value);

  return formatted;
}

/**
 * Format percentage
 */
export function formatPercentage(
  value: number | undefined | null,
  decimals: number = 1,
  locale: string = 'ar'
): string {
  if (value === undefined || value === null) {
    return '-';
  }

  const localeCode = LOCALES[locale] || locale;
  
  return new Intl.NumberFormat(localeCode, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

/**
 * Format date with locale support
 */
export function formatDate(
  date: string | Date | undefined | null,
  locale: string = 'ar',
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) {
    return '-';
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '-';
  }

  const localeCode = LOCALES[locale] || locale;
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  return new Intl.DateTimeFormat(localeCode, options || defaultOptions).format(dateObj);
}

/**
 * Format date and time
 */
export function formatDateTime(
  date: string | Date | undefined | null,
  locale: string = 'ar'
): string {
  if (!date) {
    return '-';
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '-';
  }

  const localeCode = LOCALES[locale] || locale;
  
  return new Intl.DateTimeFormat(localeCode, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(
  date: string | Date | undefined | null,
  locale: string = 'ar'
): string {
  if (!date) {
    return '-';
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '-';
  }

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  const localeCode = LOCALES[locale] || locale;
  const rtf = new Intl.RelativeTimeFormat(localeCode, { numeric: 'auto' });

  if (diffYears > 0) return rtf.format(-diffYears, 'year');
  if (diffMonths > 0) return rtf.format(-diffMonths, 'month');
  if (diffWeeks > 0) return rtf.format(-diffWeeks, 'week');
  if (diffDays > 0) return rtf.format(-diffDays, 'day');
  if (diffHours > 0) return rtf.format(-diffHours, 'hour');
  if (diffMins > 0) return rtf.format(-diffMins, 'minute');
  return rtf.format(-diffSecs, 'second');
}

/**
 * Parse currency string back to number
 */
export function parseCurrency(value: string): number {
  // Remove all non-numeric characters except decimal separator
  const cleaned = value.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Format phone number
 */
export function formatPhone(phone: string | undefined | null, countryCode: string = '+966'): string {
  if (!phone) return '-';
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Format Saudi number
  if (digits.length === 9 && digits.startsWith('5')) {
    return `${countryCode} ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  }
  
  // Format with country code
  if (digits.length === 12 && digits.startsWith('966')) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  
  return phone;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number, locale: string = 'ar'): string {
  const units = locale === 'ar' 
    ? ['بايت', 'كيلوبايت', 'ميغابايت', 'غيغابايت']
    : ['B', 'KB', 'MB', 'GB'];
  
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${formatNumber(size, { decimals: 1, locale })} ${units[unitIndex]}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string | undefined | null, maxLength: number = 50): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Format account code with hierarchy
 */
export function formatAccountCode(code: string, separator: string = '-'): string {
  if (!code) return '';
  
  // Format as 1-100-1001 style
  const parts = code.match(/.{1,2}/g) || [];
  return parts.join(separator);
}

/**
 * Convert Arabic numbers to English
 */
export function arabicToEnglish(str: string): string {
  const arabicNumerals = '٠١٢٣٤٥٦٧٨٩';
  return str.replace(/[٠-٩]/g, (d) => arabicNumerals.indexOf(d).toString());
}

/**
 * Convert English numbers to Arabic
 */
export function englishToArabic(str: string): string {
  const arabicNumerals = '٠١٢٣٤٥٦٧٨٩';
  return str.replace(/[0-9]/g, (d) => arabicNumerals[parseInt(d)]);
}

export default {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  parseCurrency,
  formatPhone,
  formatFileSize,
  truncateText,
  formatAccountCode,
  arabicToEnglish,
  englishToArabic,
};
