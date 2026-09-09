import { EngineInputError, type StreakResult, type StreakState } from './types';

/**
 * A learning day is the user's local calendar day (docs/decisions.md, marked as an
 * assumption). `Intl` resolves it without a date library and handles daylight
 * saving transitions, since it works on calendar dates rather than on offsets.
 */
export function localDay(instant: Date, timeZone: string): string {
  if (!(instant instanceof Date) || Number.isNaN(instant.getTime())) {
    throw new EngineInputError('instant', 'instant doit être une date valide');
  }
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(instant);
  } catch {
    throw new EngineInputError('timeZone', `Fuseau horaire inconnu : ${timeZone}`);
  }
}

function previousDay(day: string): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

/**
 * Increments at most once per local day. Any XP-earning activity counts; passive
 * page views do not (CDC §26), which is why callers pass the activity instant
 * rather than a page load.
 */
export function updateStreak(
  state: StreakState,
  activityAt: Date,
  timeZone: string,
): StreakResult {
  const today = localDay(activityAt, timeZone);
  const last = state.lastActiveDate;

  if (last === today) {
    return {
      ...state,
      changed: false,
      reason: 'Déjà actif aujourd’hui : la série ne compte qu’une fois par jour.',
    };
  }

  const continuing = last !== null && last === previousDay(today);
  const currentDays = continuing ? state.currentDays + 1 : 1;
  const longestDays = Math.max(state.longestDays, currentDays);

  return {
    currentDays,
    longestDays,
    lastActiveDate: today,
    changed: true,
    reason: continuing
      ? `Deuxième jour consécutif au moins : la série passe à ${currentDays}.`
      : last === null
        ? 'Première journée d’apprentissage : la série démarre à 1.'
        : `Un jour a été manqué depuis le ${last} : la série repart à 1.`,
  };
}

/** True when the streak is still alive but today has not been counted yet. */
export function isStreakAtRisk(state: StreakState, now: Date, timeZone: string): boolean {
  if (state.lastActiveDate === null) return false;
  const today = localDay(now, timeZone);
  return state.lastActiveDate === previousDay(today);
}
