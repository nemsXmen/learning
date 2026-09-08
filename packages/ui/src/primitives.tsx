import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ElementType, HTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';
import type { Tone } from './tokens';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft focus-visible:ring-offset-2 focus-visible:ring-offset-bg';

/* -------------------------------------------------------------------------- */
/* Spinner                                                                     */
/* -------------------------------------------------------------------------- */

export function Spinner({ label = 'Chargement' }: { label?: string }) {
  return (
    <span role="status" aria-live="polite" className="inline-flex items-center">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-4 animate-spin"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="9" className="opacity-25" />
        <path d="M21 12a9 9 0 0 0-9-9" />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Button                                                                      */
/* -------------------------------------------------------------------------- */

export type ButtonVariant = 'primary' | 'secondary' | 'accentQuiet' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-on hover:brightness-110',
  secondary: 'border border-border text-text hover:border-border-strong hover:bg-surface',
  accentQuiet:
    'border border-accent-border bg-accent-surface text-accent-soft hover:border-accent-soft',
  ghost: 'text-text-muted hover:text-text hover:bg-surface',
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-[13px] gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-12 px-6 text-[15px] gap-2',
};

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Busy: the control is inert and announced as such. Implies disabled. */
  loading?: boolean;
  /** Paired with `disabledReason` so a blocked action always says why (CDC §85). */
  disabled?: boolean;
  disabledReason?: string;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled = false, disabledReason, className, children, ...rest },
  ref,
) {
  const inert = disabled || loading;
  return (
    <button
      ref={ref}
      type={rest.type ?? 'button'}
      disabled={inert}
      aria-busy={loading || undefined}
      aria-describedby={rest['aria-describedby']}
      title={disabled && disabledReason ? disabledReason : rest.title}
      className={cn(
        'inline-flex items-center justify-center rounded-control font-semibold',
        'transition-[background-color,border-color,filter] duration-[var(--duration-fast)]',
        'disabled:cursor-not-allowed disabled:opacity-55',
        focusRing,
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...rest}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
});

/* -------------------------------------------------------------------------- */
/* Card                                                                        */
/* -------------------------------------------------------------------------- */

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Draws the accent border used for the primary action on a screen. */
  emphasis?: boolean;
  /** Dashed outline for empty or not-yet-available content. */
  quiet?: boolean;
  as?: 'div' | 'section' | 'article' | 'li';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { emphasis = false, quiet = false, as = 'div', className, children, ...rest },
  ref,
) {
  // Polymorphic root: the four allowed tags share the same attribute surface.
  const Tag = as as ElementType;
  return (
    <Tag
      ref={ref}
      className={cn(
        'rounded-panel p-6',
        quiet
          ? 'border border-dashed border-border-strong bg-surface-sunken'
          : 'border bg-surface',
        !quiet && (emphasis ? 'border-accent-border' : 'border-border'),
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
});

/* -------------------------------------------------------------------------- */
/* Badge                                                                       */
/* -------------------------------------------------------------------------- */

const badgeTones: Record<Tone, string> = {
  neutral: 'border-border-strong text-text-subtle',
  accent: 'border-accent-border bg-accent-surface text-accent-soft',
  success: 'border-success/40 bg-success/10 text-success',
  warning: 'border-warning/40 bg-warning/10 text-warning',
  danger: 'border-danger/40 bg-danger/10 text-danger',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  /** Rendered before the label; decorative, so it is hidden from assistive tech. */
  icon?: ReactNode;
}

export function Badge({ tone = 'neutral', icon, className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 text-xs font-medium',
        badgeTones[tone],
        className,
      )}
      {...rest}
    >
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      {children}
    </span>
  );
}
