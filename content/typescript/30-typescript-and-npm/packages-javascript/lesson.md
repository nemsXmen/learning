---
id: typescript-30-packages-javascript
title: Packages JavaScript
slug: packages-javascript
technology: typescript
level: intermediate
module: 30-typescript-and-npm
order: 5
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-30-packages-typescript-natifs]
skills: [npm]
tags: [typescript, npm]
---

## Objectifs

- Consommer une lib JS pure en TypeScript
- Choisir @types ou declare module
- Gérer l’absence de types

## Introduction

De nombreuses libs restent en **JavaScript** sans types officiels.

## Concept

Options :
1. Installer `@types/lib` si disponible
2. Écrire un `declare module "lib" { ... }` local
3. `// @ts-ignore` / any (dernier recours)

```ts
// local-types/legacy.d.ts
declare module "legacy-lib" {
  export function start(): void;
}
```

## Exemple

Permet d’importer sans erreur TS tout en documentant l’API utilisée.

## Comment ça fonctionne

Les ambient modules comblent le trou de types. Idéalement contribuer à DefinitelyTyped ensuite.

## Erreurs fréquentes

- any sur tout le module sans déclaration minimale
- Types locaux trop optimistes

## À retenir

- @types d’abord
- declare module sinon
- Contribuer / upstream types

## Exercices

1. Déclare un module "acme-utils" avec export function clamp(...): number.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   declare module "acme-utils" {
     export function clamp(n: number, min: number, max: number): number;
   }
   ```
   :::

## Questions d'entretien

1. Comment intègres-tu une lib JS non typée dans un projet TS ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Je cherche `@types`, sinon j’ajoute un `declare module` minimal pour l’API utilisée, et j’évite `any` global. À terme, types officiels ou contribution DefinitelyTyped.
   :::
