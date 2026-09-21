---
id: typescript-23-classes-declarees
title: Classes déclarées
slug: classes-declarees
technology: typescript
level: intermediate
module: 23-declaration-files
order: 7
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-23-fonctions-declarees]
skills: [declaration-files]
tags: [typescript, declaration-files]
---

## Objectifs

- Déclarer des classes dans un .d.ts
- Exposer constructeur, méthodes, propriétés
- Gérer héritage et membres static

## Introduction

Les classes JS peuvent être décrites entièrement en déclarations.

## Concept

```ts
declare class Logger {
  constructor(prefix?: string);
  log(message: string): void;
  static create(prefix: string): Logger;
  readonly level: string;
}
```

## Exemple

```ts
declare class EventEmitter {
  on(event: string, listener: (...args: any[]) => void): this;
  emit(event: string, ...args: any[]): boolean;
}
```

## Comment ça fonctionne

On déclare la forme publique. Les détails d’implémentation restent dans le `.js`.

## Erreurs fréquentes

- Exposer des membres privés inutiles
- Oublier le type de retour de méthodes chaînées (`this`)

## À retenir

- `declare class` + membres
- Constructeur, instance, static
- API publique seulement

## Exercices

1. Déclare une classe `Counter` avec `value: number`, `inc(): void`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   declare class Counter {
     value: number;
     inc(): void;
   }
   ```
   :::

## Questions d'entretien

1. Que met-on dans une déclaration de classe `.d.ts` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   La surface publique : constructeur, propriétés, méthodes, membres static, éventuellement l’héritage. Pas l’implémentation des méthodes.
   :::
