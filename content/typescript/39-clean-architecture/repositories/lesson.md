---
id: typescript-39-repositories
title: Repositories
slug: repositories
technology: typescript
level: intermediate
module: 39-clean-architecture
order: 8
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-39-use-cases]
skills: [architecture]
tags: [typescript, architecture]
---

## Objectifs

- Repositionner les repositories dans Clean Architecture
- Ports définis par le domain/application
- Adapters infra

## Introduction

Les **repositories** sont des ports de persistance.

## Concept

```
domain/application  →  interface UserRepository
infrastructure      →  class PrismaUserRepository implements UserRepository
```

## Exemple

Le use case ne connaît que `UserRepository`. Prisma reste dans infra.

## Comment ça fonctionne

Dependency inversion : le détail (Prisma) dépend de l’abstraction définie plus au centre.

## Erreurs fréquentes

- Interface collée aux méthodes Prisma
- Repository dans le mauvais sens de dépendance

## À retenir

- Port au centre
- Adapter à l’extérieur
- Méthodes métier

## Exercices

1. Qui définit l’interface UserRepository ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   La couche domain ou application (le centre), pas l’infra.
   :::

## Questions d'entretien

1. Où vit l’interface repository en Clean Architecture ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Vers le centre (domain/application). L’implémentation ORM vit en infrastructure et dépend de cette interface.
   :::
