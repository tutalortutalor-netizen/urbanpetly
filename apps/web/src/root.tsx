import type { ReactNode } from 'react';
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  type LinksFunction,
} from 'react-router';

import stylesHref from './styles.css?url';

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: stylesHref }];

/**
 * The document shell. In framework mode React Router owns `index.html`, so the
 * `<head>` that used to live in `index.html` lives here; per-page `<title>` and
 * description come from each route's `meta` export.
 */
export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-4 p-6">
      <h1 className="text-3xl font-semibold text-ink">
        {isNotFound ? 'Page not found' : 'Something went wrong'}
      </h1>
      <p className="text-ink-muted">
        {isNotFound
          ? 'That page does not exist. Try searching for a service instead.'
          : 'Please try again in a moment.'}
      </p>
    </main>
  );
}
