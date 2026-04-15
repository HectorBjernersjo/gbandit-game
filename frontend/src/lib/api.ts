import { getAccessToken } from "@/lib/auth";
import { ResultAsync, errAsync } from "neverthrow";

export interface SessionUser {
    id: string;
    name: string;
    is_anon: boolean;
}

export interface ApiError {
    status: number;
    message: string;
    path: string;
}

function logApiError(message: string, details: Record<string, unknown>) {
    console.error(`[api] ${message}`, details);
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

function withBearer(init: RequestInit | undefined, token: string): RequestInit {
    const headers = new Headers(init?.headers ?? {});
    headers.set("authorization", `Bearer ${token}`);

    return {
        ...init,
        headers,
    };
}

function apiFetchWithToken<T>(
    path: string,
    init?: RequestInit,
    forceRefresh = false,
): ResultAsync<T, ApiError> {
    return ResultAsync.fromPromise(getAccessToken(forceRefresh), (error): ApiError => ({
        status: 401,
        message: String(error),
        path,
    })).andThen((token) => {
        if (!token) return errAsync<T, ApiError>({ status: 401, message: "not authenticated", path });
        return rawFetch<T>(path, withBearer(init, token));
    });
}

export function getMe(): ResultAsync<SessionUser, ApiError> {
    return apiFetchWithToken<SessionUser>("/api/me").orElse((error) => {
        if (error.status !== 401) return errAsync(error);
        return apiFetchWithToken<SessionUser>("/api/me", undefined, true);
    });
}

export function getOptionalMe(): ResultAsync<SessionUser | null, ApiError> {
    return getMe().orElse((error) => {
        if (error.status === 401) return ResultAsync.fromSafePromise(Promise.resolve(null));
        return errAsync(error);
    });
}
