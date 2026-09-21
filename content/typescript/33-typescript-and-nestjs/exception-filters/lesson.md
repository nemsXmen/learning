---
id: typescript-33-exception-filters
title: Exception filters
slug: exception-filters
technology: typescript
level: intermediate
module: 33-typescript-and-nestjs
order: 14
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-33-interceptors]
skills: [nestjs]
tags: [typescript, nestjs]
---

## Objectifs

- Gérer les exceptions proprement
- HttpException et filtres custom
- Uniformiser les erreurs API

## Introduction

Les **exception filters** capturent les erreurs et formatent la réponse HTTP.

## Concept

```ts
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const status = exception.getStatus();
    res.status(status).json({
      statusCode: status,
      message: exception.message
    });
  }
}
```

## Exemple

```ts
throw new NotFoundException("User not found");
throw new BadRequestException({ code: "INVALID_EMAIL" });
```

## Comment ça fonctionne

Nest mappe HttpException → status. Un filtre global uniformise le body d’erreur.

## Erreurs fréquentes

- throw new Error() sans HttpException → 500 générique
- Fuiter des stack traces en prod

## À retenir

- HttpException / NotFoundException…
- @Catch + ExceptionFilter
- Format d’erreur stable

## Exercices

1. Lance une NotFoundException dans un service.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   throw new NotFoundException("Item not found");
   ```
   :::

## Questions d'entretien

1. Pourquoi préférer HttpException à throw new Error() dans Nest ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Parce que HttpException (et sous-classes) portent un status HTTP et un payload contrôlé, que les filtres peuvent formater proprement. Error brut devient souvent un 500 opaque.
   :::
