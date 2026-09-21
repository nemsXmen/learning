---
id: typescript-31-children
title: children
slug: children
technology: typescript
level: intermediate
module: 31-typescript-and-react
order: 4
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-31-props]
skills: [react]
tags: [typescript, react]
---

## Objectifs

- Typer `children`
- Connaître ReactNode vs ReactElement
- Limiter les children si besoin

## Introduction

`children` représente le contenu imbriqué d’un composant.

## Concept

```tsx
type CardProps = {
  title: string;
  children: React.ReactNode;
};

function Card({ title, children }: CardProps) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
```

## Exemple

```tsx
children: React.ReactElement; // un seul élément
children: string; // texte seulement
```

## Comment ça fonctionne

`ReactNode` accepte éléments, strings, numbers, arrays, null, etc. Plus strict = `ReactElement` ou types custom.

## Erreurs fréquentes

- Oublier de déclarer children alors qu’on l’utilise
- Typer children en any

## À retenir

- ReactNode = large et courant
- Affiner si le design l’exige
- Props explicites > FC implicite

## Exercices

1. Type Layout avec children: React.ReactNode.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type LayoutProps = { children: React.ReactNode };
   ```
   :::

## Questions d'entretien

1. ReactNode vs ReactElement pour children ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   `ReactNode` est large (texte, fragments, tableaux, null…). `ReactElement` n’accepte qu’un élément React. On choisit selon la flexibilité voulue.
   :::
