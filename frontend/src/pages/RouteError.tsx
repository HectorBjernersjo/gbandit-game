import { SignOutButton } from "@/components/SignOutButton";

export function RouteError() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="text-foreground/60">
        We couldn&apos;t load your account. Please try again later.
      </p>
      <SignOutButton />
    </main>
  );
}
