---
id: typescript-25-skip-lib-check
title: skipLibCheck
slug: skip-lib-check
technology: typescript
level: intermediate
module: 25-tsconfig
order: 14
estimatedMinutes: 8
difficulty: 2
xp: 35
prerequisites: [typescript-25-es-module-interop]
skills: [tsconfig]
tags: [typescript, tsconfig]
---

## Objectifs

- Comprendre `skipLibCheck`
- Accélérer la compile en ignorant les checks des .d.ts
- Connaître le trade-off

## Introduction

`skipLibCheck: true` saute la vérification de type de tous les fichiers de déclaration (`.d.ts`).

## Concept

```json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

## Exemple

Utile quand des `@types` conflictuels ralentissent ou cassent le build sans impact sur ton code applicatif.

## Comment ça fonctionne

TypeScript ne type-check plus le contenu des `.d.ts` (libs et @types). Ton code source reste vérifié.

## Erreurs fréquentes

- Masquer des problèmes réels dans des types locaux `.d.ts` du projet

## À retenir

- Plus rapide, moins strict sur les libs
- Courant en production de builds
- Ne remplace pas des types de qualité

## Exercices

1. Active skipLibCheck.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```json
   { "compilerOptions": { "skipLibCheck": true } }
   ```
   :::

## Questions d'entretien

1. Quel est le trade-off de `skipLibCheck` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   On gagne en temps de compilation et on évite des erreurs provenant de `.d.ts` tiers, au prix de ne plus vérifier ces déclarations. Le code applicatif reste type-checké.
   :::
