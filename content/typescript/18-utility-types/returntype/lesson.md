---
id: typescript-18-returntype
title: ReturnType
slug: returntype
technology: typescript
level: intermediate
module: 18-utility-types
order: 10
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-18-nonnullable]
skills: [utility-types]
tags: [typescript, utility-types]
---

## Objectifs

- Utiliser `ReturnType<T>`
- Extraire le type de retour d’une fonction
- Éviter la duplication

## Introduction

`ReturnType<T>` extrait le type de retour d’un type fonction.

## Concept

```ts
function createUser() {
  return { id: 1, name: "Alice" };
}
type User = ReturnType<typeof createUser>;
// { id: number; name: string }
```

## Exemple

```ts
type Handler = (event: Event) => void;
type HandlerReturn = ReturnType<Handler>; // void
```

## Comment ça fonctionne

S’appuie sur un conditional type + `infer`. `T` doit être un type fonction.

## Erreurs fréquentes

- Passer une valeur au lieu d’un type (utiliser `typeof fn`)

## À retenir

- `ReturnType<typeof fn>`
- Source de vérité = la fonction
- Très utilisé avec les factories

## Exercices

1. Extrais le type de retour de `() => string[]`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type R = ReturnType<() => string[]>; // string[]
   ```
   :::

## Questions d'entretien

1. Pourquoi utiliser ReturnType plutôt que de redéclarer le type de retour ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Pour garder une seule source de vérité : si la fonction évolue, le type dérivé reste synchronisé automatiquement.
   :::
