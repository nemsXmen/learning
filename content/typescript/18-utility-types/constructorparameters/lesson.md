---
id: typescript-18-constructorparameters
title: ConstructorParameters
slug: constructorparameters
technology: typescript
level: intermediate
module: 18-utility-types
order: 12
estimatedMinutes: 8
difficulty: 2
xp: 35
prerequisites: [typescript-18-parameters]
skills: [utility-types]
tags: [typescript, utility-types]
---

## Objectifs

- Utiliser `ConstructorParameters<T>`
- Extraire les params d’un constructeur
- Typer des factories de classes

## Introduction

`ConstructorParameters<T>` extrait le tuple des paramètres du constructeur d’une classe (ou d’un type constructeur).

## Concept

```ts
class User {
  constructor(public name: string, public age: number) {}
}
type Args = ConstructorParameters<typeof User>; // [string, number]
```

## Exemple

```ts
function create<T extends new (...args: any) => any>(
  Ctor: T,
  ...args: ConstructorParameters<T>
): InstanceType<T> {
  return new Ctor(...args);
}
```

## Comment ça fonctionne

Similaire à Parameters mais sur la signature constructeur.

## Erreurs fréquentes

- Passer l’instance au lieu du constructeur (`typeof Class`)

## À retenir

- `ConstructorParameters<typeof Class>`
- Factories génériques
- Couple avec InstanceType

## Exercices

1. Extrais les params du constructeur d’une classe Point(x, y).

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   class Point { constructor(public x: number, public y: number) {} }
   type P = ConstructorParameters<typeof Point>; // [number, number]
   ```
   :::

## Questions d'entretien

1. Quelle différence entre Parameters et ConstructorParameters ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Parameters s’applique à un type fonction. ConstructorParameters s’applique à un type constructeur (classe) et extrait les paramètres de `constructor`.
   :::
