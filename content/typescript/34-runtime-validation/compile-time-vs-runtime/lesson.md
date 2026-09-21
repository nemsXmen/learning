---
id: typescript-34-compile-time-vs-runtime
title: Compile-time vs runtime
slug: 34-compile-time-vs-runtime
technology: typescript
level: intermediate
module: 34-runtime-validation
order: 2
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-34-donnees-externes]
skills: [validation]
tags: [typescript, validation]
---

## Objectifs

- Distinguer garanties compile-time et runtime
- Voir la type erasure
- Positionner la validation

## Introduction

TypeScript protège à la **compilation** ; le JavaScript exécuté n’a plus les types.

## Concept

```ts
function greet(user: User) {
  return user.name.toUpperCase();
}
// À runtime, user peut être n’importe quoi si la frontière est poreuse
```

Compile-time : le compilateur refuse les appels mal typés **dans ton code**.  
Runtime : les données externes contournent ce filet.

## Exemple

```ts
greet(JSON.parse(input)); // compile si any/unknown mal géré — crash possible
```

## Comment ça fonctionne

Les annotations de types sont effacées. Il faut du code JS (guards, schemas) pour vérifier à l’exécution.

## Erreurs fréquentes

- Croire que le typage suffit pour les API
- Désactiver strict pour « faire passer » des données douteuses

## À retenir

- TS = compile-time
- Validation = runtime
- Complémentaires

## Exercices

1. Pourquoi user.name peut-il crasher malgré le type User ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Si user vient d’une source non validée, le runtime n’a plus le type et name peut être absent.
   :::

## Questions d'entretien

1. Compile-time typing vs runtime validation ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Le typage empêche les incohérences dans le code source que le compilateur voit. La validation runtime vérifie les données réelles aux frontières (réseau, env, I/O) où TypeScript n’a aucun pouvoir.
   :::
