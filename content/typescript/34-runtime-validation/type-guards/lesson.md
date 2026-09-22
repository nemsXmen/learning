---
id: typescript-34-type-guards
title: Type guards
slug: type-guards
technology: typescript
level: intermediate
module: 34-runtime-validation
order: 4
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-34-validation-manuelle]
skills: [validation]
tags: [typescript, validation, narrowing]
---

## Objectifs

- Écrire des type predicates
- Affiner unknown vers un type
- Composer des guards

## Introduction

Un **type guard** est une fonction qui affirme un type et permet le narrowing.

## Concept

```ts
function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as User).id === "string" &&
    typeof (value as User).name === "string"
  );
}

function handle(data: unknown) {
  if (isUser(data)) {
    console.log(data.name); // data: User
  }
}
```

## Exemple

`Array.isArray`, `typeof`, `instanceof` sont des guards natifs.

## Comment ça fonctionne

Le predicat `value is T` dit au compilateur que dans le branche true, value a le type T.

## Erreurs fréquentes

- Retourner boolean sans `value is T`
- Guard trop permissif (mensonge de type)

## À retenir

- value is T
- Narrowing après if
- Honnêteté du guard

## Exercices

1. Guard isString(value: unknown): value is string.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   function isString(value: unknown): value is string {
     return typeof value === "string";
   }
   ```
   :::

## Questions d'entretien

1. Que signifie `value is User` dans la signature d’un guard ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   C’est un type predicate : si la fonction retourne true, TypeScript affine le type de value en User dans le bloc conditionnel.
   :::
