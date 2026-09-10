import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiFetch, parseBody, toClientError } from '../../../../../../lib/auth-routes';
import { accessToken } from '../../../../../../lib/auth-server';

const schema = z.object({
  progressPercent: z.number().int().min(0).max(100).optional(),
  timeSpentSeconds: z.number().int().min(0).optional(),
});

interface Params {
  params: Promise<{ chapterId: string }>;
}

/**
 * The browser reports progress here, never to the API directly: the access token
 * stays in this runtime (docs/rules.md #21).
 */
export async function POST(request: Request, { params }: Params): Promise<NextResponse> {
  const parsed = await parseBody(request, schema);
  if ('error' in parsed) return parsed.error;

  const { chapterId } = await params;
  try {
    const result = await apiFetch<{ status: string; progressPercent: number }>(
      `/me/progress/chapters/${encodeURIComponent(chapterId)}`,
      { method: 'PUT', body: parsed.data, accessToken: await accessToken() },
    );
    return NextResponse.json({ status: result.status, progressPercent: result.progressPercent });
  } catch (error) {
    return toClientError(error);
  }
}
