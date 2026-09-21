---
id: typescript-38-observer
title: Observer
slug: observer
technology: typescript
level: intermediate
module: 38-design-patterns
order: 5
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-38-strategy]
skills: [patterns]
tags: [typescript, patterns]
---

## Objectifs

- Publier/souscrire à des événements
- Typer les payloads
- Éviter le couplage direct

## Introduction

**Observer** (pub/sub) notifie des abonnés lors d’événements.

## Concept

```ts
type Events = {
  userCreated: { id: string; email: string };
  userDeleted: { id: string };
};

class Emitter {
  private listeners: {
    [K in keyof Events]?: Array<(payload: Events[K]) => void>;
  } = {};

  on<K extends keyof Events>(event: K, fn: (payload: Events[K]) => void) {
    (this.listeners[event] ??= []).push(fn);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]) {
    this.listeners[event]?.forEach((fn) => fn(payload));
  }
}
```

## Exemple

EventEmitter Node typé, bus domaine, UI stores.

## Comment ça fonctionne

La map d’événements type `on`/`emit`. Pas d’événement libre en string non typée.

## Erreurs fréquentes

- Payloads any
- Fuites de listeners (pas d’off)

## À retenir

- Map event → payload
- on/emit génériques
- Lifecycle des listeners

## Exercices

1. Type Events avec "ping": void (ou {}).

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type Events = { ping: Record<string, never> };
   ```
   :::

## Questions d'entretien

1. Comment types-tu un EventEmitter en TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Avec une map `Events` event → type de payload, et des méthodes `on`/`emit` génériques sur `keyof Events` pour contraindre noms et payloads.
   :::
