/**
 * What a graded attempt meant for XP, in words (CDC §26). A retake that repeats
 * the same score earns nothing — and used to say nothing either, which reads as a
 * bug rather than as the rule.
 *
 * It never promises XP for an improvement: the engine requires a minimum gain,
 * and that threshold belongs to the API, not to this screen.
 */
export function xpNote(result: {
  passed: boolean;
  scorePercent: number;
  previousBestScore: number | null;
}): string | null {
  if (!result.passed) return null;

  if (result.previousBestScore === null) {
    return 'Premier passage réussi : l’XP de ce quiz t’est acquise.';
  }
  if (result.scorePercent > result.previousBestScore) {
    return `Meilleur score dépassé : ${result.previousBestScore} % → ${result.scorePercent} %.`;
  }
  return `Pas d’XP cette fois : tu avais déjà fait ${result.previousBestScore} %. Seule une amélioration en rapporte.`;
}
