---
id: typescript-18-exclude
title: Exclude
slug: exclude
technology: typescript
level: intermediate
module: 18-utility-types
order: 7
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-18-record]
skills: [utility-types]
tags: [typescript, utility-types]
---

## Objectifs

- Utiliser `Exclude<T, U>`
- Filtrer une union
- Comprendre la distributivité

## Introduction

`Exclude<T, U>` retire de l’union `T` tous les types assignables à `U`.

## Concept

```ts
type T = "a" | "b" | "c" | "d";
type U = Exclude<T, "a" | "c">; // "b" | "d"

type NonStrings = Exclude<string | number | boolean, string>; // number | boolean
```

## Exemple

```ts
type Event = "click" | "scroll" | "submit";
type NonClick = Exclude<Event, "click">; // "scroll" | "submit"
```

## Comment ça fonctionne

`T extends U ? never : T` distribué sur l’union T.

## Erreurs fréquentes

- Confondre avec Omit (Omit = clés d’objet, Exclude = membres d’union)

## À retenir

- `Exclude<T, U>` = T moins ce qui est assignable à U
- Filtrage d’unions
- Base d’Omit

## Exercices

1. Exclus `"admin"` d’une union de rôles `"admin" | "user" | "guest"`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type Role = "admin" | "user" | "guest";
   type NonAdmin = Exclude<Role, "admin">;
   ```
   :::

## Questions d'entretien

1. Quelle différence entre Exclude et Omit ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Exclude opère sur des unions de types (retire des membres). Omit opère sur des types objets (retire des propriétés par nom de clé).
   :::
