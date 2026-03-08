import { createContext, use } from "react";
import type { SessionUser } from "@/lib/api";

const AuthContext = createContext<SessionUser | null>(null);

export const AuthProvider = AuthContext.Provider;

export function useUser(): SessionUser {
  const user = use(AuthContext);
  if (!user) throw new Error("useUser must be used within an AuthProvider");
  return user;
}

export function useOptionalUser(): SessionUser | null {
  return use(AuthContext);
}
