---
id: typescript-05-callbacks-types
title: Callbacks typés
slug: callbacks-types
technology: typescript
level: beginner
module: 05-functions
order: 8
estimatedMinutes: 15
difficulty: 2
xp: 50
prerequisites: [typescript-05-arrow-functions]
skills: [functions]
tags: [typescript, functions, callbacks]
---

## Objectifs

- Typer correctement les callbacks
- Utiliser les function types pour les paramètres callback
- Voir des patterns courants (map, event handlers…)

## Introduction

Les callbacks sont partout. Bien les typer rend les APIs claires et sûres.

## Concept

```ts
function process(items: number[], callback: (item: number) => string): string[] {
  return items.map(callback);
}

const result = process([1, 2, 3], (n) => `n=${n}`);
```

Le type du callback `(item: number) => string` documente exactement ce qui est attendu.

## Exemple

```ts
type Predicate<T> = (value: T) => boolean;

function filter<T>(items: T[], predicate: Predicate<T>): T[] {
  return items.filter(predicate);
}
```

## Comment ça fonctionne

On utilise un function type (ou un type alias) pour décrire la signature attendue du callback. Le contextual typing permet souvent d’alléger les annotations côté appelant.

## Erreurs fréquentes

- Typer le callback en `Function` ou `any`
- Oublier le type de retour du callback
- Ne pas documenter les arguments du callback

## À retenir

- Toujours typer les callbacks avec une signature précise
- Les type aliases de fonctions améliorent la lisibilité
- Le contextual typing aide l’appelant

## Exercices

1. Écris une fonction `forEach` typée qui prend un tableau de strings et un callback `(s: string) => void`.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   function forEach(items: string[], cb: (s: string) => void): void {
     for (const item of items) cb(item);
   }
   ```
   :::

## Questions d'entretien


1. Comment type-t-on un paramètre callback en TypeScript ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   Avec un function type, par exemple `(value: number) => boolean`, ou via un type alias. Cela documente les arguments et le retour attendus.
   :::

