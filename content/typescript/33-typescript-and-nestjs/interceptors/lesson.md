---
id: typescript-33-interceptors
title: Interceptors
slug: interceptors
technology: typescript
level: intermediate
module: 33-typescript-and-nestjs
order: 13
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-33-guards]
skills: [nestjs]
tags: [typescript, nestjs]
---

## Objectifs

- Comprendre les interceptors
- Transformer les réponses
- Logging / timeout

## Introduction

Les **interceptors** s’enroulent autour de l’exécution du handler.

## Concept

```ts
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((data) => ({ data, ok: true }))
    );
  }
}
```

## Exemple

LoggingInterceptor, TimeoutInterceptor, cache.

## Comment ça fonctionne

RxJS `Observable` : on peut map, tap, catchError, timeout sur le flux de réponse.

## Erreurs fréquentes

- Logique métier lourde dans un interceptor
- Oublier de retourner next.handle()

## À retenir

- NestInterceptor
- next.handle()
- map / tap

## Exercices

1. À quoi sert map dans un interceptor de réponse ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   À transformer la valeur émise (ex. envelopper { data }).
   :::

## Questions d'entretien

1. Donne un cas d’usage typique d’interceptor Nest.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Uniformiser le format de réponse, logger latence/status, appliquer un timeout, ou mettre en cache certaines réponses.
   :::
