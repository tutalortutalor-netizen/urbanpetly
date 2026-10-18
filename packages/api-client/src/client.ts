import { AppError, errorResponseSchema, type ErrorCode } from '@urbanpetly/shared';
import type { z } from 'zod';

export interface ApiClientOptions {
  /** Base URL of the API, including the version prefix, e.g. `https://api.urbanpetly.com/api/v1`. */
  baseUrl: string;
  /** Returns the current access token, or null when the user is anonymous. */
  getAccessToken?: () => string | null | undefined;
  /** Injectable for tests. Defaults to the global `fetch`. */
  fetchFn?: typeof fetch;
}

export interface RequestOptions<TResponse> {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  /** Query params; `undefined` and `null` values are dropped. */
  query?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;
  /** Zod schema the response body is parsed with, so callers get validated data. */
  schema?: z.ZodType<TResponse>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

/** Drop empty params so URLs stay canonical and cacheable. */
export function buildQueryString(query: RequestOptions<unknown>['query']): string {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Thin typed wrapper around `fetch`. Every non-2xx response is turned into an
 * `AppError` so UI code has one error type to handle, whatever went wrong.
 */
export class ApiClient {
  readonly #baseUrl: string;
  readonly #getAccessToken: () => string | null | undefined;
  readonly #fetch: typeof fetch;

  constructor(options: ApiClientOptions) {
    this.#baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.#getAccessToken = options.getAccessToken ?? (() => null);
    this.#fetch = options.fetchFn ?? globalThis.fetch.bind(globalThis);
  }

  async request<TResponse>(path: string, options: RequestOptions<TResponse> = {}) {
    const { method = 'GET', query, body, schema, headers = {}, signal } = options;
    const token = this.#getAccessToken();

    const response = await this.#fetch(`${this.#baseUrl}${path}${buildQueryString(query)}`, {
      method,
      credentials: 'include',
      signal: signal ?? null,
      headers: {
        Accept: 'application/json',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });

    if (!response.ok) throw await toAppError(response);
    if (response.status === 204) return undefined as TResponse;

    const payload: unknown = await response.json();
    return schema ? schema.parse(payload) : (payload as TResponse);
  }

  get<T>(path: string, options: Omit<RequestOptions<T>, 'method' | 'body'> = {}) {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  post<T>(path: string, body?: unknown, options: Omit<RequestOptions<T>, 'method'> = {}) {
    return this.request<T>(path, { ...options, method: 'POST', body });
  }

  patch<T>(path: string, body?: unknown, options: Omit<RequestOptions<T>, 'method'> = {}) {
    return this.request<T>(path, { ...options, method: 'PATCH', body });
  }

  delete<T>(path: string, options: Omit<RequestOptions<T>, 'method' | 'body'> = {}) {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}

/** Status codes we fall back to when the body is not a contract error envelope. */
const STATUS_FALLBACK: Record<number, ErrorCode> = {
  400: 'VALIDATION_ERROR',
  401: 'UNAUTHENTICATED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'BUSINESS_RULE',
  429: 'RATE_LIMITED',
};

async function toAppError(response: Response): Promise<AppError> {
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = undefined;
  }

  const parsed = errorResponseSchema.safeParse(payload);
  if (parsed.success) {
    const { code, message, details } = parsed.data.error;
    return new AppError(code, message, details);
  }

  const code = STATUS_FALLBACK[response.status] ?? 'INTERNAL';
  return new AppError(code, response.statusText || 'Request failed');
}
