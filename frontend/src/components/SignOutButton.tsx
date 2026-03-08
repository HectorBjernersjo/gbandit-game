import { logoutUrl } from "@/lib/auth";

export function SignOutButton() {
  return (
    <a
      href={logoutUrl()}
      className="rounded-lg border border-foreground/20 px-4 py-2 text-sm hover:bg-foreground/5 transition-colors"
    >
      Sign out
    </a>
  );
}
