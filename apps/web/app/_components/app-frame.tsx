'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppShell, type NavItem } from '@app/ui';

function Icon({ path }: { path: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );
}

export const APP_NAV: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Tableau de bord',
    icon: <Icon path="M4 4h7v9H4zM13 4h7v5h-7zM13 13h7v7h-7zM4 17h7v3H4z" />,
  },
  {
    href: '/learn',
    label: 'Parcours',
    icon: <Icon path="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2 2 0 0 1 2 2v13M20 5.5A1.5 1.5 0 0 0 18.5 4H14a2 2 0 0 0-2 2" />,
  },
  { href: '/boost', label: 'Boost', icon: <Icon path="M13 2 4 14h7l-1 8 9-12h-7z" /> },
];

/** The section a path belongs to: a chapter or its test still lights up "Parcours". */
export function activeSection(pathname: string): string | undefined {
  return APP_NAV.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  )?.href;
}

/**
 * The frame around every signed-in screen.
 *
 * `AppShell` was built with the design system for exactly this and then only
 * ever mounted on the component gallery, so the learner's screens had no way to
 * move between sections, no skip link, no theme toggle, and no way to sign out
 * short of typing /logout.
 */
export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AppShell
      nav={APP_NAV}
      activeHref={activeSection(pathname)}
      brand={
        <Link href="/dashboard" className="flex items-center gap-2.5 text-text no-underline">
          <span className="size-7 rounded-[9px] bg-linear-to-br from-accent-soft to-accent-alt" />
          <span className="font-display text-[17px] font-bold tracking-tight">Atelier</span>
        </Link>
      }
      sidebarFooter={
        <Link
          href="/logout"
          className="block rounded-control px-3 py-2.5 text-sm text-text-muted no-underline hover:bg-surface hover:text-text"
        >
          Se déconnecter
        </Link>
      }
    >
      {children}
    </AppShell>
  );
}
