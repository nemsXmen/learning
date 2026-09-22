---
id: typescript-28-typages-dom
title: Typages DOM
slug: typages-dom
technology: typescript
level: intermediate
module: 28-typescript-and-dom
order: 1
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: []
skills: [dom]
tags: [typescript, dom]
---

## Objectifs

- Comprendre les types DOM fournis par TypeScript
- Activer la lib DOM
- Voir la hiérarchie d’interfaces

## Introduction

TypeScript inclut des déclarations riches pour le **DOM** via `lib: ["DOM"]`.

## Concept

```ts
const el: HTMLElement | null = document.getElementById("app");
const div: HTMLDivElement = document.createElement("div");
```

Hiérarchie (simplifiée) : `EventTarget` → `Node` → `Element` → `HTMLElement` → `HTMLDivElement`…

## Exemple

Sans lib DOM, `document` n’est pas connu du type-checker.

## Comment ça fonctionne

Les interfaces sont dans `lib.dom.d.ts`. Elles décrivent l’API navigateur au niveau des types uniquement.

## Erreurs fréquentes

- Oublier `DOM` dans `lib` (projet Node-only par erreur)
- Traiter tout en `HTMLElement` trop générique

## À retenir

- lib DOM = types navigateur
- Hiérarchie d’éléments
- null possible sur beaucoup de queries

## Exercices

1. Configure lib pour inclure DOM.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```json
   { "compilerOptions": { "lib": ["ES2020", "DOM"] } }
   ```
   :::

## Questions d'entretien

1. D’où viennent les types `HTMLElement`, `document`, etc. ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Des fichiers de déclaration standard de TypeScript (`lib.dom.d.ts`), activés via l’option `lib` du tsconfig.
   :::
