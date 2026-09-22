---
id: typescript-25-exact-optional-property-types
title: exactOptionalPropertyTypes
slug: exact-optional-property-types
technology: typescript
level: intermediate
module: 25-tsconfig
order: 9
estimatedMinutes: 12
difficulty: 3
xp: 45
prerequisites: [typescript-25-no-unchecked-indexed-access]
skills: [tsconfig]
tags: [typescript, tsconfig]
---

## Objectifs

- Comprendre `exactOptionalPropertyTypes`
- Distinguer propriété absente vs `undefined`
- L’activer avec prudence

## Introduction

Par défaut, `prop?: T` accepte `undefined`. Avec `exactOptionalPropertyTypes`, une propriété optionnelle n’accepte `undefined` **que** si le type l’inclut explicitement.

## Concept

```ts
type Opts = { color?: string };

// Sans exactOptionalPropertyTypes : OK
const a: Opts = { color: undefined };

// Avec exactOptionalPropertyTypes : erreur
// Il faut omettre la clé, ou typer color?: string | undefined
```

## Exemple

Utile pour coller à des APIs qui différencient « clé absente » et « undefined ».

## Comment ça fonctionne

Renforce la précision des optionnels au prix de plus d’annotations (`T | undefined`) quand undefined est voulu.

## Erreurs fréquentes

- L’activer sans migrer les assignations `prop: undefined`

## À retenir

- Optionnel ≠ undefined automatique (sous ce flag)
- Présence vs absence de clé
- Flag avancé, migration attentive

## Exercices

1. Sous exactOptionalPropertyTypes, comment autoriser undefined sur color ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type Opts = { color?: string | undefined };
   ```
   :::

## Questions d'entretien

1. Que change `exactOptionalPropertyTypes` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Il empêche d’assigner explicitement `undefined` à une propriété optionnelle `prop?: T` sauf si le type inclut `undefined`. Cela distingue absence de clé et valeur undefined.
   :::
