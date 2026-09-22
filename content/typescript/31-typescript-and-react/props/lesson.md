---
id: typescript-31-props
title: Props
slug: props
technology: typescript
level: intermediate
module: 31-typescript-and-react
order: 3
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-31-composants-types]
skills: [react]
tags: [typescript, react]
---

## Objectifs

- Modéliser des props optionnelles et requises
- Utiliser des unions et littéraux
- Étendre des props HTML

## Introduction

Les **props** sont le contrat d’entrée du composant.

## Concept

```tsx
type AlertProps = {
  variant: "info" | "warning" | "error";
  message: string;
  dismissible?: boolean;
};

type ButtonProps = React.ComponentProps<"button"> & {
  loading?: boolean;
};
```

## Exemple

```tsx
function Alert({ variant, message, dismissible = false }: AlertProps) {
  return <div data-variant={variant}>{message}</div>;
}
```

## Comment ça fonctionne

`?` rend optionnel. Les unions de littéraux documentent les variantes. `ComponentProps<"button">` réutilise les attributs natifs.

## Erreurs fréquentes

- Tout optionnel sans défauts
- Dupliquer les attributs HTML à la main

## À retenir

- Requises vs optionnelles
- Unions de variantes
- ComponentProps pour le native

## Exercices

1. Props d’un Badge avec tone: "neutral" | "success".

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type BadgeProps = { tone: "neutral" | "success"; children: React.ReactNode };
   ```
   :::

## Questions d'entretien

1. Comment réutilises-tu les props natives d’un bouton ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Avec `React.ComponentProps<"button">` (ou `ComponentPropsWithoutRef`) croisé (`&`) avec les props custom du design system.
   :::
