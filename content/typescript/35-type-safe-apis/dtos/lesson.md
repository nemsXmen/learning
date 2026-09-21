---
id: typescript-35-dtos
title: DTOs
slug: 35-dtos
technology: typescript
level: intermediate
module: 35-type-safe-apis
order: 6
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-35-pagination-types]
skills: [api]
tags: [typescript, api, dto]
---

## Objectifs

- Positionner les DTOs dans une API typée
- Input vs output DTOs
- Mapping domaine

## Introduction

Les **DTOs** sont les objets de transfert du contrat HTTP.

## Concept

```ts
// input
type CreateOrderDto = {
  productId: string;
  quantity: number;
};

// output
type OrderDto = {
  id: string;
  productId: string;
  quantity: number;
  status: "pending" | "paid";
  createdAt: string;
};
```

## Exemple

Mapper entity → OrderDto pour masquer champs internes.

## Comment ça fonctionne

DTOs stabilisent le contrat public. Le domaine reste libre d’évoluer derrière.

## Erreurs fréquentes

- Un seul type pour input, output et DB
- Mapping oublié

## À retenir

- DTO in / DTO out
- Mapping explicite
- Contrat stable

## Exercices

1. Différence CreateUserDto vs UserDto de réponse ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Create : champs d’entrée (password…). UserDto : champs publics (sans secret, avec id/createdAt…).
   :::

## Questions d'entretien

1. Pourquoi des DTOs distincts input/output ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Les champs acceptés à l’écriture (password, tokens) ne sont pas ceux exposés à la lecture. Séparer évite fuites et clarifie le contrat.
   :::
