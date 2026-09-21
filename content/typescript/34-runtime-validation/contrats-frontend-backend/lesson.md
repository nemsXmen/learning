---
id: typescript-34-contrats-frontend-backend
title: Contrats frontend/backend
slug: contrats-frontend-backend
technology: typescript
level: intermediate
module: 34-runtime-validation
order: 13
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-34-validation-db]
skills: [validation]
tags: [typescript, validation, api]
---

## Objectifs

- Partager des contrats de types
- Valider aux deux bouts si besoin
- Éviter la dérive front/back

## Introduction

Front et back TypeScript peuvent **partager** schemas/types, mais chacun valide ce qu’il reçoit.

## Concept

```
packages/shared/
  schemas/user.ts   # Zod
  types/            # ou z.infer exportés
apps/web/           # importe schemas pour forms
apps/api/           # importe schemas pour handlers
```

## Exemple

tRPC / GraphQL codegen / OpenAPI → types générés + validation runtime côté serveur (et parfois client).

## Comment ça fonctionne

Source de vérité unique (schema ou spec). Le front type les appels ; le back valide quand même les entrées.

## Erreurs fréquentes

- Types partagés sans validation serveur
- Deux définitions User divergentes

## À retenir

- Shared schemas
- Validate serveur obligatoire
- Codegen / monorepo

## Exercices

1. Pourquoi le serveur valide-t-il encore si le front est typé ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Parce que le client peut être contourné, outdated, ou non-TS.
   :::

## Questions d'entretien

1. Comment évites-tu la dérive de contrats front/back en TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En partageant schemas/types (monorepo, package shared, OpenAPI/tRPC codegen) et en validant runtime côté serveur. Une seule source de vérité pour la forme des messages.
   :::
