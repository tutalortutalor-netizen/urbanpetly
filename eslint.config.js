import base from '@urbanpetly/config/eslint/base';
import node from '@urbanpetly/config/eslint/node';
import react from '@urbanpetly/config/eslint/react';

const REACT_WORKSPACES = ['apps/web', 'apps/provider', 'apps/admin', 'packages/ui'];
const NODE_WORKSPACES = ['apps/api', 'packages/shared', 'packages/api-client', 'packages/config'];

/** Expand a workspace list into the glob form flat config expects. */
const filesIn = (workspaces) => workspaces.map((w) => `${w}/**/*.{ts,tsx,js,jsx}`);

export default [
  ...base,
  ...react.map((config) => ({ ...config, files: filesIn(REACT_WORKSPACES) })),
  ...node.map((config) => ({ ...config, files: filesIn(NODE_WORKSPACES) })),
  {
    // Config files run in Node regardless of which workspace they live in.
    files: ['**/*.config.{ts,js}', 'eslint.config.js', 'prettier.config.js'],
    ...node[0],
  },
  {
    // apps/web runs React Router in framework mode (ADR-022), where a route
    // module exports data and metadata alongside its component by design. Only
    // apps/web: apps/provider and apps/admin use the plain router and should
    // keep the stricter default.
    files: ['apps/web/src/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': [
        'warn',
        {
          allowConstantExport: true,
          allowExportNames: [
            'action',
            'clientAction',
            'clientLoader',
            'handle',
            'headers',
            'links',
            'loader',
            'meta',
            'shouldRevalidate',
          ],
        },
      ],
    },
  },
];
