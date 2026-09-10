import type { Metadata } from 'next';
import { QuizRunner } from './quiz-runner';

export const metadata: Metadata = {
  title: 'Quiz',
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ technology: string; chapter: string }>;
}

export default async function QuizPage({ params }: PageProps) {
  const { technology, chapter } = await params;
  return <QuizRunner technology={technology} chapter={chapter} />;
}
