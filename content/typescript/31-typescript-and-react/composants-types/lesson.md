---
id: typescript-31-composants-types
title: Composants typés
slug: composants-types
technology: typescript
level: intermediate
module: 31-typescript-and-react
order: 2
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-31-react-plus-typescript]
skills: [react]
tags: [typescript, react]
---

## Objectifs

- Déclarer un composant fonctionnel typé
- Typer le retour JSX
- Voir FC vs annotation manuelle

## Introduction

Un composant React typé déclare explicitement ses **props**.

## Concept

```tsx
type ButtonProps = {
  label: string;
  onClick?: () => void;
};

function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}
```

## Exemple

```tsx
const Button = ({ label }: ButtonProps): JSX.Element => (
  <button>{label}</button>
);
```

`React.FC` est optionnel et parfois déconseillé (children implicite selon versions).

## Comment ça fonctionne

Les props sont un objet typé. TypeScript vérifie les usages `<Button label="Ok" />`.

## Erreurs fréquentes

- Props non typées → any implicite
- Abuser de React.FC sans besoin

## À retenir

- type/interface Props
- Destructure typée
- JSX.Element optionnel

## Exercices

1. Type un composant Title avec prop text: string.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```tsx
   type TitleProps = { text: string };
   function Title({ text }: TitleProps) {
     return <h1>{text}</h1>;
   }
   ```
   :::

## Questions d'entretien

1. Comment types-tu un composant fonctionnel React ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En définissant un type/interface de props et en annotant les paramètres de la fonction. Le retour est généralement inféré comme JSX.Element.
   :::
