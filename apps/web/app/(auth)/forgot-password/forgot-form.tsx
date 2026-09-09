'use client';

import { AuthForm, Field, postJson } from '../auth-form';

export function ForgotForm() {
  return (
    <AuthForm
      title="Mot de passe oublié"
      description="Indique ton adresse : si un compte existe, tu recevras un lien."
      submitLabel="Envoyer le lien"
      // The wording never confirms whether the address has an account.
      successMessage="Si un compte existe pour cette adresse, un lien vient d’être envoyé. Il est valable 60 minutes."
      onSubmit={(form) =>
        postJson('/api/auth/password/forgot', { email: String(form.get('email') ?? '') })
      }
    >
      {(errors) => (
        <Field label="Adresse e-mail" name="email" type="email" autoComplete="email" autoFocus error={errors['email']} />
      )}
    </AuthForm>
  );
}
