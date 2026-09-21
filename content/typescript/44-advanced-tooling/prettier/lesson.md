---
id: typescript-44-prettier
title: Prettier
slug: prettier
technology: typescript
level: intermediate
module: 44-advanced-tooling
order: 2
estimatedMinutes: 8
difficulty: 1
xp: 30
prerequisites: [typescript-44-eslint-plus-typescript]
skills: [tooling]
tags: [typescript, tooling]
---

## Objectifs

- Formater TS/TSX avec Prettier
- Intégrer ESLint
- CI format check

## Introduction

**Prettier** impose un format cohérent sans débat.

## Concept

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all"
}
```

```bash
npx prettier --write "src/**/*.{ts,tsx}"
npx prettier --check "src/**/*.{ts,tsx}"
```

## Exemple

`eslint-config-prettier` désactive les règles ESLint conflictuelles.

## Comment ça fonctionne

Parse → reprint opinionated. Pas de règles métier, uniquement style.

## Erreurs fréquentes

- Mélanger tab/spaces configs IDE vs Prettier
- Oublier --check en CI

## À retenir

- write / check
- eslint-config-prettier
- Format en CI

## Exercices

1. Commande pour vérifier le format sans écrire ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   `prettier --check`
   :::

## Questions d'entretien

1. Rôle de Prettier vs ESLint ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Prettier = formatage. ESLint = qualité/bugs (et un peu de style). On laisse Prettier gagner sur le format via eslint-config-prettier.
   :::
