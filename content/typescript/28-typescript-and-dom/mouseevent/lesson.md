---
id: typescript-28-mouseevent
title: MouseEvent
slug: mouseevent
technology: typescript
level: intermediate
module: 28-typescript-and-dom
order: 6
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-28-event]
skills: [dom]
tags: [typescript, dom, events]
---

## Objectifs

- Typer les événements souris
- Utiliser clientX, button, etc.
- Lier click / mousemove

## Introduction

`MouseEvent` étend `Event` avec les infos pointeur.

## Concept

```ts
el.addEventListener("click", (e: MouseEvent) => {
  console.log(e.clientX, e.clientY);
  console.log(e.button);
  console.log(e.ctrlKey);
});
```

## Exemple

```ts
function onMove(e: MouseEvent) {
  const x = e.clientX;
  const y = e.clientY;
}
```

## Comment ça fonctionne

addEventListener infère souvent le bon type d’event selon le nom (`"click"` → MouseEvent).

## Erreurs fréquentes

- Typer manuellement Event trop large
- Oublier que touch ≠ mouse (TouchEvent)

## À retenir

- MouseEvent pour click, mousemove…
- clientX/Y, button, modifiers
- Inférence via le nom d’event

## Exercices

1. Log clientX dans un handler click typé MouseEvent.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   el.addEventListener("click", (e: MouseEvent) => {
     console.log(e.clientX);
   });
   ```
   :::

## Questions d'entretien

1. Comment TypeScript sait-il que le handler de "click" reçoit un MouseEvent ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Grâce aux overload / mappings dans lib.dom.d.ts qui associent les noms d’événements aux interfaces d’event correspondantes.
   :::
