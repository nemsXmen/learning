---
id: typescript-08-narrowing-avec-les-unions
title: Narrowing avec les unions
slug: narrowing-avec-les-unions
technology: typescript
level: intermediate
module: 08-union-and-intersection
order: 8
estimatedMinutes: 15
difficulty: 2
xp: 50
prerequisites: [typescript-08-exhaustiveness-checking]
skills: [unions-intersections, type-narrowing]
tags: [typescript, unions, narrowing]
---

## Objectifs

- Revoir les techniques de narrowing sur les unions
- Combiner typeof, in, égalité, discriminant
- Écrire du code sûr et lisible

## Introduction

Le **narrowing** réduit une union à un type plus précis dans un bloc de code.

## Concept

### typeof

```ts
function f(x: string | number) {
  if (typeof x === "string") {
    x.toUpperCase();
  } else {
    x.toFixed(2);
  }
}
```

### in

```ts
function f(x: { a: string } | { b: number }) {
  if ("a" in x) {
    x.a;
  } else {
    x.b;
  }
}
```

### Discriminant

```ts
if (shape.kind === "circle") {
  shape.radius;
}
```

### Égalité / truthiness

```ts
if (value !== null) { /* ... */ }
if (value) { /* ... */ }
```

## Exemple

```ts
type Result = { ok: true; value: string } | { ok: false; error: string };

function message(r: Result): string {
  if (r.ok) return r.value;
  return r.error;
}
```

## Comment ça fonctionne

TypeScript analyse le flux de contrôle (control-flow analysis) et restreint les types en fonction des tests.

## Erreurs fréquentes

- Narrowing insuffisant
- Tests qui ne sont pas reconnus par TypeScript (préférer les formes supportées)

## À retenir

- typeof, in, discriminant, égalité = outils de base
- Le narrowing rend les unions utilisables en pratique
- Toujours traiter tous les cas

## Exercices

1. Écris une fonction qui narrow une union `string | string[]` et retourne la longueur totale.

   :::solution
   ```ts
   function totalLength(value: string | string[]): number {
     if (typeof value === "string") return value.length;
     return value.reduce((sum, s) => sum + s.length, 0);
   }
   ```
   :::

## Questions d'entretien

1. Quelles techniques de narrowing utilises-tu sur les unions ?

   :::reponse
   typeof pour les primitifs, in pour les objets, les discriminants (kind/type), les tests d’égalité et la truthiness. Le control-flow analysis de TypeScript réduit ensuite le type dans chaque branche.
   :::
