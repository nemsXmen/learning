---
id: typescript-16-entity-et-value-object
title: Entity et Value Object
slug: entity-et-value-object
technology: typescript
level: intermediate
module: 16-oop-and-typescript
order: 12
estimatedMinutes: 15
difficulty: 3
xp: 55
prerequisites: [typescript-16-domain-models]
skills: [oop]
tags: [typescript, oop, ddd]
---

## Objectifs

- Distinguer Entity et Value Object
- Les modéliser en TypeScript
- Appliquer égalité et immutabilité

## Introduction

En Domain-Driven Design, on sépare les **entités** (identité) des **value objects** (valeur).

## Concept

### Entity

Identifiée par un id, peut changer d’état tout en restant « la même ».

```ts
class User {
  constructor(
    public readonly id: string,
    public name: string
  ) {}
}
```

### Value Object

Défini par ses attributs, souvent immuable, égalité structurelle.

```ts
class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: "EUR" | "USD"
  ) {}

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) throw new Error("Currency mismatch");
    return new Money(this.amount + other.amount, this.currency);
  }
}
```

## Exemple

`OrderId`, `Email`, `Address` sont souvent des value objects. `Order`, `Customer` sont des entités.

## Comment ça fonctionne

Les value objects réduisent les primitives obsessionnelles et centralisent les règles (format email, montants…). Les entités portent le cycle de vie et l’identité.

## Erreurs fréquentes

- Tout passer en string/number (primitive obsession)
- Value objects mutables sans contrôle

## À retenir

- Entity = identité + cycle de vie
- Value Object = valeur + immutabilité souvent
- Enrichit le modèle de domaine TypeScript

## Exercices

1. Crée un value object `Email` qui valide un format simple au constructeur.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   class Email {
     constructor(public readonly value: string) {
       if (!value.includes("@")) throw new Error("Invalid email");
     }
   }
   ```
   :::

## Questions d'entretien

1. Quelle est la différence entre une Entity et un Value Object ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Une Entity est définie par son identité (id) et peut évoluer d’état. Un Value Object est défini par ses attributs, souvent immuable, et deux instances aux mêmes valeurs sont considérées égales.
   :::
