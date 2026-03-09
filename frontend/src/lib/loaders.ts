import { redirect } from "react-router";
import { getMe, getOptionalMe, type SessionUser } from "@/lib/api";

export async function requireUser(): Promise<SessionUser> {
  const result = await getMe();

  if (result.isOk()) return result.value;

  if (result.error.status === 401) throw redirect("/");

  throw new Response(result.error.message, { status: result.error.status });
}

export async function optionalUser(): Promise<SessionUser | null> {
  const result = await getOptionalMe();

  if (result.isOk()) return result.value;

  throw new Response(result.error.message, { status: result.error.status });
}
