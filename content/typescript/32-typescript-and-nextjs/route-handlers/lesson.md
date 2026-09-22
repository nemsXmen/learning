---
id: typescript-32-route-handlers
title: Route Handlers
slug: route-handlers
technology: typescript
level: intermediate
module: 32-typescript-and-nextjs
order: 9
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-32-server-actions]
skills: [nextjs]
tags: [typescript, nextjs]
---

## Objectifs

- Typer les Route Handlers (app/api)
- Utiliser Request / Response
- Valider body et params

## Introduction

Les **Route Handlers** exposent des endpoints HTTP sous `app/api/**/route.ts`.

## Concept

```tsx
// app/api/hello/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "hello" });
}

export async function POST(request: Request) {
  const body: unknown = await request.json();
  // valider body
  return NextResponse.json({ ok: true }, { status: 201 });
}
```

## Exemple

```tsx
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return NextResponse.json({ id });
}
```

## Comment ça fonctionne

Handlers nommés HTTP (GET, POST…). Types Web Fetch API + helpers Next.

## Erreurs fréquentes

- as Body sans validation
- Oublier les status codes

## À retenir

- route.ts
- Request / NextResponse
- unknown → validate

## Exercices

1. Écris un GET qui retourne { ok: true }.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   export async function GET() {
     return NextResponse.json({ ok: true });
   }
   ```
   :::

## Questions d'entretien

1. Comment types-tu le body d’un POST Route Handler ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En le lisant comme `unknown` (`await request.json()`), puis en le validant avec un schema avant usage typé.
   :::
