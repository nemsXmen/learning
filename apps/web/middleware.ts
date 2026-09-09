import { NextResponse, type NextRequest } from 'next/server';
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  isProtectedPath,
  writeSession,
  clearSession,
  type SessionTokens,
} from './lib/session';

/**
 * The only place a session is refreshed. A Server Component cannot set cookies
 * during render, so silent refresh has to happen here — before the page runs.
 */
async function refresh(refreshToken: string): Promise<SessionTokens | null> {
  const base = process.env['API_BASE_URL'];
  if (!base) return null;

  try {
    const response = await fetch(new URL('/auth/refresh', base), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    });
    if (!response.ok) return null;
    return (await response.json()) as SessionTokens;
  } catch {
    // API unreachable: treat as no session rather than throwing on every request.
    return null;
  }
}

function toLogin(request: NextRequest): NextResponse {
  const url = new URL('/login', request.url);
  url.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search);
  const response = NextResponse.redirect(url);
  clearSession(response.cookies);
  return response;
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  // A signed-in visitor has no business on the sign-in screens.
  if ((pathname === '/login' || pathname === '/register') && accessToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!isProtectedPath(pathname)) return NextResponse.next();

  if (accessToken) return NextResponse.next();

  if (!refreshToken) return toLogin(request);

  const tokens = await refresh(refreshToken);
  if (!tokens) return toLogin(request);

  // Two writes, both needed: on the request so the page rendering *now* sees the
  // fresh token, and on the response so the browser keeps it for the next one.
  request.cookies.set(ACCESS_COOKIE, tokens.accessToken);
  request.cookies.set(REFRESH_COOKIE, tokens.refreshToken);
  const response = NextResponse.next({ request });
  writeSession(response.cookies, tokens);
  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/learn/:path*',
    '/boost/:path*',
    '/practice/:path*',
    '/profile/:path*',
    '/login',
    '/register',
  ],
};
