---
id: typescript-31-usereducer
title: useReducer
slug: usereducer
technology: typescript
level: intermediate
module: 31-typescript-and-react
order: 8
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-31-usestate]
skills: [react]
tags: [typescript, react, hooks]
---

## Objectifs

- Typer state et actions de useReducer
- Utiliser des unions discriminées d’actions
- Garantir l’exhaustivité du reducer

## Introduction

`useReducer` brille avec des **actions typées**.

## Concept

```tsx
type State = { count: number };
type Action =
  | { type: "increment" }
  | { type: "decrement" }
  | { type: "set"; value: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
    case "set":
      return { count: action.value };
    default: {
      const _exhaustive: never = action;
      return state;
    }
  }
}
```

## Exemple

```tsx
const [state, dispatch] = useReducer(reducer, { count: 0 });
dispatch({ type: "set", value: 10 });
```

## Comment ça fonctionne

L’union d’actions + switch permet à TypeScript d’affiner le payload par cas.

## Erreurs fréquentes

- Actions en string non discriminées
- Oublier le retour State

## À retenir

- Action = union discriminée
- reducer: (State, Action) => State
- default never

## Exercices

1. Ajoute une action { type: "reset" } au type Action.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   | { type: "reset" }
   ```
   :::

## Questions d'entretien

1. Pourquoi une union discriminée pour les actions ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Pour que chaque `action.type` affine le reste du payload et que le reducer soit exhaustif et type-safe.
   :::
