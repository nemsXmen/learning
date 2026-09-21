---
id: typescript-31-react-plus-typescript
title: React + TypeScript
slug: react-plus-typescript
technology: typescript
level: intermediate
module: 31-typescript-and-react
order: 1
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: []
skills: [react]
tags: [typescript, react]
---

## Objectifs

- Mettre en place React avec TypeScript
- Connaître les packages de types
- Voir le fichier `.tsx`

## Introduction

React + TypeScript est le stack UI le plus répandu pour les apps typées.

## Concept

```bash
npm create vite@latest my-app -- --template react-ts
# ou
npx create-next-app@latest --typescript
```

Packages clés : `react`, `react-dom`, `@types/react`, `@types/react-dom` (souvent inclus).

## Exemple

Fichiers composants en `.tsx` (JSX + TypeScript).

## Comment ça fonctionne

Le JSX est typé via les types React. `tsconfig` active `"jsx": "react-jsx"` (ou équivalent).

## Erreurs fréquentes

- Oublier @types/react
- jsx mal configuré

## À retenir

- Template React-TS
- .tsx
- jsx dans tsconfig

## Exercices

1. Quelle extension de fichier pour un composant React typé ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   `.tsx`
   :::

## Questions d'entretien

1. Pourquoi utiliser TypeScript avec React ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Pour typer props, state, events et hooks, détecter les erreurs à la compile, améliorer l’autocomplétion et documenter les contrats des composants.
   :::
