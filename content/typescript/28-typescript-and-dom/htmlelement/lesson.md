---
id: typescript-28-htmlelement
title: HTMLElement
slug: htmlelement
technology: typescript
level: intermediate
module: 28-typescript-and-dom
order: 2
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-28-typages-dom]
skills: [dom]
tags: [typescript, dom]
---

## Objectifs

- Utiliser le type `HTMLElement`
- Connaître ses propriétés courantes
- Le distinguer des sous-types

## Introduction

`HTMLElement` est la base de la plupart des éléments HTML.

## Concept

```ts
const el = document.getElementById("app");
if (el) {
  el.id;
  el.className;
  el.style.color = "red";
  el.addEventListener("click", () => {});
}
```

## Exemple

```ts
function hide(el: HTMLElement) {
  el.hidden = true;
}
```

## Comment ça fonctionne

Propriétés communes : `id`, `classList`, `style`, `dataset`, `innerHTML`, etc. Les éléments spécifiques ajoutent des API (value pour input…).

## Erreurs fréquentes

- Accéder à `.value` sur HTMLElement (réservé aux inputs)
- Ignorer null

## À retenir

- Base des éléments HTML
- style, classList, dataset
- Affiner vers HTMLInputElement etc. si besoin

## Exercices

1. Écris une fonction setText(el: HTMLElement, text: string).

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   function setText(el: HTMLElement, text: string) {
     el.textContent = text;
   }
   ```
   :::

## Questions d'entretien

1. Pourquoi ne pas tout typer en HTMLElement ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Parce que des API spécifiques (value, checked, options…) n’existent que sur des sous-types. Un typage trop large empêche d’accéder proprement à ces membres.
   :::
