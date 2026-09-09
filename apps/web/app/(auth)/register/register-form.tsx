'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GOALS } from '@app/validation';
import { AuthForm, Field, postJson } from '../auth-form';

/** CDC §34: the goal and the daily time budget shape every later recommendation. */
const GOAL_LABELS: Record<(typeof GOALS)[number], string> = {
  BETTER_DEVELOPER: 'Devenir meilleur développeur',
  PREPARE_INTERVIEW: 'Préparer un entretien',
  CHANGE_STACK: 'Changer de technologie',
  BECOME_SENIOR: 'Devenir senior',
  LEARN_NEW_STACK: 'Apprendre une nouvelle stack',
  BUILD_PROJECTS: 'Construire des projets',
};

const MINUTES = [15, 30, 60, 120] as const;

export function RegisterForm() {
  const router = useRouter();

  return (
    <AuthForm
      title="Créer un compte"
      description="Deux minutes, et ton parcours se construit autour de ton objectif."
      submitLabel="Créer mon compte"
      onSubmit={(form) =>
        postJson('/api/auth/register', {
          email: String(form.get('email') ?? ''),
          password: String(form.get('password') ?? ''),
          displayName: String(form.get('displayName') ?? ''),
          goal: String(form.get('goal') ?? ''),
          dailyMinutesTarget: Number(form.get('dailyMinutesTarget') ?? 30),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Paris',
        })
      }
      onSuccess={() => {
        router.push('/dashboard');
        router.refresh();
      }}
      footer={
        <p className="text-[13px] text-text-muted">
          Déjà un compte ? <Link href="/login">Se connecter</Link>
        </p>
      }
    >
      {(errors) => (
        <>
          <Field label="Prénom ou pseudo" name="displayName" autoComplete="nickname" autoFocus error={errors['displayName']} />
          <Field label="Adresse e-mail" name="email" type="email" autoComplete="email" error={errors['email']} />
          <Field
            label="Mot de passe"
            name="password"
            type="password"
            autoComplete="new-password"
            hint="Au moins 12 caractères, avec une minuscule, une majuscule et un chiffre."
            error={errors['password']}
          />

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-[13px] font-medium text-text-muted">Ton objectif</legend>
            <select
              name="goal"
              defaultValue="BETTER_DEVELOPER"
              className="h-11 w-full rounded-control border border-border bg-surface-sunken px-3 text-sm text-text focus-visible:border-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
            >
              {GOALS.map((goal) => (
                <option key={goal} value={goal}>
                  {GOAL_LABELS[goal]}
                </option>
              ))}
            </select>
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-[13px] font-medium text-text-muted">
              Temps disponible par jour
            </legend>
            <div className="flex flex-wrap gap-2">
              {MINUTES.map((minutes, index) => (
                <label
                  key={minutes}
                  className="cursor-pointer rounded-pill border border-border px-3.5 py-2 text-[13px] text-text-muted has-checked:border-accent-border has-checked:bg-accent-surface has-checked:text-accent-soft"
                >
                  <input
                    type="radio"
                    name="dailyMinutesTarget"
                    value={minutes}
                    defaultChecked={index === 1}
                    className="sr-only"
                  />
                  {minutes >= 60 ? `${minutes / 60} h` : `${minutes} min`}
                </label>
              ))}
            </div>
          </fieldset>
        </>
      )}
    </AuthForm>
  );
}
