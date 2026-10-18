export function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-4 p-6">
      <h1 className="text-3xl font-semibold text-ink">Page not found</h1>
      <p className="text-ink-muted">
        That page does not exist. Go back to <a href="/">your dashboard</a>.
      </p>
    </main>
  );
}
