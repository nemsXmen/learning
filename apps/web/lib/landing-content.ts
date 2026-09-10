/**
 * Every word on the public page, in one place rather than scattered through JSX
 * (features/14-public-landing/REQUIREMENTS.md).
 *
 * Nothing here claims what the product cannot back: no testimonial, no user
 * count, no customer logo. Facts that do not exist yet are bracketed so they are
 * impossible to ship by accident.
 */

export interface LandingSection {
  eyebrow: string;
  title: string;
  body: string;
}

export interface LoopStep {
  index: string;
  title: string;
  body: string;
}

export interface PathCard {
  code: string;
  name: string;
  body: string;
  status: 'available' | 'soon';
}

export const HERO = {
  eyebrow: 'Un mentor technique, pas un catalogue de cours',
  title: 'Arrête de relire.\nCommence à retenir.',
  body:
    'Tu lis un chapitre, tu pratiques, tu te testes. Le moteur repère ce que tu ne maîtrises ' +
    'pas vraiment et te dit quoi réviser aujourd’hui — avec la raison, pas un badge.',
  primaryCta: 'Créer mon parcours',
  secondaryCta: 'Se connecter',
} as const;

/** The six-step loop of CDC §1. */
export const LOOP: LoopStep[] = [
  { index: '01', title: 'Apprendre', body: 'Un chapitre structuré : concept, exemple, pièges.' },
  { index: '02', title: 'Pratiquer', body: 'Des exercices courts, pas un projet de trois heures.' },
  { index: '03', title: 'Tester', body: 'Un test par chapitre, corrigé côté serveur.' },
  { index: '04', title: 'Identifier', body: 'Le moteur repère la compétence qui a lâché.' },
  { index: '05', title: 'Réviser', body: 'Au bon moment, avant que tu ne l’oublies.' },
  { index: '06', title: 'Débloquer', body: 'La suite s’ouvre quand les prérequis tiennent.' },
];

export const BOOST: LandingSection & { points: string[] } = {
  eyebrow: 'Learning Boost',
  title: 'Dix minutes qui valent une soirée de relecture',
  body:
    'Une session courte, construite à partir de tes erreurs réelles et des notions que tu es ' +
    'sur le point d’oublier. Question, explication, exercice, mini-test. Puis tu vois ce qui a bougé.',
  points: [
    'Choisi par un moteur déterministe, pas par une IA opaque',
    'Chaque recommandation affiche sa raison',
    'Répétition espacée qui s’ajuste à tes résultats',
  ],
};

export const MASTERY: LandingSection = {
  eyebrow: 'Maîtrise',
  title: '« Chapitre lu = 100 % » ne veut rien dire',
  body:
    'La progression est suivie par compétence, pas par page tournée. Un chapitre enseigne ' +
    'plusieurs notions, et une notion est enseignée par plusieurs chapitres. C’est ce graphe ' +
    'qui décide de ce qui s’ouvre, de ce qui se révise, et de ce qui attend.',
};

/** The six dimensions of CDC §11, shown against the naive single number. */
export const MASTERY_DIMENSIONS = [
  { label: 'Lecture', value: 100 },
  { label: 'Exercices', value: 80 },
  { label: 'Quiz', value: 100 },
  { label: 'Test', value: 70 },
  { label: 'Maîtrise', value: 72 },
  { label: 'Rétention', value: 60 },
];

/**
 * The fallback list, used when the catalogue cannot be read at build time. It
 * must stay honest on its own: a path is "available" here only if its content is
 * actually written.
 */
export const FALLBACK_PATHS: PathCard[] = [
  {
    code: 'JS',
    name: 'JavaScript',
    body: 'Des variables au modèle d’exécution.',
    status: 'available',
  },
  {
    code: 'TS',
    name: 'TypeScript',
    body: 'De l’inférence aux types conditionnels.',
    status: 'available',
  },
  {
    code: 'RE',
    name: 'React · Next.js',
    body: 'Composants, état serveur, rendu.',
    status: 'soon',
  },
  {
    code: 'PG',
    name: 'NestJS · PostgreSQL',
    body: 'Architecture, requêtes, performance.',
    status: 'soon',
  },
];

export const GAMIFICATION = {
  title: 'XP et série : utiles, pas centraux',
  body:
    'Tu gagnes de l’XP en apprenant, pas en rouvrant la même page. Relire un chapitre déjà ' +
    'terminé rapporte zéro — et c’est volontaire. La série existe pour t’aider à revenir, pas ' +
    'pour te culpabiliser.',
  examples: [
    { label: '1re lecture', value: '+10 XP', earned: true },
    { label: 'Relecture', value: '0 XP', earned: false },
    { label: 'Score amélioré', value: '+20 XP', earned: true },
  ],
} as const;

export const CLOSING = {
  title: 'Commence par un chapitre. Le reste s’adapte.',
  body:
    'Choisis un objectif, dis-nous combien de temps tu as par jour, et le parcours se construit ' +
    'autour de ça.',
  cta: 'Créer mon parcours',
  /** No pricing decision exists yet; the bracket is deliberate. */
  note: '[TARIF À DÉFINIR] · aucune carte bancaire pour commencer',
  company: '[NOM DE LA SOCIÉTÉ]',
} as const;

export const METADATA = {
  title: 'Atelier — apprendre pour retenir, pas pour cocher',
  description:
    'Une plateforme d’apprentissage adaptatif pour développeurs : tu lis, tu pratiques, tu te ' +
    'testes, et le moteur te dit quoi réviser — avec la raison.',
} as const;
