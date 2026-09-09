'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button, Card, Spinner } from '@app/ui';
import { postJson } from '../auth-form';

type State = 'pending' | 'done' | 'invalid' | 'missing';

export function VerifyEmail() {
  const token = useSearchParams().get('token');
  const [state, setState] = useState<State>(token ? 'pending' : 'missing');
  // React runs effects twice in development; the token is single use, so guard it.
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;

    postJson('/api/auth/email/verify', { token }).then((result) => {
      setState(result.ok ? 'done' : 'invalid');
    });
  }, [token]);

  return (
    <Card className="flex flex-col gap-4" emphasis={state === 'done'}>
      {state === 'pending' ? (
        <>
          <h1 className="font-display text-xl font-semibold">Confirmation en cours</h1>
          <p className="flex items-center gap-2 text-sm text-text-muted">
            <Spinner label="Vérification du lien" />
            Un instant.
          </p>
        </>
      ) : null}

      {state === 'done' ? (
        <>
          <h1 className="font-display text-xl font-semibold">Adresse confirmée</h1>
          <p role="status" className="text-sm text-text-muted">
            Ton compte est vérifié. Tu peux reprendre ton parcours.
          </p>
          <Button size="lg" onClick={() => window.location.assign('/dashboard')}>
            Aller au tableau de bord
          </Button>
        </>
      ) : null}

      {state === 'invalid' || state === 'missing' ? (
        <>
          <h1 className="font-display text-xl font-semibold">Lien invalide ou expiré</h1>
          <p role="alert" className="text-sm text-text-muted">
            {state === 'missing'
              ? 'Ce lien ne contient pas de jeton.'
              : 'Ce lien a déjà servi ou il a expiré. Un lien de confirmation est valable 24 heures.'}
          </p>
          <p className="text-[13px] text-text-muted">
            Connecte-toi puis demande un nouvel envoi depuis le bandeau de ton compte.
          </p>
          <Link href="/login" className="text-[13px]">
            Se connecter
          </Link>
        </>
      ) : null}
    </Card>
  );
}
