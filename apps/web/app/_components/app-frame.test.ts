import { describe, expect, it } from 'vitest';
import { activeSection } from './app-frame';

describe('activeSection', () => {
  it('lights up the section of a nested screen', () => {
    expect(activeSection('/learn/javascript/variables/quiz')).toBe('/learn');
    expect(activeSection('/boost/session/abc')).toBe('/boost');
    expect(activeSection('/dashboard')).toBe('/dashboard');
  });

  it('matches on a path segment, not on a string prefix', () => {
    // "/learning" is not inside "/learn".
    expect(activeSection('/learning')).toBeUndefined();
  });
});
