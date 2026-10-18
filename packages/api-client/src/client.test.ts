import { AppError } from '@urbanpetly/shared';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { ApiClient, buildQueryString } from './client.js';

const json = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

describe('buildQueryString', () => {
  it('returns an empty string when there is nothing to send', () => {
    expect(buildQueryString(undefined)).toBe('');
    expect(buildQueryString({ q: undefined, city: null, locality: '' })).toBe('');
  });

  it('serialises the params that have a value', () => {
    expect(buildQueryString({ city: 'delhi', page: 2, verified: true })).toBe(
      '?city=delhi&page=2&verified=true',
    );
  });
});

describe('ApiClient', () => {
  it('calls the base URL with the path and query', async () => {
    const fetchFn = vi.fn<typeof fetch>(async () =>
      json({ data: [], meta: { page: 1, pageSize: 20, total: 0 } }),
    );
    const client = new ApiClient({ baseUrl: 'https://api.test/api/v1/', fetchFn });

    await client.get('/providers', { query: { city: 'delhi' } });

    expect(fetchFn).toHaveBeenCalledOnce();
    expect(fetchFn.mock.calls[0]?.[0]).toBe('https://api.test/api/v1/providers?city=delhi');
  });

  it('sends the bearer token when one is available', async () => {
    const fetchFn = vi.fn<typeof fetch>(async () => json({ ok: true }));
    const client = new ApiClient({
      baseUrl: 'https://api.test/api/v1',
      getAccessToken: () => 'token-123',
      fetchFn,
    });

    await client.get('/me');

    const init = fetchFn.mock.calls[0]?.[1] as RequestInit;
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer token-123');
  });

  it('omits the Authorization header for anonymous callers', async () => {
    const fetchFn = vi.fn<typeof fetch>(async () => json({ ok: true }));
    const client = new ApiClient({ baseUrl: 'https://api.test/api/v1', fetchFn });

    await client.get('/providers');

    const init = fetchFn.mock.calls[0]?.[1] as RequestInit;
    expect((init.headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it('validates the response against the given schema', async () => {
    const fetchFn = vi.fn<typeof fetch>(async () => json({ slug: 'happy-paws' }));
    const client = new ApiClient({ baseUrl: 'https://api.test/api/v1', fetchFn });

    const provider = await client.get('/providers/happy-paws', {
      schema: z.object({ slug: z.string() }),
    });

    expect(provider.slug).toBe('happy-paws');
  });

  it('returns undefined for 204 responses', async () => {
    const fetchFn = vi.fn<typeof fetch>(async () => new Response(null, { status: 204 }));
    const client = new ApiClient({ baseUrl: 'https://api.test/api/v1', fetchFn });

    await expect(
      client.post('/auth/otp/request', { phone: '9999999999' }),
    ).resolves.toBeUndefined();
  });

  it('turns a contract error envelope into an AppError', async () => {
    const fetchFn = vi.fn<typeof fetch>(async () =>
      json({ error: { code: 'NOT_FOUND', message: 'No such provider' } }, { status: 404 }),
    );
    const client = new ApiClient({ baseUrl: 'https://api.test/api/v1', fetchFn });

    await expect(client.get('/providers/nope')).rejects.toMatchObject({
      code: 'NOT_FOUND',
      status: 404,
      message: 'No such provider',
    });
  });

  it('falls back to a status-derived code when the body is not an envelope', async () => {
    const fetchFn = vi.fn<typeof fetch>(
      async () => new Response('gateway blew up', { status: 502 }),
    );
    const client = new ApiClient({ baseUrl: 'https://api.test/api/v1', fetchFn });

    const error = await client.get('/providers').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).code).toBe('INTERNAL');
  });
});
