---
id: typescript-09-number-literal-types
title: Number literal types
slug: number-literal-types
technology: typescript
level: beginner
module: 09-literal-types
order: 2
estimatedMinutes: 10
difficulty: 1
xp: 35
prerequisites: [typescript-09-string-literal-types]
skills: [literal-types]
tags: [typescript, literals, number]
---

## Objectifs

- Utiliser les number literal types
- Créer des unions de nombres littéraux
- Voir des cas d’usage (dés, ports, codes)

## Introduction

Comme pour les strings, TypeScript traite les nombres littéraux comme des types.

## Concept

```ts
type Dice = 1 | 2 | 3 | 4 | 5 | 6;
type HttpSuccess = 200 | 201 | 204;

let roll: Dice = 4;
// roll = 7; // ❌
```

## Exemple

```ts
function setPort(port: 3000 | 8080 | 9000) {
  // ...
}
```

## Comment ça fonctionne

Chaque littéral numérique est un sous-type de `number`. Les unions forment des ensembles fermés.

## Erreurs fréquentes

- Utiliser `number` trop large
- Oublier que `0.1 + 0.2` n’est pas un littéral exact utile ici

## À retenir

- `1 | 2 | 3` = ensemble de nombres autorisés
- Utile pour les codes, ports, configurations numériques limitées

## Exercices

1. Crée un type `HttpError` pour 400 | 401 | 403 | 404 | 500.

   :::solution
   ```ts
   type HttpError = 400 | 401 | 403 | 404 | 500;
   ```
   :::

## Questions d'entretien

1. Dans quels cas utilises-tu des number literal types ?

   :::reponse
   Pour des ensembles fermés de nombres : codes HTTP, faces de dé, ports connus, niveaux, etc. Cela documente et restreint les valeurs acceptées.
   :::
