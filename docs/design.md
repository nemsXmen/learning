# Design

Visual direction and the source of the mockups. Implementation rules live in
[../features/00-design-system/](../features/00-design-system/).

## Direction

Dark-first, developer-premium. Background `#0B1020`, surface `#111827`, border
`#1F2937` (CDC §60), indigo-violet accent. One accent, one success, one warning, one
danger, one streak colour — nothing else. Light theme derives from the same token
names; only the values change, never the roles.

Type: Space Grotesk (titres), IBM Plex Sans (texte), JetBrains Mono (code).

## Maquettes

Canvas: <https://claude.ai/code/artifact/c81ba46f-909f-402a-b94b-20616f087696>

Two pages:

- **Espace connecté** — dashboard, `/learn`, roadmap technologie, lecture de chapitre,
  quiz avec feedback d'erreur, session Boost, progression, dashboard mobile.
- **Landing & système** — landing publique et la planche de jetons et composants.

Source files live in [`../design/`](../design/) as `.dc.html` artboards plus
`canvas.json`. To change a mockup, edit the artboard file and re-seed the canvas —
never edit `maquettes-atelier.html` by hand.

## What the mockups commit to

- One dominant primary action per screen, with the engine's reason shown verbatim
  (CDC §66, §81).
- Quiz feedback always shows: ta réponse, la bonne réponse, pourquoi, quoi réviser
  (CDC §76).
- Progress is six dimensions (lecture, exercices, quiz, test, maîtrise, rétention),
  never "chapitre lu = 100 %" (CDC §11).
- Loading, empty and error states are drawn, not assumed (CDC §85).
- Tone stays credible: "Tu es à 2 chapitres de terminer JavaScript Async" (CDC §78).

## Placeholders still open on the landing

`[TARIF À DÉFINIR]` and `[NOM DE LA SOCIÉTÉ]`. No testimonial, logo or user count is
shown, because none exists yet.
