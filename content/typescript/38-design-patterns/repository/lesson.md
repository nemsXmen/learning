---
id: typescript-38-repository
title: Repository
slug: repository
technology: typescript
level: intermediate
module: 38-design-patterns
order: 6
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-38-observer]
skills: [patterns]
tags: [typescript, patterns, database]
---

## Objectifs

- Revoir le pattern Repository côté design
- Interface + implémentation typées
- Lien avec le domaine

## Introduction

Le **Repository** médiatise accès data et domaine (déjà vu en Nest/DB, ici en pattern).

## Concept

```ts
interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  save(order: Order): Promise<void>;
}
```

## Exemple

In-memory pour tests, SQL pour prod — même interface.

## Comment ça fonctionne

Ports & adapters : le domaine ne connaît que l’interface.

## Erreurs fréquentes

- Repository qui fuit des détails SQL
- Trop de méthodes de reporting (séparer query side)

## À retenir

- Interface fine
- Implémentations interchangeables
- Domaine découplé

## Exercices

1. Implémente InMemoryUserRepository.findById.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   findById(id: string) {
     return Promise.resolve(this.map.get(id) ?? null);
   }
   ```
   :::

## Questions d'entretien

1. Repository comme design pattern : bénéfice clé ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Abstraction de la persistance derrière un contrat typé, testabilité (in-memory), et indépendance du domaine vis-à-vis de l’ORM/SQL.
   :::
