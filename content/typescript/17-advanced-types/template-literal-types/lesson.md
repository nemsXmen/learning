---
id: typescript-17-template-literal-types
title: Template literal types
slug: template-literal-types
technology: typescript
level: advanced
module: 17-advanced-types
order: 7
estimatedMinutes: 15
difficulty: 3
xp: 55
prerequisites: [typescript-17-mapped-types]
skills: [advanced-types]
tags: [typescript, template-literal-types]
---

## Objectifs

- Utiliser les template literal types
- Composer des strings au niveau des types
- Voir des cas d’usage (routes, events…)

## Introduction

Les **template literal types** construisent des types string à partir d’autres types string.

## Concept

```ts
type World = "world";
type Greeting = `hello ${World}`; // "hello world"

type EventName<T extends string> = `on${Capitalize<T>}`;
type Click = EventName<"click">; // "onClick"
```

```ts
type HttpMethod = "GET" | "POST";
type Endpoint = "/users" | "/posts";
type Route = `${HttpMethod} ${Endpoint}`;
// "GET /users" | "GET /posts" | "POST /users" | "POST /posts"
```

## Exemple

```ts
type PropEvent<T extends string> = `${T}Changed`;
type NameEvent = PropEvent<"name">; // "nameChanged"
```

## Comment ça fonctionne

Les unions se distribuent dans les template literals, produisant le produit cartésien des combinaisons.

## Erreurs fréquentes

- Oublier les contraintes `extends string`
- Complexité excessive de chaînes de templates

## À retenir

- `` `prefix${Type}suffix` ``
- Distribution sur les unions
- Idéal pour events, routes, CSS-in-JS typé

## Exercices

1. Crée un type `CssVar<T extends string>` = `--${T}`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type CssVar<T extends string> = `--${T}`;
   ```
   :::

## Questions d'entretien

1. À quoi servent les template literal types ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   À construire des types string par composition (préfixes, suffixes, combinaisons). Ils se distribuent sur les unions et sont très utiles pour typer des noms d’événements, des routes, des clés CSS, etc.
   :::
