function baseDomain(): string {
  const { hostname } = window.location;
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".localhost")
  ) {
    return "gbandit.localhost";
  }
  return "gbandit.com";
}

export function gbanditOrigin(subdomain: string): string {
  return `${window.location.protocol}//${subdomain}.${baseDomain()}`;
}
