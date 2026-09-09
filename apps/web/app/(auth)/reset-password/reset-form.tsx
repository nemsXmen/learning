'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@app/ui';
import { AuthForm, Field, postJson } from '../auth-form';

export function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get('token');

  // An expired or truncated link is a state, not a crash: offer the way out.
  if (!token) {
    return (
      <Card className="flex flex-col gap-3">
        <h1 className="font-display text-xl font-semibold">Lien incomplet</h1>
        <p className="text-sm text-text-muted">
          Ce lien ne contient pas de jeton. Il a peut-être été coupé par ton client mail.
        </p>
        <Link href="/forgot-password" className="text-[13px]">
          Demander un nouveau lien
        </Link>
      </Card>
    );
  }

  return (
    <AuthForm
      title="Nouveau mot de passe"
      description="Choisis un mot de passe que tu n’utilises nulle part ailleurs."
      submitLabel="Enregistrer"
      successMessage="Mot de passe modifié. Toutes tes autres sessions ont été déconnectées."
      onSubmit={(form) =>
        postJson('/api/auth/password/reset', {
          token,
          password: String(form.get('password') ?? ''),
        })
      }
      onSuccess={() => router.refresh()}
      footer={
        <p className="text-[13px] text-text-muted">
          <Link href="/login">Se connecter</Link>
        </p>
      }
    >
      {(errors) => (
        <Field
          label="Nouveau mot de passe"
          name="password"
          type="password"
          autoComplete="new-password"
          autoFocus
          hint="Au moins 12 caractères, avec une minuscule, une majuscule et un chiffre."
          error={errors['password']}
        />
      )}
    </AuthForm>
  );
}
