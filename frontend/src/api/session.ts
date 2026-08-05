import { redirect } from "react-router";
import { ApiError, apiFetchWithToken } from "@/lib/http";

export interface SessionUser {
  id: string;
  name: string;
  is_anon: boolean;
}

export function getMe(): Promise<SessionUser> {
  return apiFetchWithToken<SessionUser>("/api/me");
}

export async function getOptionalMe(): Promise<SessionUser | null> {
  try {
    return await getMe();
  } catch (error) {
    // 401 = not signed in. 404 = the platform gateway answering for a project
    // whose backend isn't deployed (backend commented out in gbandit.jsonc) —
    // treat both as "no user" instead of erroring the page.
    if (error instanceof ApiError && (error.status === 401 || error.status === 404)) {
      return null;
    }
    throw error;
  }
}

export async function requireUser(): Promise<SessionUser> {
  try {
    return await getMe();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) throw redirect("/");
    console.error("[loader] requireUser failed", error);
    if (error instanceof ApiError) throw new Response(error.message, { status: error.status });
    throw error;
  }
}

export async function optionalUser(): Promise<SessionUser | null> {
  try {
    return await getOptionalMe();
  } catch (error) {
    console.error("[loader] optionalUser failed", error);
    if (error instanceof ApiError) throw new Response(error.message, { status: error.status });
    throw error;
  }
}
