/**
 * The browser holds cookies and nothing else. Tokens live here, in the Next.js
 * server runtime, and are attached to API calls server-side — no client component
 * ever receives one (docs/rules.md #21, #28).
 *
 * Deliberately free of `server-only` so the middleware can import it too.
 */

export const ACCESS_COOKIE = 'atelier_at';
export const REFRESH_COOKIE = 'atelier_rt';

/** 30 days, matching JWT_REFRESH_TTL. */
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface CookieOptions {
  httpOnly: true;
  secure: boolean;
  sameSite: 'lax';
  path: '/';
  maxAge: number;
}

function isSecure(): boolean {
  return process.env['SESSION_COOKIE_SECURE'] === 'true';
}

/**
 * httpOnly so script cannot read it, SameSite=Lax so a cross-site POST cannot
 * ride it, Secure once deployed.
 */
export function cookieOptions(maxAge: number): CookieOptions {
  return { httpOnly: true, secure: isSecure(), sameSite: 'lax', path: '/', maxAge };
}

/**
 * Structural, not derived from NextResponse: the same helpers write cookies on a
 * response, on a request, and on a plain object in tests.
 */
export interface CookieWriter {
  set(name: string, value: string, options: CookieOptions): unknown;
}

export function writeSession(cookies: CookieWriter, tokens: SessionTokens): void {
  cookies.set(ACCESS_COOKIE, tokens.accessToken, cookieOptions(tokens.expiresIn));
  cookies.set(REFRESH_COOKIE, tokens.refreshToken, cookieOptions(REFRESH_MAX_AGE));
}

export function clearSession(cookies: CookieWriter): void {
  // maxAge 0 rather than delete(): the attributes must match for every browser
  // to drop the cookie reliably.
  cookies.set(ACCESS_COOKIE, '', cookieOptions(0));
  cookies.set(REFRESH_COOKIE, '', cookieOptions(0));
}

/** Routes that require a session. Everything else is public. */
export const PROTECTED_PREFIXES = ['/dashboard', '/learn', '/boost', '/practice', '/profile'] as const;

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
