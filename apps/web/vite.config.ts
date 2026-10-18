import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// Framework mode (ADR-022): the React Router plugin replaces @vitejs/plugin-react
// and owns the HTML entry. Vitest reads vitest.config.ts instead - the plugin
// expects a real route build, which the unit tests neither have nor need.
export default defineConfig({
  plugins: [reactRouter(), tailwindcss()],
  // The React Router CLI does not forward Vite's --port/--strictPort flags, so
  // the port the README documents is pinned here instead.
  server: { port: 5173, strictPort: true },
  preview: { port: 5173, strictPort: true },
  // Client source maps only. The server environment exists purely to prerender
  // at build time, and React Router warns that shipping its source maps would
  // publish server code to the browser. The build still prints that warning
  // because any source map triggers it - `build/server` carries no .map files.
  environments: {
    client: { build: { sourcemap: true } },
  },
});
