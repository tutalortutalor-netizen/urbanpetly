import globals from 'globals';

/**
 * Overlay for Node workspaces (apps/api, packages/shared, packages/api-client).
 * Apply after the base preset and scope it with `files`.
 *
 * @type {import('eslint').Linter.Config[]}
 */
export const node = [
  {
    languageOptions: {
      globals: { ...globals.node },
      ecmaVersion: 2023,
      sourceType: 'module',
    },
  },
];

export default node;
