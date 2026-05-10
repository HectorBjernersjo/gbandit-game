export type DevUser = "eric" | "anna" | "steve" | null;

const STORAGE_KEY = "gbandit-dev-user";

const VALID: DevUser[] = ["eric", "anna", "steve"];

export function getDevUser(): DevUser {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw && VALID.includes(raw as DevUser)) return raw as DevUser;
  return null;
}

export function setDevUser(user: DevUser): void {
  if (user) localStorage.setItem(STORAGE_KEY, user);
  else localStorage.removeItem(STORAGE_KEY);
}
