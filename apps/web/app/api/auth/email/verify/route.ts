import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiFetch, parseBody, toClientError } from '../../../../../lib/auth-routes';

const schema = z.object({ token: z.string().min(1) });

export async function POST(request: Request): Promise<NextResponse> {
  const parsed = await parseBody(request, schema);
  if ('error' in parsed) return parsed.error;

  try {
    const result = await apiFetch<{ emailVerified: boolean }>('/auth/email/verify', {
      method: 'POST',
      body: parsed.data,
    });
    return NextResponse.json(result);
  } catch (error) {
    return toClientError(error);
  }
}
