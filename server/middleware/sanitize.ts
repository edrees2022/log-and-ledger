import { Request, Response, NextFunction } from 'express';
import { sanitizeObject, hasSQLInjection } from '../utils/sanitization';
import { badRequest, serverError } from '../utils/sendError';

/**
 * Middleware to sanitize all incoming request data
 */
export function sanitizeMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // Sanitize body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
      
      // Check for SQL injection attempts - DISABLED
      // We use Drizzle ORM which uses parameterized queries, so we are safe from SQLi.
      // This regex-based check was too aggressive (blocking words like "SELECT", "UPDATE" in descriptions).
      /*
      const bodyStr = JSON.stringify(req.body);
      if (hasSQLInjection(bodyStr)) {
        badRequest(res, 'Invalid input detected. Please check your data.');
        return;
      }
      */
    }
    
    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query as Record<string, any>);
    }
    
    // Sanitize params
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params);
    }
    
    next();
  } catch (error) {
    console.error('Sanitization error:', error);
    serverError(res, 'Request processing error');
    return;
  }
}
