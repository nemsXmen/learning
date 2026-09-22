---
id: typescript-34-type-safety-e2e
title: Type safety E2E
slug: type-safety-e2e
technology: typescript
level: intermediate
module: 34-runtime-validation
order: 14
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-34-contrats-frontend-backend]
skills: [validation]
tags: [typescript, validation]
---

## Objectifs

- Viser une sûreté de bout en bout
- Combiner types, schemas, tests
- Connaître les limites

## Introduction

La **type safety E2E** relie UI → API → DB avec le moins de trous possible.

## Concept

Chaîne typique :
1. Schema partagé (Zod)
2. Validation runtime aux frontières
3. Types inférés dans UI et serveur
4. ORM typé + migrations
5. Tests de contrat / e2e

```ts
// même schema
CreateUserSchema → form UI + POST handler + tests
```

## Exemple

tRPC : procédures typées bout en bout. OpenAPI + codegen + validator.

## Comment ça fonctionne

Chaque trou (any, as, JSON non validé) casse la chaîne. L’objectif est de minimiser ces trous, pas de promesse magique.

## Erreurs fréquentes

- any « temporaire » qui reste
- Tests e2e sans assert sur la forme

## À retenir

- Schemas partagés
- Zéro confiance aux frontières
- Tests de contrat
- Limites assumées

## Exercices

1. Cite un outil/approche pour type safety E2E.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   tRPC, OpenAPI+codegen, shared Zod schemas, contract tests…
   :::

## Questions d'entretien

1. Comment approches-tu la type safety de bout en bout ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Schemas/types partagés, validation runtime à chaque frontière, ORM et clients HTTP typés, et tests de contrat. On élimine les `any`/`as` injustifiés qui brisent la chaîne.
   :::
