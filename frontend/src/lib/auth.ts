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

function baseDomain(): string {
  const { hostname } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".localhost")) {
    return "gbandit.localhost";
  }
  return "gbandit.com";
}

export function authOrigin(): string {
  return `${window.location.protocol}//auth.${baseDomain()}`;
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
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      audience: "game-backend",
    }),
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
