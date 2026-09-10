import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ApiError } from '../../../../lib/api';
import { accessToken, requireUser } from '../../../../lib/auth-server';
import { apiFetch } from '../../../../lib/api';
import { BoostRunner, type BoostSessionView } from './boost-runner';

export const metadata: Metadata = {
  title: 'Session Boost',
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BoostSessionPage({ params }: PageProps) {
  await requireUser('/boost');
  const { id } = await params;

  let session: BoostSessionView;
  try {
    // Server-side: the session resumes at whatever step it was left on.
    session = await apiFetch<BoostSessionView>(`/me/boost/sessions/${encodeURIComponent(id)}`, {
      accessToken: await accessToken(),
      cache: 'no-store',
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return <BoostRunner session={session} />;
}
