---
id: typescript-31-useref
title: useRef
slug: useref
technology: typescript
level: intermediate
module: 31-typescript-and-react
order: 9
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-31-usereducer]
skills: [react]
tags: [typescript, react, hooks]
---

## Objectifs

- Typer useRef pour le DOM
- Typer useRef pour valeurs mutables
- Gérer null initial

## Introduction

`useRef` sert aux refs DOM et aux boîtes mutables.

## Concept

```tsx
const inputRef = useRef<HTMLInputElement>(null);
// inputRef.current: HTMLInputElement | null

function focus() {
  inputRef.current?.focus();
}

return <input ref={inputRef} />;
```

```tsx
const renders = useRef(0); // number, current mutable
renders.current += 1;
```

## Exemple

Attention : `useRef<T>(null)` vs `useRef<T | null>(null)` selon le mode strict de refs.

## Comment ça fonctionne

Le générique fixe le type de `current`. Pour le DOM, null initial est standard.

## Erreurs fréquentes

- useRef() sans générique → never / any selon contexte
- Accéder à current sans optional chaining

## À retenir

- useRef<HTMLInputElement>(null)
- current | null pour DOM
- Mutable box typée

## Exercices

1. Ref sur un HTMLDivElement.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```tsx
   const ref = useRef<HTMLDivElement>(null);
   ```
   :::

## Questions d'entretien

1. Pourquoi `useRef<HTMLInputElement>(null)` plutôt que sans générique ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Pour que `current` soit typé comme `HTMLInputElement | null` et exposer focus/value de façon type-safe après null check.
   :::
