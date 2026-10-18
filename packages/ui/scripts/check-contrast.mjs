#!/usr/bin/env node
/**
 * Token guard for @urbanpetly/ui.
 *
 * 1. Parses src/styles/tokens.css (the single source of raw values).
 * 2. Asserts every WCAG 2.1 AA pair the design system claims in
 *    docs/design/design-system.md §2.3.
 * 3. Asserts the combinations we forbid actually fail (dark ink on the rose accent).
 * 4. Asserts the few numbers duplicated in src/tokens.ts and
 *    tailwind-preset.cjs still match the stylesheet.
 *
 * Run: node scripts/check-contrast.mjs   (pnpm --filter @urbanpetly/ui check:tokens)
 * Exits non-zero on any failure so CI blocks the merge.
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = resolve(here, '..');
const require = createRequire(import.meta.url);

const css = readFileSync(resolve(pkgRoot, 'src/styles/tokens.css'), 'utf8');
const tokensTs = readFileSync(resolve(pkgRoot, 'src/tokens.ts'), 'utf8');
const preset = require(resolve(pkgRoot, 'tailwind-preset.cjs'));

// --- parsing ---------------------------------------------------------------

const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');

/**
 * Drop `@media` (and other at-rule) blocks, with their nested braces, so the
 * base map is not polluted by responsive or reduced-motion overrides — those
 * legitimately redefine the same custom properties.
 */
function stripAtRules(source) {
  let out = '';
  for (let i = 0; i < source.length; i += 1) {
    if (source[i] !== '@') {
      out += source[i];
      continue;
    }
    const open = source.indexOf('{', i);
    if (open === -1) break;
    let depth = 0;
    let j = open;
    for (; j < source.length; j += 1) {
      if (source[j] === '{') depth += 1;
      else if (source[j] === '}' && (depth -= 1) === 0) break;
    }
    i = j;
  }
  return out;
}

/** Collect `--name: value;` pairs from every top-level block whose selector matches. */
function declarationsFor(source, selectorPattern) {
  const out = {};
  const blocks = stripAtRules(stripComments(source)).matchAll(/([^{}]+)\{([^{}]*)\}/g);
  for (const [, selector, body] of blocks) {
    if (!selectorPattern.test(selector.trim())) continue;
    for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      out[name] = value.trim();
    }
  }
  return out;
}

const base = declarationsFor(css, /^:root$/);

/** Follow `var(--x)` indirection down to a literal value. */
function resolveVar(vars, token, seen = new Set()) {
  let value = vars[token];
  if (value === undefined) throw new Error(`token ${token} is not defined`);
  const match = /^var\((--[\w-]+)\)$/.exec(value);
  if (!match) return value;
  if (seen.has(token)) throw new Error(`circular token reference at ${token}`);
  seen.add(token);
  return resolveVar(vars, match[1], seen);
}

// --- contrast --------------------------------------------------------------

const channel = (c) => {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};

