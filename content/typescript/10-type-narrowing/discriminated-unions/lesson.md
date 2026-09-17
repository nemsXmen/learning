---
id: typescript-10-discriminated-unions
title: Discriminated unions
slug: discriminated-unions
technology: typescript
level: intermediate
module: 10-type-narrowing
order: 11
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-08-discriminated-unions]
skills: [type-narrowing]
tags: [typescript, narrowing, discriminated]
---

## Objectifs

- Revisiter les discriminated unions sous l’angle du narrowing
- Les utiliser systématiquement pour les variantes
- Les combiner avec switch / if

## Introduction

Les discriminated unions sont l’une des formes de narrowing les plus puissantes et lisibles.

## Concept

```ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; size: number };

function area(shape: Shape): number {
  if (shape.kind === "circle") {
    return Math.PI * shape.radius ** 2;
  }
  return shape.size ** 2;
}
```

## Exemple

Le discriminant peut être un string, number ou boolean literal.

```ts
type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };
```

## Comment ça fonctionne

Le test sur le discriminant permet à TypeScript de sélectionner le bon membre de l’union et d’exposer ses propriétés spécifiques.

## Erreurs fréquentes

- Discriminant non littéral (trop large)
- Oublier des cas (compléter avec exhaustiveness)

## À retenir

- Discriminant littéral = narrowing automatique
- Pattern de référence pour les états et résultats
- À combiner avec l’exhaustivité

## Exercices

1. Narrow un `Result<number>` pour afficher la valeur ou l’erreur.

   :::solution
   ```ts
   function show(r: { ok: true; value: number } | { ok: false; error: string }) {
     if (r.ok) console.log(r.value);
     else console.error(r.error);
   }
   ```
   :::

## Questions d'entretien

1. Pourquoi les discriminated unions sont-elles si efficaces pour le narrowing ?

   :::reponse
   Parce que le discriminant est une propriété de type littéral distincte pour chaque membre. Un simple test d’égalité permet à TypeScript d’identifier précisément le membre et d’exposer ses champs.
   :::
