---
id: typescript-05-void
title: void
slug: void
technology: typescript
level: beginner
module: 05-functions
order: 12
estimatedMinutes: 10
difficulty: 1
xp: 35
prerequisites: [typescript-02-void]
skills: [functions]
tags: [typescript, functions, void]
---

## Objectifs

- Utiliser `void` comme type de retour de fonction
- Distinguer `void` de `undefined` et `never`
- Savoir quand l’annoter

## Introduction

`void` indique qu’une fonction ne produit pas de valeur utile pour l’appelant.

## Concept

```ts
function log(message: string): void {
  console.log(message);
}
```

On peut faire `return;` ou omettre le `return`. On ne doit pas retourner une vraie valeur.

## Exemple

```ts
function setTitle(title: string): void {
  document.title = title;
}
```

## Comment ça fonctionne

`void` est surtout un signal pour l’appelant. TypeScript autorise l’absence de valeur de retour ou un `return;` explicite.

## Erreurs fréquentes

- Confondre `void` et `never`
- Annoter `: undefined` alors que `void` est plus idiomatique pour les effets de bord

## À retenir

- `void` = pas de valeur de retour utile
- Idéal pour les loggers, setters, event handlers
- Différent de `never` (qui ne retourne jamais)

## Exercices

1. Annote une fonction qui affiche un message.

   :::solution
   ```ts
   function print(msg: string): void {
     console.log(msg);
   }
   ```
   :::

## Questions d'entretien

1. Quand utilises-tu `void` comme type de retour ?

   :::reponse
   Quand la fonction effectue un effet de bord et que l’appelant n’est pas censé utiliser de valeur de retour.
   :::
