---
id: typescript-38-state
title: State
slug: state
technology: typescript
level: intermediate
module: 38-design-patterns
order: 9
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-38-command]
skills: [patterns]
tags: [typescript, patterns]
---

## Objectifs

- Modéliser des états métier
- Transitions typées
- Machines à états simples

## Introduction

Le pattern **State** fait varier le comportement selon un état interne.

## Concept

```ts
type OrderStatus = "draft" | "placed" | "shipped" | "cancelled";

type Order = {
  status: OrderStatus;
};

function canCancel(order: Order): boolean {
  return order.status === "draft" || order.status === "placed";
}

function place(order: Order): Order {
  if (order.status !== "draft") throw new Error("invalid transition");
  return { ...order, status: "placed" };
}
```

## Exemple

Unions discriminées + fonctions de transition. Libs : XState (typé).

## Comment ça fonctionne

L’union de status limite les états légaux. Les transitions valident à runtime + types.

## Erreurs fréquentes

- Status string libre
- Transitions implicites non testées

## À retenir

- Union d’états
- Transitions explicites
- Invariants

## Exercices

1. Type PaymentStatus = "pending" | "paid" | "failed".

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type PaymentStatus = "pending" | "paid" | "failed";
   ```
   :::

## Questions d'entretien

1. Comment types-tu une machine à états simple en TS ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Avec une union d’états, des fonctions de transition qui valident les départs/arrivées, éventuellement des unions discriminées pour les données associées à chaque état. XState pour les cas complexes.
   :::
