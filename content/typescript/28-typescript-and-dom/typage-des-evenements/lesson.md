---
id: typescript-28-typage-des-evenements
title: Typage des événements
slug: typage-des-evenements
technology: typescript
level: intermediate
module: 28-typescript-and-dom
order: 8
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-28-keyboardevent]
skills: [dom]
tags: [typescript, dom, events]
---

## Objectifs

- S’appuyer sur l’inférence d’addEventListener
- Typer des handlers custom
- Utiliser EventMap

## Introduction

Les types DOM mappent les noms d’événements vers les bonnes interfaces.

## Concept

```ts
button.addEventListener("click", (e) => {
  // e: MouseEvent (inféré)
});

input.addEventListener("input", (e) => {
  // e: Event
  const t = e.target;
});
```

Handlers extraits :

```ts
const onClick: (e: MouseEvent) => void = (e) => {
  console.log(e.clientX);
};
```

## Exemple – custom events

```ts
declare global {
  interface HTMLElementEventMap {
    "app:ready": CustomEvent<{ version: string }>;
  }
}
```



## Exemple

Consulte les exemples de code de cette leçon pour appliquer la notion.

## Comment ça fonctionne

`HTMLElementEventMap` (et variants) lient nom → type d’event pour l’inférence.

## Erreurs fréquentes

- Annoter Event trop large et perdre clientX
- Custom events non déclarés

## À retenir

- Inférence via le nom
- Annoter les handlers extraits
- Étendre EventMap pour le custom

## Exercices

1. Type explicitement un handler (e: KeyboardEvent) => void.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   const onKey: (e: KeyboardEvent) => void = (e) => {
     if (e.key === "Enter") submit();
   };
   ```
   :::

## Questions d'entretien

1. Comment types-tu un CustomEvent avec payload ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En étendant l’interface EventMap appropriée (ex. HTMLElementEventMap) pour associer le nom d’événement à `CustomEvent<Payload>`, afin que addEventListener infère le bon type.
   :::
