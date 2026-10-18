# UrbanPetly

Pet services aggregator for Delhi NCR. Pet parents find, compare and contact providers;
providers get a listing and leads.

The specification in [`docs/`](docs/README.md) is the source of truth - start there.
Project vocabulary lives in [`GLOSSARY.md`](GLOSSARY.md); architecture decisions in
[`docs/adr/`](docs/adr/README.md).

## Requirements

- Node 22 LTS (see `.nvmrc`; `nvm use` picks it up)
- pnpm 12 (`corepack enable` uses the version pinned in `packageManager`)

If `corepack` fails to fetch pnpm with a 404 on `@pnpm/exe`, you are behind a registry proxy that
mirrors packages but not that binary. Install the JS package instead - it is served normally:

```bash
npm install -g pnpm@12
```

## Getting started

```bash
pnpm install
pnpm dev
```

`pnpm dev` builds the workspace packages once, then starts every app in parallel:

| App              | URL                     | Workspace      |
| ---------------- | ----------------------- | -------------- |
| Customer site    | http://localhost:5173   | `apps/web`     |
| Provider console | http://localhost:5174   | `apps/provider`|
| Admin back office| http://localhost:5175   | `apps/admin`   |
| API              | http://localhost:3000   | `apps/api`     |

Liveness check: `curl http://localhost:3000/api/v1/health`.

Each app ships a `.env.example`. Copy it to `.env` (API) or `.env.local` (Vite apps) when you
need to override a default; neither is committed. The API validates its environment with Zod at
startup and refuses to boot on a bad value.

## Repository layout

```
apps/
  web/        customer site (Vite + React)
  provider/   provider dashboard (Vite + React)
  admin/      admin back office (Vite + React)
  api/        Fastify API
packages/
  shared/     Zod schemas, types, constants, error codes
  api-client/ typed fetch client for the API
  ui/         design tokens and shared React components
  config/     ESLint, Prettier and TypeScript presets
docs/         the specification
```

Apps may import from `packages/*`, never from each other. Only the API talks to MySQL and the
object store. See [`docs/02-architecture.md`](docs/02-architecture.md).

### Routing

All three front ends use React Router 8, pinned to one version in the `pnpm-workspace.yaml`
catalog. v8 is ESM-only and `react-router-dom` no longer exists - always import from `react-router`.

The apps deliberately use **two different routing idioms**, decided in
[ADR-022](docs/adr/0022-prerender-approach-for-seo-pages.md):

- `apps/web` uses **framework mode** (`@react-router/dev`, `react-router.config.ts`) because the
  customer site needs build-time prerendering for SEO. Its build produces real HTML for every
  prerendered path plus `build/client/__spa-fallback.html` for everything else, and it outputs to
  `build/`, not `dist/`.
- `apps/provider` and `apps/admin` use the plain `<BrowserRouter>` API. They sit behind login and
  are marked `noindex`, so prerendering buys them nothing.

This inconsistency is intentional. Please do not "fix" it by converging the two.

## Scripts

Run from the repository root; each one fans out across the workspaces.

| Script                | What it does                                      |
| --------------------- | ------------------------------------------------- |
| `pnpm dev`            | Build packages, then run every app in watch mode  |
| `pnpm build`          | Production build of every package and app         |
| `pnpm typecheck`      | `tsc --noEmit` everywhere                         |
| `pnpm test`           | Vitest unit and integration suites                |
| `pnpm test:watch`     | The same suites in watch mode                     |
| `pnpm lint`           | ESLint, warnings treated as failures              |
| `pnpm lint:fix`       | ESLint with `--fix`                               |
| `pnpm format`         | Prettier write                                    |
| `pnpm format:check`   | Prettier check (what CI runs)                     |

CI runs install, lint, format check, typecheck, test and build on every pull request
(`.github/workflows/ci.yml`).

## Contributing

Never commit or push to `main`. Branch, open a pull request, get the Tech Lead's review and the
founder's approval - the full rules are in
[`docs/10-git-workflow.md`](docs/10-git-workflow.md), and the Definition of Done is in
[`docs/07-test-plan.md`](docs/07-test-plan.md).
