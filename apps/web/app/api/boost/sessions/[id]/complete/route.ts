import { NextResponse } from 'next/server';
import { apiFetch, toClientError } from '../../../../../../lib/auth-routes';
import { accessToken } from '../../../../../../lib/auth-server';

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: Params): Promise<NextResponse> {
  const { id } = await params;

  try {
    const result = await apiFetch<unknown>(
      `/me/boost/sessions/${encodeURIComponent(id)}/complete`,
      { method: 'POST', accessToken: await accessToken() },
    );
    return NextResponse.json(result);
  } catch (error) {
    return toClientError(error);
  }
}
