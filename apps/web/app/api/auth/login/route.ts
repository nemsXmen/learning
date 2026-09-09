import { NextResponse } from 'next/server';
import { loginSchema } from '@app/validation';
import { apiFetch, parseBody, toClientError } from '../../../../lib/auth-routes';
import { writeSession, type SessionTokens } from '../../../../lib/session';

interface LoginResponse extends SessionTokens {
  user: { id: string; email: string; displayName: string; emailVerified: boolean };
}

export async function POST(request: Request): Promise<NextResponse> {
  const parsed = await parseBody(request, loginSchema);
  if ('error' in parsed) return parsed.error;

  try {
    const session = await apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: parsed.data,
    });

    const response = NextResponse.json({ user: session.user });
    writeSession(response.cookies, session);
    return response;
  } catch (error) {
    return toClientError(error);
  }
}
