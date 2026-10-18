#!/usr/bin/env node
/**
 * Token guard for @urbanpetly/ui.
 *
 * 1. Parses src/theme.css (the single source of raw values).
 * 2. Asserts every WCAG 2.1 AA pair the design system claims in
 *    docs/design/design-system.md §2.3 — on every background the token is
 *    actually used on, not just the flattering ones.
 * 3. Asserts the combinations we forbid actually fail (dark ink on the rose accent).
 * 4. Asserts the few numbers duplicated in src/tokens.ts still match the stylesheet.
 *
 * It fails LOUDLY. A guard that cannot find what it is guarding is worse than no
 * guard, so a missing block or an unresolvable token is an error, never a skip.
 *
 * Run: node scripts/check-contrast.mjs   (pnpm --filter @urbanpetly/ui check:tokens)
 * Exits non-zero on any failure so CI blocks the merge.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = resolve(here, '..');
const WRITE = process.argv.includes('--write');

const css = readFileSync(resolve(pkgRoot, 'src/theme.css'), 'utf8');
const tokensTs = readFileSync(resolve(pkgRoot, 'src/tokens.ts'), 'utf8');

// --- parsing ---------------------------------------------------------------

const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');

const declarationsIn = (body) => {
  const out = {};
  for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    out[name] = value.trim();
  }
  return out;
};

/**
 * Walk the stylesheet's top-level blocks and collect declarations from `:root`
 * and from `@theme`.
 *
 * Deliberately explicit about the three shapes that are NOT collected:
 *  - statement at-rules (`@import url(…);`) end at `;` and must not swallow the
 *    block that follows them;
 *  - `@media` / `@supports` blocks legitimately redefine the same properties
 *    (the responsive type scale, the reduced-motion clamp), so folding them into
 *    the base map would make the map a lie;
 *  - `@utility` blocks declare properties on a class, not on the token layer.
 */
function parseTokenBlocks(source) {
  const text = stripComments(source);
  const root = {};
  const theme = {};
  let i = 0;

  while (i < text.length) {
    const open = text.indexOf('{', i);
    const semi = text.indexOf(';', i);

    // A statement at-rule or stray declaration before the next block.
    if (semi !== -1 && (open === -1 || semi < open)) {
      i = semi + 1;
      continue;
    }
    if (open === -1) break;

    const prelude = text.slice(i, open).trim();

    let depth = 0;
    let j = open;
    for (; j < text.length; j += 1) {
      if (text[j] === '{') depth += 1;
      else if (text[j] === '}' && (depth -= 1) === 0) break;
    }
    if (depth !== 0) throw new Error('unbalanced braces in theme.css');

    const body = text.slice(open + 1, j);
    if (/^@theme(\s|$)/.test(prelude)) Object.assign(theme, declarationsIn(body));
    else if (prelude === ':root') Object.assign(root, declarationsIn(body));

    i = j + 1;
  }

  // Fail loudly rather than silently testing an empty or half-built map.
  if (Object.keys(root).length === 0) throw new Error('no :root block found in theme.css');
  if (Object.keys(theme).length === 0) throw new Error('no @theme block found in theme.css');
  return { root, theme };
}

const { root, theme } = parseTokenBlocks(css);
const base = { ...root, ...theme };

