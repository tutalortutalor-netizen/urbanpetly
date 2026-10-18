import { z } from 'zod';

/** `a, b ,c` -> `['a','b','c']`, with a fallback used when the variable is unset. */
const commaSeparated = (fallback: string) =>
  z
    .string()
    .default(fallback)
    .transform((value) =>
      value
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean),
    );

const DEFAULT_CORS_ORIGINS = 'http://localhost:5173,http://localhost:5174,http://localhost:5175';

/**
 * Environment contract for the API (docs/02-architecture.md section 8).
 *
 * Variables for features that do not exist yet are optional so a fresh clone
 * boots with no `.env` at all; `productionRequirements` promotes the ones that
 * must never be missing in production, so a misconfigured deploy fails fast.
 */
export const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    HOST: z.string().min(1).default('0.0.0.0'),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

    /** Origins allowed to call the API with credentials. */
    CORS_ORIGINS: commaSeparated(DEFAULT_CORS_ORIGINS),

    APP_WEB_URL: z.url().default('http://localhost:5173'),

    DATABASE_URL: z.string().min(1).optional(),

    JWT_ACCESS_SECRET: z.string().min(32).optional(),
    JWT_REFRESH_SECRET: z.string().min(32).optional(),

    OTP_PROVIDER: z.enum(['fake', 'http']).default('fake'),
    OTP_API_URL: z.url().optional(),
    OTP_API_KEY: z.string().min(1).optional(),

    S3_ENDPOINT: z.url().optional(),
    S3_REGION: z.string().min(1).optional(),
    S3_BUCKET: z.string().min(1).optional(),
    S3_ACCESS_KEY: z.string().min(1).optional(),
    S3_SECRET_KEY: z.string().min(1).optional(),
    MEDIA_PUBLIC_URL: z.url().optional(),

    SMTP_URL: z.string().min(1).optional(),
    ADMIN_PHONE_ALLOWLIST: commaSeparated(''),
    SENTRY_DSN: z.string().min(1).optional(),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV !== 'production') return;

    for (const key of ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const) {
      if (!env[key]) {
        ctx.addIssue({
          code: 'custom',
          path: [key],
          message: `${key} is required when NODE_ENV=production`,
        });
      }
    }

    if (env.OTP_PROVIDER === 'fake') {
      ctx.addIssue({
        code: 'custom',
        path: ['OTP_PROVIDER'],
        message: 'The fake OTP sender must never be enabled in production',
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

/**
 * A blank line in `.env` (`KEY=`) means "not set", not "set to an empty string".
 *
 * Node's `--env-file` reads a bare `KEY=` as `''`, which `.optional()` rejects
 * and `.default()` never fills in - so copying `.env.example` verbatim would
 * fail on every commented-out placeholder.
 */
const withoutBlanks = (source: NodeJS.ProcessEnv): NodeJS.ProcessEnv =>
  Object.fromEntries(Object.entries(source).filter(([, value]) => value !== ''));

/** Parse an environment bag, throwing a readable error listing every bad variable. */
export function parseEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(withoutBlanks(source));

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${details}`);
  }

  return result.data;
}
