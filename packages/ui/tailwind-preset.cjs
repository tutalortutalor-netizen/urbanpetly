/**
 * UrbanPetly Tailwind preset.
 *
 * Every utility resolves to a CSS custom property declared in src/styles/tokens.css,
 * which is the single source of raw values. Import that stylesheet once per app
 * (apps/<app>/src/main.css) and add this preset to the app's tailwind.config.
 *
 *   // apps/web/tailwind.config.cjs
 *   module.exports = {
 *     presets: [require('@urbanpetly/ui/tailwind-preset')],
 *     content: ['./index.html', './src/**\/*.{ts,tsx}', '../../packages/ui/src/**\/*.{ts,tsx}'],
 *   };
 *
 * Docs: docs/design/design-system.md
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    // Replaces Tailwind's default palette: if it is not a token, it does not exist.
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      inherit: 'inherit',

      bg: 'var(--color-bg)',
      surface: {
        DEFAULT: 'var(--color-surface)',
        sunken: 'var(--color-surface-sunken)',
        raised: 'var(--color-surface-raised)',
      },
      overlay: 'var(--color-overlay)',

      fg: {
        DEFAULT: 'var(--color-fg)',
        muted: 'var(--color-fg-muted)',
        subtle: 'var(--color-fg-subtle)',
        inverse: 'var(--color-fg-inverse)',
      },

      border: {
        DEFAULT: 'var(--color-border)',
        strong: 'var(--color-border-strong)',
      },

      primary: {
        DEFAULT: 'var(--color-primary)',
        hover: 'var(--color-primary-hover)',
        active: 'var(--color-primary-active)',
        subtle: 'var(--color-primary-subtle)',
        fg: 'var(--color-primary-fg)',
      },
      accent: {
        DEFAULT: 'var(--color-accent)',
        subtle: 'var(--color-accent-subtle)',
        fg: 'var(--color-accent-fg)',
        strong: 'var(--color-accent-strong)',
      },

      success: {
        DEFAULT: 'var(--color-success)',
        subtle: 'var(--color-success-subtle)',
        fg: 'var(--color-success-fg)',
      },
      warning: {
        DEFAULT: 'var(--color-warning)',
        subtle: 'var(--color-warning-subtle)',
        fg: 'var(--color-warning-fg)',
      },
      danger: {
        DEFAULT: 'var(--color-danger)',
        subtle: 'var(--color-danger-subtle)',
        fg: 'var(--color-danger-fg)',
      },
      info: {
        DEFAULT: 'var(--color-info)',
        subtle: 'var(--color-info-subtle)',
        fg: 'var(--color-info-fg)',
      },

      focus: 'var(--color-focus-ring)',
    },

    screens: {
      sm: '480px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },

    spacing: {
      0: '0px',
      px: '1px',
      1: 'var(--space-1)',
      2: 'var(--space-2)',
      3: 'var(--space-3)',
      4: 'var(--space-4)',
      5: 'var(--space-5)',
      6: 'var(--space-6)',
      8: 'var(--space-8)',
      10: 'var(--space-10)',
      12: 'var(--space-12)',
      16: 'var(--space-16)',
      20: 'var(--space-20)',
      24: 'var(--space-24)',
      target: 'var(--target-min)',
    },

    fontFamily: {
      heading: 'var(--font-heading)',
      body: 'var(--font-body)',
      mono: 'var(--font-mono)',
    },

    fontSize: {
      display: ['var(--text-display)', { lineHeight: 'var(--text-display-lh)', fontWeight: '700' }],
      h1: ['var(--text-h1)', { lineHeight: 'var(--text-h1-lh)', fontWeight: '700' }],
      h2: ['var(--text-h2)', { lineHeight: 'var(--text-h2-lh)', fontWeight: '600' }],
      h3: ['var(--text-h3)', { lineHeight: 'var(--text-h3-lh)', fontWeight: '600' }],
      'body-lg': ['var(--text-body-lg)', { lineHeight: 'var(--text-body-lg-lh)' }],
      body: ['var(--text-body)', { lineHeight: 'var(--text-body-lh)' }],
      'body-sm': ['var(--text-body-sm)', { lineHeight: 'var(--text-body-sm-lh)' }],
      caption: ['var(--text-caption)', { lineHeight: 'var(--text-caption-lh)', fontWeight: '500' }],
    },

    borderRadius: {
      none: '0',
      sm: 'var(--radius-sm)',
      md: 'var(--radius-md)',
      lg: 'var(--radius-lg)',
      xl: 'var(--radius-xl)',
      pill: 'var(--radius-pill)',
      full: '9999px',
    },

    boxShadow: {
      none: 'none',
      xs: 'var(--shadow-xs)',
      sm: 'var(--shadow-sm)',
      md: 'var(--shadow-md)',
      lg: 'var(--shadow-lg)',
    },

    transitionDuration: {
      fast: 'var(--duration-fast)',
      base: 'var(--duration-base)',
      slow: 'var(--duration-slow)',
    },

    transitionTimingFunction: {
      standard: 'var(--ease-standard)',
      enter: 'var(--ease-enter)',
      exit: 'var(--ease-exit)',
    },

    zIndex: {
      base: 'var(--z-base)',
      dropdown: 'var(--z-dropdown)',
      sticky: 'var(--z-sticky)',
      header: 'var(--z-header)',
      overlay: 'var(--z-overlay)',
      modal: 'var(--z-modal)',
      toast: 'var(--z-toast)',
    },

    extend: {
      maxWidth: {
        content: '1200px',
        prose: '68ch',
        form: '560px',
      },
      minHeight: { target: 'var(--target-min)' },
      minWidth: { target: 'var(--target-min)' },
      aspectRatio: { card: '4 / 3', hero: '3 / 2' },
      outlineWidth: { focus: '3px' },
      outlineOffset: { focus: '2px' },
    },
  },

  plugins: [
    // Utilities we need everywhere and do not want re-invented per app.
    function ({ addUtilities }) {
      addUtilities({
        // Prices, distances, ratings and counts must not shift while loading.
        '.tabular': { fontVariantNumeric: 'tabular-nums' },
        // Standard focus ring (design-system.md §9).
        '.focus-ring': {
          outline: '3px solid var(--color-focus-ring)',
          outlineOffset: '2px',
        },
        // Sticky bottom bars must clear the iOS home indicator.
        '.pb-safe': {
          paddingBottom: 'max(var(--space-4), env(safe-area-inset-bottom))',
        },
        // Accessible visually-hidden text (skip links, live-region labels).
        '.sr-only-focusable:not(:focus):not(:focus-within)': {
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          borderWidth: '0',
        },
      });
    },
  ],
};
