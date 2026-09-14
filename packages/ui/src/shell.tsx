'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from './cn';
import { Button } from './primitives';
import { Drawer } from './overlays';
import { THEME_KEY, type Theme } from './theme';

export interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

/* -------------------------------------------------------------------------- */
/* Theme                                                                       */
/* -------------------------------------------------------------------------- */

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    // The root script already decided and applied it; the toggle only catches up
    // so its label describes the theme the visitor is actually looking at.
    setTheme((document.documentElement.dataset['theme'] as Theme | null) ?? 'dark');
  }, []);

  function toggle() {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.dataset['theme'] = next;
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      // Private mode can refuse storage; the toggle still works for this visit.
    }
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={toggle}
      aria-label={theme === 'light' ? 'Passer au thème sombre' : 'Passer au thème clair'}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <path d="M12 3a6 6 0 0 0 0 12 6 6 0 0 1 0-12z" />
      </svg>
    </Button>
  );
}

/* -------------------------------------------------------------------------- */
/* Shell                                                                       */
/* -------------------------------------------------------------------------- */

export interface AppShellProps {
  nav: NavItem[];
  activeHref?: string;
  brand?: ReactNode;
  headerRight?: ReactNode;
  sidebarFooter?: ReactNode;
  children: ReactNode;
}

function NavList({ nav, activeHref }: { nav: NavItem[]; activeHref?: string }) {
  return (
    <nav aria-label="Navigation principale" className="flex flex-col gap-1">
      {nav.map((item) => {
        const active = item.href === activeHref;
        return (
          <a
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft',
              active
                ? 'bg-surface-raised text-text shadow-[inset_2px_0_0_var(--color-accent-soft)]'
                : 'text-text-muted hover:bg-surface hover:text-text',
            )}
          >
            <span aria-hidden="true" className="text-current">
              {item.icon}
            </span>
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}

export function AppShell({
  nav,
  activeHref,
  brand,
  headerRight,
  sidebarFooter,
  children,
}: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-bg text-text">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-accent-on"
      >
        Aller au contenu
      </a>

      <div className="flex">
        {/* Desktop sidebar. Sticky: on a long chapter it used to scroll away with
            the page, leaving only the sign-out link at the foot of an empty column. */}
        <aside className="sticky top-0 hidden h-dvh w-62 shrink-0 flex-col gap-7 self-start overflow-y-auto border-r border-border p-4 lg:flex">
          {brand ? <div className="px-2">{brand}</div> : null}
          <NavList nav={nav} activeHref={activeHref} />
          {sidebarFooter ? <div className="mt-auto">{sidebarFooter}</div> : null}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-17 items-center justify-between gap-3 border-b border-border px-5 sm:px-8">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setMenuOpen(true)}
                aria-label="Ouvrir le menu"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                >
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              </Button>
              <div className="lg:hidden">{brand}</div>
            </div>
            <div className="flex items-center gap-2.5">
              <ThemeToggle />
              {headerRight}
            </div>
          </header>

          <main id="contenu" className="min-w-0 flex-1">
            {children}
          </main>
        </div>
      </div>

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title="Navigation">
        <NavList nav={nav} activeHref={activeHref} />
        {sidebarFooter ? <div className="mt-6">{sidebarFooter}</div> : null}
      </Drawer>
    </div>
  );
}
