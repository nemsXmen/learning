---
id: typescript-04-proprietes-readonly
title: Propriétés readonly
slug: proprietes-readonly
technology: typescript
level: beginner
module: 04-objects
order: 4
estimatedMinutes: 12
difficulty: 2
xp: 40
prerequisites: [typescript-04-proprietes-optionnelles]
skills: [objects]
tags: [typescript, objects, readonly]
---

## Objectifs

- Utiliser `readonly` sur les propriétés d’objet
- Comprendre la protection à la compilation
- Savoir quand l’appliquer

## Introduction

`readonly` empêche la réaffectation d’une propriété après l’initialisation de l’objet.

## Concept

```ts
type Config = {
  readonly apiUrl: string;
  timeout: number;
};

const config: Config = { apiUrl: "https://api.example.com", timeout: 5000 };
// config.apiUrl = "autre"; // ❌ Cannot assign to 'apiUrl' because it is a read-only property
config.timeout = 3000; // OK
```

## Exemple

```ts
interface Point {
  readonly x: number;
  readonly y: number;
}

const origin: Point = { x: 0, y: 0 };
```

## Comment ça fonctionne

Le modificateur `readonly` est vérifié uniquement par le type-checker. À runtime la propriété reste mutable en JavaScript.

## Erreurs fréquentes

- Croire que `readonly` protège à runtime
- Oublier que les objets imbriqués ne sont pas automatiquement readonly en profondeur

## À retenir

- `readonly prop: Type` → pas de réaffectation
- Protection de compilation uniquement
- Idéal pour les identifiants, configurations, props immuables

## Exercices

1. Crée un type `Id` avec une propriété `value` readonly de type string.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   type Id = {
     readonly value: string;
   };
   ```
   :::

## Questions d'entretien


1. `readonly` garantit-il l’immutabilité à runtime ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   Non. C’est une contrainte du système de types. Le JavaScript généré reste mutable. Pour une immutabilité runtime il faut d’autres mécanismes (Object.freeze, structures immuables…).
   :::

