import { AppError } from '@urbanpetly/shared';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { API_PREFIX, buildApp } from '../../app.js';
import { parseEnv } from '../../config/env.js';
import { healthResponseSchema } from './routes.js';

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp({ env: parseEnv({ NODE_ENV: 'test' }), logger: false });
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe(`GET ${API_PREFIX}/health`, () => {
  it('returns 200 with the liveness payload', async () => {
    const response = await app.inject({ method: 'GET', url: `${API_PREFIX}/health` });

    expect(response.statusCode).toBe(200);
    expect(healthResponseSchema.parse(response.json())).toMatchObject({ status: 'ok' });
  });

  it('is reachable without authentication', async () => {
    const response = await app.inject({ method: 'GET', url: `${API_PREFIX}/health` });

    expect(response.statusCode).not.toBe(401);
  });
});

describe('error handling', () => {
  it('returns the contract error envelope for unknown routes', async () => {
    const response = await app.inject({ method: 'GET', url: `${API_PREFIX}/nope` });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: { code: 'NOT_FOUND', message: expect.stringContaining('/nope') },
    });
  });

  it('maps a thrown AppError to its status and code', async () => {
    const isolated = await buildApp({ env: parseEnv({ NODE_ENV: 'test' }), logger: false });
    isolated.get('/boom', async () => {
      throw new AppError('BUSINESS_RULE', 'Request already completed');
    });
    await isolated.ready();

    const response = await isolated.inject({ method: 'GET', url: '/boom' });

    expect(response.statusCode).toBe(422);
    expect(response.json()).toEqual({
      error: { code: 'BUSINESS_RULE', message: 'Request already completed' },
    });

    await isolated.close();
  });

  it('hides internal details behind a generic 500', async () => {
    const isolated = await buildApp({ env: parseEnv({ NODE_ENV: 'test' }), logger: false });
    isolated.get('/kaboom', async () => {
      throw new Error('connection string mysql://user:pw@db');
    });
    await isolated.ready();

    const response = await isolated.inject({ method: 'GET', url: '/kaboom' });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({
      error: { code: 'INTERNAL', message: 'Internal server error' },
    });

    await isolated.close();
  });
});

describe('security headers', () => {
  it('sets the helmet defaults', async () => {
    const response = await app.inject({ method: 'GET', url: `${API_PREFIX}/health` });

    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });
});
