---
id: typescript-15-constructeurs
title: Constructeurs
slug: constructeurs
technology: typescript
level: intermediate
module: 15-classes
order: 2
estimatedMinutes: 12
difficulty: 2
xp: 40
prerequisites: [typescript-15-declarer-une-classe]
skills: [classes]
tags: [typescript, classes]
---

## Objectifs

- Déclarer un constructeur typé
- Initialiser les propriétés
- Comprendre le rôle de `constructor`

## Introduction

Le **constructeur** s’exécute à l’instanciation et initialise l’état de l’objet.

## Concept

```ts
class User {
  name: string;
  age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
}

const u = new User("Alice", 30);
```

Une classe n’a qu’un constructeur (pas de surcharge runtime, mais des overloads de types possibles).

## Exemple

```ts
class Timer {
  start: number;
  constructor() {
    this.start = Date.now();
  }
}
```

## Comment ça fonctionne

Les paramètres du constructeur sont typés comme ceux d’une fonction. `this` dans le constructeur désigne la nouvelle instance.

## Erreurs fréquentes

- Oublier d’assigner les propriétés déclarées
- Logique métier lourde dans le constructeur

## À retenir

- `constructor(params) { ... }`
- Initialise l’instance
- Un seul constructeur d’implémentation

## Exercices

1. Écris une classe `Product` avec un constructeur `(name: string, price: number)`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   class Product {
     name: string;
     price: number;
     constructor(name: string, price: number) {
       this.name = name;
       this.price = price;
     }
   }
   ```
   :::

## Questions d'entretien

1. Combien de constructeurs d’implémentation une classe TypeScript peut-elle avoir ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Un seul. On peut déclarer des overloads de types pour documenter plusieurs signatures, mais une seule implémentation.
   :::
