---
id: typescript-20-conditional-types-imbriques
title: Conditional types imbriqués
slug: conditional-types-imbriques
technology: typescript
level: advanced
module: 20-conditional-types
order: 5
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-20-distributive-conditional-types]
skills: [conditional-types]
tags: [typescript, conditional-types]
---

## Objectifs

- Imbriquer des conditional types
- Exprimer des décisions multi-étapes
- Rester lisible

## Introduction

On peut imbriquer des ternaires de types pour des logiques plus riches.

## Concept

```ts
type TypeName<T> =
  T extends string ? "string" :
  T extends number ? "number" :
  T extends boolean ? "boolean" :
  T extends undefined ? "undefined" :
  T extends Function ? "function" :
  "object";

type A = TypeName<string>; // "string"
type B = TypeName<() => void>; // "function"
```

## Exemple

```ts
type Flatten<T> =
  T extends Array<infer U>
    ? U extends Array<any>
      ? Flatten<U>
      : U
    : T;
```

## Comment ça fonctionne

Chaque branche peut elle-même être un conditional type. L’ordre des tests compte (comme un if/else if).

## Erreurs fréquentes

- Imbrications trop profondes illisibles
- Ordre des conditions incorrect

## À retenir

- Ternaires de types chaînés
- Ordre des tests important
- Préférer la clarté à la densité

## Exercices

1. Écris un TypeName simplifié pour string | number | other.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type TypeName<T> =
     T extends string ? "string" :
     T extends number ? "number" :
     "other";
   ```
   :::

## Questions d'entretien

1. Comment gères-tu plusieurs conditions au niveau des types ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En imbriquant des conditional types (ternaires chaînés), en veillant à l’ordre des tests et à la lisibilité — éventuellement en nommant des types intermédiaires.
   :::
