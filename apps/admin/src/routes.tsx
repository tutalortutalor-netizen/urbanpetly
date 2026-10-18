import { Route, Routes } from 'react-router';

import { App } from './App';
import { NotFound } from './NotFound';

/**
 * Plain client-side routing. The back office sits behind login and is marked
 * noindex, so it deliberately does not use React Router framework mode or
 * prerendering - that is `apps/web` only (ADR-022).
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
