# @urbanpetly/ui

Design tokens and (as they are built) the shared React components for all three front-end
apps. Design documentation lives in [`docs/design/`](../../docs/design/);
[`design-system.md`](../../docs/design/design-system.md) is the source of truth for every
value here.

**Tailwind v4.** There is no `tailwind.config` and no preset — the theme *is* the stylesheet.

## What is in this package today (Phase 0)

| Path | What it is |
|---|---|
| `src/theme.css` | **The single source of raw values.** Primitives, the `@theme` semantic layer, type scale, spacing, radius, shadow, motion, z-index, reduced-motion handling, focus ring, and the `tabular` / `focus-ring` / `pb-safe` / `sr-only-focusable` utilities. |
| `src/tokens.ts` | Typed `var(--token)` accessors for TS consumers, `resolveToken()` for canvas/map code that cannot use `var()`, and `animationDurationMs()` for JS-driven motion. |
| `scripts/check-contrast.mjs` | Guard: asserts every documented WCAG AA pair on every background it lands on, that forbidden pairings still fail, that `tokens.ts` has not drifted, and that the prototype's generated stylesheet is current. |

React components are **not** here yet — see [Status](#status).

## Use it in an app

1. Add the dependency (`"@urbanpetly/ui": "workspace:*"`).
2. Import it once, after Tailwind, in the app's entry stylesheet:

   ```css
   /* apps/web/src/main.css */
   @import 'tailwindcss';
   @import '@urbanpetly/ui/theme.css';
   ```

3. Write utilities, never raw values:

   ```tsx
   <button className="min-h-target rounded-md bg-primary px-4 text-body text-primary-fg hover:bg-primary-hover">
     Send request
   </button>
   ```

`02-architecture.md` §5: no hard-coded colours or spacing in app code. The theme **clears**
Tailwind's default palette and spacing scale, so `bg-blue-500` and `p-7` simply do not exist —
that is deliberate. Bare `rounded` (12px) and `shadow` are kept, because people type them from
habit and a class that silently does nothing wastes an afternoon.

Tokens with no Tailwind namespace — durations, z-index — are plain custom properties:
`duration-[var(--duration-fast)]`, `z-[var(--z-header)]`.

## Rules

- Raw values live in `theme.css` only. Everything else references them.
- App code uses semantic tokens (`bg-surface`, `text-fg-muted`, `border-border-strong`), never
  primitives (`--up-brand-600`).
- A new token is a design decision: document it in `design-system.md` first, then add it here.
- Focus is never removed. **`outline-none` is banned** — including Tailwind's `focus:outline-none`,
  which outranks the global `:focus-visible` rule on specificity and wins silently. Use the
  `focus-ring` utility if a control needs to draw its own.
- Reduced motion is handled once, globally. Components must not reimplement it — but motion that
  carries meaning (spinners, skeletons) sets `data-motion-essential` to opt out of the clamp, and
  JS-driven animation must use `animationDurationMs()` rather than the raw `durationMs` constant.

## Checks

```bash
pnpm --filter @urbanpetly/ui check:tokens            # verify
pnpm --filter @urbanpetly/ui check:tokens -- --write # regenerate the prototype stylesheet
```

Fails the build when a required contrast pair drops below WCAG AA on any background it is used
on, when a pairing the design system forbids (dark ink on the rose accent) starts passing, when a
semantic token does not resolve, when `tokens.ts` drifts from `theme.css`, or when the
prototype's generated stylesheet goes stale. It also fails when it cannot find the `:root` or
`@theme` block at all — a guard that silently tests nothing is worse than no guard. Wire it into
CI alongside lint and typecheck (`07-test-plan.md`).

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
| Tokens (Tailwind v4 `@theme`) + contrast guard | In this PR |
| Storybook | Needs the monorepo scaffold (E12-S1); set up with the first components |
| React components | Specified in [`component-inventory.md`](../../docs/design/component-inventory.md); built in the order listed there |
