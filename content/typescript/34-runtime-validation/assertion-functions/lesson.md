---
id: typescript-34-assertion-typescript-basics
title: Assertion typescript-basics
slug: assertion-typescript-basics
technology: typescript
level: intermediate
module: 34-runtime-validation
order: 5
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-34-type-guards]
skills: [validation]
tags: [typescript, validation]
---

## Objectifs

- Utiliser asserts value is T
- Échouer vite si invalide
- Différencier guard et assert

## Introduction

Une **assertion function** lance une erreur si la condition est fausse et affine le type ensuite.

## Concept

```ts
function assertUser(value: unknown): asserts value is User {
  if (!isUser(value)) {
    throw new Error("Invalid user");
  }
}

function main(data: unknown) {
  assertUser(data);
  console.log(data.name); // data: User
}
```

## Exemple

Utile en début de fonction pour préconditions.

## Comment ça fonctionne

`asserts value is T` indique que si la fonction retourne (sans throw), value est T.

## Erreurs fréquentes

- Oublier le throw
- Assertions silencieuses

## À retenir

- asserts value is T
- Throw si invalide
- Affinage après l’appel

## Exercices

1. assertString(value: unknown): asserts value is string.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   function assertString(value: unknown): asserts value is string {
     if (typeof value !== "string") throw new Error("not a string");
   }
   ```
   :::

## Questions d'entretien

1. Type guard vs assertion function ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Guard : retourne boolean, l’appelant branche. Assertion : throw si invalide, et affine le type dans la suite linéaire du code.
   :::
