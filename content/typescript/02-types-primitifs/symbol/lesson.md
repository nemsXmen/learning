---
id: typescript-02-symbol
title: symbol
slug: symbol
technology: typescript
level: beginner
module: 02-types-primitifs
order: 7
estimatedMinutes: 12
difficulty: 2
xp: 40
prerequisites: [typescript-02-bigint]
skills: [primitive-types]
tags: [typescript, symbol, primitifs]
---

## Objectifs

- Comprendre le type `symbol`
- Savoir créer des symboles uniques
- Connaître les cas d’usage principaux (clés d’objet uniques)

## Introduction

`symbol` est un type primitif dont chaque valeur est unique et immuable. Il est souvent utilisé comme clé de propriété pour éviter les collisions.

## Concept

```ts
const id = Symbol("id");
const anotherId = Symbol("id");

console.log(id === anotherId); // false – chaque Symbol est unique
```

### Typage

```ts
let sym: symbol = Symbol("key");
```

### Symboles comme clés

```ts
const userId = Symbol("userId");

const user = {
  name: "Alice",
  [userId]: 123
};

console.log(user[userId]); // 123
```

Les symboles n’apparaissent pas dans `Object.keys()` ni dans les boucles `for…in` classiques.

## Exemple

```ts
const SECRET = Symbol("secret");

class Service {
  [SECRET] = "valeur cachée";
}
```

## Comment ça fonctionne

Chaque appel à `Symbol()` produit une valeur unique. TypeScript type ces valeurs comme `symbol`. Il existe aussi les *well-known symbols* (`Symbol.iterator`, `Symbol.toStringTag`…).

## Erreurs fréquentes

- Croire que deux `Symbol("desc")` sont égaux
- Utiliser des symboles partout alors qu’une simple string suffit
- Oublier que les symboles ne sont pas énumérés par défaut

## À retenir

- Chaque `Symbol()` est unique
- Utile pour des clés de propriété non collisionnables
- Type primitif à part entière
- Rarement nécessaire au début, mais bon à connaître

## Exercices

1. Crée deux symboles avec la même description et vérifie qu’ils sont différents.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   const a = Symbol("x");
   const b = Symbol("x");
   console.log(a === b); // false
   ```
   :::

## Questions d'entretien


1. À quoi servent principalement les symbols en TypeScript/JavaScript ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   À créer des identifiants uniques, souvent utilisés comme clés de propriétés d’objets pour éviter les collisions de noms, et pour les well-known symbols du langage (iterator, etc.).
   :::

