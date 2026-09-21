---
id: typescript-41-inference-avancee
title: Inférence avancée
slug: inference-avancee
technology: typescript
level: advanced
module: 41-advanced-generics
order: 4
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-41-valeurs-par-defaut]
skills: [generics]
tags: [typescript, generics]
---

## Objectifs

- Comprendre sites d’inférence
- Infer dans des positions
- Guider le compilateur

## Introduction

L’**inférence** déduit les type args depuis les valeurs passées.

## Concept

```ts
function identity<T>(value: T): T {
  return value;
}
const n = identity(42); // T = number

function pair<A, B>(a: A, b: B): [A, B] {
  return [a, b];
}
```

## Exemple

`as const` affine les littéraux inférés.

## Comment ça fonctionne

TypeScript choisit le candidat le plus bas commun compatible. Des annotations explicites fixent T si besoin.

## Erreurs fréquentes

- Annotation excessive qui casse l’inférence
- Attendre une inférence impossible (pas de site)

## À retenir

- Sites d’inférence
- as const
- Annotation quand nécessaire

## Exercices

1. Que vaut T pour identity("hi") ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   string (ou "hi" avec contexte const).
   :::

## Questions d'entretien

1. Comment forcer une inférence plus précise de littéraux ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Avec `as const`, des génériques contraints sur des littéraux, ou des overloads — selon le cas — pour éviter l’élargissement vers string/number.
   :::
