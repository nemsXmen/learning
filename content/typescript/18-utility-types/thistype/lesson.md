---
id: typescript-18-thistype
title: ThisType
slug: thistype
technology: typescript
level: advanced
module: 18-utility-types
order: 15
estimatedMinutes: 12
difficulty: 3
xp: 45
prerequisites: [typescript-18-awaited]
skills: [utility-types]
tags: [typescript, utility-types]
---

## Objectifs

- Comprendre `ThisType<T>`
- Typer `this` dans les objets littéraux
- Voir un cas d’usage (options d’API)

## Introduction

`ThisType<T>` marque un type pour indiquer le type de `this` dans un contexte d’objet littéral (avec `noImplicitThis` / contexte approprié).

## Concept

```ts
type Helper = {
  multiply(x: number): number;
};

type Config = {
  factor: number;
} & ThisType<Helper & { factor: number }>;

const config: Config = {
  factor: 2,
  multiply(x) {
    return x * this.factor; // this typé
  }
};
```

## Exemple

Utilisé dans des APIs de type Vue options API ou builders d’objets avec méthodes.

## Comment ça fonctionne

`ThisType` n’a pas d’effet runtime : c’est un marqueur purement type-level interprété dans certains contextes d’inférence de `this`.

## Erreurs fréquentes

- S’attendre à un effet hors des contextes supportés
- Complexifier inutilement

## À retenir

- Marqueur pour le type de `this`
- Contextes d’objets littéraux / options APIs
- Avancé et situationnel

## Exercices

1. Explique en une phrase le rôle de ThisType.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Marquer le type de `this` pour les méthodes dans un objet littéral typé.
   :::

## Questions d'entretien

1. À quoi sert `ThisType<T>` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   C’est un utility type marqueur qui indique le type de `this` dans certains contextes d’objets littéraux, permettant de typer correctement les méthodes qui s’y réfèrent.
   :::
