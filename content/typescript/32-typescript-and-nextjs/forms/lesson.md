---
id: typescript-32-forms
title: Forms
slug: 32-forms
technology: typescript
level: intermediate
module: 32-typescript-and-nextjs
order: 12
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-32-metadata]
skills: [nextjs]
tags: [typescript, nextjs, forms]
---

## Objectifs

- Lier forms et Server Actions
- Typer progressive enhancement
- Valider côté serveur

## Introduction

Les formulaires Next s’intègrent naturellement aux **Server Actions**.

## Concept

```tsx
"use server";
export async function subscribe(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  // EmailSchema.parse(email)
}

// page
<form action={subscribe}>
  <input name="email" type="email" required />
  <button type="submit">Subscribe</button>
</form>
```

## Exemple

`useFormState` / `useActionState` (selon version) pour feedback client typé.

## Comment ça fonctionne

Sans JS, le form POST vers l’action. Avec JS, transitions. Dans tous les cas : valider serveur.

## Erreurs fréquentes

- Validation client only
- Oublier les messages d’erreur typés

## À retenir

- action={serverAction}
- FormData + schema
- Feedback UX typé

## Exercices

1. Relie un form à une action save.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```tsx
   <form action={save}>...</form>
   ```
   :::

## Questions d'entretien

1. Pourquoi valider encore côté serveur avec des Server Actions ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Parce que le client peut être contourné. La Server Action est la frontière de confiance : validation et auth doivent s’y trouver.
   :::
