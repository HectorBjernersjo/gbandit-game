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
}

// Dedup concurrent refresh attempts — all 401 retries share one in-flight refresh.
let refreshPromise: Promise<boolean> | null = null;

function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = fetch("/auth/refresh")
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

function rawFetch<T>(path: string, init?: RequestInit): ResultAsync<T, ApiError> {
  return ResultAsync.fromPromise(
    fetch(path, init),
    (e): ApiError => ({ status: 0, message: String(e) }),
  ).andThen((response) => {
    if (!response.ok) {
      return ResultAsync.fromPromise(
        response.text(),
        (): ApiError => ({
          status: response.status,
          message: "failed to read response",
        }),
      ).andThen((body) => errAsync({ status: response.status, message: body }));
    }
    return ResultAsync.fromPromise(
      response.json() as Promise<T>,
      (): ApiError => ({ status: 0, message: "failed to parse response" }),
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
