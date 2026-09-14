/**
 * Theme decided at the document root, before the first paint.
 *
 * No 'use client' here on purpose: the root layout is a Server Component and
 * inlines the script below, so this module must not drag the client bundle in.
 *
 * It used to be `ThemeToggle`'s own effect that set `data-theme`, which meant a
 * stored preference was honoured only on the two pages carrying a toggle — a
 * learner who chose the light theme got dark screens everywhere else — and even
 * there the wrong theme was painted until hydration.
 */

export const THEME_KEY = 'atelier.theme';
export type Theme = 'dark' | 'light';

/** Inlined synchronously in <head>; dark is the fallback when storage refuses. */
export const THEME_SCRIPT =
  `(function(){try{` +
  `var t=localStorage.getItem('${THEME_KEY}');` +
  `if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}` +
  `document.documentElement.dataset.theme=t;` +
  `}catch(e){document.documentElement.dataset.theme='dark';}})();`;
