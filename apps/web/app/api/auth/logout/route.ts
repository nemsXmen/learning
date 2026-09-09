import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { apiFetch } from '../../../../lib/auth-routes';
import { REFRESH_COOKIE, clearSession } from '../../../../lib/session';

export async function POST(): Promise<NextResponse> {
  const store = await cookies();
  const refreshToken = store.get(REFRESH_COOKIE)?.value;

  if (refreshToken) {
    try {
      await apiFetch<void>('/auth/logout', { method: 'POST', body: { refreshToken } });
    } catch {
      // The server-side revocation failed; clearing the cookies still signs the
      // user out here, which is what they asked for.
    }
  }

  const response = new NextResponse(null, { status: 204 });
  clearSession(response.cookies);
  return response;
}
