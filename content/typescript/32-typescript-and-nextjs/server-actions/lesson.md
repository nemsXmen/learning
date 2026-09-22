---
id: typescript-32-server-actions
title: Server Actions
slug: server-actions
technology: typescript
level: intermediate
module: 32-typescript-and-nextjs
order: 8
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-32-client-components]
skills: [nextjs]
tags: [typescript, nextjs]
---

## Objectifs

- Déclarer des Server Actions
- Typer arguments et retour
- Valider les entrées

## Introduction

Les **Server Actions** sont des fonctions serveur appelables depuis le client (formulaires, transitions).

## Concept

```tsx
"use server";

export async function createPost(formData: FormData) {
  const title = String(formData.get("title") ?? "");
  // valider + db
  return { ok: true as const };
}
```

```tsx
<form action={createPost}>
  <input name="title" />
  <button type="submit">Save</button>
</form>
```

## Exemple

Avec arguments typés (hors FormData) via `bind` ou appels depuis client transitions — toujours valider.

## Comment ça fonctionne

Next sérialise l’appel. TypeScript type la fonction, mais les données restent une frontière : validation runtime indispensable.

## Erreurs fréquentes

- Faire confiance à FormData sans parse
- Exposer des actions sans auth check

## À retenir

- "use server"
- FormData ou args typés + validate
- Authz dans l’action

## Exercices

1. Esquisse une server action async qui accepte FormData.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   "use server";
   export async function save(formData: FormData) {}
   ```
   :::

## Questions d'entretien

1. Les types d’une Server Action suffisent-ils pour la sécurité des inputs ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Non. Les types sont compile-time. Les inputs doivent être validés à runtime (schema), et l’autorisation vérifiée côté serveur.
   :::
