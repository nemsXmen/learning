'use client';

import { useState } from 'react';
import {
  AppShell,
  Badge,
  Button,
  Card,
  CodeBlock,
  Drawer,
  EmptyState,
  ErrorState,
  Modal,
  ProgressBar,
  ProgressRing,
  Skeleton,
  SkeletonRegion,
  Tabs,
  Toast,
  Tooltip,
  toneForMastery,
  TONES,
} from '@app/ui';

/**
 * The living gallery. A component appears here the day it exists, not the day its
 * screen ships — that is what keeps design from becoming one blocking milestone
 * (features/00-design-system).
 */

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

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: <Icon path="M4 4h7v9H4zM13 4h7v5h-7zM13 13h7v7h-7zM4 17h7v3H4z" /> },
  { href: '/learn', label: 'Apprendre', icon: <Icon path="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2 2 0 0 1 2 2v13M20 5.5A1.5 1.5 0 0 0 18.5 4H14a2 2 0 0 0-2 2" /> },
  { href: '/boost', label: 'Boost', icon: <Icon path="M13 2 4 14h7l-1 8 9-12h-7z" /> },
  { href: '/design', label: 'Système visuel', icon: <Icon path="M12 3v18M3 12h18" /> },
];

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        {note ? <p className="mt-1 text-sm text-text-muted">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}

function ComponentsTab() {
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  return (
    <div className="flex flex-col gap-10">
      <Section title="Button" note="Chaque état bloqué affiche sa raison.">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primaire</Button>
          <Button variant="secondary">Secondaire</Button>
          <Button variant="accentQuiet">Accent discret</Button>
          <Button variant="ghost">Ghost</Button>
          <Button loading>Chargement</Button>
          <Button disabled disabledReason="Réponds à toutes les questions">
            Désactivé
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </Section>

      <Section title="Badge">
        <div className="flex flex-wrap gap-2">
          {TONES.map((tone) => (
            <Badge key={tone} tone={tone}>
              {tone}
            </Badge>
          ))}
        </div>
      </Section>

      <Section title="Card">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <h3 className="font-display text-base font-semibold">Standard</h3>
            <p className="mt-2 text-sm text-text-muted">Surface, bordure, rayon de panneau.</p>
          </Card>
          <Card emphasis>
            <h3 className="font-display text-base font-semibold">Emphase</h3>
            <p className="mt-2 text-sm text-text-muted">Réservée à l&apos;action principale.</p>
          </Card>
          <Card quiet>
            <h3 className="font-display text-base font-semibold">Discrète</h3>
            <p className="mt-2 text-sm text-text-muted">Contenu vide ou pas encore disponible.</p>
          </Card>
        </div>
      </Section>

      <Section title="Progress" note="La valeur est toujours lisible en texte, jamais seulement en couleur.">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-4">
            <ProgressBar value={72} label="Closures" showValue tone={toneForMastery(72)} />
            <ProgressBar value={43} label="Event Loop" showValue tone={toneForMastery(43)} />
            <ProgressBar value={91} label="Async/Await" showValue tone={toneForMastery(91)} />
          </div>
          <div className="flex items-center gap-8">
            <ProgressRing value={68} label="Progression globale" />
            <ProgressRing value={43} label="Event Loop" size={64} tone="danger" />
          </div>
        </div>
      </Section>

      <Section title="Overlays" note="Piège de focus, Escape, restitution du focus.">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={() => setModalOpen(true)}>
            Ouvrir la modale
          </Button>
          <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
            Ouvrir le drawer
          </Button>
          <Button variant="secondary" onClick={() => setToastOpen(true)}>
            Afficher un toast
          </Button>
          <Tooltip label="Visible au survol et au focus clavier">
            <span className="cursor-help border-b border-dashed border-border-strong text-sm text-text-muted">
              Tooltip
            </span>
          </Tooltip>
        </div>

        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Réinitialiser ta progression ?"
          description="Tes scores et ta maîtrise seront recalculés depuis zéro. Cette action est définitive."
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
                Annuler
              </Button>
              <Button size="sm" onClick={() => setModalOpen(false)}>
                Confirmer
              </Button>
            </>
          }
        />
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Navigation">
          <p className="text-sm text-text-muted">Le drawer porte la navigation sur mobile.</p>
        </Drawer>
        <Toast open={toastOpen} message="Chapitre marqué comme lu" tone="success" onDismiss={() => setToastOpen(false)} />
      </Section>

      <Section title="CodeBlock">
        <CodeBlock
          filename="counter.js"
          language="javascript"
          code={`function counter() {
  let count = 0;
  return () => ++count;
}`}
        />
      </Section>

      <Section title="Tabs">
        <Tabs
          aria-label="Exemple"
          items={[
            { id: 'un', label: 'Leçon', content: <p className="text-sm text-text-muted">Contenu de la leçon.</p> },
            { id: 'deux', label: 'Quiz', content: <p className="text-sm text-text-muted">Contenu du quiz.</p> },
            { id: 'trois', label: 'Exercices', content: <p className="text-sm text-text-muted">Contenu des exercices.</p> },
          ]}
        />
      </Section>
    </div>
  );
}

