---
id: typescript-26-assertions-et-securite
title: Assertions et sécurité
slug: assertions-et-securite
technology: typescript
level: intermediate
module: 26-typescript-and-javascript-runtime
order: 4
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-26-runtime-validation]
skills: [runtime]
tags: [typescript, assertions, runtime]
---

## Objectifs

- Relier assertions et risque runtime
- Réserver as / ! aux cas justifiés
- Préférer validation + narrowing

## Introduction

Les assertions donnent une **fausse impression de sécurité** si les données sont externes.

## Concept

```ts
// Dangereux
const user = JSON.parse(raw) as User;

// Plus sûr
const parsed = JSON.parse(raw) as unknown;
if (!isUser(parsed)) throw new Error("Invalid user");
const user: User = parsed;
```

## Exemple

Après Zod.parse, le type est déjà garanti : l’assertion supplémentaire est souvent inutile.

## Comment ça fonctionne

`as` n’ajoute aucun bytecode de vérification. La sécurité runtime vient uniquement du code JS que tu écris (ou de la lib de validation).

## Erreurs fréquentes

- as User sur tout JSON
- ! sur getElementById sans garantie

## À retenir

- Assertion ≠ validation
- unknown + guard / schema
- Documenter les assertions restantes

## Exercices

1. Réécris `as User` sur un JSON en passant par unknown + type guard.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   const data: unknown = JSON.parse(raw);
   if (!isUser(data)) throw new Error("bad");
   // data is User
   ```
   :::

## Questions d'entretien

1. Pourquoi une assertion n’apporte-t-elle pas de sécurité runtime ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Parce qu’elle est purement compile-time : aucun check n’est émis en JavaScript. Seule une validation explicite protège à l’exécution.
   :::
