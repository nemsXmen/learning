---
id: typescript-21-template-literal-types
title: Template literal types
slug: 21-template-literal-types
technology: typescript
level: advanced
module: 21-template-literal-types
order: 1
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-17-template-literal-types]
skills: [template-literal-types]
tags: [typescript, template-literal-types]
---

## Objectifs

- Comprendre les template literal types
- Composer des types string
- Voir la distribution sur les unions

## Introduction

Les **template literal types** construisent des types string à partir d’autres types string, sur le modèle des template literals JS.

## Concept

```ts
type World = "world";
type Greeting = `hello ${World}`; // "hello world"

type A = "a" | "b";
type B = "1" | "2";
type Combo = `${A}${B}`; // "a1" | "a2" | "b1" | "b2"
```

## Exemple

```ts
type CssUnit = "px" | "em" | "rem";
type CssValue = `${number}${CssUnit}`; // e.g. pattern for "10px"
```

## Comment ça fonctionne

Les unions se distribuent : le produit cartésien des combinaisons est généré.

## Erreurs fréquentes

- Oublier que number dans un template produit un type large
- Complexité excessive de chaînes

## À retenir

- `` `prefix${Type}suffix` ``
- Distribution sur les unions
- Typage fin des strings structurées

## Exercices

1. Crée un type `HelloName` pour `` `hello ${"Alice" | "Bob"}` ``.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type HelloName = `hello ${"Alice" | "Bob"}`;
   // "hello Alice" | "hello Bob"
   ```
   :::

## Questions d'entretien

1. Que se passe-t-il quand on place des unions dans un template literal type ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   TypeScript distribue et produit le produit cartésien de toutes les combinaisons de littéraux.
   :::
