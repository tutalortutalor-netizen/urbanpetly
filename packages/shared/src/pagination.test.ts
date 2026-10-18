import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  offsetFor,
  paginated,
  paginationQuerySchema,
} from './pagination.js';

describe('paginationQuerySchema', () => {
  it('applies defaults when the query is empty', () => {
    expect(paginationQuerySchema.parse({})).toEqual({ page: 1, pageSize: DEFAULT_PAGE_SIZE });
  });

  it('coerces string query params', () => {
    expect(paginationQuerySchema.parse({ page: '3', pageSize: '10' })).toEqual({
      page: 3,
      pageSize: 10,
    });
  });

  it('rejects a page size above the contract maximum', () => {
    expect(paginationQuerySchema.safeParse({ pageSize: MAX_PAGE_SIZE + 1 }).success).toBe(false);
  });

  it('rejects a zero or negative page', () => {
    expect(paginationQuerySchema.safeParse({ page: 0 }).success).toBe(false);
  });
});

describe('offsetFor', () => {
  it('is zero on the first page', () => {
    expect(offsetFor({ page: 1, pageSize: 20 })).toBe(0);
  });

  it('skips whole pages', () => {
    expect(offsetFor({ page: 4, pageSize: 25 })).toBe(75);
  });
});

describe('paginated', () => {
  it('wraps rows in the response envelope', () => {
    expect(paginated(['a'], { page: 1, pageSize: 20, total: 1 })).toEqual({
      data: ['a'],
      meta: { page: 1, pageSize: 20, total: 1 },
    });
  });
});
