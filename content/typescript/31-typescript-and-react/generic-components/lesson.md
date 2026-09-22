---
id: typescript-31-generic-components
title: Generic components
slug: generic-components
technology: typescript
level: advanced
module: 31-typescript-and-react
order: 15
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-31-custom-hooks]
skills: [react]
tags: [typescript, react, generics]
---

## Objectifs

- Écrire des composants génériques
- Lier props items / renderItem
- Préserver le type des éléments

## Introduction

Les composants génériques adaptent leurs props au type des données.

## Concept

```tsx
type ListProps<T> = {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
};

function List<T>({ items, renderItem }: ListProps<T>) {
  return <ul>{items.map((item, i) => <li key={i}>{renderItem(item)}</li>)}</ul>;
}

<List items={users} renderItem={(u) => u.name} />
```

## Exemple

Select générique, Table, Autocomplete…

## Comment ça fonctionne

`T` est inféré depuis `items`. `renderItem` reçoit le bon type.

## Erreurs fréquentes

- Perdre T en annotant mal
- key manquante / index only

## À retenir

- function Comp<T>(props: Props<T>)
- Inférence depuis les données
- render props typées

## Exercices

1. Esquisse SelectProps<T> avec options: T[] et onChange: (v: T) => void.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type SelectProps<T> = {
     options: T[];
     onChange: (value: T) => void;
   };
   ```
   :::

## Questions d'entretien

1. À quoi servent les composants React génériques ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   À réutiliser une UI (liste, select, table) tout en préservant le type précis des données et des callbacks, via un paramètre de type T.
   :::
