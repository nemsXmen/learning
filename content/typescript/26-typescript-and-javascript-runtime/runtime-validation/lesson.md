---
id: typescript-26-runtime-validation
title: Runtime validation
slug: runtime-validation
technology: typescript
level: intermediate
module: 26-typescript-and-javascript-runtime
order: 3
estimatedMinutes: 15
difficulty: 2
xp: 50
prerequisites: [typescript-26-type-erasure]
skills: [runtime]
tags: [typescript, validation]
---

## Objectifs

- Valider les données à runtime
- Connaître les approches (manuelle, Zod, io-ts…)
- Lier validation et types

## Introduction

Pour les données externes, la **validation runtime** complète le typage compile-time.

## Concept

```ts
import { z } from "zod";

const UserSchema = z.object({
  id: z.string(),
  name: z.string()
});
type User = z.infer<typeof UserSchema>;

const user = UserSchema.parse(JSON.parse(raw));
```

Validation manuelle :

```ts
function isUser(data: unknown): data is User {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof (data as any).id === "string" &&
    typeof (data as any).name === "string"
  );
}
```

## Exemple

Frontières : HTTP, localStorage, query params, messages workers.

## Comment ça fonctionne

On parse/valide `unknown` → type sûr. Les libs peuvent inférer le type TS depuis le schema.

## Erreurs fréquentes

- Valider trop tard (après usage)
- Schemas dérivés à la main sans source unique

## À retenir

- unknown → validate → T
- Schema = source de vérité possible
- Indispensable aux frontières

## Exercices

1. Écris un type guard minimal isStringArray.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   function isStringArray(data: unknown): data is string[] {
     return Array.isArray(data) && data.every((x) => typeof x === "string");
   }
   ```
   :::

## Questions d'entretien

1. Comment combines-tu TypeScript et validation runtime ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En traitant les entrées externes comme `unknown`, en les validant (Zod, type guards…), puis en travaillant avec le type inféré ou affirmé. Le schema peut servir de source unique pour le type et la validation.
   :::
