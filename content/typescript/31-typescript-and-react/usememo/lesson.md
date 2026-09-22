---
id: typescript-31-usememo
title: useMemo
slug: usememo
technology: typescript
level: intermediate
module: 31-typescript-and-react
order: 11
estimatedMinutes: 8
difficulty: 2
xp: 35
prerequisites: [typescript-31-useeffect]
skills: [react]
tags: [typescript, react, hooks]
---

## Objectifs

- Typer useMemo
- Laisser l’inférence travailler
- Éviter les sur-mémos

## Introduction

`useMemo<T>` mémorise une valeur calculée.

## Concept

```tsx
const total = useMemo(() => items.reduce((a, b) => a + b.price, 0), [items]);
// number inféré
```

```tsx
const view = useMemo<ViewModel>(() => build(items), [items]);
```

## Exemple

Utile pour objets/tableaux passés à des enfants mémoïsés.

## Comment ça fonctionne

Le générique est souvent inféré depuis le return du callback.

## Erreurs fréquentes

- useMemo partout sans mesure
- deps incorrectes

## À retenir

- Inférence du type de valeur
- deps complètes
- Perf mesurée

## Exercices

1. Mémorise une liste filtrée typée Product[].

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```tsx
   const visible = useMemo(
     () => products.filter((p) => p.active),
     [products]
   );
   ```
   :::

## Questions d'entretien

1. useMemo change-t-il le système de types ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Non de façon fondamentale : il conserve le type de la valeur calculée. C’est une optimisation runtime, pas un outil de typage.
   :::
