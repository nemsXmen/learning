---
id: typescript-21-event-names-types
title: Event names typés
slug: event-names-types
technology: typescript
level: advanced
module: 21-template-literal-types
order: 4
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-21-noms-de-proprietes-dynamiques]
skills: [template-literal-types]
tags: [typescript, template-literal-types, events]
---

## Objectifs

- Typer des noms d’événements
- Générer onClick, onChange, etc.
- Lier event → payload

## Introduction

Les template literals typent proprement les systèmes d’événements.

## Concept

```ts
type Events = {
  click: MouseEvent;
  change: Event;
  submit: SubmitEvent;
};

type EventHandlers = {
  [K in keyof Events as `on${Capitalize<string & K>}`]?: (
    event: Events[K]
  ) => void;
};
// { onClick?: (e: MouseEvent) => void; onChange?: ...; onSubmit?: ... }
```

## Exemple

```ts
type EventName = "click" | "focus" | "blur";
type HandlerName = `on${Capitalize<EventName>}`;
// "onClick" | "onFocus" | "onBlur"
```

## Comment ça fonctionne

Une map event → type de payload + remapping des clés vers onX.

## Erreurs fréquentes

- Handler typé en any
- Désynchronisation entre noms d’events et handlers

## À retenir

- Map d’events + template onX
- Payload typé par event
- Autocomplétion des handlers

## Exercices

1. À partir de `"load" | "error"`, génère `"onLoad" | "onError"`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type E = "load" | "error";
   type H = `on${Capitalize<E>}`;
   ```
   :::

## Questions d'entretien

1. Comment types-tu un système d’event handlers de façon scalable ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En définissant une map event → payload, puis en dérivant les handlers via un mapped type avec template `` on${Capitalize<K>} `` pour lier automatiquement nom et type d’événement.
   :::
