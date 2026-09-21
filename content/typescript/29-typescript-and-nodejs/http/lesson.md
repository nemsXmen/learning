---
id: typescript-29-http
title: http
slug: http
technology: typescript
level: intermediate
module: 29-typescript-and-nodejs
order: 6
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-29-path]
skills: [nodejs]
tags: [typescript, nodejs, http]
---

## Objectifs

- Typer un serveur http basique
- Connaître IncomingMessage et ServerResponse
- Voir les bases avant frameworks

## Introduction

Le module `http` de Node est entièrement typé via `@types/node`.

## Concept

```ts
import http from "http";

const server = http.createServer((req, res) => {
  // req: http.IncomingMessage
  // res: http.ServerResponse
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("ok");
});

server.listen(3000);
```

## Exemple

```ts
req.method; // string | undefined
req.url; // string | undefined
```

## Comment ça fonctionne

Les callbacks reçoivent des objets typés. Pour un usage réel, on s’appuie souvent sur Express, Fastify, Hono… qui ajoutent leurs propres types.

## Erreurs fréquentes

- Ignorer method/url undefined
- Parser le body sans lib / validation

## À retenir

- IncomingMessage / ServerResponse
- createServer typé
- Frameworks pour la prod

## Exercices

1. Crée un serveur qui répond "hello" en text/plain.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   http.createServer((req, res) => {
     res.setHeader("Content-Type", "text/plain");
     res.end("hello");
   }).listen(3000);
   ```
   :::

## Questions d'entretien

1. Quels types principaux interviennent dans http.createServer ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Le handler reçoit `IncomingMessage` (requête) et `ServerResponse` (réponse), définis dans les types Node.
   :::
