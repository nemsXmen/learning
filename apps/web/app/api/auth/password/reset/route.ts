import { NextResponse } from 'next/server';
import { z } from 'zod';
import { passwordSchema } from '@app/validation';
import { apiFetch, parseBody, toClientError } from '../../../../../lib/auth-routes';
import { clearSession } from '../../../../../lib/session';

const schema = z.object({ token: z.string().min(1), password: passwordSchema });

export async function POST(request: Request): Promise<NextResponse> {
  const parsed = await parseBody(request, schema);
  if ('error' in parsed) return parsed.error;

  try {
    await apiFetch<void>('/auth/password/reset', { method: 'POST', body: parsed.data });

    // The API just revoked every session; drop the cookies here too so the
    // browser does not keep presenting a token that no longer works.
    const response = new NextResponse(null, { status: 204 });
    clearSession(response.cookies);
    return response;
  } catch (error) {
    return toClientError(error);
  }
}
