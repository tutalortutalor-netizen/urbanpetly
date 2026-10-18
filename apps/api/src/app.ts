import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { AppError, type ErrorResponse } from '@urbanpetly/shared';
import Fastify, { type FastifyInstance } from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { ZodError } from 'zod';

import { parseEnv, type Env } from './config/env.js';
import { healthRoutes } from './modules/health/routes.js';

export const API_PREFIX = '/api/v1';

export interface BuildAppOptions {
  /** Overrides for tests; anything omitted comes from `process.env`. */
  env?: Env;
  /** Set to false in tests to keep the output readable. */
  logger?: boolean;
}

/**
 * Builds the Fastify instance. `server.ts` listens on it; tests drive it with
 * `app.inject()` so no port is ever bound (docs/07-test-plan.md).
 */
export async function buildApp(options: BuildAppOptions = {}): Promise<FastifyInstance> {
  const env = options.env ?? parseEnv();

  const app = Fastify({
    logger: options.logger === false ? false : { level: env.LOG_LEVEL },
    genReqId: () => crypto.randomUUID(),
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.decorate('env', env);

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, {
    origin: env.CORS_ORIGINS.length > 0 ? env.CORS_ORIGINS : false,
    credentials: true,
  });

  app.setErrorHandler((error, request, reply) => {
    const appError = toAppError(error);

    if (appError.status >= 500) {
      request.log.error({ err: error }, 'unhandled error');
    } else {
      request.log.info({ code: appError.code }, 'request rejected');
    }

    reply.status(appError.status).send(appError.toResponse());
  });

  app.setNotFoundHandler((request, reply) => {
    const body: ErrorResponse = {
      error: { code: 'NOT_FOUND', message: `Route ${request.method} ${request.url} not found` },
    };
    reply.status(404).send(body);
  });

  await app.register(healthRoutes, { prefix: API_PREFIX });

  return app;
}

/** Normalise anything thrown in a route into the shared error vocabulary. */
function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (error instanceof ZodError) {
    return new AppError('VALIDATION_ERROR', 'Request validation failed', error.issues);
  }

  if (typeof error === 'object' && error !== null && 'statusCode' in error) {
    const { statusCode, message } = error as { statusCode?: number; message?: string };
    if (statusCode === 429) return new AppError('RATE_LIMITED', message ?? 'Too many requests');
    if (statusCode === 400) return new AppError('VALIDATION_ERROR', message ?? 'Bad request');
    if (statusCode === 401) return new AppError('UNAUTHENTICATED', message ?? 'Unauthenticated');
    if (statusCode === 403) return new AppError('FORBIDDEN', message ?? 'Forbidden');
    if (statusCode === 404) return new AppError('NOT_FOUND', message ?? 'Not found');
  }

  // Never leak internals to the client; the stack is in the log line above.
  return new AppError('INTERNAL', 'Internal server error');
}

declare module 'fastify' {
  interface FastifyInstance {
    env: Env;
  }
}
