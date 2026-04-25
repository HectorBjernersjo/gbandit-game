import { useLoaderData } from "react-router";
import { type SessionUser } from "@/api/session";
import { AuthProvider } from "@/lib/auth-context";
import { HomeLoggedIn } from "@/pages/HomeLoggedIn";
import { HomeLoggedOut } from "@/pages/HomeLoggedOut";

export function Home() {
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
