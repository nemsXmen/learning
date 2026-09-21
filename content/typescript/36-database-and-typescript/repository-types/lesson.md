---
id: typescript-36-repository-types
title: Repository types
slug: repository-types
technology: typescript
level: intermediate
module: 36-database-and-typescript
order: 4
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-36-dto-vs-entity]
skills: [database]
tags: [typescript, database]
---

## Objectifs

- Typer les repositories
- Ports et implémentations
- Méthodes de lecture/écriture

## Introduction

Le **repository** expose des opérations data typées au domaine.

## Concept

```ts
interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}
```

## Exemple

Implémentation Prisma/TypeORM/Drizzle derrière l’interface.

## Comment ça fonctionne

Le domaine dépend de l’interface. L’infra fournit l’adapter. Types de retour = modèles domaine (ou entities mappées).

## Erreurs fréquentes

- Retourner des types ORM bruts partout
- Interface trop large (god repository)

## À retenir

- Interface fine
- Promise<T | null>
- Adapter ORM

## Exercices

1. Ajoute list(): Promise<User[]> à l’interface.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   list(): Promise<User[]>;
   ```
   :::

## Questions d'entretien

1. Pourquoi typer un repository par une interface ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Pour découpler le domaine de l’ORM, faciliter les tests (mock), et documenter clairement les opérations data supportées.
   :::
