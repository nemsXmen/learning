---
id: typescript-16-encapsulation
title: Encapsulation
slug: encapsulation
technology: typescript
level: intermediate
module: 16-oop-and-typescript
order: 1
estimatedMinutes: 15
difficulty: 2
xp: 45
prerequisites: [typescript-15-private]
skills: [oop]
tags: [typescript, oop, encapsulation]
---

## Objectifs

- Comprendre l’encapsulation
- L’appliquer avec private / protected / getters
- Cacher les détails d’implémentation

## Introduction

L’**encapsulation** consiste à regrouper données et comportements et à contrôler l’accès aux détails internes.

## Concept

```ts
class BankAccount {
  private balance = 0;

  deposit(amount: number) {
    if (amount <= 0) throw new Error("Invalid amount");
    this.balance += amount;
  }

  withdraw(amount: number) {
    if (amount > this.balance) throw new Error("Insufficient funds");
    this.balance -= amount;
  }

  getBalance(): number {
    return this.balance;
  }
}
```

Le solde n’est modifiable que via des méthodes qui garantissent les invariants.

## Exemple

Les parameter properties `private` et les getters/setters sont les outils TypeScript de l’encapsulation.

## Comment ça fonctionne

On expose une API minimale (méthodes publiques) et on garde l’état critique en `private`. Le type-checker empêche les accès illégaux.

## Erreurs fréquentes

- Tout laisser en public
- Getters/setters triviaux sans validation (fausse encapsulation)

## À retenir

- Cacher l’état, exposer le comportement
- `private` + méthodes publiques
- Invariants protégés

## Exercices

1. Encapsule un compteur avec increment/getValue et value private.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   class Counter {
     private value = 0;
     increment() { this.value++; }
     getValue() { return this.value; }
   }
   ```
   :::

## Questions d'entretien

1. Qu’est-ce que l’encapsulation en POO et comment TypeScript l’aide-t-il ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   C’est le fait de regrouper état et comportement et de restreindre l’accès aux détails internes. TypeScript fournit `private`, `protected`, les getters/setters et le contrôle à la compilation pour appliquer cette discipline.
   :::
