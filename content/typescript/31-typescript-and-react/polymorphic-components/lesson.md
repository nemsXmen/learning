---
id: typescript-31-polymorphic-components
title: Polymorphic components
slug: polymorphic-components
technology: typescript
level: advanced
module: 31-typescript-and-react
order: 16
estimatedMinutes: 15
difficulty: 3
xp: 55
prerequisites: [typescript-31-generic-components]
skills: [react]
tags: [typescript, react]
---

## Objectifs

- Comprendre les composants polymorphes (`as`)
- Typer la prop `as`
- Combiner avec ComponentPropsWithoutRef

## Introduction

Un composant **polymorphe** peut rendre différents éléments (`button`, `a`, `div`…) tout en restant typé.

## Concept

```tsx
type BoxProps<T extends React.ElementType> = {
  as?: T;
  children?: React.ReactNode;
} & React.ComponentPropsWithoutRef<T>;

function Box<T extends React.ElementType = "div">({
  as,
  children,
  ...rest
}: BoxProps<T>) {
  const Component = as || "div";
  return <Component {...rest}>{children}</Component>;
}

<Box as="a" href="/">Home</Box>
<Box as="button" type="button">Ok</Box>
```

## Exemple

Design systems : Text, Button as={Link}, etc.

## Comment ça fonctionne

`T` représente l’élément. `ComponentPropsWithoutRef<T>` apporte les props natives correspondantes (href pour a, type pour button).

## Erreurs fréquentes

- Props natives non liées à `as`
- Complexité excessive trop tôt

## À retenir

- as?: ElementType
- ComponentPropsWithoutRef
- Inférence selon as

## Exercices

1. Pourquoi href est-il accepté quand as="a" ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Parce que ComponentPropsWithoutRef<"a"> inclut href, et T est inféré à "a".
   :::

## Questions d'entretien

1. Comment types-tu un composant avec prop `as` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En le rendant générique sur `T extends ElementType`, en typant `as?: T`, et en croisant avec `ComponentPropsWithoutRef<T>` pour exposer les props natives du bon élément.
   :::
