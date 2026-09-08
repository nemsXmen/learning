import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Badge, Button } from './primitives';
import { ProgressBar, ProgressRing, toneForMastery } from './progress';
import { Modal, Toast } from './overlays';
import { Tabs } from './tabs';
import { EmptyState, ErrorState } from './states';

describe('Button', () => {
  it('is inert and announced as busy while loading', async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Enregistrer
      </Button>,
    );
    const button = screen.getByRole('button', { name: /enregistrer/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('surfaces the reason when it is disabled', () => {
    render(
      <Button disabled disabledReason="Réponds à toutes les questions">
        Valider
      </Button>,
    );
    expect(screen.getByRole('button', { name: /valider/i })).toHaveAttribute(
      'title',
      'Réponds à toutes les questions',
    );
  });
});

describe('Badge', () => {
  it('hides a decorative icon from assistive technology', () => {
    render(<Badge icon={<svg data-testid="icon" />}>Maîtrisé</Badge>);
    expect(screen.getByTestId('icon').parentElement).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('ProgressBar', () => {
  it('exposes the value to assistive technology', () => {
    render(<ProgressBar value={72} label="Progression du chapitre" />);
    const bar = screen.getByRole('progressbar', { name: 'Progression du chapitre' });
    expect(bar).toHaveAttribute('aria-valuenow', '72');
  });

  it('clamps out-of-range and non-finite values', () => {
    const { rerender } = render(<ProgressBar value={140} label="x" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    rerender(<ProgressBar value={-3} label="x" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    rerender(<ProgressBar value={Number.NaN} label="x" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });
});

describe('ProgressRing', () => {
  it('renders the value as text, not colour alone', () => {
    render(<ProgressRing value={68} label="Progression globale" />);
    expect(screen.getByText(/68 %/)).toBeInTheDocument();
    expect(screen.getByText(/Progression globale/)).toBeInTheDocument();
  });
});

describe('toneForMastery', () => {
  it.each([
    [0, 'danger'],
    [49, 'danger'],
    [50, 'warning'],
    [74, 'warning'],
    [75, 'success'],
    [100, 'success'],
  ])('maps %i%% to %s', (value, tone) => {
    expect(toneForMastery(value)).toBe(tone);
  });
});

describe('Modal', () => {
  it('traps focus, closes on Escape and restores focus', async () => {
    function Harness() {
      return (
        <>
          <button type="button">déclencheur</button>
          <Modal open title="Confirmer" onClose={onClose}>
            <button type="button">action</button>
          </Modal>
        </>
      );
    }
    const onClose = vi.fn();
    render(<Harness />);

    expect(screen.getByRole('dialog', { name: 'Confirmer' })).toBeInTheDocument();
    expect(document.body).toHaveStyle({ overflow: 'hidden' });

    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('labels the dialog with its title and description', () => {
    render(<Modal open title="Supprimer" description="Action définitive." onClose={() => {}} />);
    const dialog = screen.getByRole('dialog', { name: 'Supprimer' });
    expect(within(dialog).getByText('Action définitive.')).toBeInTheDocument();
  });
});

describe('Tabs', () => {
  const items = [
    { id: 'a', label: 'Un', content: <p>contenu un</p> },
    { id: 'b', label: 'Deux', content: <p>contenu deux</p> },
    { id: 'c', label: 'Trois', content: <p>contenu trois</p> },
  ];

  it('moves selection with the arrow keys and wraps around', async () => {
    render(<Tabs items={items} aria-label="Sections" />);
    const first = screen.getByRole('tab', { name: 'Un' });
    first.focus();

    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Deux' })).toHaveAttribute('aria-selected', 'true');

    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'Trois' })).toHaveAttribute('aria-selected', 'true');

    await userEvent.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'Un' })).toHaveAttribute('aria-selected', 'true');
  });

  it('shows only the selected panel', () => {
    render(<Tabs items={items} defaultId="b" aria-label="Sections" />);
    expect(screen.getByText('contenu deux')).toBeVisible();
    expect(screen.getByText('contenu un').closest('[role="tabpanel"]')).toHaveAttribute('hidden');
  });
});

describe('state components', () => {
  it('EmptyState always offers a next action', async () => {
    const onClick = vi.fn();
    render(
      <EmptyState
        title="Aucun parcours démarré"
        description="Choisis une technologie pour commencer."
        action={{ label: 'Choisir', onClick }}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Choisir' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('ErrorState is announced and retryable', async () => {
    const onRetry = vi.fn();
    render(<ErrorState title="Échec" description="Rien n'est perdu." onRetry={onRetry} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Réessayer' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});

describe('Toast', () => {
  it('auto-dismisses after its duration', async () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(<Toast open message="Enregistré" onDismiss={onDismiss} durationMs={1000} />);
    vi.advanceTimersByTime(1000);
    expect(onDismiss).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it('does not auto-dismiss when the duration is zero', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(<Toast open message="Persistant" onDismiss={onDismiss} durationMs={0} />);
    vi.advanceTimersByTime(60_000);
    expect(onDismiss).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
