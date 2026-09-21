---
id: typescript-23-introduction-aux-d-ts
title: Introduction aux .d.ts
slug: introduction-aux-d-ts
technology: typescript
level: intermediate
module: 23-declaration-files
order: 1
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: []
skills: [declaration-files]
tags: [typescript, d.ts]
---

## Objectifs

- Comprendre le rôle des fichiers `.d.ts`
- Distinguer implémentation et déclaration
- Voir où ils interviennent

## Introduction

Les fichiers **`.d.ts`** (declaration files) décrivent des types **sans** fournir d’implémentation JavaScript.

## Concept

```ts
// math.d.ts
export function add(a: number, b: number): number;

// math.js (implémentation séparée)
export function add(a, b) {
  return a + b;
}
```

TypeScript utilise le `.d.ts` pour typer les imports ; le runtime charge le `.js`.

## Exemple

Les packages npm publient souvent un `.d.ts` (ou un champ `types` dans package.json) pour le support TypeScript.

## Comment ça fonctionne

Le compilateur lit les déclarations pour le type-checking. Aucun code n’est émis depuis un `.d.ts` pur.

## Erreurs fréquentes

- Mettre de l’implémentation dans un `.d.ts`
- Oublier de publier les types avec une lib JS

## À retenir

- `.d.ts` = types seulement
- Pont entre JS et TypeScript
- Essentiel pour les libs et le global scope

## Exercices

1. Explique en une phrase le rôle d’un fichier .d.ts.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Décrire les types d’une API JavaScript existante sans fournir d’implémentation.
   :::

## Questions d'entretien

1. À quoi servent les fichiers `.d.ts` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   À déclarer des types pour du code JavaScript (ou des APIs globales) afin que TypeScript puisse type-checker les usages, sans émettre d’implémentation.
   :::
