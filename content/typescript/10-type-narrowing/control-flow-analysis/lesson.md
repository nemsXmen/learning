---
id: typescript-10-control-flow-analysis
title: Control-flow analysis
slug: control-flow-analysis
technology: typescript
level: intermediate
module: 10-type-narrowing
order: 6
estimatedMinutes: 15
difficulty: 2
xp: 50
prerequisites: [typescript-10-truthiness-narrowing]
skills: [type-narrowing]
tags: [typescript, narrowing, control-flow]
---

## Objectifs

- Comprendre l’analyse de flux de contrôle de TypeScript
- Voir comment les branches, returns et throws affectent les types
- Écrire du code que le type-checker comprend bien

## Introduction

TypeScript analyse le **flux de contrôle** (if, switch, return, throw, etc.) pour affiner les types au fil du code.

## Concept

```ts
function example(x: string | null) {
  if (x === null) {
    return;
  }
  // ici x est string
  console.log(x.toUpperCase());
}
```

```ts
function example2(x: string | number) {
  if (typeof x === "string") {
    return x.toUpperCase();
  }
  // ici x est number
  return x.toFixed(2);
}
```

## Exemple

Les assignments successifs sont aussi suivis :

```ts
let value: string | number = "hello";
value = 42;
// value est number ici
```

## Comment ça fonctionne

Le compilateur construit un graphe de flux et propage les types affinisés dans chaque branche. Les early returns et throws éliminent des possibilités pour la suite.

## Erreurs fréquentes

- Écrire des tests que TypeScript ne peut pas analyser (trop complexes)
- Muter des objets de façon opaque (perte de narrowing)

## À retenir

- TypeScript suit le flux (if, switch, return, throw…)
- Early return = excellent outil de narrowing
- Garde les conditions simples et locales

## Exercices

1. Utilise un early return pour narrow `string | null`.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   function f(x: string | null) {
     if (x === null) return;
     console.log(x.length); // string
   }
   ```
   :::

## Questions d'entretien


1. Qu’est-ce que le control-flow analysis en TypeScript ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   C’est la capacité du compilateur à suivre les branches du code (conditions, returns, throws…) pour restreindre les types au fur et à mesure de l’exécution possible.
   :::

