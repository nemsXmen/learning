'use client';

import { useState } from 'react';
import { cn } from './cn';

export interface CodeBlockProps {
  /** Pre-highlighted HTML from the API, or plain code when `html` is absent. */
  html?: string;
  code?: string;
  language?: string;
  filename?: string;
  className?: string;
}

/**
 * Renders code the API already highlighted (docs/decisions.md — NestJS owns
 * `content/`). No client-side parser, no second theme.
 */
export function CodeBlock({ html, code, language, filename, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const plain = code ?? '';

  async function copy() {
    try {
      await navigator.clipboard.writeText(plain);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be denied; the code stays selectable, so this is not an error.
    }
  }

  return (
    <figure
      className={cn(
        'overflow-hidden rounded-card border border-border bg-surface-sunken',
        className,
      )}
    >
      <figcaption className="flex items-center justify-between border-b border-border bg-surface px-3.5 py-2.5">
        <span className="font-mono text-xs text-text-muted">{filename ?? language ?? 'code'}</span>
        {plain ? (
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1.5 rounded px-1.5 py-1 font-mono text-xs text-text-subtle hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
          >
            {copied ? 'Copié' : 'Copier'}
          </button>
        ) : null}
        <span aria-live="polite" className="sr-only">
          {copied ? 'Code copié dans le presse-papiers' : ''}
        </span>
      </figcaption>
      {/* Wide code scrolls inside its own container, never the page. */}
      <div className="overflow-x-auto">
        {html ? (
          <pre
            className="p-5 font-mono text-[13.5px] leading-relaxed"
            // Sanitized server-side by the content engine before it is served.
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <pre className="p-5 font-mono text-[13.5px] leading-relaxed">
            <code data-language={language}>{plain}</code>
          </pre>
        )}
      </div>
    </figure>
  );
}
