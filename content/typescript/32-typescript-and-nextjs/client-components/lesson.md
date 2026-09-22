---
id: typescript-32-client-components
title: Client Components
slug: client-components
technology: typescript
level: intermediate
module: 32-typescript-and-nextjs
order: 7
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-32-server-components]
skills: [nextjs]
tags: [typescript, nextjs]
---

## Objectifs

- Déclarer un Client Component
- Savoir quand l’utiliser
- Typer hooks et events

## Introduction

Les **Client Components** s’exécutent aussi sur le client (interactivité).

## Concept

```tsx
"use client";

import { useState } from "react";

export function Counter() {
  const [n, setN] = useState(0);
  return <button onClick={() => setN(n + 1)}>{n}</button>;
}
```

## Exemple

Directives `"use client"` en tête de fichier. Tout enfant importé devient partie du graphe client.

## Comment ça fonctionne

Même typage React TS. Limite : ne pas importer de code serveur sensible dans un client component.

## Erreurs fréquentes

- "use client" partout sans besoin
- Importer fs/db dans un client component

## À retenir

- "use client"
- Hooks OK
- Surface client minimale

## Exercices

1. Où place-t-on la directive "use client" ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   En première ligne du fichier composant.
   :::

## Questions d'entretien

1. Quand passer en Client Component ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Dès qu’on a besoin d’état local, d’effects, d’handlers navigateur ou d’APIs browser-only. Sinon rester Server Component pour réduire le JS client.
   :::
