import { NextResponse } from 'next/server';
import { registerSchema } from '@app/validation';
import { apiFetch, parseBody, toClientError } from '../../../../lib/auth-routes';
import { writeSession, type SessionTokens } from '../../../../lib/session';

interface RegisterResponse extends SessionTokens {
  user: { id: string; email: string; displayName: string; emailVerified: boolean };
}

export async function POST(request: Request): Promise<NextResponse> {
  const parsed = await parseBody(request, registerSchema);
  if ('error' in parsed) return parsed.error;

  try {
    const session = await apiFetch<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: parsed.data,
    });

    // The tokens stop here: the browser gets the user, never the credentials.
    const response = NextResponse.json({ user: session.user }, { status: 201 });
    writeSession(response.cookies, session);
    return response;
  } catch (error) {
    return toClientError(error);
  }
}
