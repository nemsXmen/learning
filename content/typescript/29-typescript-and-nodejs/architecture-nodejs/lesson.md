---
id: typescript-29-architecture-nodejs
title: Architecture Node.js
slug: architecture-nodejs
technology: typescript
level: intermediate
module: 29-typescript-and-nodejs
order: 13
estimatedMinutes: 15
difficulty: 3
xp: 55
prerequisites: [typescript-29-cli-typee]
skills: [nodejs]
tags: [typescript, nodejs, architecture]
---

## Objectifs

- Structurer une app Node TypeScript
- Séparer couches (config, domain, infra)
- Appliquer les frontières de modules

## Introduction

TypeScript brille quand l’architecture Node est claire : config, domaine, adapters.

## Concept

Exemple de structure :

```
src/
  config/       # loadConfig typé
  domain/       # règles métier pures
  infra/        # fs, http, db
  app/          # composition
  main.ts       # boot
```

Règles :
- domain n’importe pas infra
- infra implémente des ports définis par domain
- config validée une fois au boot

## Exemple

```ts
// domain
export interface UserRepo {
  findById(id: string): Promise<User | null>;
}

// infra
export class PgUserRepo implements UserRepo {
  async findById(id: string) { /* ... */ }
}
```

## Comment ça fonctionne

Les types définissent les contrats entre couches. Les tests mockent les ports.

## Erreurs fréquentes

- God module index.ts
- process.env et fs partout dans le domaine

## À retenir

- Couches + ports
- Config centralisée
- Types comme contrats
- main compose

## Exercices

1. Où placer un client Redis dans cette architecture ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Dans infra (adapter), derrière une interface définie côté domain si le métier en dépend.
   :::

## Questions d'entretien

1. Comment organises-tu une application Node.js TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En séparant config validée, domaine pur (types + règles), infra (adapters Node/DB/HTTP), et un composition root. Les types servent de contrats entre couches ; le domaine n’importe pas les détails Node.
   :::
