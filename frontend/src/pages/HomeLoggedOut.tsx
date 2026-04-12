import { GAME_NAME } from "@/config";
import { loginUrl, guestUrl } from "@/lib/auth";

export function HomeLoggedOut() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">{GAME_NAME}</h1>
      <p className="text-lg text-foreground/60">
        Sign in to get started, or try it out first.
      </p>
      <div className="flex gap-4">
        <a
          href={loginUrl()}
          className="rounded-lg bg-foreground px-6 py-3 text-background font-medium hover:opacity-90 transition-opacity"
        >
          Sign in
        </a>
        <a
          href={guestUrl()}
          className="rounded-lg border border-foreground/20 px-6 py-3 font-medium hover:bg-foreground/5 transition-colors"
        >
          Continue as guest
        </a>
      </div>
    </main>
  );
}
