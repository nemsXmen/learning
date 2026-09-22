---
id: typescript-27-promise-allsettled
title: Promise.allSettled
slug: promise-allsettled
technology: typescript
level: intermediate
module: 27-typescript-and-async
order: 5
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-27-promise-all]
skills: [async]
tags: [typescript, promise]
---

## Objectifs

- Utiliser `Promise.allSettled`
- Typer fulfilled / rejected
- Collecter tous les résultats

## Introduction

`allSettled` attend **toutes** les promesses, qu’elles réussissent ou échouent.

## Concept

```ts
const results = await Promise.allSettled([p1, p2]);
// PromiseSettledResult<T>[]

for (const r of results) {
  if (r.status === "fulfilled") {
    console.log(r.value);
  } else {
    console.error(r.reason);
  }
}
```

## Exemple

Utile pour des batchs où un échec ne doit pas masquer les autres succès.

## Comment ça fonctionne

Chaque entrée devient `{ status: "fulfilled", value } | { status: "rejected", reason }`.

## Erreurs fréquentes

- Traiter results comme T[] directement
- Oublier le narrowing sur status

## À retenir

- Pas de fail-fast
- PromiseSettledResult
- Narrow sur status

## Exercices

1. Narrow un PromiseSettledResult<number> pour lire value.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   if (r.status === "fulfilled") {
     const n: number = r.value;
   }
   ```
   :::

## Questions d'entretien

1. Quand préférer allSettled à all ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Quand on veut le résultat de chaque promesse même en cas d’échecs partiels — rapports, batchs, agrégations — plutôt qu’un fail-fast global.
   :::