function luminance(hex) {
  const h = hex.trim().replace('#', '');
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
  if (!/^[0-9a-f]{6}$/i.test(full)) throw new Error(`not a hex colour: ${hex}`);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// --- the contract ----------------------------------------------------------

const AA_TEXT = 4.5; // WCAG 1.4.3 normal text
const AA_UI = 3.0; // WCAG 1.4.11 non-text contrast

/** [label, foreground token, background token, minimum ratio] */
const REQUIRED = [
  ['body text on surface', '--color-fg', '--color-surface', AA_TEXT],
  ['body text on page bg', '--color-fg', '--color-bg', AA_TEXT],
  ['muted text on surface', '--color-fg-muted', '--color-surface', AA_TEXT],
  ['subtle text on surface', '--color-fg-subtle', '--color-surface', AA_TEXT],
  ['inverse text on fg', '--color-fg-inverse', '--color-fg', AA_TEXT],
  ['primary label on primary', '--color-primary-fg', '--color-primary', AA_TEXT],
  ['primary label on primary hover', '--color-primary-fg', '--color-primary-hover', AA_TEXT],
  ['primary label on primary active', '--color-primary-fg', '--color-primary-active', AA_TEXT],
  ['link text on surface', '--color-primary', '--color-surface', AA_TEXT],
  ['text on primary-subtle chip', '--color-primary-hover', '--color-primary-subtle', AA_TEXT],
  ['accent label on accent', '--color-accent-fg', '--color-accent', AA_TEXT],
  ['accent ink on accent-subtle chip', '--color-accent-strong', '--color-accent-subtle', AA_TEXT],
  ['accent ink on surface', '--color-accent-strong', '--color-surface', AA_TEXT],
  ['accent fill on surface (rating stars)', '--color-accent', '--color-surface', AA_UI],
  ['success text on surface', '--color-success', '--color-surface', AA_TEXT],
  ['warning text on surface', '--color-warning', '--color-surface', AA_TEXT],
  ['danger text on surface', '--color-danger', '--color-surface', AA_TEXT],
  ['info text on surface', '--color-info', '--color-surface', AA_TEXT],
  ['success fg on success subtle', '--color-success-fg', '--color-success-subtle', AA_TEXT],
  ['warning fg on warning subtle', '--color-warning-fg', '--color-warning-subtle', AA_TEXT],
  ['danger fg on danger subtle', '--color-danger-fg', '--color-danger-subtle', AA_TEXT],
  ['info fg on info subtle', '--color-info-fg', '--color-info-subtle', AA_TEXT],
  ['white on danger (destructive button)', '--color-surface', '--color-danger', AA_TEXT],
  ['interactive border on surface', '--color-border-strong', '--color-surface', AA_UI],
  ['interactive border on page bg', '--color-border-strong', '--color-bg', AA_UI],
  ['focus ring on surface', '--color-focus-ring', '--color-surface', AA_UI],
  ['focus ring on page bg', '--color-focus-ring', '--color-bg', AA_UI],
  ['focus ring on sunken surface', '--color-focus-ring', '--color-surface-sunken', AA_UI],
];

/**
 * Combinations the design system forbids: these MUST stay below AA, so that a
 * well-meaning "let's darken the label on the accent" never silently legalises an
 * unreadable pairing. The rose accent carries white text, not dark ink — the
 * opposite of what most of our surfaces do, so it is worth asserting.
 */
const FORBIDDEN = [['dark ink on rose accent', '--color-fg', '--color-accent', AA_TEXT]];

let failures = 0;
const fail = (msg) => {
  failures += 1;
  console.error(`  FAIL  ${msg}`);
};

console.log('\nBrand "Indigo Care"');

for (const [label, fgToken, bgToken, min] of REQUIRED) {
  try {
    const ratio = contrast(resolveVar(base, fgToken), resolveVar(base, bgToken));
    if (ratio + 1e-9 < min) {
      fail(`${label}: ${ratio.toFixed(2)}:1 < required ${min}:1`);
    } else {
      console.log(`  ok    ${ratio.toFixed(2).padStart(5)}:1  ${label}`);
    }
  } catch (error) {
    fail(`${label}: ${error.message}`);
  }
}

for (const [label, fgToken, bgToken, min] of FORBIDDEN) {
  try {
    const ratio = contrast(resolveVar(base, fgToken), resolveVar(base, bgToken));
    if (ratio >= min) {
      fail(`${label}: ${ratio.toFixed(2)}:1 now passes — the docs say it must not be used; update design-system.md §2.3`);
    } else {
      console.log(`  ok    ${ratio.toFixed(2).padStart(5)}:1  ${label} (correctly below AA, must not be used)`);
    }
  } catch (error) {
    fail(`${label}: ${error.message}`);
  }
}

// Every semantic colour must resolve to a usable literal, so a typo fails CI.
for (const token of Object.keys(base)) {
  if (!token.startsWith('--color-') || token === '--color-overlay') continue;
  try {
    luminance(resolveVar(base, token));
  } catch (error) {
    fail(`${token} does not resolve to a hex colour (${error.message})`);
  }
}

// --- numbers duplicated outside the stylesheet -----------------------------

console.log('\nCross-file consistency');

const expectNumber = (label, actual, expected) => {
  if (String(actual) !== String(expected)) fail(`${label}: ${actual} !== ${expected}`);
  else console.log(`  ok    ${label} = ${expected}`);
};

// tokens.ts breakpoints vs the preset's screens
const tsBreakpoints = /breakpoint\s*=\s*\{([^}]*)\}/.exec(tokensTs)?.[1] ?? '';
for (const [name, px] of Object.entries(preset.theme.screens)) {
  const match = new RegExp(`${name}\\s*:\\s*(\\d+)`).exec(tsBreakpoints);
  expectNumber(`breakpoint ${name}`, match ? `${match[1]}px` : 'missing', px);
}

// tokens.ts durations vs tokens.css
const tsDurations = /durationMs\s*=\s*\{([^}]*)\}/.exec(tokensTs)?.[1] ?? '';
for (const name of ['fast', 'base', 'slow']) {
  const match = new RegExp(`${name}\\s*:\\s*(\\d+)`).exec(tsDurations);
  expectNumber(`duration ${name}`, match ? `${match[1]}ms` : 'missing', base[`--duration-${name}`]);
}

// tokens.ts target size vs tokens.css
const tsTarget = /TARGET_MIN_PX\s*=\s*(\d+)/.exec(tokensTs)?.[1];
expectNumber('minimum target size', tsTarget ? `${tsTarget}px` : 'missing', base['--target-min']);

// Every colour utility in the preset must point at a declared token.
const presetTokens = JSON.stringify(preset.theme.colors).matchAll(/var\((--[\w-]+)\)/g);
for (const [, token] of presetTokens) {
  if (!(token in base)) fail(`tailwind-preset.cjs references ${token}, which tokens.css does not declare`);
}

// --- result ----------------------------------------------------------------

if (failures > 0) {
  console.error(`\n${failures} token check(s) failed.`);
  process.exit(1);
}
console.log('\nAll token checks passed.');
