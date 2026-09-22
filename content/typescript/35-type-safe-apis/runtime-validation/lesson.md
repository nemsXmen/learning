---
id: typescript-35-runtime-validation
title: Runtime validation
slug: 35-runtime-validation
technology: typescript
level: intermediate
module: 35-type-safe-apis
order: 7
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-35-dtos]
skills: [api]
tags: [typescript, api, validation]
---

## Objectifs

- Rappeler le rôle de la validation dans les APIs typées
- Valider entrées et parfois sorties
- Lier schema et types de contrat

## Introduction

Sans **validation runtime**, les types d’API ne sont que de la documentation.

## Concept

```ts
const body = CreateUserSchema.parse(req.body);
// body: z.infer<typeof CreateUserSchema>
```

Optionnel : valider aussi les réponses sortantes en staging pour détecter les drifts.

## Exemple

Contract tests : rejouer des fixtures contre les schemas.

## Comment ça fonctionne

Le schema est le contrat exécutable. Les types en sont dérivés.

## Erreurs fréquentes

- Types only, zero validation
- Validation seulement en dev

## À retenir

- Schema = contrat exécutable
- parse aux bords
- Types dérivés

## Exercices

1. Pourquoi valider encore si tout est typé ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Parce que les types disparaissent à runtime et que les clients ne sont pas toujours de confiance.
   :::

## Questions d'entretien

1. Lien entre types d’API et validation runtime ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Les types décrivent le contrat pour le compilateur et les développeurs. La validation runtime garantit que les messages réels respectent ce contrat aux frontières.
   :::
