# @urbanpetly/ui

Design tokens, the Tailwind preset and (as they are built) the shared React components for
all three front-end apps. Design documentation lives in [`docs/design/`](../../docs/design/);
[`design-system.md`](../../docs/design/design-system.md) is the source of truth for every
value here.

## What is in this package today (Phase 0)

| Path | What it is |
|---|---|
| `src/styles/tokens.css` | **The single source of raw values.** Primitives, semantic tokens, type scale, spacing, radius, shadow, motion, z-index, reduced-motion handling, focus ring. |
| `tailwind-preset.cjs` | Tailwind theme mapped onto those custom properties, plus `.tabular`, `.focus-ring`, `.pb-safe` utilities. |
| `src/tokens.ts` | Typed `var(--token)` accessors for TS consumers, plus `resolveToken()` for canvas/map code that cannot use `var()`. |
| `scripts/check-contrast.mjs` | Guard: asserts every documented WCAG AA pair, for both brand options, and that the numbers duplicated in `tokens.ts` still match the CSS. |

React components are **not** here yet — see [Status](#status).

## Use it in an app

1. Add the dependency (`"@urbanpetly/ui": "workspace:*"`).
2. Import the tokens once, at the top of the app's entry stylesheet:

   ```css
   /* apps/web/src/main.css */
   @import '@urbanpetly/ui/tokens.css';
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

3. Extend the preset in the app's Tailwind config:

   ```js
   // apps/web/tailwind.config.cjs
   module.exports = {
     presets: [require('@urbanpetly/ui/tailwind-preset')],
     content: ['./index.html', './src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
   };
   ```

4. Write utilities, never raw values:

   ```tsx
   <button className="min-h-target rounded-md bg-primary px-4 text-body text-primary-fg hover:bg-primary-hover">
     Request booking
   </button>
   ```

`02-architecture.md` §5: no hard-coded colours or spacing in app code. The preset **replaces**
Tailwind's default palette, so `bg-blue-500` simply does not exist — that is deliberate.

## Rules

- Raw values live in `tokens.css` only. Everything else references them.
- App code uses semantic tokens (`bg-surface`, `text-fg-muted`, `border-border-strong`), never
  primitives (`--up-brand-600`).
- A new token is a design decision: document it in `design-system.md` first, then add it here.
- Focus is never removed. The global `:focus-visible` ring is defined in `tokens.css`.
- Reduced motion is handled once, globally. Components must not reimplement it.

## Checks

```bash
pnpm --filter @urbanpetly/ui check:tokens
```

Fails the build when a required contrast pair drops below WCAG AA, when a pairing the design
system forbids (dark ink on the rose accent) starts passing, when a semantic token does not
resolve, or when `tokens.ts` / the preset drift from `tokens.css`. Wire it into CI alongside
lint and typecheck (`07-test-plan.md`).

## Brand

**"Indigo Care"** — indigo primary, rose accent, cool slate neutrals, *Outfit* headings over
*Inter* body. Chosen by the founder on 2026-10-18; rationale and the rejected alternative are in
[`docs/design/brand-direction.md`](../../docs/design/brand-direction.md).

Two things to know before you reach for a colour:

- The accent carries **white** text, not dark ink (`--color-accent-fg` is white, 4.70:1). Dark ink
  on rose is 3.80:1 and the guard fails the build if anyone tries it.
- `--up-neutral-400` is decorative only (2.56:1). Interactive borders use `--color-border-strong`.

## Status

| Piece | State |
|---|---|
| Tokens + Tailwind preset + contrast guard | In this PR |
| Storybook | Needs the monorepo scaffold (E12-S1); set up with the first components |
| React components | Specified in [`component-inventory.md`](../../docs/design/component-inventory.md); built in the order listed there |
