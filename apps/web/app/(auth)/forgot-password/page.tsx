import type { Metadata } from 'next';
import Link from 'next/link';
import { ForgotForm } from './forgot-form';

export const metadata: Metadata = { title: 'Mot de passe oublié' };

export default function ForgotPasswordPage() {
  return (
    <>
      <ForgotForm />
      <p className="mt-4 text-center text-[13px] text-text-muted">
        <Link href="/login">Revenir à la connexion</Link>
      </p>
    </>
  );
}
