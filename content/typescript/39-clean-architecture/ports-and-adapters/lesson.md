---
id: typescript-39-ports-and-adapters
title: Ports & adapters
slug: ports-and-adapters
technology: typescript
level: intermediate
module: 39-clean-architecture
order: 11
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-39-dependency-injection]
skills: [architecture]
tags: [typescript, architecture]
---

## Objectifs

- Nommer ports et adapters
- Ports entrants / sortants
- Hexagonal architecture

## Introduction

**Ports & Adapters** (hexagonal) est une vue de Clean Architecture.

## Concept

- **Port** : interface du centre (API du use case ou SPI repo)
- **Adapter** : implémentation périphérique (HTTP controller, Prisma repo)

```
[HTTP Adapter] → (inbound port: CreateUser) → Domain
[Prisma Adapter] ← (outbound port: UserRepository) ← Domain
```

## Exemple

Inbound : controller appelle use case.  
Outbound : use case appelle repository.

## Comment ça fonctionne

Le hexagone (centre) ne connaît que des ports. Les adapters branchent le monde réel.

## Erreurs fréquentes

- Ports trop techniques (Request, Response Express)
- Adapters qui contournent les use cases

## À retenir

- Inbound / outbound
- Centre stable
- Périphérie remplaçable

## Exercices

1. UserRepository est un port inbound ou outbound ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Outbound (le centre appelle l’extérieur).
   :::

## Questions d'entretien

1. Port vs adapter ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Port = contrat (interface) du centre. Adapter = code périphérique qui respecte ce contrat (HTTP, DB, messaging…).
   :::
