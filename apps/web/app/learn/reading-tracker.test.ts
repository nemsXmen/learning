import { describe, expect, it } from 'vitest';
import { scrollDepthPercent } from './[technology]/[chapter]/reading-tracker';

describe('scrollDepthPercent', () => {
  it('is 100 when the page cannot scroll', () => {
    // A short chapter is fully read as soon as it is opened.
    expect(scrollDepthPercent(0, 900, 700)).toBe(100);
    expect(scrollDepthPercent(0, 900, 900)).toBe(100);
  });

  it('counts the viewport as read, not just the scroll offset', () => {
    // Top of a page twice the viewport: half of it is already on screen.
    expect(scrollDepthPercent(0, 800, 1600)).toBe(50);
  });

  it('reaches 100 at the bottom', () => {
    expect(scrollDepthPercent(800, 800, 1600)).toBe(100);
  });

  it('treats a negative offset as the top, not as less than the top', () => {
    // iOS rubber-banding reports a negative scrollY above the first pixel.
    expect(scrollDepthPercent(-50, 800, 1600)).toBe(scrollDepthPercent(0, 800, 1600));
  });

  it('never exceeds 100, whatever the browser reports', () => {
    expect(scrollDepthPercent(99_999, 800, 1600)).toBe(100);
  });

  it('grows monotonically with the scroll position', () => {
    const values = [0, 200, 400, 600, 800].map((y) => scrollDepthPercent(y, 800, 1600));
    for (let i = 1; i < values.length; i += 1) {
      expect(values[i]!).toBeGreaterThanOrEqual(values[i - 1]!);
    }
  });
});
