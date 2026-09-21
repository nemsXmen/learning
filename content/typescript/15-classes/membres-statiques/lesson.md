---
id: typescript-15-membres-statiques
title: Membres statiques
slug: membres-statiques
technology: typescript
level: intermediate
module: 15-classes
order: 10
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-15-readonly]
skills: [classes]
tags: [typescript, classes, static]
---

## Objectifs

- Déclarer des propriétés et méthodes `static`
- Comprendre qu’elles appartiennent à la classe, pas à l’instance
- Voir des cas d’usage

## Introduction

Les membres **static** sont partagés par toutes les instances et accessibles via le nom de la classe.

## Concept

```ts
class MathUtil {
  static PI = 3.14159;

  static circleArea(radius: number): number {
    return MathUtil.PI * radius * radius;
  }
}

MathUtil.circleArea(2);
// const m = new MathUtil(); m.PI; // ❌ pas sur l’instance (sauf accès particulier)
```

## Exemple

```ts
class User {
  private static nextId = 1;
  readonly id: number;
  constructor(public name: string) {
    this.id = User.nextId++;
  }
}
```

## Comment ça fonctionne

`static` attache le membre au constructeur (la fonction classe), pas au prototype des instances.

## Erreurs fréquentes

- Accéder à un membre static via `this` dans un contexte d’instance de façon confuse
- Abuser du static pour un état global mutable

## À retenir

- `static` = niveau classe
- Accès : `ClassName.member`
- Utile pour helpers, compteurs, constantes

## Exercices

1. Ajoute une méthode static `createGuest()` à User qui retourne un User nommé "Guest".

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   class User {
     constructor(public name: string) {}
     static createGuest(): User {
       return new User("Guest");
     }
   }
   ```
   :::

## Questions d'entretien

1. Quelle est la différence entre un membre static et un membre d’instance ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Un membre d’instance appartient à chaque objet créé avec `new`. Un membre static appartient à la classe elle-même et est partagé / accessible via `ClassName.member`.
   :::
