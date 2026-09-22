---
id: typescript-28-event
title: Event
slug: event
technology: typescript
level: intermediate
module: 28-typescript-and-dom
order: 5
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-28-htmlformelement]
skills: [dom]
tags: [typescript, dom, events]
---

## Objectifs

- Connaître le type `Event`
- Utiliser target, currentTarget, preventDefault
- Voir la base des événements

## Introduction

`Event` est l’interface de base de tous les événements DOM.

## Concept

```ts
function onClick(e: Event) {
  e.preventDefault();
  e.target; // EventTarget | null
  e.currentTarget;
  e.type;
}
```

## Exemple

```ts
el.addEventListener("click", (e: Event) => {
  console.log(e.type);
});
```

## Comment ça fonctionne

`target` est l’élément d’origine ; `currentTarget` celui auquel le listener est attaché. Souvent trop large → affiner (MouseEvent…).

## Erreurs fréquentes

- (e.target as HTMLInputElement) sans check
- Confondre target et currentTarget

## À retenir

- Event = base
- preventDefault / stopPropagation
- Affiner vers MouseEvent, KeyboardEvent…

## Exercices

1. Dans un listener, appelle preventDefault sur e: Event.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   el.addEventListener("click", (e: Event) => {
     e.preventDefault();
   });
   ```
   :::

## Questions d'entretien

1. target vs currentTarget ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   `target` est l’élément qui a originé l’événement ; `currentTarget` est l’élément sur lequel le handler est enregistré (peut différer avec la délégation d’événements).
   :::
