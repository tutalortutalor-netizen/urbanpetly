import { z } from 'zod';

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 50;

/** `?page=1&pageSize=20` - see docs/04-api-contract.md "Conventions". */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export const paginationMetaSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1).max(MAX_PAGE_SIZE),
  total: z.number().int().min(0),
});

export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

/** Wrap a page of rows in the response envelope the API contract defines. */
export function paginated<T>(data: T[], meta: PaginationMeta): Paginated<T> {
  return { data, meta };
}

/** SQL OFFSET for a 1-based page. */
export function offsetFor({ page, pageSize }: PaginationQuery): number {
  return (page - 1) * pageSize;
}
