import 'reflect-metadata';
import { MailTransport } from './mail.service';

/** `pnpm --filter @app/api mail:test --to <adresse>` — proves an SMTP config works. */
async function main(): Promise<void> {
  const index = process.argv.indexOf('--to');
  const to = index === -1 ? undefined : process.argv[index + 1];
  if (!to) {
    console.error('Usage : mail:test --to <adresse>');
    process.exit(1);
  }

  const transport = new MailTransport();
  if (!(await transport.verifyConnection())) {
    console.error('Connexion SMTP impossible : vérifie SMTP_HOST, SMTP_PORT et les identifiants.');
    process.exit(1);
  }

  await transport.send({
    template: 'verify-email',
    to,
    variables: { displayName: 'Test', link: 'https://example.invalid/verify?token=sonde', expiresIn: '24 heures' },
  });
  console.log(`Message de test envoyé à ${to}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
