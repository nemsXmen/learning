---
id: typescript-14-abstractions-reutilisables
title: Abstractions réutilisables
slug: abstractions-reutilisables
technology: typescript
level: intermediate
module: 14-generics-advanced
order: 9
estimatedMinutes: 15
difficulty: 3
xp: 55
prerequisites: [typescript-14-pagination-generique]
skills: [generics]
tags: [typescript, generics]
---

## Objectifs

- Concevoir des abstractions génériques réutilisables
- Éviter la sur-abstraction
- Trouver le bon niveau de généricité

## Introduction

Les generics permettent de factoriser, mais trop d’abstraction nuit à la lisibilité.

## Concept

Bon niveau :

```ts
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };
```

Trop abstrait trop tôt :

```ts
type Container<T, M, E, C> = { /* 15 paramètres */ };
```

## Exemple

```ts
// Réutilisable et lisible
function pipe<A, B, C>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C
): C {
  return bc(ab(a));
}
```

## Comment ça fonctionne

On abstrait quand on a **plusieurs usages concrets** qui partagent une structure. On nomme clairement les paramètres de type.

## Erreurs fréquentes

- Généricité spéculative (avant d’avoir 2–3 usages)
- Trop de paramètres de type
- Noms obscurs (`T1`, `T2`, `T3`…)

## À retenir

- Abstraire après duplication réelle
- Peu de paramètres, noms clairs
- Lisibilité > astuce type-level

## Exercices

1. Propose une abstraction simple pour un couple succès/erreur (Result).

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type Result<T, E = string> =
     | { ok: true; value: T }
     | { ok: false; error: E };
   ```
   :::

## Questions d'entretien

1. Comment décides-tu du niveau de généricité d’une abstraction ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En partant d’usages concrets : j’abstrais quand la duplication est réelle (au moins 2–3 cas). Je limite le nombre de paramètres de type, je les nomme clairement, et je privilégie la lisibilité à la prouesse type-level.
   :::
