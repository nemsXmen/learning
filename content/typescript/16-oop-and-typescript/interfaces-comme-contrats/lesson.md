---
id: typescript-16-interfaces-comme-contrats
title: Interfaces comme contrats
slug: interfaces-comme-contrats
technology: typescript
level: intermediate
module: 16-oop-and-typescript
order: 6
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-16-composition]
skills: [oop]
tags: [typescript, oop, interfaces]
---

## Objectifs

- Utiliser les interfaces comme contrats d’architecture
- Découpler modules via des interfaces
- Voir le pattern « programmer contre des interfaces »

## Introduction

En architecture, les **interfaces** formalisent les frontières entre modules.

## Concept

```ts
interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

class PostgresUserRepository implements UserRepository {
  async findById(id: string) { /* SQL... */ return null; }
  async save(user: User) { /* SQL... */ }
}

class UserService {
  constructor(private users: UserRepository) {}
  async getUser(id: string) {
    return this.users.findById(id);
  }
}
```

`UserService` ne connaît pas Postgres, seulement le contrat.

## Exemple

On peut mocker facilement `UserRepository` dans les tests.

## Comment ça fonctionne

L’interface définit le port ; l’implémentation est un adapter. C’est le cœur de l’architecture hexagonale / clean architecture légère.

## Erreurs fréquentes

- Interfaces anémiques qui fuient les détails
- Une interface par classe sans besoin réel

## À retenir

- Interface = contrat de module
- Facilite tests et substitution
- Programmer contre des interfaces

## Exercices

1. Définis un contrat `EmailSender` avec `send(to: string, body: string)`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   interface EmailSender {
     send(to: string, body: string): Promise<void>;
   }
   ```
   :::

## Questions d'entretien

1. Pourquoi injecter une interface plutôt qu’une classe concrète ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Pour découpler le code métier des détails d’implémentation, faciliter les tests (mocks) et permettre de changer d’implémentation sans modifier les consommateurs.
   :::
