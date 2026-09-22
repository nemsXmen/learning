---
id: typescript-34-validation-manuelle
title: Validation manuelle
slug: validation-manuelle
technology: typescript
level: intermediate
module: 34-runtime-validation
order: 3
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-34-compile-time-vs-runtime]
skills: [validation]
tags: [typescript, validation]
---

## Objectifs

- Valider à la main avec des checks
- Comprendre les limites
- Préparer type guards / schemas

## Introduction

La validation **manuelle** utilise des `typeof`, `in`, comparaisons.

## Concept

```ts
function isUser(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value &&
    typeof (value as { id: unknown }).id === "string" &&
    typeof (value as { name: unknown }).name === "string"
  );
}
```

## Exemple

Rapide pour 1–2 champs ; pénible et fragile pour des objets imbriqués.

## Comment ça fonctionne

Des conditions JS pures. Sans type predicate, TypeScript n’affine pas automatiquement le type après le check.

## Erreurs fréquentes

- Checks incomplets
- Duplication massive

## À retenir

- Possible mais verbeux
- Préférer guards / schemas
- Toujours unknown en entrée

## Exercices

1. Vérifie que value est un number fini.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   typeof value === "number" && Number.isFinite(value)
   ```
   :::

## Questions d'entretien

1. Limite principale de la validation manuelle ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Verbosité, risque d’oublis sur structures imbriquées, et difficulté à partager/documenter le contrat comparé à un schema déclaratif (Zod…).
   :::
