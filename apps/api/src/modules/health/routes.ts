import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

export const healthResponseSchema = z.object({
  status: z.literal('ok'),
  uptimeSeconds: z.number().nonnegative(),
  version: z.string(),
});

/**
 * Liveness only: it must not touch the database or any other dependency, so an
 * overloaded dependency cannot make the orchestrator restart a healthy process.
 * Readiness (`/ready`, with a DB check) lands with E12-S4.
 */
export async function healthRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/health',
    {
      schema: {
        response: { 200: healthResponseSchema },
      },
    },
    async () => ({
      status: 'ok' as const,
      uptimeSeconds: Math.round(process.uptime()),
      version: process.env.APP_VERSION ?? 'dev',
    }),
  );
}
