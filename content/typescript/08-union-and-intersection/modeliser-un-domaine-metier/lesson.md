---
id: typescript-08-modeliser-un-domaine-metier
title: Modéliser un domaine métier
slug: modeliser-un-domaine-metier
technology: typescript
level: intermediate
module: 08-union-and-intersection
order: 9
estimatedMinutes: 20
difficulty: 3
xp: 60
prerequisites: [typescript-08-narrowing-avec-les-unions]
skills: [unions-intersections]
tags: [typescript, unions, domain]
---

## Objectifs

- Appliquer unions et intersections pour modéliser un domaine
- Choisir discriminated unions pour les états
- Construire un petit modèle cohérent

## Introduction

Unions et intersections sont des outils de modélisation. On les utilise pour exprimer clairement les règles du domaine.

## Concept

## Exemple

Exemple : un système de commandes.

```ts
type Money = { amount: number; currency: "EUR" | "USD" };

type OrderStatus =
  | { status: "draft" }
  | { status: "placed"; placedAt: Date }
  | { status: "shipped"; trackingNumber: string }
  | { status: "delivered"; deliveredAt: Date }
  | { status: "cancelled"; reason: string };

type Order = {
  id: string;
  total: Money;
} & OrderStatus;
```

Chaque statut n’expose que les données pertinentes.

## Exemple d’usage

```ts
function describe(order: Order): string {
  switch (order.status) {
    case "draft":
      return "Brouillon";
    case "placed":
      return `Passée le ${order.placedAt.toISOString()}`;
    case "shipped":
      return `Expédiée – ${order.trackingNumber}`;
    case "delivered":
      return `Livrée le ${order.deliveredAt.toISOString()}`;
    case "cancelled":
      return `Annulée : ${order.reason}`;
  }
}
```

## Comment ça fonctionne

On combine :
- Literal unions pour les valeurs fermées
- Discriminated unions pour les états
- Intersections pour ajouter des champs communs

## Erreurs fréquentes

- Tout mettre dans un seul objet avec beaucoup de champs optionnels
- Oublier l’exhaustivité

## À retenir

- Préfère les discriminated unions aux « gros objets » optionnels
- Le type devient une documentation vivante du domaine
- Exhaustivité + narrowing = code robuste

## Exercices

1. Modélise un `Payment` qui peut être "card" (last4) ou "paypal" (email).

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   type Payment =
     | { method: "card"; last4: string }
     | { method: "paypal"; email: string };
   ```
   :::

## Questions d'entretien


1. Comment utilises-tu les unions pour modéliser un domaine métier ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   En privilégiant les discriminated unions pour les états et variantes, les literal unions pour les ensembles fermés de valeurs, et les intersections pour les champs communs. Cela rend les transitions et les données associées explicites et vérifiées par le compilateur.
   :::

