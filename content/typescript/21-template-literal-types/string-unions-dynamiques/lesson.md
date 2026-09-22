---
id: typescript-21-string-unions-dynamiques
title: String unions dynamiques
slug: string-unions-dynamiques
technology: typescript
level: advanced
module: 21-template-literal-types
order: 2
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-21-template-literal-types]
skills: [template-literal-types]
tags: [typescript, template-literal-types]
---

## Objectifs

- Construire des unions de strings dynamiquement
- Combiner préfixes, suffixes et unions de base
- Éviter les unions manuelles répétitives

## Introduction

Au lieu de lister à la main toutes les variantes, on les génère.

## Concept

```ts
type Lang = "fr" | "en" | "es";
type LocaleKey = `locale_${Lang}`;
// "locale_fr" | "locale_en" | "locale_es"

type Size = "sm" | "md" | "lg";
type ButtonClass = `btn-${Size}`;
// "btn-sm" | "btn-md" | "btn-lg"
```

## Exemple

```ts
type HttpVerb = "get" | "post" | "put" | "delete";
type Action = `api.${HttpVerb}`;
```

## Comment ça fonctionne

Une union de base + template = union élargie sans duplication.

## Erreurs fréquentes

- Maintenir une longue union à la main alors qu’un template suffirait

## À retenir

- Une source (union de base) + template
- Moins de duplication
- Évolutif quand on ajoute un membre à la base

## Exercices

1. Génère `"icon-home" | "icon-user" | "icon-settings"` à partir de `"home" | "user" | "settings"`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type Icon = "home" | "user" | "settings";
   type IconClass = `icon-${Icon}`;
   ```
   :::

## Questions d'entretien

1. Pourquoi générer des string unions via template literals plutôt que les lister ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Pour éviter la duplication et rester synchronisé avec une union de base : ajouter un membre à la base met à jour automatiquement toutes les variantes préfixées/suffixées.
   :::
