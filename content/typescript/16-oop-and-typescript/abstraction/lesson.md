---
id: typescript-16-abstraction
title: Abstraction
slug: abstraction
technology: typescript
level: intermediate
module: 16-oop-and-typescript
order: 4
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-16-polymorphisme]
skills: [oop]
tags: [typescript, oop, abstraction]
---

## Objectifs

- Comprendre l’abstraction en POO
- L’exprimer avec interfaces et classes abstraites
- Séparer le « quoi » du « comment »

## Introduction

L’**abstraction** consiste à exposer l’essentiel et à masquer la complexité.

## Concept

```ts
interface PaymentProcessor {
  charge(amount: number): Promise<void>;
}

class StripeProcessor implements PaymentProcessor {
  async charge(amount: number) {
    // détails Stripe...
  }
}

class OrderService {
  constructor(private payments: PaymentProcessor) {}
  async checkout(total: number) {
    await this.payments.charge(total);
  }
}
```

`OrderService` dépend de l’abstraction, pas de Stripe.

## Exemple

Classes abstraites et interfaces sont les deux leviers principaux en TypeScript.

## Comment ça fonctionne

On définit des contrats stables et on laisse les implémentations varier. Cela réduit le couplage.

## Erreurs fréquentes

- Abstraire trop tôt (pas assez d’usages concrets)
- Fuites de détails d’implémentation dans le contrat

## À retenir

- Exposer le quoi, cacher le comment
- Interfaces / abstract classes
- Abstraction guidée par les usages réels

## Exercices

1. Définis une interface `Logger` avec `info(msg: string)` et une classe qui l’implémente.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   interface Logger { info(msg: string): void; }
   class ConsoleLogger implements Logger {
     info(msg: string) { console.log(msg); }
   }
   ```
   :::

## Questions d'entretien

1. Qu’est-ce que l’abstraction en conception orientée objet ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   C’est le fait de définir des contrats qui exposent le comportement essentiel tout en masquant les détails d’implémentation. En TypeScript, on s’appuie surtout sur les interfaces et les classes abstraites.
   :::
