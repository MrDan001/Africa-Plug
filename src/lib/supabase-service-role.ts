import "server-only";

type JwtClaims = {
  role?: unknown;
  ref?: unknown;
  exp?: unknown;
};

function readJwtClaims(value: string): JwtClaims | null {
  const parts = value.split(".");
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) return null;

  try {
    return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as JwtClaims;
  } catch {
    return null;
  }
}

/**
 * Returns a server-side Supabase credential tied to the same project URL.
 *
 * Prefer a legacy service_role JWT when available because it carries an explicit
 * project ref and role that can be checked before Storage/Database requests.
 * A modern Supabase secret key is also accepted as a fallback.
 */
export function getSupabaseServiceRoleKey(projectUrl: string): string | null {
  let projectRef: string;
  try {
    const parsed = new URL(projectUrl);
    projectRef = parsed.hostname.split(".")[0];
    if (!projectRef || !parsed.hostname.endsWith(".supabase.co")) return null;
  } catch {
    return null;
  }

  const candidates = [
    process.env.SUPABASE_SERVICE_ROLE_JWT,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  ].map((value) => value?.trim()).filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    const claims = readJwtClaims(candidate);
    if (
      claims?.role === "service_role" &&
      claims.ref === projectRef &&
      (typeof claims.exp !== "number" || claims.exp * 1000 > Date.now())
    ) {
      return candidate;
    }
  }

  const modernSecretKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (modernSecretKey?.startsWith("sb_secret_")) return modernSecretKey;

  return null;
}
