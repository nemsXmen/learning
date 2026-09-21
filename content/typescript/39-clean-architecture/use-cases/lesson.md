---
id: typescript-39-use-cases
title: Use cases
slug: use-cases
technology: typescript
level: intermediate
module: 39-clean-architecture
order: 7
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-39-entities]
skills: [architecture]
tags: [typescript, architecture]
---

## Objectifs

- Formaliser un use case typé
- Input / Output
- Erreurs métier

## Introduction

Un **use case** = une intention applicative (CreateUser, PlaceOrder…).

## Concept

```ts
type PlaceOrderInput = {
  userId: string;
  productIds: string[];
};

type PlaceOrderOutput = {
  orderId: string;
};

interface PlaceOrder {
  execute(input: PlaceOrderInput): Promise<PlaceOrderOutput>;
}
```

## Exemple

Un use case = une classe ou fonction, dépendances en ports, tests unitaires faciles.

## Comment ça fonctionne

Input validé (schema) → domain + ports → output DTO applicatif.

## Erreurs fréquentes

- Use case God (trop de responsabilités)
- Retourner des types infra

## À retenir

- Nom d’intention
- Input/Output typés
- Erreurs métier

## Exercices

1. Esquisse CancelOrderInput avec orderId: string.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type CancelOrderInput = { orderId: string };
   ```
   :::

## Questions d'entretien

1. Comment structures-tu un use case en TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Avec un type d’input, un type d’output, une interface ou classe `execute`, des ports injectés, et des erreurs métier typées — sans dépendance au framework HTTP.
   :::
