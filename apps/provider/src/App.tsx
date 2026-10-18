import { Button } from '@urbanpetly/ui';

import { env } from './env';

/**
 * Phase 0 placeholder. Provider onboarding and the request inbox arrive with
 * E5/E6; this screen exists so the scaffold is demonstrably wired end to end.
 */
export function App() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 p-6">
      <h1 className="text-3xl font-semibold text-ink">UrbanPetly for providers</h1>
      <p className="text-ink-muted">
        Manage your listing and your enquiries. The provider dashboard scaffold is running.
      </p>
      <p className="text-sm text-ink-muted">
        API: <code>{env.VITE_API_URL}</code>
      </p>
      <div>
        <Button>Go to my listing</Button>
      </div>
    </main>
  );
}
