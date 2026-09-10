import { NextResponse } from 'next/server';
import { apiFetch, toClientError } from '../../../../../../../lib/auth-routes';
import { accessToken } from '../../../../../../../lib/auth-server';

interface Params {
  params: Promise<{ id: string; index: string }>;
}

export async function POST(request: Request, { params }: Params): Promise<NextResponse> {
  const { id, index } = await params;
  const body = await request.json().catch(() => null);

  try {
    const result = await apiFetch<unknown>(
      `/me/boost/sessions/${encodeURIComponent(id)}/steps/${encodeURIComponent(index)}`,
      { method: 'POST', body, accessToken: await accessToken() },
    );
    return NextResponse.json(result);
  } catch (error) {
    return toClientError(error);
  }
}
