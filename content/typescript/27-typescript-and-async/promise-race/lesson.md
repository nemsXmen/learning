---
id: typescript-27-promise-race
title: Promise.race
slug: promise-race
technology: typescript
level: intermediate
module: 27-typescript-and-async
order: 6
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-27-promise-allsettled]
skills: [async]
tags: [typescript, promise]
---

## Objectifs

- Utiliser `Promise.race`
- Comprendre le premier settlement
- Typer le résultat

## Introduction

`Promise.race` se règle sur la **première** promesse qui se termine (succès ou rejet).

## Concept

```ts
const result = await Promise.race([
  fetchData(),
  timeout(5000)
]);
```

## Exemple – timeout

```ts
function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error("timeout")), ms)
  );
}
```



## Exemple

Consulte les exemples de code de cette leçon pour appliquer la notion.

## Comment ça fonctionne

Le type de retour est une union des types de succès des candidates (approximativement). Le premier settlement gagne.

## Erreurs fréquentes

- Oublier que le rejet compte aussi comme « premier »
- Ne pas annuler les percuts (AbortController)

## À retenir

- Premier terminé gagne
- Timeouts classiques
- Penser à l’annulation

## Exercices

1. Course entre getUser() et un timeout 3s.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   await Promise.race([getUser(), timeout(3000)]);
   ```
   :::

## Questions d'entretien

1. Promise.race prend-il seulement le premier succès ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Non : le premier settlement, qu’il soit fulfilled ou rejected. Un rejet rapide gagne aussi la course.
   :::
