---
id: typescript-38-chain-of-responsibility
title: Chain of Responsibility
slug: chain-of-responsibility
technology: typescript
level: intermediate
module: 38-design-patterns
order: 12
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-38-decorator]
skills: [patterns]
tags: [typescript, patterns]
---

## Objectifs

- Chaîner des handlers
- Typer le passage de contexte
- Cas middleware

## Introduction

**Chain of Responsibility** fait passer une requête le long d’une chaîne de handlers.

## Concept

```ts
type Handler<T> = (ctx: T, next: () => Promise<void>) => Promise<void>;

async function runChain<T>(ctx: T, handlers: Handler<T>[]) {
  let i = 0;
  const next = async (): Promise<void> => {
    const h = handlers[i++];
    if (h) await h(ctx, next);
  };
  await next();
}
```

## Exemple

Middlewares HTTP Express/Nest, pipelines de validation.

## Comment ça fonctionne

Chaque handler décide de continuer (`next`) ou d’arrêter. Le type `T` du contexte est partagé.

## Erreurs fréquentes

- Oublier d’appeler next
- Contexte any mutable chaotique

## À retenir

- Handler + next
- Contexte typé
- Ordre de chaîne

## Exercices

1. Un handler log puis appelle next.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   const log: Handler<Ctx> = async (ctx, next) => {
     console.log(ctx);
     await next();
   };
   ```
   :::

## Questions d'entretien

1. Lien entre middlewares HTTP et Chain of Responsibility ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Les middlewares forment une chaîne où chaque maillon traite la requête/réponse et délègue au suivant — une instance du pattern Chain of Responsibility.
   :::
