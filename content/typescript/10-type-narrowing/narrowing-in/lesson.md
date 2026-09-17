---
id: typescript-10-narrowing-in
title: Narrowing avec in
slug: narrowing-in
technology: typescript
level: intermediate
module: 10-type-narrowing
order: 3
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-10-narrowing-instanceof]
skills: [type-narrowing]
tags: [typescript, narrowing, in]
---

## Objectifs

- Utiliser l’opérateur `in` pour narrow des unions d’objets
- Distinguer des formes par la présence de propriétés
- Connaître les limites

## Introduction

L’opérateur `in` teste la présence d’une propriété et permet un excellent narrowing structurel.

## Concept

```ts
type Fish = { swim: () => void };
type Bird = { fly: () => void };

function move(animal: Fish | Bird) {
  if ("swim" in animal) {
    animal.swim();
  } else {
    animal.fly();
  }
}
```

## Exemple

```ts
type Success = { data: string };
type Failure = { error: string };

function handle(result: Success | Failure) {
  if ("data" in result) {
    console.log(result.data);
  } else {
    console.error(result.error);
  }
}
```

## Comment ça fonctionne

Si la propriété testée n’existe que sur certains membres de l’union, TypeScript restreint le type en conséquence.

## Erreurs fréquentes

- Tester une propriété commune à tous les membres (pas de narrowing utile)
- Confondre avec les index signatures

## À retenir

- `"prop" in obj` = narrowing structurel
- Idéal quand les variantes ont des propriétés distinctes
- Alternative légère aux discriminants explicites

## Exercices

1. Narrow une union `{ a: number } | { b: string }` avec `in`.

   :::solution
   ```ts
   function f(x: { a: number } | { b: string }) {
     if ("a" in x) return x.a;
     return x.b;
   }
   ```
   :::

## Questions d'entretien

1. Quand préfères-tu `in` à un discriminant `kind` ?

   :::reponse
   Quand les objets ont déjà des propriétés distinctives et qu’on ne veut pas ajouter de champ technique. Pour les modèles métier clairs, un discriminant explicite reste souvent plus lisible.
   :::
