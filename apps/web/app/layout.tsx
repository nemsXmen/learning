import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { THEME_SCRIPT } from '@app/ui';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Atelier', template: '%s · Atelier' },
  description: "Plateforme d'apprentissage adaptatif pour développeurs.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/*
          Before the stylesheet and before the first paint: a stored theme must
          not arrive one frame late, and it must reach every screen, not only
          the ones that happen to render a toggle.
        */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
