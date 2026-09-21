---
id: typescript-33-repository-pattern
title: Repository pattern
slug: repository-pattern
technology: typescript
level: intermediate
module: 33-typescript-and-nestjs
order: 17
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-33-configuration-typee]
skills: [nestjs]
tags: [typescript, nestjs, architecture]
---

## Objectifs

- Appliquer le pattern repository
- Isoler la persistance
- Typer les ports data

## Introduction

Le **repository** abstrait l’accès data derrière une interface typée.

## Concept

```ts
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
}

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaService) {}
  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
  save(user: User) {
    return this.prisma.user.upsert({ /* ... */ });
  }
}
```

```ts
{ provide: "UserRepository", useClass: PrismaUserRepository }
```

## Exemple

Le service métier dépend de `UserRepository`, pas de Prisma directement.

## Comment ça fonctionne

Port (interface/token) + adapter (implémentation ORM). Tests : mock du port.

## Erreurs fréquentes

- Fuite des types ORM dans tout le domaine
- Repository = service god

## À retenir

- Interface + impl
- Token DI
- Domaine découplé de l’ORM

## Exercices

1. Pourquoi le service ne dépend-il pas de PrismaService directement ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Pour rester testable et indépendant de l’ORM ; on dépend d’un port UserRepository.
   :::

## Questions d'entretien

1. Comment mets-tu en place un repository typé dans Nest ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En définissant une interface (ou classe abstraite) des opérations data, une implémentation ORM @Injectable, et en liant le token via useClass dans le module. Les services injectent le port.
   :::
