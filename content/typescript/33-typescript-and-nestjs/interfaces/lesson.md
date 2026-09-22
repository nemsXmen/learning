---
id: typescript-33-interfaces
title: Interfaces
slug: interfaces
technology: typescript
level: intermediate
module: 33-typescript-and-nestjs
order: 8
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-33-dtos]
skills: [nestjs]
tags: [typescript, nestjs]
---

## Objectifs

- Utiliser interfaces pour contrats métier
- Les distinguer des classes DTO
- Éviter de les utiliser comme tokens DI

## Introduction

Les **interfaces** documentent des formes de données et contrats sans runtime.

## Concept

```ts
export interface User {
  id: string;
  email: string;
}

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
}
```

## Exemple

Implémentation :

```ts
@Injectable()
export class PrismaUserRepository implements UserRepository {
  // ...
}
```

Token DI : souvent la classe abstraite ou un Symbol, pas l’interface pure.

## Comment ça fonctionne

`implements` vérifie la conformité à la compile. Runtime : seule la classe existe.

## Erreurs fréquentes

- Injecter une interface sans token
- Confondre interface et DTO validé

## À retenir

- Interfaces = contrats compile-time
- DTO classes = validation runtime
- Tokens DI concrets

## Exercices

1. Interface Product { id: string; price: number }.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   export interface Product {
     id: string;
     price: number;
   }
   ```
   :::

## Questions d'entretien

1. Interface vs class DTO dans Nest ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Interface : contrat type-only, pas de validation runtime, pas de token DI. Class DTO : existe à runtime, décorateurs de validation, utilisable avec ValidationPipe.
   :::
