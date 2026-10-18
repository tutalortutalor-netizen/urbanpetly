import type { Config } from '@react-router/dev/config';

/**
 * Framework mode, client-rendered, with build-time prerendering of SEO pages
 * (ADR-022). `apps/provider` and `apps/admin` deliberately do NOT use framework
 * mode - they sit behind login and must not be indexed.
 *
 * Phase 0 prerenders only `/`, which is enough to prove the build produces both
 * artefacts: a real `build/client/index.html` for the prerendered route and
 * `build/client/__spa-fallback.html` for everything else. Phase 1 replaces the
 * static list with a function that reads the prerender manifest from the API.
 */
export default {
  appDirectory: 'src',
  ssr: false,
  prerender: ['/'],
} satisfies Config;
