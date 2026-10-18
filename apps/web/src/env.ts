import { z } from 'zod';

/**
 * Only `VITE_`-prefixed variables reach the browser bundle; never put a secret
 * in one. Parsed at module load so a misconfigured build fails immediately.
 */
const schema = z.object({
  VITE_API_URL: z.url().default('http://localhost:3000/api/v1'),
});

export const env = schema.parse(import.meta.env);
