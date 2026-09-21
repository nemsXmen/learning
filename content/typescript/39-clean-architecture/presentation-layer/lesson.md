---
id: typescript-39-presentation-layer
title: Presentation layer
slug: presentation-layer
technology: typescript
level: intermediate
module: 39-clean-architecture
order: 5
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-39-infrastructure-layer]
skills: [architecture]
tags: [typescript, architecture]
---

## Objectifs

- Placer controllers, UI, CLI
- Adapter transport → use case
- DTOs de bordure

## Introduction

La **présentation** (ou delivery) parle au monde extérieur : HTTP, UI, CLI.

## Concept

```ts
// presentation/http/create-user.controller.ts
@Post("/users")
async create(@Body() body: CreateUserBody) {
  const user = await this.createUser.execute({
    email: body.email,
    password: body.password
  });
  return toUserResponse(user);
}
```

## Exemple

React pages, Nest controllers, CLI commands — tous appellent des use cases.

## Comment ça fonctionne

Validation d’entrée ici (ou juste avant), mapping DTO ↔ application, mapping erreurs → status HTTP.

## Erreurs fréquentes

- Logique métier dans le controller
- Réponses = entities brutes

## À retenir

- Mince
- Appelle les use cases
- DTOs in/out

## Exercices

1. Le controller doit-il connaître Prisma ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Non.
   :::

## Questions d'entretien

1. Rôle de la couche présentation ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Traduire le transport (HTTP, UI, CLI) vers les use cases et inversement : validation de bordure, DTOs, codes d’erreur — sans règles métier profondes.
   :::
