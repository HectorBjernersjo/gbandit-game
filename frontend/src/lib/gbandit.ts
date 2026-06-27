function baseDomain(): string {
  const { hostname } = window.location;
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".localhost")
  ) {
    return "gbandit.localhost";
  }
  // The game is served from `<project>.<base-domain>` (e.g. `flappy-bird.wt1.gbandit`
  // or `flappy-bird.gbandit.com`). Sibling services live on the same base domain, so
  // derive it by dropping the leading project label rather than hardcoding it.
  const labels = hostname.split(".");
  if (labels.length > 2) {
    return labels.slice(1).join(".");
  }
  return hostname;
}

export function gbanditOrigin(subdomain: string): string {
  return `${window.location.protocol}//${subdomain}.${baseDomain()}`;
}
