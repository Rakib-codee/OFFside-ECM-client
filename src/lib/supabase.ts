/** Shared server-side Supabase REST access (no SDK). Server modules only. */

export function supabaseConfig(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url: url.replace(/\/$/, ""), key } : null;
}

export function isDbConfigured(): boolean {
  return supabaseConfig() !== null;
}

interface RestOptions extends RequestInit {
  /** Next.js fetch cache: seconds + tags. Omit for no-store. */
  revalidate?: number;
  tags?: string[];
}

export async function supabaseRest(
  path: string,
  { revalidate, tags, ...init }: RestOptions,
): Promise<Response> {
  const config = supabaseConfig();
  if (!config) {
    throw new Error("Supabase is not configured");
  }
  return fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    ...(revalidate !== undefined
      ? { next: { revalidate, tags } }
      : { cache: "no-store" as const }),
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
}

/** Storage API (used for product image uploads). */
export async function supabaseStorage(path: string, init: RequestInit): Promise<Response> {
  const config = supabaseConfig();
  if (!config) {
    throw new Error("Supabase is not configured");
  }
  return fetch(`${config.url}/storage/v1/${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      ...init.headers,
    },
  });
}
