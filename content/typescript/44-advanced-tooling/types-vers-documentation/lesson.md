---
id: typescript-44-types-vers-documentation
title: Types → documentation
slug: types-vers-documentation
technology: typescript
level: intermediate
module: 44-advanced-tooling
order: 11
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-44-schemas-vers-types]
skills: [tooling]
tags: [typescript, tooling, docs]
---

## Objectifs

- Documenter depuis les types
- TSDoc / API Extractor / TypeDoc
- Garder docs alignées

## Introduction

Les **types** peuvent alimenter la documentation d’API.

## Concept

```ts
/**
 * Crée un utilisateur.
 * @param input - données d’inscription
 */
export function createUser(input: CreateUserInput): Promise<User> {}
```

Outils : **TypeDoc**, **API Extractor**, doc générée OpenAPI depuis types (selon stack).

## Exemple

CI qui régénère la doc et vérifie le diff.

## Comment ça fonctionne

Commentaires TSDoc + signatures typées → site de référence.

## Erreurs fréquentes

- Doc morte non générée
- any dans l’API publique documentée

## À retenir

- TSDoc
- Générateurs
- API publique propre

## Exercices

1. Outil courant pour doc HTML depuis TS ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   TypeDoc (entre autres).
   :::

## Questions d'entretien

1. Comment gardes-tu la documentation alignée avec le code TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En générant la doc depuis les signatures et TSDoc (TypeDoc, API Extractor…), en CI, plutôt que de maintenir un wiki manuel divergent.
   :::
