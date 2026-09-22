---
id: typescript-22-assertions-dangereuses
title: Assertions dangereuses
slug: assertions-dangereuses
technology: typescript
level: intermediate
module: 22-type-assertions
order: 6
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-22-assertions-avec-le-dom]
skills: [type-assertions]
tags: [typescript, assertions]
---

## Objectifs

- Reconnaître les assertions dangereuses
- Voir les anti-patterns
- Protéger le codebase

## Introduction

Certaines assertions créent une fausse sécurité.

## Concept

```ts
// Dangereux : aucune garantie
const user = data as User;

// Dangereux : double assertion gratuite
const n = "hello" as unknown as number;

// Dangereux : non-null assertion abusive
const el = document.getElementById("x")!;
el.innerHTML = "..."; // crash si null
```

## Exemple

```ts
// Moins dangereux si validé avant
function parseUser(data: unknown): User {
  // validation Zod / io-ts / manuelle...
  return data as User; // OK après validation
}
```

## Comment ça fonctionne

L’assertion ment au compilateur. Si le runtime ne correspond pas, les bugs apparaissent plus loin.

## Erreurs fréquentes

- `!` partout
- `as any` pour « faire taire » le compilateur
- Assertions sans validation sur des données externes

## À retenir

- Données externes → valider puis assertir (ou typer via la validation)
- Éviter `as any` et `!` systématiques
- L’assertion n’est pas une validation

## Exercices

1. Cite deux assertions dangereuses courantes.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   `as any`, non-null assertion `!` sans check, double assertion injustifiée, cast de JSON non validé.
   :::

## Questions d'entretien

1. Pourquoi les assertions sur des données externes sont-elles risquées ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Parce qu’elles n’offrent aucune garantie runtime. Les données peuvent ne pas respecter le type, et les erreurs n’apparaîtront qu’à l’usage, souvent loin du point d’assertion.
   :::
