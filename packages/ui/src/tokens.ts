/**
 * TypeScript view of `tokens.css`. These are references, not copies: the values
 * live in one place, so an SVG stroke or an inline style cannot drift from the
 * stylesheet (features/00-design-system/CONTRACT.md).
 */

const ref = (name: string) => `var(--${name})`;

export const tokens = {
  color: {
    bg: ref('color-bg'),
    surface: ref('color-surface'),
    surfaceSunken: ref('color-surface-sunken'),
    surfaceRaised: ref('color-surface-raised'),
    border: ref('color-border'),
    borderStrong: ref('color-border-strong'),

    text: ref('color-text'),
    textMuted: ref('color-text-muted'),
    textSubtle: ref('color-text-subtle'),

    accent: ref('color-accent'),
    accentSoft: ref('color-accent-soft'),
    accentAlt: ref('color-accent-alt'),
    accentOn: ref('color-accent-on'),
    accentSurface: ref('color-accent-surface'),
    accentBorder: ref('color-accent-border'),

    success: ref('color-success'),
    warning: ref('color-warning'),
    danger: ref('color-danger'),
    streak: ref('color-streak'),
  },
  radius: {
    control: ref('radius-control'),
    card: ref('radius-card'),
    panel: ref('radius-panel'),
    pill: ref('radius-pill'),
  },
  font: {
    display: ref('font-display'),
    sans: ref('font-sans'),
    mono: ref('font-mono'),
  },
  motion: {
    fast: ref('duration-fast'),
    base: ref('duration-base'),
    slow: ref('duration-slow'),
    ease: ref('ease-out'),
  },
} as const;

export type Tokens = typeof tokens;

/** Semantic tones shared by Badge, ProgressBar and the state components. */
export const TONES = ['neutral', 'accent', 'success', 'warning', 'danger'] as const;
export type Tone = (typeof TONES)[number];
