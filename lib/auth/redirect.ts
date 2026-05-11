const DEFAULT_AUTH_REDIRECT = "/rooms";

export function safeInternalRedirectPath(
  value?: string | null,
  fallback = DEFAULT_AUTH_REDIRECT
) {
  const path = value?.trim();

  if (!path) return fallback;
  if (!path.startsWith("/")) return fallback;
  if (path.startsWith("//")) return fallback;
  if (path.includes("\\")) return fallback;
  if (/[\u0000-\u001f\u007f]/.test(path)) return fallback;

  return path;
}

