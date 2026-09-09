import type { ReactNode } from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <header className="flex h-17 items-center px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <span className="size-7 rounded-[9px] bg-linear-to-br from-accent-soft to-accent-alt" />
          <span className="font-display text-[17px] font-bold tracking-tight text-text">Atelier</span>
        </Link>
      </header>
      {/* One column from 320px; the primary action stays above the fold. */}
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 pb-16">
        {children}
      </main>
    </div>
  );
}
