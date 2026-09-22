---
id: typescript-28-keyboardevent
title: KeyboardEvent
slug: keyboardevent
technology: typescript
level: intermediate
module: 28-typescript-and-dom
order: 7
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-28-mouseevent]
skills: [dom]
tags: [typescript, dom, events]
---

## Objectifs

- Typer les événements clavier
- Utiliser key, code, modifiers
- Gérer keydown / keyup

## Introduction

`KeyboardEvent` décrit les interactions clavier.

## Concept

```ts
window.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key === "Escape") {
    closeModal();
  }
  if (e.ctrlKey && e.key === "s") {
    e.preventDefault();
    save();
  }
});
```

## Exemple

Préférer `e.key` (sémantique) à `e.keyCode` (déprécié).

## Comment ça fonctionne

`key` donne le caractère / nom de touche ; `code` la touche physique.

## Erreurs fréquentes

- Utiliser keyCode
- Oublier preventDefault sur les raccourcis

## À retenir

- KeyboardEvent
- key / code
- ctrlKey, metaKey, shiftKey, altKey

## Exercices

1. Ferme une modale sur Escape.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   window.addEventListener("keydown", (e: KeyboardEvent) => {
     if (e.key === "Escape") closeModal();
   });
   ```
   :::

## Questions d'entretien

1. key vs code sur KeyboardEvent ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   `key` est la valeur sémantique (ex. "a", "Escape"). `code` identifie la touche physique (ex. "KeyA"), utile pour les layouts clavier variables.
   :::
