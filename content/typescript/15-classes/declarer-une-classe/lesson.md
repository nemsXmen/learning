---
id: typescript-15-declarer-une-classe
title: Déclarer une classe
slug: declarer-une-classe
technology: typescript
level: intermediate
module: 15-classes
order: 1
estimatedMinutes: 12
difficulty: 2
xp: 40
prerequisites: []
skills: [classes]
tags: [typescript, classes]
---

## Objectifs

- Déclarer une classe TypeScript
- Instancier avec `new`
- Comprendre le lien type + valeur

## Introduction

Une **classe** TypeScript combine une forme d’objet (type) et une implémentation runtime (valeur).

## Concept

```ts
class User {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  greet() {
    return `Hello, ${this.name}`;
  }
}

const user = new User("Alice");
user.greet(); // "Hello, Alice"
```

Le nom `User` désigne à la fois le type de l’instance et la fonction constructeur.

## Exemple

```ts
class Point {
  x: number = 0;
  y: number = 0;
}
```

## Comment ça fonctionne

TypeScript ajoute le typage des membres par-dessus la syntaxe de classe ES. À la compilation, on obtient du JavaScript de classes (ou équivalent selon la cible).

## Erreurs fréquentes

- Oublier `new` à l’instanciation
- Confondre la classe (valeur) et le type d’instance

## À retenir

- `class Nom { ... }`
- `new Nom(...)` pour créer une instance
- La classe est à la fois type et valeur

## Exercices

1. Déclare une classe `Counter` avec une propriété `value` initialisée à 0.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   class Counter {
     value: number = 0;
   }
   ```
   :::

## Questions d'entretien

1. En TypeScript, que représente le nom d’une classe ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   À la fois le type des instances et la valeur constructeur runtime. On peut l’utiliser dans des annotations de type et avec `new`.
   :::