/** Follow `var(--x)` indirection down to a literal value. */
function resolveVar(vars, token, seen = new Set()) {
  const value = vars[token];
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

/**
 * Backgrounds a foreground token actually lands on. Testing only `surface` and
 * `bg` was how `fg-subtle` on a sunken panel got to 4.34:1 while §2.3 promised AA.
 */
const SURFACES = ['--color-surface', '--color-bg', '--color-surface-sunken'];
const TINTS = ['--color-primary-subtle', '--color-accent-subtle'];

const on = (label, fg, backgrounds, min) =>
  backgrounds.map((bg) => [`${label} on ${bg.replace('--color-', '')}`, fg, bg, min]);

/** [label, foreground token, background token, minimum ratio] */
const REQUIRED = [
  ...on('body text', '--color-fg', [...SURFACES, ...TINTS], AA_TEXT),
  ...on('muted text', '--color-fg-muted', [...SURFACES, ...TINTS], AA_TEXT),
  ...on('subtle text', '--color-fg-subtle', [...SURFACES, ...TINTS], AA_TEXT),
  ...on('link text', '--color-primary', SURFACES, AA_TEXT),
  ...on('interactive border', '--color-border-strong', [...SURFACES, ...TINTS], AA_UI),
  ...on('focus ring', '--color-focus-ring', [...SURFACES, ...TINTS], AA_UI),
  ...on('accent ink', '--color-accent-strong', ['--color-surface', '--color-accent-subtle'], AA_TEXT),
  ...on('accent fill (rating stars, non-text)', '--color-accent', SURFACES, AA_UI),
  ['inverse text on fg', '--color-fg-inverse', '--color-fg', AA_TEXT],
  ['primary label on primary', '--color-primary-fg', '--color-primary', AA_TEXT],
  ['primary label on primary hover', '--color-primary-fg', '--color-primary-hover', AA_TEXT],
  ['primary label on primary active', '--color-primary-fg', '--color-primary-active', AA_TEXT],
  ['text on primary-subtle chip', '--color-primary-hover', '--color-primary-subtle', AA_TEXT],
  ['accent label on accent', '--color-accent-fg', '--color-accent', AA_TEXT],
  ['success text on surface', '--color-success', '--color-surface', AA_TEXT],
  ['warning text on surface', '--color-warning', '--color-surface', AA_TEXT],
  ['danger text on surface', '--color-danger', '--color-surface', AA_TEXT],
  ['info text on surface', '--color-info', '--color-surface', AA_TEXT],
  ['success fg on success subtle', '--color-success-fg', '--color-success-subtle', AA_TEXT],
  ['warning fg on warning subtle', '--color-warning-fg', '--color-warning-subtle', AA_TEXT],
  ['danger fg on danger subtle', '--color-danger-fg', '--color-danger-subtle', AA_TEXT],
  ['info fg on info subtle', '--color-info-fg', '--color-info-subtle', AA_TEXT],
  ['white on danger (destructive button)', '--color-surface', '--color-danger', AA_TEXT],
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
      fail(
        `${label}: ${ratio.toFixed(2)}:1 now passes — the docs say it must not be used; update design-system.md §2.3`,
      );
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
  if (['--color-transparent', '--color-current', '--color-inherit'].includes(token)) continue;
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

// tokens.ts breakpoints vs the theme's --breakpoint-*
const tsBreakpoints = /breakpoint\s*=\s*\{([^}]*)\}/.exec(tokensTs)?.[1] ?? '';
for (const name of ['sm', 'md', 'lg', 'xl']) {
  const match = new RegExp(`${name}\\s*:\\s*(\\d+)`).exec(tsBreakpoints);
  expectNumber(`breakpoint ${name}`, match ? `${match[1]}px` : 'missing', base[`--breakpoint-${name}`]);
}

// tokens.ts durations vs theme.css
const tsDurations = /durationMs\s*=\s*\{([^}]*)\}/.exec(tokensTs)?.[1] ?? '';
for (const name of ['fast', 'base', 'slow']) {
  const match = new RegExp(`${name}\\s*:\\s*(\\d+)`).exec(tsDurations);
  expectNumber(`duration ${name}`, match ? `${match[1]}ms` : 'missing', base[`--duration-${name}`]);
}

// tokens.ts target size vs theme.css
const tsTarget = /TARGET_MIN_PX\s*=\s*(\d+)/.exec(tokensTs)?.[1];
expectNumber('minimum target size', tsTarget ? `${tsTarget}px` : 'missing', base['--target-min']);

// Every token tokens.ts hands to JS must exist in the stylesheet.
// Comments are stripped first — the doc comments talk about `var(--token)`.
const referenced = [...stripComments(tokensTs).matchAll(/var\((--[\w-]+)\)/g)].map(([, token]) => token);
const missing = [...new Set(referenced)].filter((token) => !(token in base));
if (missing.length > 0) fail(`src/tokens.ts references undeclared token(s): ${missing.join(', ')}`);
else console.log(`  ok    all ${new Set(referenced).size} tokens referenced by tokens.ts are declared`);

// --- the prototype's plain-CSS view of the semantic layer -------------------

/**
 * The clickable prototype (docs/design/prototype) loads the real stylesheet in a
 * browser with no build step — and a browser ignores `@theme` wholesale, so every
 * semantic token would be undefined there. This renders that block as plain CSS
 * so the prototype keeps working, and then asserts the rendered file is current,
 * which is what keeps "the mockup cannot drift from the code" true.
 *
 * Regenerate with: pnpm --filter @urbanpetly/ui check:tokens -- --write
 */
const PROTOTYPE_CSS = resolve(pkgRoot, '../../docs/design/prototype/tokens-resolved.css');

const rendered = [
  '/**',
  ' * GENERATED — do not edit. Run `pnpm --filter @urbanpetly/ui check:tokens -- --write`.',
  ' *',
  " * The semantic layer from packages/ui/src/theme.css, rendered as plain CSS so the",
  ' * dependency-free prototype can use it. In a real app Tailwind emits these itself.',
  ' */',
  '',
  ':root {',
  ...Object.entries(theme).map(([name, value]) => `  ${name}: ${value};`),
  '}',
  '',
].join('\n');

console.log('\nPrototype stylesheet');
if (WRITE) {
  writeFileSync(PROTOTYPE_CSS, rendered, 'utf8');
  console.log('  ok    wrote docs/design/prototype/tokens-resolved.css');
} else {
  let current = null;
  try {
    current = readFileSync(PROTOTYPE_CSS, 'utf8');
  } catch {
    fail('docs/design/prototype/tokens-resolved.css is missing — run check:tokens -- --write');
  }
  if (current !== null && current !== rendered) {
    fail('docs/design/prototype/tokens-resolved.css is stale — run check:tokens -- --write');
  } else if (current !== null) {
    console.log('  ok    docs/design/prototype/tokens-resolved.css matches theme.css');
  }
}

// --- result ----------------------------------------------------------------

if (failures > 0) {
  console.error(`\n${failures} token check(s) failed.`);
  process.exit(1);
}
console.log('\nAll token checks passed.');
