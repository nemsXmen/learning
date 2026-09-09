'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthForm, Field, postJson } from '../auth-form';

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') ?? '/dashboard';
  const expired = params.get('expired') === '1';

  return (
    <AuthForm
      title="Se connecter"
      description={
        expired
          ? 'Ta session a expiré. Reconnecte-toi pour reprendre où tu en étais.'
          : 'Reprends ton parcours là où tu l’as laissé.'
      }
      submitLabel="Se connecter"
      onSubmit={(form) =>
        postJson('/api/auth/login', {
          email: String(form.get('email') ?? ''),
          password: String(form.get('password') ?? ''),
        })
      }
      onSuccess={() => {
        router.push(next);
        router.refresh();
      }}
      footer={
        <div className="flex flex-col gap-2 text-[13px] text-text-muted">
          <Link href="/forgot-password">Mot de passe oublié ?</Link>
          <span>
            Pas encore de compte ? <Link href="/register">Créer un compte</Link>
          </span>
        </div>
      }
    >
      {(errors) => (
        <>
          <Field
            label="Adresse e-mail"
            name="email"
            type="email"
            autoComplete="email"
            autoFocus
            error={errors['email']}
          />
          <Field
            label="Mot de passe"
            name="password"
            type="password"
            autoComplete="current-password"
            error={errors['password']}
          />
        </>
      )}
    </AuthForm>
  );
}
