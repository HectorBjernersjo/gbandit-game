import { useLoaderData } from "react-router";
import { type SessionUser } from "@/api/session";
import { AuthProvider } from "@/lib/auth-context";
import { HomeLoggedIn } from "@/pages/HomeLoggedIn";
import { HomeLoggedOut } from "@/pages/HomeLoggedOut";

// Auth-aware home page. Requires the backend (uncomment `backend` in
// gbandit.jsonc) and the auth routes in router.ts — its loader calls the
// backend's /api/me to resolve the signed-in user.
export function AuthHome() {
  const user = useLoaderData<SessionUser | null>();

  if (user) {
    return (
      <AuthProvider value={user}>
        <HomeLoggedIn />
      </AuthProvider>
    );
  }

  return <HomeLoggedOut />;
}
