import { NextResponse } from 'next/server';
import { apiFetch, toClientError } from '../../../../../../lib/auth-routes';
import { accessToken } from '../../../../../../lib/auth-server';

interface Params {
  params: Promise<{ attemptId: string }>;
}

/**
 * Grading happens in the API, never here and never in the browser: the answer key
 * must not travel (docs/rules.md #29).
 */
export async function POST(request: Request, { params }: Params): Promise<NextResponse> {
  const { attemptId } = await params;
  const body = await request.json().catch(() => null);

  try {
    const result = await apiFetch<unknown>(
      `/quizzes/attempts/${encodeURIComponent(attemptId)}/submit`,
      { method: 'POST', body, accessToken: await accessToken() },
    );
    return NextResponse.json(result);
  } catch (error) {
    return toClientError(error);
  }
}
