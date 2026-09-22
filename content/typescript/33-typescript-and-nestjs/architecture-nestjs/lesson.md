---
id: typescript-33-architecture-nestjs
title: Architecture NestJS
slug: architecture-nestjs
technology: typescript
level: intermediate
module: 33-typescript-and-nestjs
order: 18
estimatedMinutes: 15
difficulty: 3
xp: 55
prerequisites: [typescript-33-repository-pattern]
skills: [nestjs]
tags: [typescript, nestjs, architecture]
---

## Objectifs

- Structurer une app Nest typée
- Couches : transport, application, domain, infra
- Bonnes pratiques TypeScript

## Introduction

Nest encourage une architecture **modulaire** ; TypeScript en fait un socle solide.

## Concept

```
src/
  users/
    users.module.ts
    users.controller.ts
    users.service.ts
    dto/
    entities/ ou domain/
    infra/prisma-user.repository.ts
  common/
    filters/
    guards/
    pipes/
  config/
  main.ts
```

Règles :
- Controllers minces
- Services = use-cases
- Domain types stables
- Infra derrière ports
- Validation aux bords (DTO + pipes)

## Exemple

Feature module autonome exportant ce qui doit être partagé.

## Comment ça fonctionne

Le graphe de modules Nest + types TS définissent les frontières. Les tests unitaires mockent les ports.

## Erreurs fréquentes

- God AppModule
- Logique métier dans guards/interceptors
- any dans toute la couche data

## À retenir

- Feature modules
- Ports & adapters
- DTO validation
- Types domaine centraux
- DI partout

## Exercices

1. Où placer un filter d’exception HTTP global ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Dans common/filters, enregistré globalement dans main.ts ou AppModule.
   :::

## Questions d'entretien

1. Comment organises-tu une application NestJS TypeScript maintenable ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Par feature modules, controllers minces, services de use-case, domain types stables, repositories derrière des ports, validation DTO aux entrées, et cross-cutting (filters, guards) dans common. La DI et les types lient le tout sans couplage excessif.
   :::
