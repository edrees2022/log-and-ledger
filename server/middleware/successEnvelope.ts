import { Request, Response, NextFunction } from 'express';

// Middleware to standardize successful JSON responses to { data: ... }
// - Wraps any 2xx res.json(body) into { data: body }
// - Skips wrapping when body already has a top-level `data`
// - Skips wrapping for simple acknowledgements: { success: true }
// - Never touches non-2xx responses (errors handled elsewhere)
/**
 * successEnvelopeMiddleware
 *
 * Purpose:
 *  - Standardize all successful JSON responses into a predictable envelope.
 *  - For any 2xx response, wraps the payload as: { data: <payload> }.
 *
 * Behavior:
 *  - Only affects 2xx responses (statusCode in [200..299]).
 *  - Skips wrapping if:
 *      1) The body already has a top-level `data` property.
 *      2) The body is a simple acknowledgement: { success: true } (e.g., for DELETE).
 *      3) The body is an error shape (has top-level `error`).
 *  - Never touches non-2xx responses; error middleware handles those uniformly.
 *
 * Notes:
 *  - This middleware pairs with the client request layer which auto-unwraps { data }.
 *  - See API_RESPONSE_CONTRACT.md for examples and guidelines.
 */
export function successEnvelopeMiddleware(_req: Request, res: Response, next: NextFunction) {
  const originalJson = res.json.bind(res);
  (res as any).json = (body?: any) => {
    try {
      const status = res.statusCode || 200;
      const isSuccess = status >= 200 && status < 300;
      if (!isSuccess) {
        return originalJson(body);
      }

      // Avoid double-wrapping
      const isObject = body !== null && typeof body === 'object';
      const hasData = isObject && Object.prototype.hasOwnProperty.call(body, 'data');
      const isSuccessAck = isObject && Object.keys(body).length === 1 && (body as any).success === true;
      const isErrorShape = isObject && Object.prototype.hasOwnProperty.call(body, 'error');

      if (hasData || isSuccessAck || isErrorShape) {
        return originalJson(body);
      }

      return originalJson({ data: body });
    } catch {
      // If anything goes wrong, fall back to original body
      return originalJson(body);
    }
  };

  next();
}
