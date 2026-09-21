---
id: typescript-23-declare
title: declare
slug: declare
technology: typescript
level: intermediate
module: 23-declaration-files
order: 3
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-23-ambient-declarations]
skills: [declaration-files]
tags: [typescript, declare]
---

## Objectifs

- Maîtriser le mot-clé `declare`
- L’appliquer à var, function, class, module
- Comprendre qu’il n’émet rien

## Introduction

`declare` marque une déclaration ambient.

## Concept

```ts
declare let API_URL: string;
declare function fetchUser(id: string): Promise<User>;
declare class LegacyWidget {
  constructor(id: string);
  render(): void;
}
declare module "legacy-lib" {
  export function start(): void;
}
```

## Exemple

Dans un `.d.ts` ou un script ambient, `declare` est omniprésent.

## Comment ça fonctionne

Le compilateur enregistre le type et n’émet aucune ligne JS pour cette déclaration.

## Erreurs fréquentes

- Utiliser `declare` dans un module TS avec implémentation (souvent inutile / confus)

## À retenir

- `declare` = « existe déjà »
- Pas d’émission JS
- var / function / class / module / namespace

## Exercices

1. Déclare une fonction globale `track(event: string): void`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   declare function track(event: string): void;
   ```
   :::

## Questions d'entretien

1. Que signifie le mot-clé `declare` en TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Qu’on déclare l’existence d’une entité (variable, fonction, classe, module…) déjà fournie à runtime, sans en donner l’implémentation dans ce fichier. Rien n’est émis en JavaScript pour cette déclaration.
   :::
