---
id: typescript-34-validation-des-api
title: Validation des API
slug: validation-des-api
technology: typescript
level: intermediate
module: 34-runtime-validation
order: 10
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-34-dto-plus-schema]
skills: [validation]
tags: [typescript, validation, api]
---

## Objectifs

- Valider body, query, params
- Répondre 400 sur invalide
- Typer les handlers après parse

## Introduction

Chaque **endpoint** est une frontière : valider avant le métier.

## Concept

```ts
app.post("/users", (req, res) => {
  const parsed = CreateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(parsed.error.format());
  }
  const dto = parsed.data; // typé
  // ...
});
```

Nest : ValidationPipe global. Next : validation dans Server Actions / Route Handlers.

## Exemple

Valider aussi les headers critiques, pagination, filtres.

## Comment ça fonctionne

Fail fast → 400 + détails. Le code métier ne voit que des données conformes.

## Erreurs fréquentes

- Valider seulement le body, pas query/params
- Messages d’erreur trop verbeux en prod (fuite)

## À retenir

- safeParse / ValidationPipe
- 400 structuré
- Handler sur data valide

## Exercices

1. Que retourner si safeParse échoue sur un POST ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   HTTP 400 avec un payload d’erreur (format stable).
   :::

## Questions d'entretien

1. Où places-tu la validation dans une API TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   À la bordure HTTP (middleware, pipe, début de route handler / server action), avant toute logique métier, avec un schema partagé et des réponses 400 cohérentes.
   :::
