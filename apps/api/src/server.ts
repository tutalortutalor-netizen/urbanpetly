import { buildApp } from './app.js';
import { parseEnv } from './config/env.js';

async function main() {
  // Parsed before the app is built so a bad environment fails before anything binds.
  const env = parseEnv();
  const app = await buildApp({ env });

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
  } catch (error) {
    app.log.error({ err: error }, 'failed to start');
    process.exit(1);
  }

  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () => {
      app.log.info({ signal }, 'shutting down');
      void app.close().then(() => process.exit(0));
    });
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
