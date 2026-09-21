---
id: typescript-21-routes-types
title: Routes typées
slug: routes-types
technology: typescript
level: advanced
module: 21-template-literal-types
order: 5
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-21-event-names-types]
skills: [template-literal-types]
tags: [typescript, template-literal-types, routes]
---

## Objectifs

- Typer des chemins de routes
- Composer des segments
- Préparer le terrain pour les params

## Introduction

Les template literals modélisent des routes et leurs variantes.

## Concept

```ts
type Resource = "users" | "posts" | "comments";
type CollectionRoute = `/${Resource}`;
// "/users" | "/posts" | "/comments"

type ItemRoute = `/${Resource}/${string}`;
// "/users/${string}" | ...
```

## Exemple

```ts
type Locale = "fr" | "en";
type LocalizedRoute = `/${Locale}${CollectionRoute}`;
// "/fr/users" | "/en/users" | ...
```

## Comment ça fonctionne

Composition de littéraux et d’unions pour décrire l’espace des URLs valides.

## Erreurs fréquentes

- Routes en `string` trop larges
- Params non typés

## À retenir

- Routes = template + unions
- Base pour un routeur typé
- Combinable avec extraction de params

## Exercices

1. Type les routes `"/admin/users"` | `"/admin/settings"` à partir de `"users" | "settings"`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type AdminSection = "users" | "settings";
   type AdminRoute = `/admin/${AdminSection}`;
   ```
   :::

## Questions d'entretien

1. Comment approches-tu le typage des routes avec TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En modélisant les segments via des literal unions et des template literal types, pour obtenir une union de chemins valides et, plus loin, extraire les params dynamiques.
   :::
