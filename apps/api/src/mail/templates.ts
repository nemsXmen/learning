export type MailTemplate = 'verify-email' | 'reset-password' | 'password-changed';

export interface TemplateVariables {
  displayName: string;
  link?: string;
  expiresIn?: string;
}

export interface RenderedMail {
  subject: string;
  text: string;
  html: string;
}

/**
 * Plain, credible messages (CDC §78). Each one says what was asked, carries one
 * link, gives the expiry in words, and tells the reader what to do if they did
 * not ask for it. Every message has a text part: a text-only client must still
 * be able to act.
 */
export function renderTemplate(
  template: MailTemplate,
  variables: TemplateVariables,
): RenderedMail {
  switch (template) {
    case 'verify-email':
      return build({
        subject: 'Confirme ton adresse e-mail',
        greeting: `Bonjour ${variables.displayName},`,
        body: [
          'Confirme ton adresse pour sécuriser ton compte Atelier.',
          `Ce lien est valable ${variables.expiresIn ?? '24 heures'}.`,
        ],
        action: { label: 'Confirmer mon adresse', link: variables.link ?? '' },
        footer:
          "Si tu n'as pas créé de compte, ignore ce message : aucune action ne sera prise.",
      });

    case 'reset-password':
      return build({
        subject: 'Réinitialiser ton mot de passe',
        greeting: `Bonjour ${variables.displayName},`,
        body: [
          'Tu as demandé à réinitialiser ton mot de passe.',
          `Ce lien est valable ${variables.expiresIn ?? '60 minutes'} et ne fonctionne qu'une fois.`,
        ],
        action: { label: 'Choisir un nouveau mot de passe', link: variables.link ?? '' },
        footer:
          "Si tu n'es pas à l'origine de cette demande, ignore ce message : ton mot de passe actuel reste valable.",
      });

    case 'password-changed':
      return build({
        subject: 'Ton mot de passe a été modifié',
        greeting: `Bonjour ${variables.displayName},`,
        body: [
          'Ton mot de passe vient d’être modifié et toutes tes sessions ont été déconnectées.',
        ],
        footer:
          "Si tu n'es pas à l'origine de ce changement, réinitialise ton mot de passe immédiatement.",
      });
  }
}

interface Parts {
  subject: string;
  greeting: string;
  body: string[];
  action?: { label: string; link: string };
  footer: string;
}

function build(parts: Parts): RenderedMail {
  const textLines = [parts.greeting, '', ...parts.body];
  if (parts.action) textLines.push('', `${parts.action.label} : ${parts.action.link}`);
  textLines.push('', parts.footer, '', '— Atelier');

  const htmlBody = parts.body.map((line) => `<p>${escapeHtml(line)}</p>`).join('\n    ');
  const htmlAction = parts.action
    ? `<p><a href="${escapeHtml(parts.action.link)}">${escapeHtml(parts.action.label)}</a></p>
    <p style="font-size:13px;color:#555">Si le lien ne fonctionne pas, copie cette adresse :<br>${escapeHtml(parts.action.link)}</p>`
    : '';

  return {
    subject: parts.subject,
    text: textLines.join('\n'),
    html: `<!doctype html>
<html lang="fr">
  <body style="font-family:system-ui,sans-serif;line-height:1.6;color:#111">
    <p>${escapeHtml(parts.greeting)}</p>
    ${htmlBody}
    ${htmlAction}
    <p style="font-size:13px;color:#555">${escapeHtml(parts.footer)}</p>
    <p style="font-size:13px;color:#555">— Atelier</p>
  </body>
</html>`,
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
