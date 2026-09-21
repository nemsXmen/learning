---
id: typescript-39-frontieres-type-safe
title: Frontières type-safe
slug: frontieres-type-safe
technology: typescript
level: intermediate
module: 39-clean-architecture
order: 12
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-39-ports-and-adapters]
skills: [architecture]
tags: [typescript, architecture]
---

## Objectifs

- Typer les frontières entre couches
- Validation aux bords
- Mapping explicite

## Introduction

Les **frontières** Clean Architecture se prêtent au typage strict et à la validation.

## Concept

```
HTTP body (unknown) → schema.parse → CreateUserInput → use case → User → UserDto → JSON
```

Chaque flèche = type clair + éventuellement validation/mapping.

## Exemple

Interdire `any` aux bords. Prefer `unknown` + parse.

## Comment ça fonctionne

TypeScript documente les contrats ; schemas et mappers les appliquent.

## Erreurs fréquentes

- any qui traverse toutes les couches
- Mapping implicite / caché

## À retenir

- unknown aux bords
- parse + map
- Types de couche distincts

## Exercices

1. Pourquoi unknown plutôt que any sur req.body ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Force un narrowing/validation avant usage.
   :::

## Questions d'entretien

1. Comment sécurises-tu les frontières entre couches en TS ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Types distincts par couche, validation runtime (schema) aux entrées externes, mappers explicites, et interdiction de `any` qui court-circuite le filet.
   :::
