---
id: typescript-31-usecallback
title: useCallback
slug: usecallback
technology: typescript
level: intermediate
module: 31-typescript-and-react
order: 12
estimatedMinutes: 8
difficulty: 2
xp: 35
prerequisites: [typescript-31-usememo]
skills: [react]
tags: [typescript, react, hooks]
---

## Objectifs

- Typer useCallback
- Stabiliser les handlers
- Combiner avec props de callbacks

## Introduction

`useCallback` mémorise une **fonction**.

## Concept

```tsx
const onSave = useCallback((id: string) => {
  save(id);
}, []);
```

```tsx
type Props = { onSelect: (id: string) => void };
```

## Exemple

Utile quand l’identité de la fonction impacte des enfants mémoïsés.

## Comment ça fonctionne

Les types des paramètres/retour sont inférés ou annotés sur la fonction passée.

## Erreurs fréquentes

- useCallback sans besoin réel
- deps oubliées → stale closure

## À retenir

- Signature de fonction typée
- deps correctes
- Perf ciblée

## Exercices

1. useCallback d’un handler (n: number) => void.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```tsx
   const onInc = useCallback((n: number) => {
     setX((x) => x + n);
   }, []);
   ```
   :::

## Questions d'entretien

1. useCallback vs useMemo pour une fonction ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   `useCallback(fn, deps)` est équivalent à `useMemo(() => fn, deps)` dédié aux callbacks. On l’utilise pour stabiliser l’identité d’une fonction.
   :::
