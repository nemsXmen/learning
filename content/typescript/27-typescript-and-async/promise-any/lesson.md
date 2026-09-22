---
id: typescript-27-promise-any
title: Promise.any
slug: promise-any
technology: typescript
level: intermediate
module: 27-typescript-and-async
order: 7
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-27-promise-race]
skills: [async]
tags: [typescript, promise]
---

## Objectifs

- Utiliser `Promise.any`
- Comprendre le premier succès
- Gérer AggregateError

## Introduction

`Promise.any` résout avec le **premier succès**. Elle ne rejette que si **toutes** échouent.

## Concept

```ts
try {
  const value = await Promise.any([p1, p2, p3]);
} catch (e) {
  // AggregateError si toutes rejettent
}
```

## Exemple

Plusieurs miroirs / endpoints : le premier qui répond gagne.

## Comment ça fonctionne

Contrairement à race, les rejets individuels n’interrompent pas tant qu’un succès est encore possible.

## Erreurs fréquentes

- Confondre avec race
- Oublier AggregateError

## À retenir

- Premier succès
- Rejet seulement si tout échoue
- AggregateError

## Exercices

1. Différence one-liner race vs any.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   race = premier settlement ; any = premier succès (rejette si tous échouent).
   :::

## Questions d'entretien

1. Promise.any vs Promise.race ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   race : premier settlement (succès ou rejet). any : premier succès ; ne rejette que si toutes les promesses échouent (AggregateError).
   :::
