import 'server-only';
import { NextResponse } from 'next/server';
import type { ZodTypeAny, z } from 'zod';
import { ApiError, apiFetch } from './api';

/**
 * Shared shape for the browser-facing auth handlers. They are the only place
 * tokens are read or written, and they never put one in a response body.
 */
export async function parseBody<T extends ZodTypeAny>(
  request: Request,
  schema: T,
): Promise<{ data: z.infer<T> } | { error: NextResponse }> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { error: NextResponse.json({ code: 'INVALID_BODY' }, { status: 400 }) };
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: NextResponse.json(
        {
          code: 'VALIDATION_FAILED',
          fields: parsed.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 },
      ),
    };
  }
  return { data: parsed.data };
}

/** Forwards an API error verbatim, minus anything the browser should not see. */
export function toClientError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json({ code: error.code, message: error.message }, { status: error.status });
  }
  return NextResponse.json(
    { code: 'UPSTREAM_UNAVAILABLE', message: 'Service indisponible, réessaie dans un instant.' },
    { status: 503 },
  );
}

export { apiFetch, ApiError };
