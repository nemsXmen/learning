export const STORAGE_STATE = 'e2e/.auth/learner.json';

export type Theme = 'dark' | 'light';
export const THEMES: Theme[] = ['dark', 'light'];

/** Every screen the product serves, and whether it needs a session. */
export const SCREENS = [
  { name: 'landing', path: '/', authenticated: false },
  { name: 'connexion', path: '/login', authenticated: false },
  { name: 'inscription', path: '/register', authenticated: false },
  { name: 'mot de passe oublié', path: '/forgot-password', authenticated: false },
  { name: 'galerie de composants', path: '/design', authenticated: false },
  { name: 'tableau de bord', path: '/dashboard', authenticated: true },
  { name: 'catalogue', path: '/learn', authenticated: true },
  { name: 'parcours', path: '/learn/javascript', authenticated: true },
  { name: 'chapitre', path: '/learn/javascript/variables', authenticated: true },
  { name: 'test du chapitre', path: '/learn/javascript/variables/quiz', authenticated: true },
  { name: 'boost', path: '/boost', authenticated: true },
] as const;
