import { gbanditOrigin } from "@/lib/gbandit";

type TokenResponse = {
  access_token: string;
  expires_at: string;
};

const tokenState: {
  value: string | null;
  expiresAt: number;
} = {
  value: null,
  expiresAt: 0,
};

export function authOrigin(): string {
  return gbanditOrigin("auth");
}

export function loginUrl(redirect = window.location.href): string {
  return `${authOrigin()}/login?redirect=${encodeURIComponent(redirect)}`;
}

export function logoutUrl(redirect = window.location.origin): string {
  return `${authOrigin()}/api/logout?redirect=${encodeURIComponent(redirect)}`;
}

export function guestUrl(redirect = window.location.href): string {
  return `${authOrigin()}/api/anonymous?redirect=${encodeURIComponent(redirect)}`;
}

export async function getAccessToken(forceRefresh = false): Promise<string | null> {
  const now = Date.now();
  if (!forceRefresh && tokenState.value && now < tokenState.expiresAt - 30_000) {
    return tokenState.value;
  }

  const response = await fetch(`${authOrigin()}/api/token`, {
    method: "POST",
    credentials: "include",
  });

  if (response.status === 401) {
    tokenState.value = null;
    tokenState.expiresAt = 0;
    return null;
  }

  if (!response.ok) {
    throw new Error(`failed to mint access token: ${response.status}`);
  }

  const payload = (await response.json()) as TokenResponse;
  tokenState.value = payload.access_token;
  tokenState.expiresAt = Date.parse(payload.expires_at);
  return payload.access_token;
}
