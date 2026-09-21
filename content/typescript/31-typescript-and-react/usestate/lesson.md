---
id: typescript-31-usestate
title: useState
slug: usestate
technology: typescript
level: intermediate
module: 31-typescript-and-react
order: 7
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-31-forms]
skills: [react]
tags: [typescript, react, hooks]
---

## Objectifs

- Typer useState
- S’appuyer sur l’inférence
- Gérer null / unions

## Introduction

`useState` est générique : `useState<S>(initial)`.

## Concept

```tsx
const [count, setCount] = useState(0); // number inféré
const [user, setUser] = useState<User | null>(null);
const [items, setItems] = useState<string[]>([]);
```

## Exemple

```tsx
setUser({ id: "1", name: "Ada" });
setUser(null);
```

## Comment ça fonctionne

Si l’initial est assez précis, T est inféré. Sinon on annote (null initial, tableaux vides…).

## Erreurs fréquentes

- useState([]) → never[] surprise
- Oublier | null pour données absentes

## À retenir

- Annoter si inférence insuffisante
- Unions pour états vides
- Setter respecte T

## Exercices

1. State User | null initialisé à null.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```tsx
   const [user, setUser] = useState<User | null>(null);
   ```
   :::

## Questions d'entretien

1. Pourquoi `useState([])` pose-t-il problème ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   TypeScript peut inférer `never[]`. Il faut `useState<Item[]>([])` pour autoriser les éléments ensuite.
   :::
