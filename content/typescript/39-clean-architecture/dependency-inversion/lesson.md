---
id: typescript-39-dependency-inversion
title: Dependency inversion
slug: dependency-inversion
technology: typescript
level: intermediate
module: 39-clean-architecture
order: 9
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-39-repositories]
skills: [architecture]
tags: [typescript, architecture]
---

## Objectifs

- Comprendre le principe d’inversion de dépendances
- Direction des imports TypeScript
- Abstractions stables

## Introduction

**Dependency Inversion** : les modules de haut niveau ne dépendent pas des détails.

## Concept

```
UseCase ──depends on──► UserRepository (interface)
                              ▲
                              │ implements
                    PrismaUserRepository
```

En termes d’imports TS : `application` n’importe pas `infra`. `infra` importe les types de `application`/`domain`.

## Exemple

Si `create-user.ts` importe `prisma-user-repository.ts`, la règle est violée.

## Comment ça fonctionne

Les interfaces vivent au centre. Les détails pointent vers le centre.

## Erreurs fréquentes

- Imports circulaires
- Interfaces placées dans infra

## À retenir

- Haut niveau → abstractions
- Détails → abstractions
- Contrôle des imports

## Exercices

1. application/ importe infra/ : OK ou non ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Non — inversion violée.
   :::

## Questions d'entretien

1. Comment appliques-tu l’inversion de dépendances en TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En plaçant les interfaces (ports) dans domain/application, en implémentant dans infra, et en s’assurant que les imports ne pointent jamais du centre vers les détails.
   :::
