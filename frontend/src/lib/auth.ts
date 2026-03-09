export function loginUrl(): string {
  const redirect = encodeURIComponent(window.location.origin);
  return `/auth/login?redirect=${redirect}`;
}

export function logoutUrl(): string {
  const redirect = encodeURIComponent(window.location.origin);
  return `/auth/logout?redirect=${redirect}`;
}

export function guestUrl(): string {
  const redirect = encodeURIComponent(window.location.origin);
  return `/auth/anonymous?redirect=${redirect}`;
}
