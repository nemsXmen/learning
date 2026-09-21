---
id: typescript-26-json
title: JSON
slug: json
technology: typescript
level: intermediate
module: 26-typescript-and-javascript-runtime
order: 7
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-26-donnees-externes]
skills: [runtime]
tags: [typescript, json]
---

## Objectifs

- Typer le flux JSON.parse / stringify
- Éviter as T direct
- Valider après parse

## Introduction

`JSON.parse` retourne `any` (historiquement) — en pratique, on le traite comme non fiable.

## Concept

```ts
const raw = '{"id":"1","name":"Alice"}';
const data: unknown = JSON.parse(raw);
const user = UserSchema.parse(data);
```

```ts
JSON.stringify(user); // sortie string, pas de types runtime
```

## Exemple

Dates : JSON ne préserve pas le type Date → strings ISO à reparser.

## Comment ça fonctionne

Parse produit une structure JS (objets, arrays, primitives). Aucune info de type TS ne voyage dans le JSON.

## Erreurs fréquentes

- `JSON.parse(x) as User`
- Oublier le reviver pour les dates

## À retenir

- parse → unknown
- validate
- stringify perd les classes / Dates

## Exercices

1. Parse un JSON en unknown puis valide avec un type guard simple `{ id: string }`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   const data: unknown = JSON.parse(raw);
   if (typeof data === "object" && data && typeof (data as any).id === "string") {
     // ok
   }
   ```
   :::

## Questions d'entretien

1. Pourquoi `JSON.parse(...) as T` est-il risqué ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Parce que parse ne vérifie pas la forme : le cast ment au compilateur. Une validation runtime est nécessaire pour garantir T.
   :::
