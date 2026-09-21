---
id: typescript-31-useeffect
title: useEffect
slug: useeffect
technology: typescript
level: intermediate
module: 31-typescript-and-react
order: 10
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-31-useref]
skills: [react]
tags: [typescript, react, hooks]
---

## Objectifs

- Typer les effets (peu de surprises)
- Gérer cleanup
- Éviter les dépendances any

## Introduction

`useEffect` lui-même est simple à typer ; la difficulté est le **contenu** et les deps.

## Concept

```tsx
useEffect(() => {
  let cancelled = false;
  async function load() {
    const user = await getUser(id);
    if (!cancelled) setUser(user);
  }
  load();
  return () => {
    cancelled = true;
  };
}, [id]);
```

## Exemple

Cleanup : `() => void` ou `() => Destructor`.

## Comment ça fonctionne

Le callback ne doit pas être async directement (retourne une Promise ≠ cleanup). Wrapper async à l’intérieur.

## Erreurs fréquentes

- useEffect(async () => ...)
- deps manquantes (eslint exhaustive-deps)

## À retenir

- Pas async direct
- cleanup typé void
- deps correctes

## Exercices

1. Pourquoi ne pas passer async directement à useEffect ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Parce que la fonction async retourne une Promise, alors que React attend void ou une fonction de cleanup.
   :::

## Questions d'entretien

1. Comment gères-tu un fetch dans useEffect en TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Fonction async interne, gestion d’annulation/cancelled flag, setState typé, et tableau de dépendances complet. Le type de la donnée vient du helper de fetch/validation.
   :::
