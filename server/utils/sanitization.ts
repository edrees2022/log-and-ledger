/**
 * Input Sanitization & Validation Utilities
 * Protects against XSS, SQL Injection, and malicious input
 */

/**
 * Sanitize string input - remove dangerous characters
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove <script> tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove <iframe> tags
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove inline event handlers
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .trim();
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  
  const cleaned = email.toLowerCase().trim();
  
  // Basic email validation regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  return emailRegex.test(cleaned) ? cleaned : '';
}

/**
 * Sanitize phone number - keep only digits and + sign
 */
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return '';
  
  return phone.replace(/[^0-9+\-() ]/g, '').trim();
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(input: any): number | null {
  if (input === null || input === undefined || input === '') return null;
  
  const num = parseFloat(String(input).replace(/[^0-9.-]/g, ''));
  
  return isNaN(num) ? null : num;
}

/**
 * Sanitize object - recursively sanitize all string values
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = {} as T;
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value) as any;
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[key] = sanitizeObject(value);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map((item: any) => 
          typeof item === 'string' ? sanitizeString(item) : item
        ) as any;
      } else {
        sanitized[key] = value;
      }
    }
  }
  
  return sanitized;
}

/**
 * Validate and sanitize decimal amount
 */
export function sanitizeAmount(amount: any): string {
  const num = sanitizeNumber(amount);
  
  if (num === null || num < 0) return '0';
  
  return num.toFixed(2);
}

/**
 * Validate and sanitize date
 */
export function sanitizeDate(date: any): Date | null {
  if (!date) return null;
  
  const parsed = new Date(date);
  
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Sanitize URL - only allow http/https protocols
 */
export function sanitizeURL(url: string): string {
  if (!url || typeof url !== 'string') return '';
  
  const cleaned = url.trim();
  
  if (!cleaned.match(/^https?:\/\//i)) {
    return '';
  }
  
  return cleaned;
}

/**
 * Rate limiting helper - check if action is allowed
 */
export function isRateLimited(
  key: string,
  maxAttempts: number,
  windowMs: number,
  storage: Map<string, { count: number; resetTime: number }>
): boolean {
  const now = Date.now();
  const record = storage.get(key);
  
  if (!record || now > record.resetTime) {
    storage.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return false;
  }
  
  if (record.count >= maxAttempts) {
    return true;
  }
  
  record.count++;
  storage.set(key, record);
  return false;
}

/**
 * Validate SQL injection patterns
 */
export function hasSQLInjection(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(UNION.*SELECT)/gi,
    /(\bOR\b.*=.*)/gi,
    /(--|;|\/\*|\*\/)/g,
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Validate file upload
 */
export function validateFileUpload(
  filename: string,
  fileSize: number,
  allowedExtensions: string[] = ['pdf', 'jpg', 'jpeg', 'png', 'xlsx', 'csv'],
  maxSizeBytes: number = 10 * 1024 * 1024 // 10MB default
): { valid: boolean; error?: string } {
  // Check file size
  if (fileSize > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSizeBytes / (1024 * 1024)}MB`,
    };
  }
  
  // Check file extension
  const ext = filename.split('.').pop()?.toLowerCase();
  
  if (!ext || !allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `File type .${ext} is not allowed. Allowed types: ${allowedExtensions.join(', ')}`,
    };
  }
  
  // Check for double extensions (e.g., file.php.jpg)
  const parts = filename.split('.');
  if (parts.length > 2) {
    return {
      valid: false,
      error: 'Files with multiple extensions are not allowed',
    };
  }
  
  return { valid: true };
}

/**
 * Generate safe filename
 */
export function generateSafeFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const ext = originalFilename.split('.').pop()?.toLowerCase();
  const safeName = originalFilename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .substring(0, 50);
  
  return `${timestamp}-${safeName}`;
}
