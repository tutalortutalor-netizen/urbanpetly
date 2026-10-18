import globals from 'globals';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

/**
 * Overlay for React workspaces (apps/web, apps/provider, apps/admin, packages/ui).
 * Apply after the base preset and scope it with `files`.
 *
 * Accessibility rules are errors, not warnings: see docs/05-ux-spec.md and docs/06-nfr.md.
 *
 * @type {import('eslint').Linter.Config[]}
 */
export const react = [
  {
    languageOptions: {
      globals: { ...globals.browser },
      ecmaVersion: 2023,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      'jsx-a11y': jsxA11y,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
];

export default react;
