import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { apiFetch, ApiError } from './api';
import { ACCESS_COOKIE } from './session';

export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  timezone: string;
  goal: string;
  dailyMinutesTarget: number;
  createdAt: string;
}

/**
 * The signed-in user, or null. Reads the access cookie and asks the API; it never
 * refreshes, because a Server Component cannot set cookies during render — the
 * middleware owns refreshing.
 */
export async function getCurrentUser(): Promise<PublicUser | null> {
  const store = await cookies();
  const accessToken = store.get(ACCESS_COOKIE)?.value;
  if (!accessToken) return null;

  try {
    return await apiFetch<PublicUser>('/auth/me', { accessToken, cache: 'no-store' });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

/** For protected pages: the middleware normally redirects first; this is the belt. */
export async function requireUser(pathname: string): Promise<PublicUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(pathname)}`);
  return user;
}

/** The access token, for route handlers proxying on the learner's behalf. */
export async function accessToken(): Promise<string | undefined> {
  return (await cookies()).get(ACCESS_COOKIE)?.value;
}
