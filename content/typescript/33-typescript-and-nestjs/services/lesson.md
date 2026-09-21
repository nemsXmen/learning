---
id: typescript-33-services
title: Services
slug: services
technology: typescript
level: intermediate
module: 33-typescript-and-nestjs
order: 4
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-33-controllers]
skills: [nestjs]
tags: [typescript, nestjs]
---

## Objectifs

- Déclarer un `@Injectable` service
- Encapsuler la logique métier
- Typer les méthodes publiques

## Introduction

Les **services** portent la logique métier et sont injectables.

## Concept

```ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { User } from "./entities/user.entity";

@Injectable()
export class UsersService {
  private users: User[] = [];

  findAll(): User[] {
    return this.users;
  }

  findOne(id: string): User {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new NotFoundException();
    return user;
  }

  create(dto: CreateUserDto): User {
    const user = { id: crypto.randomUUID(), ...dto };
    this.users.push(user);
    return user;
  }
}
```

## Exemple

En pratique : repositories, clients HTTP, domain services.

## Comment ça fonctionne

`@Injectable()` marque la classe pour la DI. Le type de retour des méthodes documente l’API du service.

## Erreurs fréquentes

- Service sans @Injectable
- Retours any

## À retenir

- @Injectable
- Méthodes typées
- Pas de HTTP ici

## Exercices

1. Ajoute une méthode remove(id: string): void.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   remove(id: string): void {
     this.users = this.users.filter((u) => u.id !== id);
   }
   ```
   :::

## Questions d'entretien

1. Pourquoi marquer un service avec @Injectable() ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Pour indiquer à Nest qu’il peut gérer cette classe dans le conteneur DI (instanciation, injection des dépendances, scope).
   :::
