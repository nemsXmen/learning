---
id: typescript-38-adapter
title: Adapter
slug: adapter
technology: typescript
level: intermediate
module: 38-design-patterns
order: 3
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-38-builder]
skills: [patterns]
tags: [typescript, patterns]
---

## Objectifs

- Adapter une API externe à une interface interne
- Typer l’adaptateur
- Isoler les libs tierces

## Introduction

L’**Adapter** convertit une interface (souvent tierce) vers celle attendue par le domaine.

## Concept

```ts
interface Clock {
  now(): Date;
}

class SystemClock implements Clock {
  now() {
    return new Date();
  }
}

// Adapter une lib "legacy-time"
class LegacyClockAdapter implements Clock {
  constructor(private legacy: { currentMillis(): number }) {}
  now() {
    return new Date(this.legacy.currentMillis());
  }
}
```

## Exemple

Adapters HTTP, storage, payment providers.

## Comment ça fonctionne

Le domaine dépend de `Clock`. Les détails legacy restent dans l’adapter.

## Erreurs fréquentes

- Fuite des types de la lib tierce dans le domaine
- Adapter trop gros (multi-responsabilités)

## À retenir

- Interface cible
- Wrapper typé
- Isolation tierce

## Exercices

1. Pourquoi le domaine dépend-il de Clock et non de Date.now directement ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Pour tester (fake clock) et découpler du runtime global.
   :::

## Questions d'entretien

1. Adapter en TypeScript : intérêt principal ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Faire parler une API tierce le langage du domaine via une interface stable, tout en contenant le mapping et les types externes à la bordure.
   :::
