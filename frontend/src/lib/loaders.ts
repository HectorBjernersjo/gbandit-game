import { redirect } from "react-router";
import { ApiError, getMe, getOptionalMe, type SessionUser } from "@/lib/api";

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
