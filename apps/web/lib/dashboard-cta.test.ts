import { describe, expect, it } from 'vitest';
import { callToAction } from './dashboard-cta';

const action = (type: string, href: string) => ({ type, label: '', href, estimatedMinutes: 10, reason: '' });
const resume = { technologySlug: 'javascript', chapterSlug: 'variables', title: 'Variables', progressPercent: 40 };

describe('callToAction', () => {
  it('says "Reprendre" for the chapter already in progress', () => {
    expect(callToAction({ nextBestAction: action('NEXT_CHAPTER', '/learn/javascript/variables'), continue: resume })).toBe(
      'Reprendre',
    );
  });

  it('says "Commencer" for a chapter not opened yet', () => {
    expect(callToAction({ nextBestAction: action('NEXT_CHAPTER', '/learn/javascript/functions'), continue: resume })).toBe(
      'Commencer',
    );
    expect(callToAction({ nextBestAction: action('NEXT_CHAPTER', '/learn/javascript/variables'), continue: null })).toBe(
      'Commencer',
    );
  });

  it('matches the other actions to what they do', () => {
    expect(callToAction({ nextBestAction: action('BOOST', '/boost'), continue: null })).toBe('Renforcer');
    expect(callToAction({ nextBestAction: action('REVIEW', '/boost'), continue: null })).toBe('Renforcer');
    expect(callToAction({ nextBestAction: action('CAUGHT_UP', '/learn'), continue: null })).toBe('Explorer');
  });
});
