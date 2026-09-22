---
id: typescript-28-narrowing-dom
title: Narrowing DOM
slug: narrowing-dom
technology: typescript
level: intermediate
module: 28-typescript-and-dom
order: 10
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-28-query-selectors]
skills: [dom]
tags: [typescript, dom, narrowing]
---

## Objectifs

- Narrow les éléments DOM
- Utiliser instanceof, null checks
- Éviter les assertions abusives

## Introduction

Le DOM est plein de `Element | null` et de types larges : le narrowing est essentiel.

## Concept

```ts
const el = document.getElementById("app");
if (el instanceof HTMLDivElement) {
  el.style.display = "grid";
}

const node = e.target;
if (node instanceof HTMLInputElement) {
  console.log(node.value);
}
```

## Exemple

```ts
function asInput(el: Element | null): HTMLInputElement | null {
  return el instanceof HTMLInputElement ? el : null;
}
```

## Comment ça fonctionne

`instanceof` est un type guard natif pour les classes DOM (interfaces implémentées côté runtime par le navigateur).

## Erreurs fréquentes

- `as HTMLInputElement` systématique
- Non-null `!` sans garantie

## À retenir

- instanceof = narrowing DOM
- null checks
- Assertion seulement si HTML garanti

## Exercices

1. Narrow e.target vers HTMLAnchorElement et lis href.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   if (e.target instanceof HTMLAnchorElement) {
     console.log(e.target.href);
   }
   ```
   :::

## Questions d'entretien

1. Assertion vs instanceof pour un élément DOM ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   `instanceof` vérifie à runtime et affine le type. L’assertion ne vérifie rien. Préférer instanceof sauf garantie structurelle forte (élément fixe dans le HTML).
   :::