function StatesTab() {
  return (
    <div className="flex flex-col gap-10">
      <Section title="Chargement" note="Les squelettes reprennent les dimensions finales : aucun saut de mise en page.">
        <SkeletonRegion label="Chargement des parcours">
          <Card className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Skeleton width="2.375rem" height="2.375rem" rounded="control" />
              <div className="flex flex-col gap-2">
                <Skeleton width="6rem" />
                <Skeleton width="9rem" height="0.625rem" />
              </div>
            </div>
            <Skeleton height="0.375rem" />
          </Card>
        </SkeletonRegion>
      </Section>

      <Section title="Vide" note="Jamais un cul-de-sac : toujours une action suivante.">
        <EmptyState
          title="Aucun parcours démarré"
          description="Choisis une technologie pour générer ton premier parcours. Deux minutes suffisent."
          action={{ label: 'Choisir un parcours', href: '/learn' }}
        />
      </Section>

      <Section title="Erreur" note="Un message en clair, jamais une stack trace.">
        <ErrorState
          title="Impossible de charger les parcours"
          description="Ta progression est intacte. C'est l'affichage de la liste qui a échoué."
          onRetry={() => {}}
        />
      </Section>

      <Section title="Désactivé" note="Un contrôle bloqué dit toujours pourquoi.">
        <Button disabled disabledReason="Termine Promises à 60 % pour débloquer ce chapitre">
          Ouvrir Event Loop
        </Button>
      </Section>
    </div>
  );
}

function TokensTab() {
  const swatches: Array<[string, string]> = [
    ['bg', 'var(--color-bg)'],
    ['surface', 'var(--color-surface)'],
    ['surface-sunken', 'var(--color-surface-sunken)'],
    ['border', 'var(--color-border)'],
    ['text', 'var(--color-text)'],
    ['text-muted', 'var(--color-text-muted)'],
    ['accent', 'var(--color-accent)'],
    ['accent-soft', 'var(--color-accent-soft)'],
    ['accent-alt', 'var(--color-accent-alt)'],
    ['success', 'var(--color-success)'],
    ['warning', 'var(--color-warning)'],
    ['danger', 'var(--color-danger)'],
    ['streak', 'var(--color-streak)'],
  ];

  return (
    <div className="flex flex-col gap-10">
      <Section title="Couleur" note="Un accent, un succès, un avertissement, un danger, une série. Le reste est neutre.">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {swatches.map(([name, value]) => (
            <li key={name} className="overflow-hidden rounded-card border border-border">
              <div className="h-14" style={{ background: value }} />
              <div className="bg-surface px-3 py-2">
                <div className="text-[13px]">{name}</div>
                <code className="text-xs text-text-subtle">--color-{name}</code>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Typographie">
        <div className="flex flex-col gap-4">
          <p className="font-display text-4xl font-semibold">Comprendre les closures</p>
          <p className="font-display text-2xl font-semibold">Concept</p>
          <p className="text-[15.5px] leading-relaxed text-text">
            Une closure conserve l&apos;accès à son environnement lexical.
          </p>
          <p className="text-[13px] text-text-muted">30 min · difficulté 3 · 100 XP</p>
          <code className="font-mono text-[13.5px] text-accent-alt">const a = counter();</code>
        </div>
      </Section>

      <Section title="Rayons">
        <div className="flex flex-wrap gap-4">
          {(['control', 'card', 'panel', 'pill'] as const).map((radius) => (
            <div key={radius} className="text-center">
              <div
                className="mb-2 h-11 w-16 border border-border-strong"
                style={{ borderRadius: `var(--radius-${radius})` }}
              />
              <code className="text-xs text-text-subtle">{radius}</code>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

export default function DesignGalleryPage() {
  return (
    <AppShell
      nav={NAV}
      activeHref="/design"
      brand={
        <span className="flex items-center gap-2.5">
          <span className="size-7 rounded-[9px] bg-linear-to-br from-accent-soft to-accent-alt" />
          <span className="font-display text-[17px] font-bold tracking-tight">Atelier</span>
        </span>
      }
    >
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
        <header className="mb-8">
          <h1 className="font-display text-3xl font-semibold">Système visuel</h1>
          <p className="mt-2 max-w-prose text-[15px] text-text-muted">
            Chaque composant, chaque variante, chaque état — dans les deux thèmes. Un composant
            absent de cette page n&apos;est pas terminé.
          </p>
        </header>

        <Tabs
          aria-label="Sections du système visuel"
          items={[
            { id: 'components', label: 'Composants', content: <ComponentsTab /> },
            { id: 'states', label: 'États', content: <StatesTab /> },
            { id: 'tokens', label: 'Jetons', content: <TokensTab /> },
          ]}
        />
      </div>
    </AppShell>
  );
}
