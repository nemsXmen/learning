---
id: typescript-15-getters
title: Getters
slug: getters
technology: typescript
level: intermediate
module: 15-classes
order: 11
estimatedMinutes: 12
difficulty: 2
xp: 40
prerequisites: [typescript-15-membres-statiques]
skills: [classes]
tags: [typescript, classes, getters]
---

## Objectifs

- Déclarer des getters
- Exposer des propriétés calculées
- Les combiner avec des champs privés

## Introduction

Un **getter** s’utilise comme une propriété mais exécute du code à la lecture.

## Concept

```ts
class User {
  constructor(
    private firstName: string,
    private lastName: string
  ) {}

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

const u = new User("Alice", "Martin");
console.log(u.fullName); // "Alice Martin"
```

## Exemple

```ts
class Circle {
  constructor(private _radius: number) {}
  get radius(): number {
    return this._radius;
  }
  get area(): number {
    return Math.PI * this._radius ** 2;
  }
}
```

## Comment ça fonctionne

`get nom()` définit un accesseur. On lit `obj.nom` sans parenthèses. Utile pour les valeurs dérivées et l’encapsulation.

## Erreurs fréquentes

- Logique lourde / effets de bord dans un getter
- Confondre avec une méthode (appel avec `()`)

## À retenir

- `get prop(): Type { ... }`
- Accès comme une propriété
- Idéal pour les calculs légers et l’encapsulation

## Exercices

1. Ajoute un getter `label` qui retourne `#${this.id}`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   class Item {
     constructor(private id: number) {}
     get label(): string {
       return `#${this.id}`;
     }
   }
   ```
   :::

## Questions d'entretien

1. Quelle différence entre un getter et une méthode classique ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Un getter s’invoque comme une propriété (`obj.prop`) et représente souvent une valeur dérivée. Une méthode s’appelle avec des parenthèses (`obj.method()`) et représente plutôt une action.
   :::
