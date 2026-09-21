---
id: typescript-15-classes-abstraites
title: Classes abstraites
slug: classes-abstraites
technology: typescript
level: intermediate
module: 15-classes
order: 13
estimatedMinutes: 15
difficulty: 3
xp: 55
prerequisites: [typescript-15-setters]
skills: [classes]
tags: [typescript, classes, abstract]
---

## Objectifs

- Déclarer une classe abstraite
- Comprendre qu’elle ne peut pas être instanciée
- L’utiliser comme base d’héritage

## Introduction

Une **classe abstraite** factorise du comportement commun tout en interdisant l’instanciation directe.

## Concept

```ts
abstract class Shape {
  constructor(public color: string) {}

  abstract area(): number;

  describe(): string {
    return `A ${this.color} shape of area ${this.area()}`;
  }
}

class Circle extends Shape {
  constructor(color: string, public radius: number) {
    super(color);
  }
  area(): number {
    return Math.PI * this.radius ** 2;
  }
}

// new Shape("red"); // ❌
const c = new Circle("blue", 2);
```

## Exemple

Les classes abstraites sont utiles pour les frameworks et les modèles de domaine avec variantes.

## Comment ça fonctionne

`abstract class` ne peut pas être instanciée. Les sous-classes concrètes doivent implémenter les membres abstraits.

## Erreurs fréquentes

- Essayer d’instancier une classe abstraite
- Oublier d’implémenter une méthode abstraite dans la sous-classe

## À retenir

- `abstract class` = base non instanciable
- Peut contenir du code concret + des membres abstraits
- Alternative / complément aux interfaces

## Exercices

1. Déclare une classe abstraite `Animal` avec une méthode abstraite `speak(): string`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   abstract class Animal {
     abstract speak(): string;
   }
   ```
   :::

## Questions d'entretien

1. Quelle est la différence entre une classe abstraite et une interface ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Une classe abstraite peut contenir de l’implémentation (méthodes concrètes, état) et n’existe qu’une fois dans la chaîne d’héritage. Une interface ne décrit que la forme, peut être implémentée en multiple, et n’a pas d’implémentation runtime.
   :::
