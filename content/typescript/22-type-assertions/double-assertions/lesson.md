---
id: typescript-22-double-assertions
title: Double assertions
slug: double-assertions
technology: typescript
level: intermediate
module: 22-type-assertions
order: 4
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-22-as-const]
skills: [type-assertions]
tags: [typescript, assertions]
---

## Objectifs

- Comprendre les double assertions (`as unknown as T`)
- Savoir quand elles sont nécessaires
- Les traiter comme un last resort

## Introduction

Parfois TypeScript refuse une assertion directe. On passe par `unknown` (ou `any`).

## Concept

```ts
const value = "hello" as unknown as number;
// compile, mais faux à runtime si on traite vraiment comme number
```

```ts
// Cas plus légitime : typage d’une lib mal typée
const api = legacyLib as unknown as ModernApi;
```

## Exemple

Les double assertions court-circuitent le contrôle de compatibilité.

## Comment ça fonctionne

`A as B` exige un certain chevauchement. `A as unknown as B` est toujours accepté car tout est assignable depuis/vers unknown dans ce contexte d’assertion.

## Erreurs fréquentes

- Double assertion pour « faire compiler » sans comprendre
- Masquer des erreurs de design

## À retenir

- `as unknown as T` = last resort
- Signale souvent un problème de typage plus profond
- Documenter pourquoi si indispensable

## Exercices

1. Explique pourquoi `as unknown as T` est plus dangereux que `as T`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Parce qu’il contourne entièrement la vérification de compatibilité entre le type d’origine et T.
   :::

## Questions d'entretien

1. Quand utilise-t-on une double assertion ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En dernier recours, quand les types ne se chevauchent pas assez pour une assertion simple — souvent avec des libs mal typées. Il faut documenter et privilégier un meilleur typage dès que possible.
   :::
