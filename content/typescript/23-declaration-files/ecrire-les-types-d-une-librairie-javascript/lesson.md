---
id: typescript-23-ecrire-les-types-d-une-librairie-javascript
title: Écrire les types d’une librairie JavaScript
slug: ecrire-les-types-d-une-librairie-javascript
technology: typescript
level: intermediate
module: 23-declaration-files
order: 10
estimatedMinutes: 15
difficulty: 3
xp: 55
prerequisites: [typescript-23-at-types]
skills: [declaration-files]
tags: [typescript, declaration-files]
---

## Objectifs

- Décrire une démarche pour typer une lib JS
- Structurer un .d.ts de qualité
- Publier ou contribuer les types

## Introduction

Typer une lib JS existante est une compétence pratique (interne ou open source).

## Concept – démarche

1. Identifier les points d’entrée (exports)
2. Décrire les fonctions / classes / types publics
3. Ajouter generics et overloads utiles
4. Tester contre des usages réels
5. Documenter les edge cases

```ts
// my-lib.d.ts
declare module "my-lib" {
  export interface Options {
    verbose?: boolean;
  }
  export function init(options?: Options): void;
  export function run<T>(input: T): Promise<T>;
  export class Client {
    constructor(url: string);
    fetch(path: string): Promise<unknown>;
  }
}
```

## Exemple – publication

- Types dans le package (`types` dans package.json)
- Ou contribution à DefinitelyTyped



## Concept

Ce concept s’appuie sur les notions présentées dans cette leçon.

## Exemple

Consulte les exemples de code de cette leçon pour appliquer la notion.

## Comment ça fonctionne

Les consommateurs obtiennent autocomplétion et sécurité sans réécrire la lib.

## Erreurs fréquentes

- Types trop lâches (`any` partout)
- Types trop stricts qui cassent les usages légitimes
- Oublier le default export

## À retenir

- Partir des usages réels
- API publique d’abord
- Itérer avec les consommateurs
- Prefer types shipped with the lib when possible

## Exercices

1. Esquisse un `declare module "counter-js"` avec `create(): { inc(): void; value(): number }`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   declare module "counter-js" {
     export function create(): {
       inc(): void;
       value(): number;
     };
   }
   ```
   :::

## Questions d'entretien

1. Comment abordes-tu l’écriture de types pour une lib JavaScript tierce ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   J’identifie les exports publics, je décris signatures et types à partir des usages réels, j’ajoute generics/overloads pertinents, je teste contre le code consommateur, et je préfère des types précis sans bloquer les cas légitimes. Ensuite publication dans le package ou sur DefinitelyTyped.
   :::
