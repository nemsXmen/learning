---
id: typescript-28-query-selectors
title: Query selectors
slug: query-selectors
technology: typescript
level: intermediate
module: 28-typescript-and-dom
order: 9
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-28-typage-des-evenements]
skills: [dom]
tags: [typescript, dom]
---

## Objectifs

- Typer querySelector / querySelectorAll
- Utiliser les génériques de sélection
- Gérer null et NodeList

## Introduction

`querySelector` retourne `Element | null` par défaut ; on peut préciser le type.

## Concept

```ts
const input = document.querySelector<HTMLInputElement>("#email");
// HTMLInputElement | null

const items = document.querySelectorAll<HTMLLIElement>("li.item");
// NodeListOf<HTMLLIElement>
```

## Exemple

```ts
const form = document.querySelector("form");
// HTMLFormElement | null (inférence limitée selon le sélecteur littéral)
```

## Comment ça fonctionne

Le paramètre de type de `querySelector<E extends Element>` affine le retour. Ce n’est **pas** une validation runtime : un mauvais sélecteur reste un mensonge de types.

## Erreurs fréquentes

- Générique incorrect vs réalité DOM
- Oublier null

## À retenir

- querySelector<T>
- | null
- querySelectorAll → NodeListOf<T>

## Exercices

1. Sélectionne un canvas en HTMLCanvasElement | null.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   const canvas = document.querySelector<HTMLCanvasElement>("#c");
   ```
   :::

## Questions d'entretien

1. querySelector<HTMLInputElement> garantit-il un input à runtime ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Non. C’est une assertion de type compile-time. Si le sélecteur ne cible pas un input, le runtime ne correspondra pas au type.
   :::
