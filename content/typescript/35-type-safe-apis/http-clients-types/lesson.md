---
id: typescript-35-http-clients-types
title: HTTP clients typés
slug: http-clients-types
technology: typescript
level: intermediate
module: 35-type-safe-apis
order: 10
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-35-typed-fetch]
skills: [api]
tags: [typescript, api]
---

## Objectifs

- Voir axios / ky / ofetch typés
- Générer des clients
- Choisir une approche

## Introduction

Des libs HTTP offrent un **meilleur typage** que fetch nu.

## Concept

```ts
// axios
const { data } = await axios.get<UserResponse>("/users/1");

// ofetch / ky : wrappers modernes
const user = await ofetch<UserResponse>("/users/1");
```

Mieux : client généré depuis OpenAPI / tRPC proxy.

## Exemple

```ts
// idée openapi-typescript + fetch wrapper
const client = createClient<paths>();
const { data, error } = await client.GET("/users/{id}", {
  params: { path: { id: "1" } }
});
```

## Comment ça fonctionne

Les génériques de méthode typent `data`. Les clients générés typent aussi paths et params.

## Erreurs fréquentes

- get<User> sans validation réelle
- Client généré désynchronisé de la spec

## À retenir

- Libs + génériques
- Codegen > annotations manuelles
- Rester aligné avec la spec

## Exercices

1. Avantage d’un client généré OpenAPI ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Paths, params, body et responses typés depuis la spec — moins de dérive manuelle.
   :::

## Questions d'entretien

1. axios.get\<User\> suffit-il pour la sûreté ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Non : c’est une annotation de confiance. Sans validation ou codegen aligné sur une spec validée, le runtime peut différer du type.
   :::
