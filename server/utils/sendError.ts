import type { Response } from 'express';

export function sendError(
  res: Response,
  status: number,
  error: string | Error,
  extras?: Record<string, unknown>
) {
  const message = typeof error === 'string' ? error : (error?.message || 'Error');
  const errText = typeof error === 'string' ? error : message;
  return res.status(status).json({ error: errText, message, ...(extras || {}) });
}

export const badRequest = (res: Response, error: string | Error, extras?: Record<string, unknown>) =>
  sendError(res, 400, error, extras);
export const unauthorized = (res: Response, error: string | Error, extras?: Record<string, unknown>) =>
  sendError(res, 401, error, extras);
export const forbidden = (res: Response, error: string | Error, extras?: Record<string, unknown>) =>
  sendError(res, 403, error, extras);
export const notFound = (res: Response, error: string | Error, extras?: Record<string, unknown>) =>
  sendError(res, 404, error, extras);
export const serverError = (res: Response, error: string | Error, extras?: Record<string, unknown>) =>
  sendError(res, 500, error, extras);
