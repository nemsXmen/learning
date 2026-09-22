---
id: typescript-15-parameter-properties
title: Parameter properties
slug: parameter-properties
technology: typescript
level: intermediate
module: 15-classes
order: 5
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-15-methodes]
skills: [classes]
tags: [typescript, classes]
---

## Objectifs

- Utiliser les parameter properties
- Réduire le boilerplate constructeur
- Connaître les modificateurs applicables

## Introduction

Les **parameter properties** déclarent et initialisent une propriété directement depuis le paramètre du constructeur.

## Concept

```ts
class User {
  constructor(
    public name: string,
    private age: number,
    readonly id: string
  ) {}
}

const u = new User("Alice", 30, "1");
u.name; // OK
// u.age; // ❌ private
```

Équivalent long :

```ts
class User {
  public name: string;
  private age: number;
  readonly id: string;
  constructor(name: string, age: number, id: string) {
    this.name = name;
    this.age = age;
    this.id = id;
  }
}
```

## Exemple

```ts
class Service {
  constructor(private readonly repo: Repository) {}
}
```

## Comment ça fonctionne

Le modificateur (`public`, `private`, `protected`, `readonly`) sur un paramètre de constructeur crée automatiquement la propriété et l’assignation.

## Erreurs fréquentes

- Oublier le modificateur (ce n’est alors qu’un paramètre normal)
- Trop de logique dans un constructeur déjà chargé de déclarations

## À retenir

- `constructor(public name: string)` = propriété + assignation
- Très courant et idiomatique
- Combinable avec readonly / private / protected

## Exercices

1. Réécris une classe Point avec parameter properties pour x et y.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   class Point {
     constructor(public x: number, public y: number) {}
   }
   ```
   :::

## Questions d'entretien

1. Qu’est-ce qu’une parameter property en TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Un paramètre de constructeur précédé d’un modificateur (`public`, `private`, `protected`, `readonly`) qui déclare automatiquement une propriété de classe et l’initialise avec la valeur du paramètre.
   :::
