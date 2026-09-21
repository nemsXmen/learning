---
id: typescript-02-void
title: void
slug: void
technology: typescript
level: beginner
module: 02-types-primitifs
order: 11
estimatedMinutes: 12
difficulty: 1
xp: 40
prerequisites: [typescript-02-never]
skills: [primitive-types]
tags: [typescript, void, primitifs]
---

## Objectifs

- Comprendre le type `void`
- Savoir l’utiliser pour les fonctions sans retour utile
- Distinguer `void` de `undefined` et de `never`

## Introduction

`void` indique qu’une fonction ne retourne pas de valeur *utile*. C’est le type de retour le plus courant pour les fonctions qui font un effet de bord (afficher, logger, modifier un état…).

## Concept

```ts
function logMessage(message: string): void {
  console.log(message);
  // pas de return, ou return;
}
```

### void vs undefined

Une fonction `void` peut implicitement retourner `undefined`, mais on annote `void` pour dire « l’appelant ne doit pas utiliser la valeur de retour ».

```ts
function f(): void {
  return; // OK
  // return undefined; // aussi OK
  // return 42; // ❌
}
```

## Exemple

```ts
function setTitle(title: string): void {
  document.title = title;
}

const result = setTitle("Mon app"); // result est de type void
```

## Comment ça fonctionne

`void` est surtout un signal pour l’appelant : « n’utilise pas ce que je retourne ». TypeScript autorise `return;` ou l’absence de `return`, mais refuse de retourner une vraie valeur.

## Erreurs fréquentes

- Confondre `void` et `never`
- Annoter `undefined` alors que `void` est plus idiomatique pour les fonctions
- Essayer d’utiliser la valeur de retour d’une fonction `void`

## À retenir

- `void` = pas de valeur de retour utile
- Idéal pour les fonctions à effet de bord
- Différent de `never` (qui ne retourne jamais) et de `undefined` (valeur concrète)

## Exercices

1. Annote correctement une fonction qui affiche un message et ne retourne rien.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   function print(msg: string): void {
     console.log(msg);
   }
   ```
   :::

## Questions d'entretien


1. Quand utilises-tu `void` comme type de retour ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   Quand la fonction effectue une action (effet de bord) et que l’appelant n’est pas censé utiliser de valeur de retour. Exemples : loggers, setters, gestionnaires d’événements.
   :::

