---
id: typescript-32-middleware
title: Middleware
slug: middleware
technology: typescript
level: intermediate
module: 32-typescript-and-nextjs
order: 10
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-32-route-handlers]
skills: [nextjs]
tags: [typescript, nextjs]
---

## Objectifs

- Typer le middleware Next
- Utiliser NextRequest / NextResponse
- Configurer le matcher

## Introduction

Le **middleware** s’exécute avant les routes (edge).

## Concept

```ts
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("session")?.value;
  if (!token && request.nextUrl.pathname.startsWith("/app")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"]
};
```

## Exemple

Auth gate, rewrites, headers.

## Comment ça fonctionne

`NextRequest` étend Request avec cookies, nextUrl, etc. Typage fourni par Next.

## Erreurs fréquentes

- Logique lourde / accès DB dans middleware edge
- matcher trop large

## À retenir

- NextRequest / NextResponse
- matcher
- Garder léger

## Exercices

1. Type le paramètre de middleware.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   export function middleware(request: NextRequest) {}
   ```
   :::

## Questions d'entretien

1. Que types-tu dans un middleware Next.js ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   La fonction reçoit `NextRequest` et retourne `NextResponse` (next, redirect, rewrite…). Le `config.matcher` filtre les chemins.
   :::
