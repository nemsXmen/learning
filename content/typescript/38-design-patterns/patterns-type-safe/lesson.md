---
id: typescript-38-patterns-type-safe
title: Patterns type-safe
slug: patterns-type-safe
technology: typescript
level: advanced
module: 38-design-patterns
order: 13
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-38-chain-of-responsibility]
skills: [patterns]
tags: [typescript, patterns]
---

## Objectifs

- Renforcer les patterns avec le système de types
- Exhaustivité, génériques, discriminated unions
- Éviter any dans les patterns

## Introduction

TypeScript **amplifie** les design patterns quand on type strictement interfaces, unions et génériques.

## Concept

Techniques :
- Unions discriminées pour Strategy/State/Command
- Génériques pour Repository/Specification
- `never` pour exhaustivité des switchs Factory
- Mapped types pour Observer events
- Opaque types / branding pour IDs

```ts
type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };
```

## Exemple

Un bus de commandes générique `execute<C extends Command>(c: C)`.

## Comment ça fonctionne

Le compilateur devient un allié du pattern : états illégaux et handlers manquants sont plus durs à introduire.

## Erreurs fréquentes

- Pattern classique copié en any
- Sur-ingénierie type-level illisible

## À retenir

- Patterns + types stricts
- Exhaustivité
- Lisibilité d’abord

## Exercices

1. Cite une technique TS qui renforce Factory/State.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Union discriminée + switch exhaustif (never).
   :::

## Questions d'entretien

1. Comment rends-tu un design pattern plus sûr avec TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En typant les ports (interfaces), en utilisant unions discriminées, génériques, exhaustivité `never`, et en évitant `any` — pour que les états et interactions illégales soient rejetés à la compile.
   :::
