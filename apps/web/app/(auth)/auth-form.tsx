'use client';

import { useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Button, Card } from '@app/ui';

export interface FieldError {
  path: string;
  message: string;
}

export interface SubmitResult {
  ok: boolean;
  /** Form-level message: credentials, rate limiting, upstream failure. */
  message?: string;
  fields?: FieldError[];
}

/**
 * Posts to a Next.js route handler and surfaces the four states the CDC requires
 * (§85): loading, error, success, disabled. The browser never sees a token —
 * the handler keeps it in an httpOnly cookie.
 */
export async function postJson(path: string, body: unknown): Promise<SubmitResult> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    return { ok: false, message: 'Connexion impossible. Vérifie ton réseau et réessaie.' };
  }

  if (response.ok) return { ok: true };

  const payload = (await response.json().catch(() => null)) as
    | { code?: string; message?: string; fields?: FieldError[] }
    | null;

  return {
    ok: false,
    message: payload?.message ?? messageForStatus(response.status),
    ...(payload?.fields ? { fields: payload.fields } : {}),
  };
}

function messageForStatus(status: number): string {
  if (status === 429) return 'Trop de tentatives. Réessaie dans quelques minutes.';
  if (status >= 500) return 'Service indisponible pour l’instant. Réessaie dans un instant.';
  return 'La demande n’a pas abouti.';
}

/* -------------------------------------------------------------------------- */
/* Field                                                                       */
/* -------------------------------------------------------------------------- */

export interface FieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password';
  autoComplete?: string;
  required?: boolean;
  defaultValue?: string;
  error?: string;
  hint?: string;
  autoFocus?: boolean;
}

export function Field({
  label,
  name,
  type = 'text',
  autoComplete,
  required = true,
  defaultValue,
  error,
  hint,
  autoFocus,
}: FieldProps) {
  const id = useId();
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null]
    .filter(Boolean)
    .join(' ');
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="flex flex-col gap-1.5">
      {/* Labels are visible, never placeholder-only. */}
      <label htmlFor={id} className="text-[13px] font-medium text-text-muted">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={isPassword && revealed ? 'text' : type}
          autoComplete={autoComplete}
          required={required}
          defaultValue={defaultValue}
          autoFocus={autoFocus}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className="h-11 w-full rounded-control border border-border bg-surface-sunken px-3.5 text-sm text-text placeholder:text-text-subtle focus-visible:border-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setRevealed((value) => !value)}
            aria-pressed={revealed}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
          >
            {revealed ? 'Masquer' : 'Afficher'}
          </button>
        ) : null}
      </div>
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-text-subtle">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Shell                                                                       */
/* -------------------------------------------------------------------------- */

export interface AuthFormProps {
  title: string;
  description?: string;
  submitLabel: string;
  onSubmit: (form: FormData) => Promise<SubmitResult>;
  onSuccess?: () => void;
  successMessage?: string;
  children: (errors: Record<string, string>) => ReactNode;
  footer?: ReactNode;
}

export function AuthForm({
  title,
  description,
  submitLabel,
  onSubmit,
  onSuccess,
  successMessage,
  children,
  footer,
}: AuthFormProps) {
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setPending(true);
    setFormError(null);
    setFieldErrors({});

    const result = await onSubmit(new FormData(event.currentTarget));
    setPending(false);

    if (result.ok) {
      setDone(true);
      onSuccess?.();
      return;
    }

    setFormError(result.message ?? 'La demande n’a pas abouti.');
    const mapped = Object.fromEntries(
      (result.fields ?? []).map((field) => [field.path, field.message]),
    );
    setFieldErrors(mapped);

    // Focus the first field at fault so a keyboard user is not left hunting.
    const firstPath = result.fields?.[0]?.path;
    if (firstPath) {
      formRef.current?.querySelector<HTMLInputElement>(`[name="${firstPath}"]`)?.focus();
    }
  }

  if (done && successMessage) {
    return (
      <Card className="flex flex-col gap-3" emphasis>
        <h1 className="font-display text-xl font-semibold">{title}</h1>
        <p role="status" className="text-sm leading-relaxed text-text-muted">
          {successMessage}
        </p>
        {footer}
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-semibold">{title}</h1>
        {description ? <p className="text-sm text-text-muted">{description}</p> : null}
      </div>

      <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {children(fieldErrors)}

        {formError ? (
          <p
            role="alert"
            aria-live="polite"
            className="rounded-control border border-danger-border bg-danger-surface px-3.5 py-2.5 text-[13px] text-danger"
          >
            {formError}
          </p>
        ) : null}

        <Button type="submit" loading={pending} size="lg">
          {submitLabel}
        </Button>
      </form>

      {footer}
    </Card>
  );
}
