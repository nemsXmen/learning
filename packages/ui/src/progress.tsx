import { cn } from './cn';
import type { Tone } from './tokens';

const fillTones: Record<Tone, string> = {
  neutral: 'bg-text-subtle',
  accent: 'bg-accent-soft',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
};

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

/**
 * Mastery bands the UI uses consistently: red under 50, amber under 75, green
 * above. Kept here so no screen invents its own thresholds.
 */
export function toneForMastery(percent: number): Tone {
  const value = clampPercent(percent);
  if (value < 50) return 'danger';
  if (value < 75) return 'warning';
  return 'success';
}

export interface ProgressBarProps {
  value: number;
  /** Names what is progressing; required, because a bare bar means nothing. */
  label: string;
  tone?: Tone;
  /** Renders the label and value as text next to the bar. */
  showValue?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  label,
  tone = 'accent',
  showValue = false,
  className,
}: ProgressBarProps) {
  const percent = clampPercent(value);
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {showValue ? (
        <div className="flex items-baseline justify-between gap-3 text-[13px]">
          <span className="min-w-0 text-text-muted">{label}</span>
          {/* Never wrapped: a long label used to push « 0 » and « % » onto two lines. */}
          <span className="shrink-0 whitespace-nowrap font-semibold text-text">{percent} %</span>
        </div>
      ) : null}
      {/*
        Always named. Showing the percentage used to drop the name entirely, on
        the assumption that the visible label would stand in for it — but the
        two were never linked, so the bar had no accessible name at all.
      */}
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="h-1.5 w-full overflow-hidden rounded-pill bg-border"
      >
        <div
          className={cn(
            'h-full rounded-pill transition-[width] duration-[var(--duration-base)] ease-[var(--ease-out)]',
            fillTones[tone],
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export interface ProgressRingProps {
  value: number;
  label: string;
  size?: number;
  tone?: Tone;
  /** Text shown inside the ring; defaults to the percentage. */
  caption?: string;
  className?: string;
}

const strokeTones: Record<Tone, string> = {
  neutral: 'stroke-text-subtle',
  accent: 'stroke-accent-soft',
  success: 'stroke-success',
  warning: 'stroke-warning',
  danger: 'stroke-danger',
};

export function ProgressRing({
  value,
  label,
  size = 88,
  tone = 'accent',
  caption,
  className,
}: ProgressRingProps) {
  const percent = clampPercent(value);
  const stroke = Math.max(6, Math.round(size / 11));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <div className={cn('inline-flex items-center gap-4', className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-border"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className={cn(
            'transition-[stroke-dashoffset] duration-[var(--duration-slow)] ease-[var(--ease-out)]',
            strokeTones[tone],
          )}
        />
      </svg>
      {/* The value is text, never colour alone (docs/rules.md #24). */}
      <span className="font-display text-[13px] text-text-muted">
        <span className="sr-only">{label} : </span>
        {caption ?? `${percent} %`}
      </span>
    </div>
  );
}
