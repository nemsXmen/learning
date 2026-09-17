---
id: typescript-10-asserts
title: asserts
slug: asserts
technology: typescript
level: intermediate
module: 10-type-narrowing
order: 10
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-10-assertion-functions]
skills: [type-narrowing]
tags: [typescript, asserts]
---

## Objectifs

- Maîtriser le mot-clé `asserts`
- Écrire des assertions robustes
- Les utiliser comme préconditions

## Introduction

`asserts` formalise les assertion functions dans le système de types.

## Concept

Deux formes principales :

```ts
// 1. Asserts une condition booléenne
function assert(cond: any, msg?: string): asserts cond {
  if (!cond) throw new Error(msg);
}

// 2. Asserts un type
function assertIsNumber(x: unknown): asserts x is number {
  if (typeof x !== "number") throw new Error("Expected number");
}
```

## Exemple

```ts
function divide(a: number, b: number) {
  assert(b !== 0, "Division by zero");
  return a / b;
}
```

## Comment ça fonctionne

Après un appel réussi (sans throw), TypeScript applique le narrowing décrit par `asserts`.

## Erreurs fréquentes

- Ne pas throw (l’assertion devient mensongère)
- Utiliser `asserts` pour de la logique métier complexe plutôt que des préconditions

## À retenir

- `asserts cond` / `asserts x is T`
- Préconditions claires et narrowing automatique
- Toujours throw en cas d’échec

## Exercices

1. Écris `assertIsArray` pour `unknown`.

   :::solution
   ```ts
   function assertIsArray(value: unknown): asserts value is unknown[] {
     if (!Array.isArray(value)) {
       throw new Error("Expected array");
     }
   }
   ```
   :::

## Questions d'entretien

1. À quoi sert le mot-clé `asserts` dans une signature de fonction ?

   :::reponse
   Il indique que la fonction est une assertion function : si elle retourne normalement, la condition ou le prédicat de type est considéré comme vrai pour la suite du flux de contrôle.
   :::
