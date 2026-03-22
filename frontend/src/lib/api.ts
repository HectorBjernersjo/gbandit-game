import { ResultAsync, errAsync } from "neverthrow";

export interface SessionUser {
  id: number;
  name: string;
  is_anon: boolean;
  prev_anon_user_ids?: number[];
}

export interface ApiError {
  status: number;
  message: string;
  path: string;
}

// Dedup concurrent refresh attempts — all 401 retries share one in-flight refresh.
let refreshPromise: Promise<boolean> | null = null;

function logApiError(message: string, details: Record<string, unknown>) {
  console.error(`[api] ${message}`, details);
}

function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch("/auth/refresh")
    .then((res) => {
      if (!res.ok) {
        logApiError("session refresh failed", { path: "/auth/refresh", status: res.status });
      }

      return res.ok;
    })
    .catch((error) => {
      logApiError("session refresh request failed", {
        path: "/auth/refresh",
        error: String(error),
      });
      return false;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

function rawFetch<T>(path: string, init?: RequestInit): ResultAsync<T, ApiError> {
  return ResultAsync.fromPromise(
    fetch(path, init),
    (error): ApiError => {
      const apiError = { status: 0, message: String(error), path };
      logApiError("request failed before response", {
        path,
        method: init?.method ?? "GET",
        error: apiError.message,
      });
      return apiError;
    },
  ).andThen((response) => {
    if (!response.ok) {
      return ResultAsync.fromPromise(
        response.text(),
        (): ApiError => ({
          status: response.status,
          message: "failed to read response",
          path,
        }),
      ).andThen((body) => errAsync({ status: response.status, message: body, path }));
    }

    return ResultAsync.fromPromise(
      response.json() as Promise<T>,
      (): ApiError => {
        const apiError = { status: 0, message: "failed to parse response", path };
        logApiError("response parsing failed", {
          path,
          method: init?.method ?? "GET",
          status: response.status,
        });
        return apiError;
      },
    );
  });
}

function apiFetch<T>(path: string, init?: RequestInit): ResultAsync<T, ApiError> {
  return rawFetch<T>(path, init).orElse((error) => {
    if (error.status !== 401) return errAsync(error);

    // 401 — try refreshing the session, then retry once
    return ResultAsync.fromSafePromise(tryRefresh()).andThen((ok) => {
      if (!ok) return errAsync(error);
      return rawFetch<T>(path, init);
    });
  });
}

export function getMe(): ResultAsync<SessionUser, ApiError> {
  return apiFetch<SessionUser>("/api/me");
}

export function getOptionalMe(): ResultAsync<SessionUser | null, ApiError> {
  return getMe().orElse((error) => {
    if (error.status === 401) return ResultAsync.fromSafePromise(Promise.resolve(null));
    return errAsync(error);
  });
}
