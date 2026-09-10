import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Card, ProgressBar, ThemeToggle } from '@app/ui';
import {
  BOOST,
  CLOSING,
  FALLBACK_PATHS,
  GAMIFICATION,
  HERO,
  LOOP,
  MASTERY,
  MASTERY_DIMENSIONS,
  METADATA,
  type PathCard,
} from '../lib/landing-content';

/** The only indexable page (CDC §61). */
export const metadata: Metadata = {
  title: METADATA.title,
  description: METADATA.description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    title: METADATA.title,
    description: METADATA.description,
    siteName: 'Atelier',
  },
  twitter: { card: 'summary_large_image', title: METADATA.title, description: METADATA.description },
  robots: { index: true, follow: true },
};

export default function HomePage() {
  // Static: no client fetch, no third-party script on first load.
  const paths = FALLBACK_PATHS;

  return (
    <div className="bg-bg">
      <Header />
      <main>
        <Hero />
        <Loop />
        <Boost />
        <Mastery />
        <Paths paths={paths} />
        <Gamification />
        <Closing />
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="flex h-18 items-center justify-between border-b border-border px-5 sm:px-10">
      <Link href="/" className="flex items-center gap-2.5 no-underline">
        <span className="size-7 rounded-[9px] bg-linear-to-br from-accent-soft to-accent-alt" />
        <span className="font-display text-[17px] font-bold tracking-tight text-text">Atelier</span>
      </Link>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Link href="/login" className="text-sm text-text-muted no-underline hover:text-text">
          {HERO.secondaryCta}
        </Link>
        <Link
          href="/register"
          className="inline-flex h-10 items-center rounded-control bg-accent px-4 text-sm font-semibold text-accent-on no-underline"
        >
          Commencer
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-5 py-20 sm:px-10 lg:grid-cols-2 lg:items-center lg:py-28">
      <div className="flex flex-col gap-6">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-accent-alt">
          {HERO.eyebrow}
        </p>
        <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
          {HERO.title.split('\n').map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p className="max-w-prose text-[17px] leading-relaxed text-text-muted">{HERO.body}</p>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Link
            href="/register"
            className="inline-flex h-12 items-center rounded-control bg-accent px-6 text-[15px] font-semibold text-accent-on no-underline"
          >
            {HERO.primaryCta}
          </Link>
          <Link
            href="/learn"
            className="inline-flex h-12 items-center rounded-control border border-border px-5 text-[15px] font-medium text-text no-underline"
          >
            Voir un chapitre
          </Link>
        </div>

        <p className="text-[13px] text-text-subtle">
          JavaScript et TypeScript disponibles · les autres parcours en préparation
        </p>
      </div>

      {/* The product's own screen, with the engine's kind of sentence. */}
      <Card emphasis className="flex flex-col gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-accent-alt">
          Prochaine meilleure action
        </p>
        <h2 className="font-display text-xl font-semibold">Renforcer Event Loop avant de continuer</h2>
        <p className="text-sm text-text-muted">
          Ton score est de 48 % et tu as échoué 3 fois sur cette compétence.
        </p>

        <div className="flex flex-col gap-3 pt-1">
          <ProgressBar value={43} label="Event Loop" tone="danger" showValue />
          <ProgressBar value={74} label="Promises" tone="warning" showValue />
          <ProgressBar value={82} label="Closures" tone="success" showValue />
        </div>

        <p className="mt-1 text-[13px] text-text-subtle">Session de 8 minutes</p>
      </Card>
    </section>
  );
}

function Loop() {
  return (
    <Section eyebrow="La boucle" title="Six étapes, répétées jusqu’à ce que ça tienne">
      <p className="mb-10 max-w-prose text-[15px] text-text-muted">
        Chaque étape produit une donnée que la suivante utilise. C’est ce qui permet au moteur de
        savoir où tu en es réellement.
      </p>

      <ol className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {LOOP.map((step) => (
          <li key={step.index}>
            <Card className="flex h-full flex-col gap-2.5">
              <span className="font-mono text-xs text-text-subtle">{step.index}</span>
              <h3 className="font-display text-base font-semibold">{step.title}</h3>
              <p className="text-[13.5px] text-text-muted">{step.body}</p>
            </Card>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function Boost() {
  return (
    <Section eyebrow={BOOST.eyebrow} title={BOOST.title}>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
        <div className="flex flex-col gap-5">
          <p className="max-w-prose text-[15px] leading-relaxed text-text-muted">{BOOST.body}</p>
          <ul className="flex list-none flex-col gap-3 p-0">
            {BOOST.points.map((point) => (
              <li key={point} className="flex gap-3 text-[15px] text-text">
                <span aria-hidden="true" className="mt-0.5 text-success">
                  ✓
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <Card emphasis className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.08em] text-accent-alt">Session terminée</p>
            <span className="font-display text-2xl font-bold text-success">86 %</span>
          </div>
          <ul className="flex list-none flex-col gap-2 p-0 text-sm">
            {[
              { name: 'Event Loop', delta: 8 },
              { name: 'Microtasks', delta: 9 },
              { name: 'Promises', delta: 3 },
            ].map((item) => (
              <li key={item.name} className="flex items-center justify-between gap-4">
                <span>{item.name}</span>
                <span className="font-mono text-[13px] text-success">+{item.delta} %</span>
              </li>
            ))}
          </ul>
          <p className="border-t border-border pt-3 text-[13px] text-text-subtle">
            Prochaine révision dans 3 jours — l’intervalle s’allonge parce que tu as réussi.
          </p>
        </Card>
      </div>
    </Section>
  );
}

function Mastery() {
  return (
    <Section eyebrow={MASTERY.eyebrow} title={MASTERY.title}>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
        <Card className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.08em] text-text-subtle">Ailleurs</p>
          <ProgressBar value={100} label="Closures" tone="neutral" showValue />

          <p className="mt-3 text-xs uppercase tracking-[0.08em] text-accent-alt">Ici</p>
          <div className="flex flex-col gap-2.5">
            {MASTERY_DIMENSIONS.map((dimension) => (
              <ProgressBar
                key={dimension.label}
                value={dimension.value}
                label={dimension.label}
                tone={dimension.label === 'Maîtrise' ? 'accent' : 'neutral'}
                showValue
              />
            ))}
          </div>
        </Card>

        <p className="max-w-prose text-[15px] leading-relaxed text-text-muted">{MASTERY.body}</p>
      </div>
    </Section>
  );
}

function Paths({ paths }: { paths: PathCard[] }) {
  return (
    <Section eyebrow="Parcours" title="Deux parcours ouverts, écrits en entier">
      <p className="mb-10 max-w-prose text-[15px] text-text-muted">
        On préfère deux parcours complets à huit parcours vides. Les suivants arrivent une fois le
        contenu écrit et relu.
      </p>

      <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
        {paths.map((path) => (
          <li key={path.name}>
            <Card
              className="flex h-full flex-col gap-3"
              emphasis={path.status === 'available'}
              quiet={path.status === 'soon'}
            >
              <span className="flex size-10 items-center justify-center rounded-card border border-border font-mono text-[13px] text-text-muted">
                {path.code}
              </span>
              <h3 className="font-display text-base font-semibold">{path.name}</h3>
              <p className="text-[13.5px] text-text-muted">{path.body}</p>
              {/* Availability is text, never colour alone. */}
              <span className="mt-auto pt-2">
                <Badge tone={path.status === 'available' ? 'accent' : 'neutral'}>
                  {path.status === 'available' ? 'Disponible' : 'Bientôt'}
                </Badge>
              </span>
            </Card>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function Gamification() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-10">
      <Card className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-xl font-semibold">{GAMIFICATION.title}</h2>
          <p className="max-w-prose text-[15px] leading-relaxed text-text-muted">
            {GAMIFICATION.body}
          </p>
        </div>

        <ul className="flex list-none flex-wrap gap-3 p-0">
          {GAMIFICATION.examples.map((example) => (
            <li
              key={example.label}
              className="rounded-card border border-border bg-surface-sunken px-5 py-4 text-center"
            >
              <p className="font-mono text-xs text-text-subtle">{example.label}</p>
              <p
                className={`mt-1.5 text-lg font-semibold ${
                  example.earned ? 'text-success' : 'text-text-subtle'
                }`}
              >
                {example.value}
              </p>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}

function Closing() {
  return (
    <section className="border-t border-border px-5 py-24 text-center sm:px-10">
      <h2 className="mx-auto max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-4xl">
        {CLOSING.title}
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-[16px] text-text-muted">{CLOSING.body}</p>

      <Link
        href="/register"
        className="mt-8 inline-flex h-12 items-center rounded-control bg-accent px-7 text-base font-semibold text-accent-on no-underline"
      >
        {CLOSING.cta}
      </Link>

      <p className="mt-5 text-[13px] text-text-subtle">{CLOSING.note}</p>
    </section>
  );
}

function Footer() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-5 py-10 sm:px-10">
      <p className="text-sm text-text-subtle">Atelier · {CLOSING.company}</p>
      <nav className="flex gap-6 text-[13.5px] text-text-muted">
        <Link href="/learn">Parcours</Link>
        <Link href="/login">Se connecter</Link>
      </nav>
    </footer>
  );
}

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-6xl border-t border-border px-5 py-16 sm:px-10 lg:py-20">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-accent-alt">{eyebrow}</p>
      <h2 className="mt-3 max-w-3xl font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
        {title}
      </h2>
      <div className="mt-8">{children}</div>
    </section>
  );
}
