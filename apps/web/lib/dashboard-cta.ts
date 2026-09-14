import type { DashboardView } from './catalog';

/**
 * The verb on the dashboard's primary button. It used to say "Commencer" for
 * anything but "caught up" — including under "Continuer : <chapter>" for a
 * chapter already half read.
 */
export function callToAction(view: Pick<DashboardView, 'nextBestAction' | 'continue'>): string {
  const action = view.nextBestAction;

  if (action.type === 'CAUGHT_UP') return 'Explorer';
  if (action.type === 'BOOST' || action.type === 'REVIEW') return 'Renforcer';

  const resume = view.continue;
  const resuming = resume !== null && action.href === `/learn/${resume.technologySlug}/${resume.chapterSlug}`;
  return resuming ? 'Reprendre' : 'Commencer';
}
