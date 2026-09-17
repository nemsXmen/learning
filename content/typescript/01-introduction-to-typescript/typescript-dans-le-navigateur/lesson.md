---
id: typescript-01-typescript-dans-le-navigateur
title: TypeScript dans le navigateur
slug: typescript-dans-le-navigateur
technology: typescript
level: beginner
module: 01-introduction-to-typescript
order: 10
estimatedMinutes: 15
difficulty: 1
xp: 40
prerequisites: [typescript-01-le-compilateur-tsc]
skills: [typescript-basics]
tags: [typescript, navigateur, frontend]
---

## Objectifs

- Comprendre comment TypeScript arrive dans le navigateur
- Connaître le rôle des bundlers / outils de build
- Savoir que le navigateur n’exécute jamais de TypeScript natif

## Introduction

Le navigateur ne comprend que le JavaScript (et le WebAssembly). TypeScript doit donc être transformé avant d’être servi.

## Concept

Deux approches principales :

1. **Compilation classique**  
   `tsc` génère des `.js` → tu les inclus avec des balises `<script>` ou un système de modules.

2. **Outils de développement modernes** (recommandé)  
   Vite, webpack, Parcel, esbuild, Turbopack…  
   Ils transpiler TypeScript à la volée en développement et produisent un bundle optimisé en production.

Avec Vite par exemple :

```bash
npm create vite@latest mon-app -- --template vanilla-ts
```

Tu écris du `.ts`, Vite s’occupe de tout.

## Exemple

En développement avec Vite, tu importes simplement :

```ts
// main.ts
const message: string = "Hello from TypeScript";
document.body.textContent = message;
```

Aucune étape manuelle de compilation n’est visible.

## Comment ça fonctionne

Les outils de build utilisent soit le compilateur TypeScript, soit des transpileurs ultra-rapides (esbuild, SWC) qui comprennent la syntaxe TypeScript mais ne font pas toujours le type-checking. Le type-checking est alors confié à `tsc --noEmit` ou au language service de l’éditeur.

## Erreurs fréquentes

- Essayer d’inclure un fichier `.ts` directement dans une balise `<script src="...">`  
  Le navigateur ne sait pas le lire.

- Croire que TypeScript s’exécute nativement dans le navigateur  
  Ce n’est pas le cas (contrairement à ce que certains runtimes expérimentaux proposent).

## À retenir

- Le navigateur = JavaScript uniquement
- En 2024+ on utilise presque toujours un outil de build (Vite, etc.)
- Le type-checking reste souvent fait par `tsc` ou l’éditeur

## Exercices

1. Pourquoi ne peut-on pas faire `<script src="app.ts">` dans une page HTML classique ?

   :::solution
   Parce que le navigateur ne parse que le JavaScript. L’extension `.ts` et les annotations de types ne sont pas supportées nativement.
   :::

## Questions d'entretien

1. Comment fait-on pour utiliser TypeScript dans une application frontend destinée au navigateur ?

   :::reponse
   On utilise un outil de build (Vite, webpack, etc.) qui transpile le TypeScript en JavaScript pendant le développement et produit un bundle optimisé pour la production. Le type-checking est assuré par le compilateur TypeScript ou le language service de l’éditeur.
   :::
