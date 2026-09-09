import { NextResponse } from 'next/server';
import { z } from 'zod';
import { emailSchema } from '@app/validation';
import { apiFetch, parseBody, toClientError } from '../../../../../lib/auth-routes';

const schema = z.object({ email: emailSchema });

/** 202 whether or not the address exists — the API decides nothing else. */
export async function POST(request: Request): Promise<NextResponse> {
  const parsed = await parseBody(request, schema);
  if ('error' in parsed) return parsed.error;

  try {
    await apiFetch<void>('/auth/password/forgot', { method: 'POST', body: parsed.data });
    return new NextResponse(null, { status: 202 });
  } catch (error) {
    return toClientError(error);
  }
}
