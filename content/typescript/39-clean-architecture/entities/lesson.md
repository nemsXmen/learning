---
id: typescript-39-entities
title: Entities
slug: entities
technology: typescript
level: intermediate
module: 39-clean-architecture
order: 6
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-39-presentation-layer]
skills: [architecture]
tags: [typescript, architecture]
---

## Objectifs

- Définir des entities de domaine
- Identité et invariants
- Différencier entity ORM

## Introduction

Une **entity** de domaine a une identité et des règles.

## Concept

```ts
class Order {
  private constructor(
    readonly id: OrderId,
    private lines: OrderLine[],
    private status: OrderStatus
  ) {}

  static create(lines: OrderLine[]): Order {
    if (lines.length === 0) throw new Error("empty order");
    return new Order(OrderId.generate(), lines, "draft");
  }

  place(): void {
    if (this.status !== "draft") throw new Error("invalid");
    this.status = "placed";
  }
}
```

## Exemple

Entity ≠ row TypeORM. L’entity domaine protège ses invariants.

## Comment ça fonctionne

Factories `create`, méthodes métier, identity stable.

## Erreurs fréquentes

- Setters publics sur tous les champs
- Confondre avec DTO

## À retenir

- Identité
- Invariants
- Comportement

## Exercices

1. Pourquoi Order.create refuse lines vides ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Invariant métier : une commande doit avoir au moins une ligne.
   :::

## Questions d'entretien

1. Entity domaine vs entity ORM ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   L’entity domaine porte identité et règles métier. L’entity ORM est un mapping de table. On peut les séparer et mapper, surtout si le modèle métier est riche.
   :::
