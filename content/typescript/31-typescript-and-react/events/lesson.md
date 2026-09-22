---
id: typescript-31-events
title: Events
slug: events
technology: typescript
level: intermediate
module: 31-typescript-and-react
order: 5
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-31-children]
skills: [react]
tags: [typescript, react, events]
---

## Objectifs

- Typer les event handlers React
- Utiliser ChangeEvent, MouseEvent, FormEvent
- Annoter les callbacks en props

## Introduction

React fournit des types d’événements synthétiques.

## Concept

```tsx
function Search() {
  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    console.log(e.target.value);
  }
  return <input onChange={onChange} />;
}
```

```tsx
type Props = {
  onSave: (e: React.MouseEvent<HTMLButtonElement>) => void;
};
```

## Exemple

```tsx
function onSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
}
```

## Comment ça fonctionne

`React.ChangeEvent<T>`, `MouseEvent<T>`, `KeyboardEvent<T>` paramètrent l’élément cible.

## Erreurs fréquentes

- e: any
- Confondre event DOM natif et SyntheticEvent (souvent transparent)

## À retenir

- ChangeEvent / MouseEvent / FormEvent
- Paramètre d’élément générique
- Handlers en props typés

## Exercices

1. Type un onClick de bouton en MouseEvent.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {};
   ```
   :::

## Questions d'entretien

1. Comment types-tu un onChange d’input en React TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   `(e: React.ChangeEvent<HTMLInputElement>) => void` — ce qui donne un `e.target` typé comme HTMLInputElement.
   :::
