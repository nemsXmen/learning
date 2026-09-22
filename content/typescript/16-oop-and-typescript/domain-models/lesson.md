---
id: typescript-16-domain-models
title: Domain models
slug: domain-models
technology: typescript
level: intermediate
module: 16-oop-and-typescript
order: 11
estimatedMinutes: 15
difficulty: 3
xp: 55
prerequisites: [typescript-16-solid]
skills: [oop]
tags: [typescript, oop, domain]
---

## Objectifs

- Comprendre ce qu’est un modèle de domaine
- L’exprimer en TypeScript (types + classes)
- Éviter les modèles anémiques

## Introduction

Le **modèle de domaine** représente les concepts et règles métier dans le code.

## Concept

```ts
class Order {
  private items: OrderItem[] = [];

  constructor(public readonly id: string) {}

  addItem(item: OrderItem) {
    if (item.quantity <= 0) throw new Error("Invalid quantity");
    this.items.push(item);
  }

  get total(): number {
    return this.items.reduce((s, i) => s + i.price * i.quantity, 0);
  }
}
```

Les règles (quantité > 0, total calculé) vivent **dans** le modèle, pas seulement dans des services externes.

## Exemple

Un modèle riche encapsule invariants et comportements. Un modèle anémique n’a que des données ; toute la logique est ailleurs.

## Comment ça fonctionne

On combine types précis (unions, littéraux), classes avec encapsulation, et parfois des value objects pour les concepts métier.

## Erreurs fréquentes

- Modèles anémiques (bags of properties)
- Logique métier éparpillée dans les contrôleurs

## À retenir

- Le domaine porte ses règles
- Types + encapsulation
- Éviter l’anémie

## Exercices

1. Ajoute une règle à une classe `Account` : on ne peut pas retirer plus que le solde.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   class Account {
     private balance = 0;
     withdraw(amount: number) {
       if (amount > this.balance) throw new Error("Insufficient funds");
       this.balance -= amount;
     }
   }
   ```
   :::

## Questions d'entretien

1. Qu’est-ce qu’un modèle de domaine anémique ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Un modèle qui ne contient que des données (propriétés) sans comportement ni règles métier. Toute la logique se retrouve ailleurs (services, contrôleurs), ce qui dilue les invariants du domaine.
   :::
