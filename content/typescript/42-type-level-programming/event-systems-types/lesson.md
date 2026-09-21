---
id: typescript-42-event-systems-types
title: Event systems typés
slug: event-systems-types
technology: typescript
level: advanced
module: 42-type-level-programming
order: 12
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-42-path-types]
skills: [type-level]
tags: [typescript, type-level]
---

## Objectifs

- Map event → payload
- on/emit typés
- Dériver handlers

## Introduction

Les **systèmes d’événements typés** lient noms et payloads.

## Concept

```ts
type Events = {
  ready: { t: number };
  error: { message: string };
};

type On = <K extends keyof Events>(
  event: K,
  handler: (payload: Events[K]) => void
) => void;
```

## Exemple

Mapped handlers : `{ [K in keyof Events as `on${Capitalize<K>}`]: ... }`.

## Comment ça fonctionne

Une seule map source de vérité ; les APIs dérivent les signatures.

## Erreurs fréquentes

- event: string libre
- payload any

## À retenir

- Map Events
- keyof + index
- Dérivation

## Exercices

1. payload de emit("error", ...) ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   `{ message: string }`
   :::

## Questions d'entretien

1. Comment types-tu un bus d’événements ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Avec une map `Events` event → payload et des méthodes génériques `on`/`emit` contraintes par `keyof Events`, éventuellement des handlers dérivés via mapped/template types.
   :::
