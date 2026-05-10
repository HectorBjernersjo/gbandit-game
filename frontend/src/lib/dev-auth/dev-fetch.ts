import { ApiError } from "@/lib/http";
import { getDevUser } from "./dev-user";

export async function devApiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers ?? {});
  const devUser = getDevUser();
  if (devUser) headers.set("X-Dev-User", devUser);

  let response: Response;
  try {
    response = await fetch(path, { ...init, headers });
  } catch (error) {
    throw new ApiError(0, String(error), path);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "failed to read response");
    throw new ApiError(response.status, body, path);
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError(0, "failed to parse response", path);
  }
}
