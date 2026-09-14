import { describe, expect, it } from 'vitest';
import { xpNote } from './xp-note';

describe('xpNote', () => {
  it('says the XP is earned on a first pass', () => {
    expect(xpNote({ passed: true, scorePercent: 75, previousBestScore: null })).toMatch(/acquise/);
  });

  it('says plainly that repeating a score earns nothing', () => {
    const note = xpNote({ passed: true, scorePercent: 100, previousBestScore: 100 });
    expect(note).toMatch(/pas d’xp/i);
    expect(note).toContain('100 %');
  });

  it('acknowledges an improvement without promising XP it cannot vouch for', () => {
    const note = xpNote({ passed: true, scorePercent: 90, previousBestScore: 75 });
    expect(note).toContain('75 % → 90 %');
    expect(note).not.toMatch(/xp/i);
  });

  it('adds nothing to a failed attempt, which already says "Pas encore"', () => {
    expect(xpNote({ passed: false, scorePercent: 25, previousBestScore: 100 })).toBeNull();
  });
});
