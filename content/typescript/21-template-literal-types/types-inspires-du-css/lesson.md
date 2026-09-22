---
id: typescript-21-types-inspires-du-css
title: Types inspirés du CSS
slug: types-inspires-du-css
technology: typescript
level: advanced
module: 21-template-literal-types
order: 7
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-21-api-route-types]
skills: [template-literal-types]
tags: [typescript, template-literal-types, css]
---

## Objectifs

- Modéliser des valeurs CSS en types
- Typer des unités et des classes
- Voir des patterns UI

## Introduction

Les template literals collent bien aux valeurs CSS structurées.

## Concept

```ts
type CssUnit = "px" | "em" | "rem" | "%";
type CssLength = `${number}${CssUnit}`;

type Color = "primary" | "secondary" | "danger";
type ColorClass = `text-${Color}` | `bg-${Color}`;
// "text-primary" | "bg-primary" | ...
```

## Exemple

```ts
type Spacing = 0 | 1 | 2 | 4 | 8;
type Margin = `m-${Spacing}` | `mx-${Spacing}` | `my-${Spacing}`;
```

## Comment ça fonctionne

On encode les conventions de naming CSS (BEM, utilities Tailwind-like) dans le système de types.

## Erreurs fréquentes

- Vouloir tout le CSS en types (trop large)
- number non littéral trop permissif

## À retenir

- Unités + classes utilitaires
- Design system typé
- Rester pragmatique (pas tout le CSS)

## Exercices

1. Type `p-0` | `p-1` | `p-2` à partir de 0 | 1 | 2.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type Pad = `p-${0 | 1 | 2}`;
   ```
   :::

## Questions d'entretien

1. Comment les template literal types aident-ils un design system ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En typant les classes utilitaires, unités et tokens (couleurs, spacing) pour que seules les combinaisons valides soient acceptées, avec autocomplétion.
   :::
