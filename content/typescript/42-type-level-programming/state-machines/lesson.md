---
id: typescript-42-state-machines
title: State machines
slug: type-level-state-machines
technology: typescript
level: advanced
module: 42-type-level-programming
order: 13
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-42-event-systems-types]
skills: [type-level]
tags: [typescript, type-level]
---

## Objectifs

- Modéliser états et transitions
- Empêcher transitions illégales
- Lien avec XState typé

## Introduction

Les **state machines** au type-level restreignent les transitions.

## Concept

```ts
type Transitions = {
  draft: "placed" | "cancelled";
  placed: "shipped" | "cancelled";
  shipped: never;
  cancelled: never;
};

type CanTransition<S extends keyof Transitions, T> =
  T extends Transitions[S] ? true : false;
```

## Exemple

Fonction `transition(state, event)` typée pour n’accepter que les cibles légales.

## Comment ça fonctionne

Map état → union d’états suivants. Le compilateur refuse le reste.

## Erreurs fréquentes

- never oublié pour états terminaux
- Events non reliés aux transitions

## À retenir

- Map de transitions
- true/false type-level
- XState pour le runtime riche

## Exercices

1. CanTransition<"draft", "placed"> ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   true
   :::

## Questions d'entretien

1. Comment le type-level aide les state machines ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En exprimant les transitions légales dans les types, on rend les états illégaux non représentables ou non appelables, réduisant les bugs de workflow avant runtime.
   :::
