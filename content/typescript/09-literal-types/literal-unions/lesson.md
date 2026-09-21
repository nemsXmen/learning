---
id: typescript-09-literal-unions
title: Literal unions
slug: literal-unions
technology: typescript
level: beginner
module: 09-literal-types
order: 4
estimatedMinutes: 12
difficulty: 1
xp: 40
prerequisites: [typescript-09-boolean-literal-types]
skills: [literal-types]
tags: [typescript, literals, unions]
---

## Objectifs

- Combiner des littéraux en unions
- Les utiliser pour les configs et les états
- Revoir le narrowing associé

## Introduction

Les literal unions regroupent plusieurs littéraux en un type fermé.

## Concept

```ts
type Status = "idle" | "loading" | "success" | "error";
type Role = "admin" | "user" | "guest";
type Size = "sm" | "md" | "lg" | "xl";
```

## Exemple

```ts
function setStatus(status: Status) {
  // autocomplétion + sécurité
}
```

## Comment ça fonctionne

Chaque membre de l’union est un literal type. TypeScript refuse les valeurs hors ensemble et permet un narrowing exhaustif.

## Erreurs fréquentes

- Élargir trop tôt en `string` / `number`
- Oublier un cas dans un switch

## À retenir

- Literal union = ensemble fermé de valeurs
- Base des machines à états et des configs typées
- Excellent narrowing

## Exercices

1. Crée un type `ButtonVariant` : "primary" | "secondary" | "danger".

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   type ButtonVariant = "primary" | "secondary" | "danger";
   ```
   :::

## Questions d'entretien


1. Pourquoi préférer une literal union à un `string` pour un statut ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   Parce qu’elle documente les valeurs autorisées, active l’autocomplétion, détecte les fautes de frappe et permet un narrowing / une exhaustivité fiables.
   :::

