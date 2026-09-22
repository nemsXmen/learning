---
id: typescript-31-custom-hooks
title: Custom hooks
slug: custom-hooks
technology: typescript
level: intermediate
module: 31-typescript-and-react
order: 14
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-31-context]
skills: [react]
tags: [typescript, react, hooks]
---

## Objectifs

- Typer les hooks custom
- Déclarer entrées/sorties
- Réutiliser de la logique typée

## Introduction

Un **custom hook** est une fonction `useX` qui encapsule de la logique React typée.

## Concept

```tsx
function useToggle(initial = false): [boolean, () => void] {
  const [on, setOn] = useState(initial);
  const toggle = useCallback(() => setOn((v) => !v), []);
  return [on, toggle];
}
```

```tsx
function useUser(id: string): { user: User | null; loading: boolean } {
  // fetch + state...
}
```

## Exemple

Retour objet nommé souvent plus lisible qu’un tuple long.

## Comment ça fonctionne

Ce sont des fonctions TS normales + règles des hooks. Les génériques sont bienvenus (`useFetch<T>`).

## Erreurs fréquentes

- Retour any
- Conditional hooks

## À retenir

- Signature claire
- Tuple ou objet typé
- Génériques si besoin

## Exercices

1. Hook useBoolean → [value, setTrue, setFalse].

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```tsx
   function useBoolean(initial = false) {
     const [value, setValue] = useState(initial);
     return [value, () => setValue(true), () => setValue(false)] as const;
   }
   ```
   :::

## Questions d'entretien

1. Comment types-tu un custom hook ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Comme une fonction TypeScript : paramètres typés, type de retour explicite ou inféré (tuple/objet), génériques si le hook est abstrait (ex. useFetch<T>).
   :::
