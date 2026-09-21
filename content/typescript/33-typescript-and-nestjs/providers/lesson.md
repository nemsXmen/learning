---
id: typescript-33-providers
title: Providers
slug: providers
technology: typescript
level: intermediate
module: 33-typescript-and-nestjs
order: 5
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-33-services]
skills: [nestjs]
tags: [typescript, nestjs]
---

## Objectifs

- Comprendre la notion de provider
- useClass / useValue / useFactory
- Tokens d’injection

## Introduction

Tout ce qui peut être injecté est un **provider** (services, configs, factories…).

## Concept

```ts
@Module({
  providers: [
    UsersService,
    { provide: "CONFIG", useValue: { port: 3000 } },
    {
      provide: "ASYNC_CONN",
      useFactory: async () => createConnection(),
      inject: []
    }
  ]
})
export class AppModule {}
```

## Exemple

```ts
constructor(@Inject("CONFIG") private config: { port: number }) {}
```

## Comment ça fonctionne

`provide` est le token (souvent la classe elle-même). `useClass` / `useValue` / `useFactory` définissent comment résoudre l’instance.

## Erreurs fréquentes

- Token string sans @Inject
- Factory non async quand elle devrait l’être

## À retenir

- Provider = injectable
- Tokens
- useClass / useValue / useFactory

## Exercices

1. Fournis une constante API_KEY via useValue.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   { provide: "API_KEY", useValue: process.env.API_KEY }
   ```
   :::

## Questions d'entretien

1. Quelle différence entre un service et un provider Nest ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Un service est un type courant de provider (classe @Injectable). Un provider est le concept plus large : toute valeur enregistrée dans le conteneur DI (classe, valeur, factory).
   :::
