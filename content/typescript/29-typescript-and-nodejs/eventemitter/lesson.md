---
id: typescript-29-eventemitter
title: EventEmitter
slug: eventemitter
technology: typescript
level: intermediate
module: 29-typescript-and-nodejs
order: 9
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-29-buffers]
skills: [nodejs]
tags: [typescript, nodejs, events]
---

## Objectifs

- Typer un EventEmitter
- Utiliser des maps d’événements
- on / emit typés

## Introduction

`EventEmitter` est le bus d’événements de Node. On peut le typer précisément.

## Concept

```ts
import { EventEmitter } from "events";

type Events = {
  ready: [];
  error: [Error];
  data: [string, number];
};

class App extends EventEmitter {
  emit<K extends keyof Events>(event: K, ...args: Events[K]): boolean {
    return super.emit(event, ...args);
  }
  on<K extends keyof Events>(event: K, listener: (...args: Events[K]) => void): this {
    return super.on(event, listener as any);
  }
}
```

## Exemple

Libs et patterns plus simples existent (typed-emitter, etc.).

## Comment ça fonctionne

Une map event → tuple d’args permet de contraindre emit/on.

## Erreurs fréquentes

- EventEmitter non générique → args any
- Fautes de nom d’event non détectées

## À retenir

- Map d’events
- emit/on génériques
- Évite les any silencieux

## Exercices

1. Définis un type Events avec "ping": [].

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type Events = { ping: [] };
   ```
   :::

## Questions d'entretien

1. Comment types-tu les événements d’un EventEmitter ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En définissant une map nom d’événement → tuple des types d’arguments, puis en typant `on`/`emit` pour n’accepter que ces noms et payloads.
   :::
