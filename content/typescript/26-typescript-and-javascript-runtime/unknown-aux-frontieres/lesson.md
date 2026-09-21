---
id: typescript-26-unknown-aux-frontieres
title: unknown aux frontières
slug: unknown-aux-frontieres
technology: typescript
level: intermediate
module: 26-typescript-and-javascript-runtime
order: 5
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-26-assertions-et-securite]
skills: [runtime]
tags: [typescript, unknown]
---

## Objectifs

- Typer les entrées externes en `unknown`
- Forcer le narrowing avant usage
- Comparer à `any`

## Introduction

`unknown` est le type sûr pour les **frontières** : tu dois prouver le type avant d’utiliser la valeur.

## Concept

```ts
async function load(): Promise<unknown> {
  const res = await fetch("/api/user");
  return res.json();
}

const data = await load();
// data.toUpperCase(); // ❌
if (typeof data === "object" && data && "name" in data) {
  // narrowing progressif...
}
```

## Exemple

`any` désactive le contrôle. `unknown` l’impose.

## Comment ça fonctionne

Aucune opération n’est autorisée sur `unknown` sans narrowing ou assertion volontaire.

## Erreurs fréquentes

- Reprendre `any` « pour aller plus vite »
- Assertir immédiatement en T sans valider

## À retenir

- Frontière = unknown
- Puis validate / narrow
- any = opt-out du type system

## Exercices

1. Type le retour de res.json() comme Promise<unknown> puis narrow en string.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   const data: unknown = await res.json();
   if (typeof data === "string") console.log(data.toUpperCase());
   ```
   :::

## Questions d'entretien

1. Pourquoi préférer `unknown` à `any` aux frontières ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Parce que `unknown` force un narrowing ou une validation avant usage, alors que `any` désactive les checks et propage le danger dans tout le code.
   :::
