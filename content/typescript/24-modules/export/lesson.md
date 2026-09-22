---
id: typescript-24-export
title: export
slug: export
technology: typescript
level: intermediate
module: 24-modules
order: 3
estimatedMinutes: 10
difficulty: 1
xp: 35
prerequisites: [typescript-24-import]
skills: [modules]
tags: [typescript, modules]
---

## Objectifs

- Exporter des valeurs et des types
- Voir export inline vs en fin de fichier
- Préparer named et default

## Introduction

`export` rend une déclaration accessible aux autres modules.

## Concept

```ts
export const PI = 3.14;
export function add(a: number, b: number) {
  return a + b;
}
export class Calculator {}
export type ID = string;
```

Ou :

```ts
const PI = 3.14;
function add(a: number, b: number) { return a + b; }
export { PI, add };
```

## Exemple

```ts
export { add as sum } from "./math";
```

## Comment ça fonctionne

Seules les déclarations exportées font partie de l’API publique du module.

## Erreurs fréquentes

- Oublier d’exporter
- Exporter trop (API trop large)

## À retenir

- export inline ou export { ... }
- Contrôle de l’API publique
- Types exportables aussi

## Exercices

1. Exporte une constante `VERSION = "1.0.0"`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   export const VERSION = "1.0.0";
   ```
   :::

## Questions d'entretien

1. Comment contrôles-tu l’API publique d’un module TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En n’exportant que ce qui doit être consommé de l’extérieur. Le reste reste privé au module (non exporté).
   :::
