import Link from 'next/link';
import { Card } from '@app/ui';
import type { ApiError } from '../../../../lib/api';

interface LockReason {
  code: string;
  skills: Array<{ id: string; name: string; mastery: number; required: number }>;
}

/**
 * The refusal comes from the API with its reason, so this screen explains rather
 * than guesses — and no chapter content was ever sent.
 */
export function LockedChapter({
  technologySlug,
  error,
}: {
  technologySlug: string;
  error: ApiError;
}) {
  const reason = (error.body as { lockReason?: LockReason } | undefined)?.lockReason;

  return (
    <div className="mx-auto flex max-w-xl flex-col justify-center gap-5 px-5 py-16">
      <Card quiet className="flex flex-col gap-4">
        <h1 className="font-display text-2xl font-semibold">Ce chapitre est encore verrouillé</h1>

        {reason && reason.skills.length > 0 ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-text-muted">
              Il s’ouvrira quand ces compétences seront suffisamment maîtrisées :
            </p>
            <ul className="flex list-none flex-col gap-2 p-0">
              {reason.skills.map((skill) => (
                <li key={skill.id} className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-text">{skill.name}</span>
                  <span className="font-mono text-xs text-text-subtle">
                    {skill.mastery} % / {skill.required} % requis
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-text-muted">
            Termine les chapitres précédents pour y accéder.
          </p>
        )}

        <Link href={`/learn/${technologySlug}`} className="text-[13px]">
          Revenir au parcours
        </Link>
      </Card>
    </div>
  );
}
