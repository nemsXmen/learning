---
id: typescript-17-composition-de-types-avances
title: Composition de types avancés
slug: composition-de-types-avances
technology: typescript
level: advanced
module: 17-advanced-types
order: 12
estimatedMinutes: 15
difficulty: 3
xp: 55
prerequisites: [typescript-17-transformations-de-types]
skills: [advanced-types]
tags: [typescript, advanced-types]
---

## Objectifs

- Composer conditionals, mapped types et template literals
- Construire des types d’API avancés
- Garder la composition lisible

## Introduction

La puissance de TypeScript apparaît quand on **compose** les outils avancés.

## Concept

```ts
type EventHandlers<T extends Record<string, any>> = {
  [K in keyof T as `on${Capitalize<string & K>}`]?: (value: T[K]) => void;
};

type Person = { name: string; age: number };
type PersonEvents = EventHandlers<Person>;
// { onName?: (value: string) => void; onAge?: (value: number) => void }
```

## Exemple

```ts
type Routes = {
  home: { path: "/"; params: never };
  user: { path: "/users/:id"; params: { id: string } };
};

type RouteName = keyof Routes;
type ParamsOf<R extends RouteName> = Routes[R]["params"];
```

## Comment ça fonctionne

On enchaîne keyof, mapped types, template literals, conditional types et indexed access pour dériver des types cohérents à partir d’une source unique.

## Erreurs fréquentes

- Types monolithiques illisibles
- Duplication de la source de vérité

## À retenir

- Une source de vérité + transformations
- Composer les outils plutôt que tout écrire à la main
- Nommer les étapes intermédiaires

## Exercices

1. À partir d’un type `{ click: MouseEvent; submit: Event }`, dérive des handlers `onClick` / `onSubmit`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type Events = { click: MouseEvent; submit: Event };
   type Handlers = {
     [K in keyof Events as `on${Capitalize<string & K>}`]: (e: Events[K]) => void;
   };
   ```
   :::

## Questions d'entretien

1. Comment conçois-tu des types avancés maintenables ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En partant d’une source de vérité unique (objet de config, map de routes…), en composant des transformations standard (mapped, conditional, template literals), et en nommant les types intermédiaires pour préserver la lisibilité.
   :::
