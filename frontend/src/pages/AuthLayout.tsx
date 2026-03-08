import { Outlet, useLoaderData } from "react-router";
import { type SessionUser } from "@/lib/api";
import { AuthProvider } from "@/lib/auth-context";

export function AuthLayout() {
  const user = useLoaderData<SessionUser>();

  return (
    <AuthProvider value={user}>
      <Outlet />
    </AuthProvider>
  );
}
