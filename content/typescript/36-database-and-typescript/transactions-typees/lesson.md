---
id: typescript-36-transactions-typees
title: Transactions typées
slug: transactions-typees
technology: typescript
level: intermediate
module: 36-database-and-typescript
order: 7
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-36-champs-nullable]
skills: [database]
tags: [typescript, database]
---

## Objectifs

- Typer les callbacks de transaction
- Garantir atomicité
- Propager le client tx

## Introduction

Les **transactions** regroupent plusieurs écritures atomiques.

## Concept

```ts
await db.transaction(async (tx) => {
  await tx.order.create({ data: order });
  await tx.stock.decrement({ where: { id }, data: { qty: 1 } });
});
```

Type de `tx` : même API que le client, scopée à la transaction (Prisma, Knex, etc.).

## Exemple

```ts
type Tx = Prisma.TransactionClient;

async function transfer(tx: Tx, from: string, to: string, amount: number) {
  // opérations typées sur tx
}
```

## Comment ça fonctionne

Le générique/callback reçoit un client transactionnel typé. En cas d’exception : rollback.

## Erreurs fréquentes

- Utiliser le client global au lieu de tx
- Transactions trop longues

## À retenir

- Callback typé
- Passer tx partout
- Rollback sur throw

## Exercices

1. Pourquoi passer `tx` aux repos dans une transaction ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Pour que toutes les opérations participent à la même transaction atomique.
   :::

## Questions d'entretien

1. Comment types-tu une transaction Prisma/Knex ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Via le callback fourni par l’API transaction, dont le paramètre est un client typé (`TransactionClient`). On propage ce client aux opérations pour rester dans la même tx.
   :::
