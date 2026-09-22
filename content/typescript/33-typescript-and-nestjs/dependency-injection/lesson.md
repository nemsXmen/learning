---
id: typescript-33-dependency-injection
title: Dependency Injection
slug: 33-dependency-injection
technology: typescript
level: intermediate
module: 33-typescript-and-nestjs
order: 6
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-33-providers]
skills: [nestjs]
tags: [typescript, nestjs, di]
---

## Objectifs

- Comprendre la DI Nest
- Injecter via constructeur
- Scopes (default singleton)

## Introduction

L’**injection de dépendances** câble automatiquement les providers.

## Concept

```ts
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
}
```

Nest résout `UsersService` grâce aux métadonnées de type émises par TypeScript.

## Exemple

```ts
@Injectable()
export class OrdersService {
  constructor(
    private readonly users: UsersService,
    private readonly mailer: MailerService
  ) {}
}
```

## Comment ça fonctionne

Reflection metadata + conteneur DI. Par défaut, scope **singleton** par application (ou par module selon config).

## Erreurs fréquentes

- Interface TypeScript pure comme token sans token custom (effacée à runtime)
- Oublier d’enregistrer le provider

## À retenir

- Constructor injection
- Types → tokens (classes)
- Singleton par défaut

## Exercices

1. Injecte ProductsService dans un controller via constructeur.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   constructor(private readonly productsService: ProductsService) {}
   ```
   :::

## Questions d'entretien

1. Pourquoi une interface TypeScript seule ne peut-elle pas servir de token DI Nest ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Parce que les interfaces sont effacées à la compilation (type erasure) : aucune valeur runtime n’existe pour résoudre l’injection. On utilise une classe, un string/symbol token, ou un Abstract class.
   :::
