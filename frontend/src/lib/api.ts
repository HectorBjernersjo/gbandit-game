import { getAccessToken } from "@/lib/auth";

export interface SessionUser {
    id: string;
    name: string;
    is_anon: boolean;
}

export class ApiError extends Error {
    status: number;
    path: string;

    constructor(status: number, message: string, path: string) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.path = path;
    }
}

async function rawFetch<T>(path: string, init?: RequestInit): Promise<T> {
    let response: Response;
    try {
        response = await fetch(path, init);
    } catch (error) {
        throw new ApiError(0, String(error), path);
    }

    if (!response.ok) {
        let body: string;
        try {
            body = await response.text();
        } catch {
            throw new ApiError(response.status, "failed to read response", path);
        }
        throw new ApiError(response.status, body, path);
    }

    try {
        return (await response.json()) as T;
    } catch {
        throw new ApiError(0, "failed to parse response", path);
    }
}

function withBearer(init: RequestInit | undefined, token: string): RequestInit {
    const headers = new Headers(init?.headers ?? {});
    headers.set("authorization", `Bearer ${token}`);

    return {
        ...init,
        headers,
    };
}

async function apiFetchWithToken<T>(path: string, init?: RequestInit): Promise<T> {
    const fetchOnce = async (forceRefresh: boolean): Promise<T> => {
        let token: string | null;
        try {
            token = await getAccessToken(forceRefresh);
        } catch (error) {
            throw new ApiError(401, String(error), path);
        }
        if (!token) throw new ApiError(401, "not authenticated", path);
        return rawFetch<T>(path, withBearer(init, token));
    };

    try {
        return await fetchOnce(false);
    } catch (error) {
        // A cached token may still validate locally but be rejected by the server
        // (clock skew, JWKS rotation). Retry once with a forced refresh.
        if (error instanceof ApiError && error.status === 401) {
            return fetchOnce(true);
        }
        throw error;
    }
}

export async function getMe(): Promise<SessionUser> {
    return apiFetchWithToken<SessionUser>("/api/me");
}

export async function getOptionalMe(): Promise<SessionUser | null> {
    try {
        return await getMe();
    } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
    }
}
