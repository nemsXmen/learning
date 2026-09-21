---
id: typescript-28-htmlformelement
title: HTMLFormElement
slug: htmlformelement
technology: typescript
level: intermediate
module: 28-typescript-and-dom
order: 4
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-28-htmlinputelement]
skills: [dom]
tags: [typescript, dom]
---

## Objectifs

- Typer les formulaires
- Utiliser elements, submit
- Accéder aux champs

## Introduction

`HTMLFormElement` représente une balise `<form>`.

## Concept

```ts
const form = document.querySelector("form");
if (form instanceof HTMLFormElement) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
  });
}
```

## Exemple

```ts
form.elements.namedItem("email"); // Element | RadioNodeList | null
```

## Comment ça fonctionne

`FormData`, `elements`, `submit()`, `reset()` font partie de l’API typée.

## Erreurs fréquentes

- Oublier preventDefault
- Accès non null-safe aux champs

## À retenir

- HTMLFormElement
- FormData pour lire les valeurs
- submit event

## Exercices

1. Sur submit, preventDefault et crée un FormData.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   form.addEventListener("submit", (e) => {
     e.preventDefault();
     const data = new FormData(form);
   });
   ```
   :::

## Questions d'entretien

1. Comment lis-tu les valeurs d’un formulaire de façon typée ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Souvent via FormData après submit, ou en ciblant chaque champ comme HTMLInputElement. Les libs de formulaires (React Hook Form…) ajoutent une couche de typage supplémentaire.
   :::
