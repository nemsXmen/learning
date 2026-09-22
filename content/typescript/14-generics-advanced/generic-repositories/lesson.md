---
id: typescript-14-generic-repositories
title: Generic repositories
slug: generic-repositories
technology: typescript
level: intermediate
module: 14-generics-advanced
order: 5
estimatedMinutes: 15
difficulty: 3
xp: 55
prerequisites: [typescript-14-generic-factories]
skills: [generics]
tags: [typescript, generics, repository]
---

## Objectifs

- Modéliser un repository générique
- Typer CRUD de façon réutilisable
- Voir un pattern d’architecture courant

## Introduction

Le pattern **Repository** se prête parfaitement aux generics.

## Concept

```ts
interface Repository<T extends { id: string }> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Omit<T, "id">): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

interface User {
  id: string;
  name: string;
  email: string;
}

class UserRepository implements Repository<User> {
  async findById(id: string): Promise<User | null> { /* ... */ return null; }
  async findAll(): Promise<User[]> { return []; }
  async create(data: Omit<User, "id">): Promise<User> {
    return { id: crypto.randomUUID(), ...data };
  }
  async update(id: string, data: Partial<User>): Promise<User> {
    return { id, name: "", email: "", ...data };
  }
  async delete(id: string): Promise<void> {}
}
```

## Exemple

On peut aussi factoriser une classe de base générique.

## Comment ça fonctionne

`T` représente l’entité. Les utilitaires `Omit` / `Partial` typent les payloads de création et mise à jour.

## Erreurs fréquentes

- Oublier la contrainte `{ id: string }`
- Typage trop lâche des méthodes update/create

## À retenir

- `Repository<T extends { id: ... }>`
- CRUD typé et réutilisable
- Pattern très répandu en backend TS

## Exercices

1. Déclare une interface `Repository<T extends { id: number }>` avec `findById` et `save`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   interface Repository<T extends { id: number }> {
     findById(id: number): T | undefined;
     save(entity: T): void;
   }
   ```
   :::

## Questions d'entretien

1. Comment les generics améliorent-ils un pattern Repository ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Ils permettent de définir une seule interface/classe de repository paramétrée par le type d’entité, avec des opérations CRUD correctement typées (y compris Omit/Partial pour create/update), sans duplication.
   :::
