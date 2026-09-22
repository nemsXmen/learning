---
id: typescript-18-instancetype
title: InstanceType
slug: instancetype
technology: typescript
level: intermediate
module: 18-utility-types
order: 13
estimatedMinutes: 8
difficulty: 2
xp: 35
prerequisites: [typescript-18-constructorparameters]
skills: [utility-types]
tags: [typescript, utility-types]
---

## Objectifs

- Utiliser `InstanceType<T>`
- Obtenir le type d’instance d’un constructeur
- L’utiliser dans des factories

## Introduction

`InstanceType<T>` extrait le type d’instance produit par un constructeur.

## Concept

```ts
class User {
  name: string = "";
}
type U = InstanceType<typeof User>; // User
```

## Exemple

```ts
function factory<T extends new (...args: any) => any>(
  Ctor: T
): InstanceType<T> {
  return new Ctor();
}
```

## Comment ça fonctionne

Conditional type sur une signature `new (...args) => infer R`.

## Erreurs fréquentes

- Passer une instance au lieu du constructeur

## À retenir

- `InstanceType<typeof Class>`
- Type de l’objet créé par `new`
- Factories / DI typées

## Exercices

1. Déclare le type d’instance de `class Counter {}` via InstanceType.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   class Counter {}
   type C = InstanceType<typeof Counter>;
   ```
   :::

## Questions d'entretien

1. Que produit `InstanceType<typeof MyClass>` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Le type des instances créées par `new MyClass(...)`, c’est-à-dire le type d’instance de la classe.
   :::
