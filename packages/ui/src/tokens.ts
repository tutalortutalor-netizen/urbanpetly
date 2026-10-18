/**
 * Typed token accessors for JavaScript/TypeScript consumers.
 *
 * Raw values live in ONE place: src/theme.css. These helpers return
 * `var(--token)` references so there is nothing to keep in sync and a brand swap
 * cannot drift. Non-colour scales that JS genuinely needs as numbers
 * (breakpoints, durations, target size) are duplicated below and asserted
 * against the stylesheet by `scripts/check-contrast.mjs`.
 *
 * Docs: docs/design/design-system.md
 */

export const color = {
  bg: 'var(--color-bg)',
  surface: 'var(--color-surface)',
  surfaceSunken: 'var(--color-surface-sunken)',
  surfaceRaised: 'var(--color-surface-raised)',
  overlay: 'var(--color-overlay)',

  fg: 'var(--color-fg)',
  fgMuted: 'var(--color-fg-muted)',
  fgSubtle: 'var(--color-fg-subtle)',
  fgInverse: 'var(--color-fg-inverse)',

  border: 'var(--color-border)',
  borderStrong: 'var(--color-border-strong)',

  primary: 'var(--color-primary)',
  primaryHover: 'var(--color-primary-hover)',
  primaryActive: 'var(--color-primary-active)',
  primarySubtle: 'var(--color-primary-subtle)',
  primaryFg: 'var(--color-primary-fg)',

  accent: 'var(--color-accent)',
  accentSubtle: 'var(--color-accent-subtle)',
  accentFg: 'var(--color-accent-fg)',
  accentStrong: 'var(--color-accent-strong)',

  success: 'var(--color-success)',
  successSubtle: 'var(--color-success-subtle)',
  successFg: 'var(--color-success-fg)',
  warning: 'var(--color-warning)',
  warningSubtle: 'var(--color-warning-subtle)',
  warningFg: 'var(--color-warning-fg)',
  danger: 'var(--color-danger)',
  dangerSubtle: 'var(--color-danger-subtle)',
  dangerFg: 'var(--color-danger-fg)',
  info: 'var(--color-info)',
  infoSubtle: 'var(--color-info-subtle)',
  infoFg: 'var(--color-info-fg)',

  focusRing: 'var(--color-focus-ring)',
} as const;

export const space = {
  1: 'var(--spacing-1)',
  2: 'var(--spacing-2)',
  3: 'var(--spacing-3)',
  4: 'var(--spacing-4)',
  5: 'var(--spacing-5)',
  6: 'var(--spacing-6)',
  8: 'var(--spacing-8)',
  10: 'var(--spacing-10)',
  12: 'var(--spacing-12)',
  16: 'var(--spacing-16)',
  20: 'var(--spacing-20)',
  24: 'var(--spacing-24)',
} as const;

export const radius = {
  sm: 'var(--radius-sm)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
  xl: 'var(--radius-xl)',
  pill: 'var(--radius-pill)',
} as const;

export const shadow = {
  xs: 'var(--shadow-xs)',
  sm: 'var(--shadow-sm)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
} as const;

export const motion = {
  duration: { fast: 'var(--duration-fast)', base: 'var(--duration-base)', slow: 'var(--duration-slow)' },
  ease: { standard: 'var(--ease-standard)', enter: 'var(--ease-enter)', exit: 'var(--ease-exit)' },
} as const;

export const zIndex = {
  base: 'var(--z-base)',
  dropdown: 'var(--z-dropdown)',
  sticky: 'var(--z-sticky)',
  header: 'var(--z-header)',
  overlay: 'var(--z-overlay)',
  modal: 'var(--z-modal)',
  toast: 'var(--z-toast)',
} as const;

/** Breakpoints in px. Must match `--breakpoint-*` in src/theme.css. */
export const breakpoint = { sm: 480, md: 768, lg: 1024, xl: 1280 } as const;

/** Minimum interactive target in px (05-ux-spec). Must match `--target-min`. */
export const TARGET_MIN_PX = 44;

/**
 * Durations in ms, for JS-driven animation (Framer/WAAPI).
 *
 * These are the *unreduced* values and must match the CSS. CSS gets reduced
 * motion for free — `theme.css` clamps `--duration-*` to 1ms under
 * `prefers-reduced-motion` — but JS reading a constant does not. Never pass
 * these straight to an animation; use `animationDurationMs()` below.
 */
export const durationMs = { fast: 120, base: 180, slow: 240 } as const;

/** True when the user has asked for reduced motion. False during SSR/prerender. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * The duration a JS-driven animation should actually use — 1ms under reduced
 * motion, matching what the stylesheet does to its CSS counterpart.
 * This is the only duration a Framer/WAAPI call should see (design-system.md §7).
 */
export function animationDurationMs(name: keyof typeof durationMs): number {
  return prefersReducedMotion() ? 1 : durationMs[name];
}

/**
 * Resolve a token to its computed value at runtime.
 * Needed by canvas/WebGL consumers — map pins, chart fills — which cannot use var().
 *
 * Accepts any of `color.primary` (`'var(--color-primary)'`), `'--color-primary'`
 * or `'color-primary'`, because every value this module exports is the first form.
 * Returns an empty string during SSR/prerender, so always provide a fallback.
 */
export function resolveToken(token: string, element: Element | null = null): string {
  if (typeof window === 'undefined') return '';
  const target = element ?? document.documentElement;
  const unwrapped = /^var\(\s*(--[\w-]+)\s*\)$/.exec(token.trim())?.[1] ?? token.trim();
  const name = unwrapped.startsWith('--') ? unwrapped : `--${unwrapped}`;
  return getComputedStyle(target).getPropertyValue(name).trim();
}

export type ColorToken = keyof typeof color;
export type SpaceToken = keyof typeof space;
export type RadiusToken = keyof typeof radius;
export type ShadowToken = keyof typeof shadow;
