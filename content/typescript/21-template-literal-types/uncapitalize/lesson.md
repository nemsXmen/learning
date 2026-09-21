---
id: typescript-21-uncapitalize
title: Uncapitalize
slug: uncapitalize
technology: typescript
level: advanced
module: 21-template-literal-types
order: 11
estimatedMinutes: 8
difficulty: 1
xp: 30
prerequisites: [typescript-21-capitalize]
skills: [template-literal-types]
tags: [typescript, template-literal-types]
---

## Objectifs

- Utiliser `Uncapitalize`
- Dé-capitaliser la première lettre
- Cas inverses de Capitalize

## Introduction

`Uncapitalize<S>` met la première lettre en minuscule.

## Concept

```ts
type A = Uncapitalize<"Hello">; // "hello"
type B = Uncapitalize<"Click" | "Change">; // "click" | "change"
```

## Exemple

```ts
type FromHandler<H extends string> =
  H extends `on${infer E}` ? Uncapitalize<E> : never;
type E = FromHandler<"onClick">; // "click"
```

## Comment ça fonctionne

Inverse de Capitalize sur le premier caractère.

## Erreurs fréquentes

- L’appliquer quand on voulait Lowercase complet

## À retenir

- `Uncapitalize<S>`
- Parsing inverse onX → event
- Pair avec Capitalize

## Exercices

1. Transforme `"UserName"` en `"userName"`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type T = Uncapitalize<"UserName">; // "userName"
   ```
   :::

## Questions d'entretien

1. Quand utiliser Uncapitalize plutôt que Lowercase ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Quand on ne veut modifier que la première lettre (ex. `UserName` → `userName`), pas toute la chaîne (`USERNAME` → `username` via Lowercase).
   :::
