import { describe, expect, it } from 'vitest';
import {
  BOOST,
  CLOSING,
  FALLBACK_PATHS,
  GAMIFICATION,
  HERO,
  LOOP,
  MASTERY,
  MASTERY_DIMENSIONS,
  METADATA,
} from './landing-content';
import { PROTECTED_PREFIXES, isProtectedPath } from './session';

describe('landing metadata', () => {
  it('has a title and a description long enough to be useful', () => {
    // A page shipped without a description is a page nobody finds.
    expect(METADATA.title.length).toBeGreaterThan(20);
    expect(METADATA.description.length).toBeGreaterThan(80);
    expect(METADATA.description.length).toBeLessThan(200);
  });
});

describe('landing copy', () => {
  const everything = JSON.stringify({
    HERO,
    LOOP,
    BOOST,
    MASTERY,
    FALLBACK_PATHS,
    GAMIFICATION,
    CLOSING,
  });

  it('claims no social proof the product cannot back', () => {
    // No testimonial, no user count, no customer logo (CDC §78 and the pack).
    expect(everything).not.toMatch(/témoignage|utilisateurs actifs|\d+\s*000\s*(développeurs|apprenants)/i);
    expect(everything).not.toMatch(/ils nous font confiance|rejoins les \d+/i);
  });

  it('quotes no price, because no pricing decision exists', () => {
    expect(everything).not.toMatch(/\d+\s*€|\d+\s*\$|par mois|abonnement/i);
    // The gap is bracketed so it cannot ship unnoticed.
    expect(CLOSING.note).toContain('[TARIF À DÉFINIR]');
    expect(CLOSING.company).toMatch(/^\[.*\]$/);
  });

  it('keeps the credible tone: no emoji, no shouting', () => {
    expect(everything).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u);
    expect(everything).not.toMatch(/INCROYABLE|!!!/);
  });

  it('describes the six-step loop of CDC §1', () => {
    expect(LOOP).toHaveLength(6);
    expect(LOOP.map((step) => step.title)).toEqual([
      'Apprendre',
      'Pratiquer',
      'Tester',
      'Identifier',
      'Réviser',
      'Débloquer',
    ]);
  });

  it('shows the six dimensions of progress, not one number', () => {
    expect(MASTERY_DIMENSIONS).toHaveLength(6);
    expect(MASTERY_DIMENSIONS.map((d) => d.label)).toContain('Rétention');
  });

  it('every section has real body copy', () => {
    for (const section of [BOOST, MASTERY]) {
      expect(section.title.length).toBeGreaterThan(10);
      expect(section.body.length).toBeGreaterThan(80);
    }
    for (const step of LOOP) expect(step.body.length).toBeGreaterThan(20);
  });
});

describe('learning paths shown publicly', () => {
  it('marks only the written paths as available', () => {
    const available = FALLBACK_PATHS.filter((path) => path.status === 'available');
    // Only JavaScript and TypeScript have content today.
    expect(available.map((path) => path.name)).toEqual(['JavaScript', 'TypeScript']);
  });

  it('says "bientôt" honestly for the rest', () => {
    const soon = FALLBACK_PATHS.filter((path) => path.status === 'soon');
    expect(soon.length).toBeGreaterThan(0);
  });
});

describe('gamification section', () => {
  it('states plainly that re-reading earns nothing (CDC §26)', () => {
    const repeat = GAMIFICATION.examples.find((example) => example.label === 'Relecture');
    expect(repeat?.value).toBe('0 XP');
    expect(repeat?.earned).toBe(false);
  });
});

describe('robots policy', () => {
  it('disallows every path the middleware protects', () => {
    // The list is imported, not retyped, so the two cannot drift.
    for (const prefix of PROTECTED_PREFIXES) {
      expect(isProtectedPath(prefix)).toBe(true);
    }
  });

  it('leaves the public entry points crawlable', () => {
    for (const path of ['/', '/login', '/register']) {
      expect(isProtectedPath(path)).toBe(false);
    }
  });
});
