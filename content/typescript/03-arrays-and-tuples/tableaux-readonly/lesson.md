---
id: typescript-03-tableaux-readonly
title: Tableaux readonly
slug: tableaux-readonly
technology: typescript
level: beginner
module: 03-arrays-and-tuples
order: 6
estimatedMinutes: 12
difficulty: 2
xp: 40
prerequisites: [typescript-03-tableaux-multidimensionnels]
skills: [arrays-tuples]
tags: [typescript, arrays, readonly]
---

## Objectifs

- Utiliser `readonly` sur les tableaux
- Connaître `ReadonlyArray<T>`
- Comprendre les limites (immutabilité superficielle)

## Introduction

Quand on ne veut pas qu’un tableau soit modifié, on le déclare `readonly`.

## Concept

```ts
const ids: readonly number[] = [1, 2, 3];
// ids.push(4);     // ❌
// ids[0] = 99;     // ❌
```

Forme générique :

```ts
const names: ReadonlyArray<string> = ["a", "b"];
```

Les méthodes de mutation (`push`, `pop`, `splice`…) disparaissent du type. Les méthodes de lecture (`map`, `filter`, `slice`…) restent disponibles et retournent souvent un tableau mutable.

## Exemple

```ts
function printAll(items: readonly string[]) {
  items.forEach(i => console.log(i));
}
```

L’appelant peut passer un `string[]` classique (compatible) mais la fonction s’engage à ne pas le modifier.

## Comment ça fonctionne

`readonly T[]` retire les méthodes mutantes de l’interface. C’est une protection de compilation uniquement.

## Erreurs fréquentes

- Croire que les éléments objets sont aussi protégés en profondeur
- Essayer d’assigner un `readonly T[]` à un `T[]` (pas compatible dans ce sens)

## À retenir

- `readonly T[]` / `ReadonlyArray<T>` = pas de mutation
- Utile pour les paramètres de fonctions et les constantes
- Protection superficielle

## Exercices

1. Déclare un tableau readonly de strings et tente un push (observe l’erreur).

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   const tags: readonly string[] = ["ts"];
   // tags.push("js"); // Erreur
   ```
   :::

## Questions d'entretien


1. Peut-on passer un `string[]` à une fonction qui attend `readonly string[]` ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   Oui. Un tableau mutable est compatible avec un paramètre readonly (on promet juste de ne pas le muter). L’inverse n’est pas vrai.
   :::

