---
id: typescript-22-angle-bracket-assertions
title: Angle-bracket assertions
slug: angle-bracket-assertions
technology: typescript
level: intermediate
module: 22-type-assertions
order: 2
estimatedMinutes: 8
difficulty: 1
xp: 30
prerequisites: [typescript-22-as]
skills: [type-assertions]
tags: [typescript, assertions]
---

## Objectifs

- Connaître la syntaxe `<Type>value`
- Savoir pourquoi `as` est préféré (JSX)
- Les considérer équivalentes hors JSX

## Introduction

L’assertion angle-bracket est la forme historique : `<Type>value`.

## Concept

```ts
const value: unknown = "hello";
const str = <string>value;
```

Équivalent à :

```ts
const str = value as string;
```

## Exemple

En JSX/TSX, `<string>value` est ambigu avec les balises → on utilise `as`.

## Comment ça fonctionne

Même sémantique que `as`. Différence purement syntaxique.

## Erreurs fréquentes

- Utiliser `<>` dans un fichier TSX

## À retenir

- `<Type>value` ≈ `value as Type`
- Préférer `as` (compatible JSX)
- Même absence de runtime check

## Exercices

1. Réécris `<number>x` avec `as`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   const n = x as number;
   ```
   :::

## Questions d'entretien

1. Pourquoi préfère-t-on `as` à la syntaxe angle-bracket ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Parce que dans les fichiers TSX, `<Type>value` entre en conflit avec la syntaxe JSX. `as` évite cette ambiguïté.
   :::
