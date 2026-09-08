import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/** Internal surface: never indexed (CDC §61). */
export const metadata: Metadata = {
  title: 'Système visuel',
  robots: { index: false, follow: false },
};

export default function DesignLayout({ children }: { children: ReactNode }) {
  return children;
}
