---
id: typescript-41-valeurs-par-defaut
title: Valeurs par défaut
slug: advanced-valeurs-par-defaut
technology: typescript
level: advanced
module: 41-advanced-generics
order: 3
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-41-plusieurs-parametres]
skills: [generics]
tags: [typescript, generics]
---

## Objectifs

- Définir des défauts de type params
- Règles d’ordre
- Cas API ergonomiques

## Introduction

Les **defaults** de génériques simplifient l’usage courant.

## Concept

```ts
type ApiResponse<T, E = { message: string }> =
  | { data: T; error?: undefined }
  | { data?: undefined; error: E };

function createStore<T = unknown>() {
  let state: T;
  // ...
}
```

## Exemple

`useState<T = undefined>()` côté mental model React.

## Comment ça fonctionne

Un param avec défaut peut être omis. Les params sans défaut ne peuvent pas suivre un param optionnel de façon invalide (règles TS).

## Erreurs fréquentes

- Défaut any paresseux
- Ordre incorrect (required after optional)

## À retenir

- T = Default
- Ergonomie API
- Éviter any

## Exercices

1. Box\<T = string\> avec value: T.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type Box<T = string> = { value: T };
   ```
   :::

## Questions d'entretien

1. Intérêt des type parameter defaults ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Réduire le bruit pour le cas courant tout en permettant de spécialiser T/E quand nécessaire, améliorant l’ergonomie de l’API générique.
   :::
