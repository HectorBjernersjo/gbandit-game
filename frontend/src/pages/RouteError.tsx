import { useEffect } from "react";
import { isRouteErrorResponse, useRouteError } from "react-router";

export function RouteError() {
  const error = useRouteError();

  useEffect(() => {
    if (isRouteErrorResponse(error)) {
      console.error("[route] route error response", {
        status: error.status,
        statusText: error.statusText,
        data: error.data,
      });
      return;
    }

    console.error("[route] unexpected route error", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="text-foreground/60">
        We couldn&apos;t load this page. Please try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="rounded-lg border border-foreground/20 px-4 py-2 text-sm hover:bg-foreground/5 transition-colors"
      >
        Try again
      </button>
    </main>
  );
}
