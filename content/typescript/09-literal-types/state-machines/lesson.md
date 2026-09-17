---
id: typescript-09-state-machines
title: State machines
slug: state-machines
technology: typescript
level: intermediate
module: 09-literal-types
order: 10
estimatedMinutes: 20
difficulty: 3
xp: 60
prerequisites: [typescript-09-configuration-typee, typescript-08-discriminated-unions]
skills: [literal-types]
tags: [typescript, state-machines, literals]
---

## Objectifs

- Modéliser une machine à états simple avec des literal types et discriminated unions
- Typer les transitions
- Voir le lien avec l’exhaustivité

## Introduction

Les literal types + discriminated unions sont idéaux pour les **state machines** légères.

## Concept

```ts
type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: string }
  | { status: "error"; message: string };

type Event =
  | { type: "FETCH" }
  | { type: "SUCCESS"; data: string }
  | { type: "ERROR"; message: string }
  | { type: "RESET" };

function transition(state: State, event: Event): State {
  switch (state.status) {
    case "idle":
      return event.type === "FETCH" ? { status: "loading" } : state;
    case "loading":
      if (event.type === "SUCCESS") return { status: "success", data: event.data };
      if (event.type === "ERROR") return { status: "error", message: event.message };
      return state;
    case "success":
    case "error":
      return event.type === "RESET" ? { status: "idle" } : state;
  }
}
```

## Exemple

Chaque état n’expose que les données pertinentes. Les transitions invalides sont difficiles à écrire grâce aux types.

## Comment ça fonctionne

Les discriminants (`status`, `type`) permettent le narrowing. On peut aller plus loin en typant les transitions autorisées par état (avec des mapped types / utilitaires avancés).

## Erreurs fréquentes

- Tout mettre dans un seul état avec des champs optionnels
- Oublier l’exhaustivité sur les états ou les events

## À retenir

- State + Event en discriminated unions
- Transitions typées
- Base pour des machines plus avancées (XState, etc.)

## Exercices

1. Ajoute un état `"retrying"` et une transition depuis `"error"` via un event `"RETRY"`.

   :::solution
   ```ts
   // Étendre State avec { status: "retrying" }
   // Étendre Event avec { type: "RETRY" }
   // Gérer le case dans transition
   ```
   :::

## Questions d'entretien

1. Comment modélises-tu une state machine simple en TypeScript ?

   :::reponse
   Avec des discriminated unions pour les états et les événements, des littéraux pour les discriminants, et une fonction de transition qui utilise le narrowing et l’exhaustivité pour ne gérer que les transitions valides.
   :::
