---
id: typescript-28-htmlinputelement
title: HTMLInputElement
slug: htmlinputelement
technology: typescript
level: intermediate
module: 28-typescript-and-dom
order: 3
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-28-htmlelement]
skills: [dom]
tags: [typescript, dom]
---

## Objectifs

- Typer les inputs
- Utiliser value, checked, type
- Narrow depuis Element

## Introduction

`HTMLInputElement` ajoute l’API des champs de saisie.

## Concept

```ts
const input = document.querySelector("#email");
if (input instanceof HTMLInputElement) {
  input.value = "user@example.com";
  input.checked; // pour checkbox/radio
  input.type;
}
```

## Exemple

```ts
function readNumber(el: HTMLInputElement): number {
  return Number(el.value);
}
```

## Comment ça fonctionne

Sans narrowing, querySelector retourne `Element | null`. `instanceof` affine vers HTMLInputElement.

## Erreurs fréquentes

- (el as HTMLInputElement).value sans check
- Confondre input et textarea (HTMLTextAreaElement)

## À retenir

- value, checked, type
- instanceof HTMLInputElement
- Textarea = autre interface

## Exercices

1. Narrow un Element vers HTMLInputElement et lis value.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   if (el instanceof HTMLInputElement) {
     console.log(el.value);
   }
   ```
   :::

## Questions d'entretien

1. Comment accèdes-tu proprement à `.value` d’un élément du DOM ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En s’assurant que c’est un HTMLInputElement (ou HTMLTextAreaElement) via instanceof ou un querySelector typé, puis en lisant `.value`.
   :::
