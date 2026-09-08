'use client';

import { useEffect, useId, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from './cn';
import { Button } from './primitives';
import { useFocusTrap } from './use-focus-trap';

/* -------------------------------------------------------------------------- */
/* Modal                                                                       */
/* -------------------------------------------------------------------------- */

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, onClose, title, description, children, footer }: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const ref = useFocusTrap<HTMLDivElement>(open, onClose);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-bg/80 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className="relative w-full max-w-lg rounded-panel border border-border bg-surface p-6 shadow-2xl"
      >
        <h2 id={titleId} className="font-display text-lg font-semibold tracking-tight">
          {title}
        </h2>
        {description ? (
          <p id={descriptionId} className="mt-2 text-sm leading-relaxed text-text-muted">
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-4">{children}</div> : null}
        <div className="mt-6 flex items-center justify-end gap-3">
          {footer ?? (
            <Button variant="secondary" size="sm" onClick={onClose}>
              Fermer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Drawer — the mobile form of a sidebar                                       */
/* -------------------------------------------------------------------------- */

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  side?: 'left' | 'right';
  children: ReactNode;
}

export function Drawer({ open, onClose, title, side = 'left', children }: DrawerProps) {
  const titleId = useId();
  const ref = useFocusTrap<HTMLDivElement>(open, onClose);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-bg/80" onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'absolute inset-y-0 flex w-[min(20rem,85vw)] flex-col border-border bg-surface p-5',
          side === 'left' ? 'left-0 border-r' : 'right-0 border-l',
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id={titleId} className="font-display text-base font-semibold">
            {title}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Fermer le menu">
            ✕
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Tooltip — hover and focus, never hover alone                                */
/* -------------------------------------------------------------------------- */

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <span className="relative inline-flex">
      <span
        aria-describedby={id}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="inline-flex"
      >
        {children}
      </span>
      <span
        id={id}
        role="tooltip"
        hidden={!visible}
        className="absolute bottom-full left-1/2 z-40 mb-2 -translate-x-1/2 whitespace-nowrap rounded-control border border-border bg-surface-raised px-2.5 py-1.5 text-xs text-text shadow-lg"
      >
        {label}
      </span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Toast                                                                       */
/* -------------------------------------------------------------------------- */

export interface ToastProps {
  open: boolean;
  message: string;
  tone?: 'neutral' | 'success' | 'danger';
  onDismiss: () => void;
  /** 0 disables auto-dismiss; hovering pauses the timer. */
  durationMs?: number;
}

const toastTones = {
  neutral: 'border-border',
  success: 'border-success/50',
  danger: 'border-danger/50',
} as const;

export function Toast({ open, message, tone = 'neutral', onDismiss, durationMs = 5000 }: ToastProps) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!open || durationMs <= 0 || paused) return;
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [open, durationMs, paused, onDismiss]);

  if (!open) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={cn(
        'fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-control border bg-surface-raised px-4 py-3 text-sm shadow-xl',
        toastTones[tone],
      )}
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Fermer la notification"
        className="text-text-subtle hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
      >
        ✕
      </button>
    </div>
  );
}
