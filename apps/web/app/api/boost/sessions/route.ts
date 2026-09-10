import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiFetch, parseBody, toClientError } from '../../../../lib/auth-routes';
import { accessToken } from '../../../../lib/auth-server';

const schema = z.object({ availableMinutes: z.number().int() });

export async function POST(request: Request): Promise<NextResponse> {
  const parsed = await parseBody(request, schema);
  if ('error' in parsed) return parsed.error;

  try {
    const session = await apiFetch<unknown>('/me/boost/sessions', {
      method: 'POST',
      body: parsed.data,
      accessToken: await accessToken(),
    });
    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    return toClientError(error);
  }
}
