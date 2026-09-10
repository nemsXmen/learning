import { NextResponse } from 'next/server';
import { apiFetch, toClientError } from '../../../../../../lib/auth-routes';
import { accessToken } from '../../../../../../lib/auth-server';

interface Params {
  params: Promise<{ chapterId: string }>;
}

export async function POST(_request: Request, { params }: Params): Promise<NextResponse> {
  const { chapterId } = await params;
  try {
    const result = await apiFetch<{ status: string; alreadyCompleted: boolean }>(
      `/me/progress/chapters/${encodeURIComponent(chapterId)}/complete`,
      { method: 'POST', accessToken: await accessToken() },
    );
    // xpAwarded arrives with slice 11; the contract keeps the field reserved.
    return NextResponse.json({ status: result.status, alreadyCompleted: result.alreadyCompleted });
  } catch (error) {
    return toClientError(error);
  }
}
