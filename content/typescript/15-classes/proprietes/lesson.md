---
id: typescript-15-proprietes
title: Propriétés
slug: proprietes
technology: typescript
level: intermediate
module: 15-classes
order: 3
estimatedMinutes: 12
difficulty: 2
xp: 40
prerequisites: [typescript-15-constructeurs]
skills: [classes]
tags: [typescript, classes]
---

## Objectifs

- Déclarer des propriétés de classe
- Les initialiser (déclaration ou constructeur)
- Comprendre definite assignment

## Introduction

Les **propriétés** portent l’état de l’instance.

## Concept

```ts
class User {
  name: string;
  age: number = 0; // initialiseur
  email?: string;  // optionnelle

  constructor(name: string) {
    this.name = name;
  }
}
```

Avec `strictPropertyInitialization`, toute propriété non optionnelle doit être initialisée (déclaration, constructeur, ou `!`).

## Exemple

```ts
class Config {
  timeout: number = 5000;
  retries!: number; // definite assignment assertion
}
```

## Comment ça fonctionne

TypeScript vérifie que les propriétés obligatoires reçoivent une valeur. `!` affirme au compilateur que l’assignation aura lieu ailleurs.

## Erreurs fréquentes

- Propriété obligatoire non initialisée
- Abuser de `!` sans garantie réelle

## À retenir

- Déclaration + type (+ initialiseur optionnel)
- `strictPropertyInitialization` est ton ami
- `?` pour optionnel, `!` avec prudence

## Exercices

1. Déclare une classe avec `id: string` et `active: boolean = true`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   class Account {
     id: string;
     active: boolean = true;
     constructor(id: string) {
       this.id = id;
     }
   }
   ```
   :::

## Questions d'entretien

1. Que fait `strictPropertyInitialization` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Il exige que chaque propriété non optionnelle soit initialisée soit à la déclaration, soit dans le constructeur (sauf si on utilise l’assertion `!`).
   :::
