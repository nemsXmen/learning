---
id: typescript-15-readonly
title: readonly
slug: readonly
technology: typescript
level: intermediate
module: 15-classes
order: 9
estimatedMinutes: 12
difficulty: 2
xp: 40
prerequisites: [typescript-15-protected]
skills: [classes]
tags: [typescript, classes, readonly]
---

## Objectifs

- Utiliser `readonly` sur les propriétés de classe
- L’initialiser correctement
- Le combiner avec les autres modificateurs

## Introduction

`readonly` empêche la réaffectation d’une propriété après l’initialisation.

## Concept

```ts
class User {
  readonly id: string;
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

const u = new User("1", "Alice");
// u.id = "2"; // ❌
u.name = "Bob"; // OK
```

Avec parameter property :

```ts
class User {
  constructor(public readonly id: string, public name: string) {}
}
```

## Exemple

```ts
class Config {
  constructor(public readonly apiUrl: string) {}
}
```

## Comment ça fonctionne

Assignation autorisée à la déclaration ou dans le constructeur uniquement. Protection compile-time.

## Erreurs fréquentes

- Essayer de réassigner hors constructeur
- Croire que les objets imbriqués sont en profondeur readonly

## À retenir

- `readonly` = pas de réaffectation après init
- Idéal pour les identifiants et configs
- Combinable avec public/private/protected

## Exercices

1. Rends `id` readonly via une parameter property.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   class Entity {
     constructor(public readonly id: string) {}
   }
   ```
   :::

## Questions d'entretien

1. Où peut-on assigner une propriété `readonly` de classe ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   À la déclaration ou dans le constructeur. Toute réaffectation ultérieure est refusée par le compilateur.
   :::
