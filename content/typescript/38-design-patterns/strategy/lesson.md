---
id: typescript-38-strategy
title: Strategy
slug: strategy
technology: typescript
level: intermediate
module: 38-design-patterns
order: 4
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-38-adapter]
skills: [patterns]
tags: [typescript, patterns]
---

## Objectifs

- Interchanger des algorithmes via une interface
- Typer les stratégies
- Éviter les switchs géants

## Introduction

**Strategy** encapsule des comportements interchangeables derrière une même interface.

## Concept

```ts
interface PricingStrategy {
  price(amount: number): number;
}

class RegularPricing implements PricingStrategy {
  price(amount: number) {
    return amount;
  }
}

class DiscountPricing implements PricingStrategy {
  constructor(private percent: number) {}
  price(amount: number) {
    return amount * (1 - this.percent / 100);
  }
}

function checkout(amount: number, strategy: PricingStrategy) {
  return strategy.price(amount);
}
```

## Exemple

Stratégies d’auth, de tri, de serialization.

## Comment ça fonctionne

Le client reçoit une `PricingStrategy`. Ajouter une stratégie = nouvelle classe, pas modifier un switch central.

## Erreurs fréquentes

- Stratégies avec état partagé non documenté
- Interface trop large

## À retenir

- Interface comportement
- Injection de stratégie
- Ouvert/fermé

## Exercices

1. Stratégie TaxStrategy avec method apply(amount: number): number.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   interface TaxStrategy {
     apply(amount: number): number;
   }
   ```
   :::

## Questions d'entretien

1. Strategy vs switch sur un enum ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Strategy déplace chaque variante dans sa propre unité typée, facilite tests et extension (OCP). Un switch central grossit et viole souvent l’ouvert/fermé.
   :::
