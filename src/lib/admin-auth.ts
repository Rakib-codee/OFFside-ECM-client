import { createHash, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "offside_admin";

/** Session token derived from the admin password — rotating the password invalidates sessions. */
export function expectedAdminToken(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return null;
  }
  return createHash("sha256").update(`offside-admin:${password}`).digest("hex");
}

export function isValidAdminToken(token: string | undefined | null): boolean {
  const expected = expectedAdminToken();
  if (!expected || !token || token.length !== expected.length) {
    return false;
  }
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

/** Reads the admin cookie straight off a Request (for route handlers). */
export function isAdminRequest(request: Request): boolean {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_COOKIE}=`));
  return isValidAdminToken(match?.slice(ADMIN_COOKIE.length + 1));
}
