import { NextResponse } from 'next/server';
import { apiFetch, toClientError } from '../../../../../../../lib/auth-routes';
import { accessToken } from '../../../../../../../lib/auth-server';

interface Params {
  params: Promise<{ technology: string; chapter: string }>;
}

/** Starts an attempt. The questions come back without their answers. */
export async function POST(_request: Request, { params }: Params): Promise<NextResponse> {
  const { technology, chapter } = await params;
  try {
    const started = await apiFetch<unknown>(
      `/learn/${encodeURIComponent(technology)}/${encodeURIComponent(chapter)}/quiz/attempts`,
      { method: 'POST', accessToken: await accessToken() },
    );
    return NextResponse.json(started, { status: 201 });
  } catch (error) {
    return toClientError(error);
  }
}
