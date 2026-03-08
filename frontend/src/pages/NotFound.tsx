import { Link } from "react-router";

export function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold opacity-15">404</h1>
      <p className="text-foreground/50 text-sm">This page doesn't exist.</p>
      <Link
        to="/"
        className="mt-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
      >
        Go home
      </Link>
    </main>
  );
}
