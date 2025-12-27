/**
 * Pagination utilities for API endpoints
 * Supports cursor-based and offset-based pagination
 */

import type { Request } from 'express';

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CursorPaginatedResponse<T> {
  data: T[];
  pagination: {
    cursor: string | null;
    nextCursor: string | null;
    limit: number;
    hasMore: boolean;
  };
}

// Default and max limits for different entity types
export const PAGINATION_LIMITS = {
  default: 25,
  max: 100,
  invoices: 50,
  bills: 50,
  journals: 100,
  auditLogs: 200,
  contacts: 100,
  items: 100,
  accounts: 200, // Usually need all at once for dropdowns
} as const;

/**
 * Parse pagination parameters from request query
 */
export function parsePaginationParams(
  req: Request, 
  entityType: keyof typeof PAGINATION_LIMITS = 'default'
): PaginationParams {
  const maxLimit = PAGINATION_LIMITS[entityType] || PAGINATION_LIMITS.default;
  
  // Parse page (1-indexed)
  let page = parseInt(req.query.page as string, 10);
  if (isNaN(page) || page < 1) page = 1;
  
  // Parse limit with entity-specific max
  let limit = parseInt(req.query.limit as string, 10);
  if (isNaN(limit) || limit < 1) limit = PAGINATION_LIMITS.default;
  if (limit > maxLimit) limit = maxLimit;
  
  // Calculate offset
  const offset = (page - 1) * limit;
  
  // Parse sort parameters
  const sortBy = (req.query.sortBy as string) || 'created_at';
  const sortOrderParam = (req.query.sortOrder as string || '').toLowerCase();
  const sortOrder: 'asc' | 'desc' = sortOrderParam === 'asc' ? 'asc' : 'desc';
  
  return { page, limit, offset, sortBy, sortOrder };
}

/**
 * Create paginated response object
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / params.limit);
  
  return {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages,
      hasNext: params.page < totalPages,
      hasPrev: params.page > 1,
    },
  };
}

/**
 * Create cursor-based paginated response
 * Better for large datasets and real-time data
 */
export function createCursorPaginatedResponse<T extends { id: string }>(
  data: T[],
  limit: number,
  hasMore: boolean,
  cursor: string | null = null
): CursorPaginatedResponse<T> {
  const nextCursor = hasMore && data.length > 0 
    ? data[data.length - 1].id 
    : null;
  
  return {
    data,
    pagination: {
      cursor,
      nextCursor,
      limit,
      hasMore,
    },
  };
}

/**
 * SQL helper for pagination with Drizzle
 */
export function getPaginationSQL(params: PaginationParams) {
  return {
    limit: params.limit,
    offset: params.offset,
  };
}

/**
 * Parse cursor from request for cursor-based pagination
 */
export function parseCursor(req: Request): string | null {
  const cursor = req.query.cursor as string;
  return cursor || null;
}

/**
 * Count query helper - wrap around a select query
 */
export async function getCount(
  countQuery: Promise<{ count: number | string }[]>
): Promise<number> {
  const result = await countQuery;
  return parseInt(result[0]?.count?.toString() || '0', 10);
}
