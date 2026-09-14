'use client';

import { useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from './cn';

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  defaultId?: string;
  'aria-label': string;
}

/**
 * Roving tabindex with arrow-key navigation, per the WAI-ARIA tabs pattern.
 * Activation follows focus, so a keyboard user never has to press Enter.
 */
export function Tabs({ items, defaultId, 'aria-label': ariaLabel }: TabsProps) {
  const base = useId();
  const [activeId, setActiveId] = useState(defaultId ?? items[0]?.id ?? '');
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  if (items.length === 0) return null;

  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === activeId),
  );

  function focusTab(index: number) {
    const next = items[(index + items.length) % items.length];
    if (!next) return;
    setActiveId(next.id);
    tabRefs.current[next.id]?.focus();
  }

  return (
    <div>
      <div role="tablist" aria-label={ariaLabel} className="flex gap-1 border-b border-border">
        {items.map((item, index) => {
          const selected = item.id === activeId;
          return (
            <button
              key={item.id}
              ref={(el) => {
                tabRefs.current[item.id] = el;
              }}
              type="button"
              role="tab"
              id={`${base}-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`${base}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveId(item.id)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowRight') focusTab(index + 1);
                else if (event.key === 'ArrowLeft') focusTab(index - 1);
                else if (event.key === 'Home') focusTab(0);
                else if (event.key === 'End') focusTab(items.length - 1);
                else return;
                event.preventDefault();
              }}
              className={cn(
                '-mb-px border-b-2 px-4 py-2.5 text-sm font-medium',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft',
                selected
                  ? 'border-accent-soft text-text'
                  : 'border-transparent text-text-muted hover:text-text',
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item, index) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${base}-panel-${item.id}`}
          aria-labelledby={`${base}-tab-${item.id}`}
          hidden={index !== activeIndex}
          tabIndex={0}
          // Focusable per the ARIA tabs pattern, so its focus has to be seen: the
          // outline was removed with nothing drawn in its place.
          className="rounded-control pt-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
