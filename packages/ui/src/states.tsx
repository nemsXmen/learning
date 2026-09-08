import type { ReactNode } from 'react';
import { cn } from './cn';
import { Button } from './primitives';

/* -------------------------------------------------------------------------- */
/* Skeleton                                                                    */
/* -------------------------------------------------------------------------- */

export interface SkeletonProps {
  /** Match the final element's metrics so nothing shifts when data lands. */
  width?: string;
  height?: string;
  rounded?: 'pill' | 'control' | 'card';
  className?: string;
}

export function Skeleton({ width, height = '0.75rem', rounded = 'pill', className }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      style={{ width, height }}
      className={cn(
        'block animate-pulse bg-surface-raised',
        rounded === 'pill' && 'rounded-pill',
        rounded === 'control' && 'rounded-control',
        rounded === 'card' && 'rounded-card',
        className,
      )}
    />
  );
}

/**
 * Wraps a loading region so assistive tech hears one message instead of a wall
 * of decorative placeholders.
 */
export function SkeletonRegion({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* EmptyState                                                                  */
/* -------------------------------------------------------------------------- */

export interface EmptyStateProps {
  title: string;
  /** Say what to do next — an empty screen must never be a dead end (CDC §81). */
  description: string;
  action?: { label: string; onClick?: () => void; href?: string };
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-panel border border-dashed border-border-strong bg-surface-sunken p-6">
      {icon ? (
        <span aria-hidden="true" className="text-text-subtle">
          {icon}
        </span>
      ) : null}
      <h3 className="font-display text-base font-semibold">{title}</h3>
      <p className="max-w-prose text-sm leading-relaxed text-text-muted">{description}</p>
      {action ? (
        action.href ? (
          <a
            href={action.href}
            className="mt-1 inline-flex h-9 items-center rounded-control bg-accent px-4 text-[13px] font-semibold text-accent-on focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            {action.label}
          </a>
        ) : (
          <Button size="sm" className="mt-1" onClick={action.onClick}>
            {action.label}
          </Button>
        )
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ErrorState                                                                  */
/* -------------------------------------------------------------------------- */

export interface ErrorStateProps {
  title: string;
  /** Plain language. Never a stack trace, never an error code alone. */
  description: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({ title, description, onRetry, retryLabel = 'Réessayer' }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-panel border border-danger-border bg-danger-surface p-6"
    >
      <div className="flex items-center gap-2.5">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-[18px] stroke-danger"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5" />
          <path d="M12 16.5v.5" />
        </svg>
        <h3 className="font-display text-base font-semibold text-danger">{title}</h3>
      </div>
      <p className="max-w-prose text-sm leading-relaxed text-text-muted">{description}</p>
      {onRetry ? (
        <Button variant="secondary" size="sm" className="mt-1" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
