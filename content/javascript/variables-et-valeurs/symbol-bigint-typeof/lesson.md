---
id: javascript-symbol-bigint-typeof
title: symbol, bigint et typeof
slug: symbol-bigint-typeof
technology: javascript
level: beginner
module: variables-et-valeurs
order: 3
estimatedMinutes: 25
difficulty: 2
xp: 60
prerequisites:
  - javascript-types-primitifs
skills:
  - js-primitive-types
tags:
  - javascript
  - types
---

## Objectifs

- Créer des symboles et savoir à quoi ils servent.
- Calculer exactement sur de très grands entiers avec `bigint`, et connaître ses limites.
- Connaître tous les résultats possibles de `typeof`, y compris ses pièges.

## Introduction

Le chapitre précédent a présenté cinq primitives. Il en reste deux, plus rares mais bien
réelles : `symbol`, qui crée des identifiants garantis uniques, et `bigint`, qui calcule
sur des entiers de taille arbitraire. Pour distinguer tous ces types, JavaScript fournit
l'opérateur `typeof` — utile, mais qui ment dans deux cas qu'il faut connaître par cœur.

## Concept

**`symbol`** : une valeur unique, créée avec `Symbol(description)`. Deux symboles de même
description sont toujours différents. On s'en sert surtout comme **clé de propriété**
qui ne risque pas d'entrer en collision avec une autre, et qui n'apparaît ni dans
`Object.keys` ni dans `JSON.stringify`.

**`bigint`** : un entier sans limite de taille, écrit avec le suffixe `n` (`123n`) ou
créé avec `BigInt(123)`. Il calcule exactement là où `number` perd en précision.

**`typeof`** renvoie une chaîne qui décrit le type d'une valeur :

| Expression | Résultat |
| --- | --- |
| `typeof 'Ada'` | `'string'` |
| `typeof 42` | `'number'` |
| `typeof true` | `'boolean'` |
| `typeof undefined` | `'undefined'` |
| `typeof Symbol('id')` | `'symbol'` |
| `typeof 10n` | `'bigint'` |
| `typeof { a: 1 }` | `'object'` |
| `typeof null` | `'object'` — erreur historique |
| `typeof [1, 2]` | `'object'` — un tableau est un objet |
| `typeof function () {}` | `'function'` |

## Exemple

```js
// symbol : une clé qui ne se mélange pas aux autres
const identifiantInterne = Symbol('identifiantInterne');
const commande = { numero: 'CMD-42', montant: 120 };
commande[identifiantInterne] = 'a7f3';

console.log(Object.keys(commande)); // ['numero', 'montant']
console.log(JSON.stringify(commande)); // {"numero":"CMD-42","montant":120}
console.log(commande[identifiantInterne]); // 'a7f3'
console.log(Symbol('id') === Symbol('id')); // false

// bigint : des entiers exacts, sans limite
console.log(2 ** 64); // 18446744073709552000 (arrondi)
console.log(2n ** 64n); // 18446744073709551616n (exact)
console.log(10n / 3n); // 3n : la division entière tronque

// typeof et ses deux pièges
console.log(typeof null); // 'object'
console.log(Array.isArray([1, 2])); // true : le bon test pour un tableau
```

## Comment ça fonctionne

`typeof null` vaut `'object'` à cause d'un choix de représentation dans la toute première
implémentation du langage, jamais corrigé pour ne pas casser le web existant. Pour tester
`null`, on compare directement : `valeur === null`. Pour un tableau, on utilise
`Array.isArray(valeur)`.

`typeof` a une particularité utile : appliqué à un identifiant **jamais déclaré**, il
renvoie `'undefined'` au lieu de lever une erreur. Seule exception : une variable `let`
ou `const` encore dans sa zone morte temporelle lève une `ReferenceError`.

`bigint` et `number` sont deux types distincts, qu'on ne peut pas mélanger dans un
calcul :

```js
10n + 5; // TypeError: Cannot mix BigInt and other types
10n + BigInt(5); // 15n
Number(10n) + 5; // 15
10n > 5; // true : les comparaisons, elles, sont autorisées
10n === 10; // false : types différents
```

`bigint` ne fonctionne pas non plus avec `Math`, et `JSON.stringify` refuse de le
sérialiser (`TypeError`) : on le convertit en chaîne avant.

`Symbol.for('clé')` fonctionne différemment de `Symbol('clé')` : il cherche le symbole
dans un registre global et renvoie **le même** pour la même clé.

## Erreurs fréquentes

**Tester un tableau avec `typeof`.** `typeof []` vaut `'object'`. Utilise
`Array.isArray`.

**Tester `null` avec `typeof`.** `typeof null` vaut `'object'`. Compare avec
`valeur === null`.

**Mélanger `bigint` et `number`.** `1n + 1` lève une `TypeError`. Convertis
explicitement l'une des deux valeurs.

**Créer un symbole avec `new`.** `new Symbol()` lève une `TypeError` : `Symbol` s'appelle
comme une fonction.

## À retenir

- Un `symbol` est unique : c'est une clé de propriété qui n'entre jamais en collision.
- Un `bigint` (suffixe `n`) calcule exactement sur de grands entiers, sans se mélanger
  aux `number`.
- `typeof null` vaut `'object'` et `typeof []` aussi : utilise `=== null` et
  `Array.isArray`.
- `typeof identifiantInconnu` renvoie `'undefined'` sans erreur.

## Exercices

1. Sans l'exécuter, prévois le résultat de `typeof` pour : `'42'`, `42`, `null`,
   `[1, 2]`, `Symbol()`, `42n`. Vérifie ensuite dans la console.

   :::indice
   Deux de ces valeurs donnent un résultat trompeur : ce sont les deux cas où `typeof`
   ment.
   :::

   :::solution
   ```js
   console.log(typeof '42'); // 'string'
   console.log(typeof 42); // 'number'
   console.log(typeof null); // 'object' (piège historique)
   console.log(typeof [1, 2]); // 'object' (un tableau est un objet)
   console.log(typeof Symbol()); // 'symbol'
   console.log(typeof 42n); // 'bigint'
   ```
   :::

2. Calcule exactement 2 puissance 64 et compare avec le résultat en `number`.

   :::indice
   L'opérateur `**` fonctionne aussi sur des `bigint`, à condition que les deux opérandes
   en soient.
   :::

   :::solution
   ```js
   console.log(2 ** 64); // 18446744073709552000 (arrondi)
   console.log(2n ** 64n); // 18446744073709551616n (exact)
   console.log(String(2n ** 64n)); // '18446744073709551616'
   ```

   Au-delà de `2 ** 53`, un `number` arrondit. Un `bigint` reste exact, mais ne se mélange
   pas aux `number` : `2n ** 64` lèverait une `TypeError`.
   :::

3. Ajoute à un objet `commande` un identifiant interne qui n'apparaisse ni dans
   `Object.keys(commande)` ni dans `JSON.stringify(commande)`.

   :::indice
   Les propriétés dont la clé est un symbole sont ignorées par `Object.keys` et par
   `JSON.stringify`.
   :::

   :::solution
   ```js
   const ID_INTERNE = Symbol('idInterne');

   const commande = { numero: 'CMD-7', montant: 80 };
   commande[ID_INTERNE] = 'db-19384';

   console.log(Object.keys(commande)); // ['numero', 'montant']
   console.log(JSON.stringify(commande)); // {"numero":"CMD-7","montant":80}
   console.log(commande[ID_INTERNE]); // 'db-19384'
   ```

   Ce n'est pas une donnée secrète : `Object.getOwnPropertySymbols(commande)` la retrouve.
   C'est une clé qui ne gêne pas l'affichage ni la sérialisation.
   :::

## Questions d'entretien

- Pourquoi `typeof null` vaut-il `'object'` ?

  :::indice
  Est-ce un choix de conception ou un accident conservé ?
  :::

  :::reponse
  C'est un bug de la toute première implémentation de JavaScript : les valeurs étaient
  étiquetées par un code de type, et celui de `null` correspondait à celui des objets. La
  correction a été envisagée, puis abandonnée parce qu'elle aurait cassé du code existant
  sur le web. On teste donc `null` par comparaison directe, `valeur === null`.
  :::

- À quoi sert un `Symbol` ?

  :::indice
  Que se passe-t-il si deux bibliothèques ajoutent chacune une propriété nommée `id` au
  même objet ?
  :::

  :::reponse
  Un symbole est une valeur garantie unique. Utilisé comme clé de propriété, il ne peut
  entrer en collision avec aucune autre clé, même de même description, et il n'apparaît ni
  dans `Object.keys`, ni dans `for...in`, ni dans `JSON.stringify`. Le langage s'en sert
  aussi pour ses propres protocoles : `Symbol.iterator` définit comment un objet se
  parcourt avec `for...of`. Ce n'est pas un mécanisme de confidentialité :
  `Object.getOwnPropertySymbols` liste ces clés.
  :::

- Quand utiliser `bigint` plutôt que `number`, et quelles sont ses limites ?

  :::indice
  Pense aux identifiants de base de données très longs et aux calculs sur de très grands
  entiers.
  :::

  :::reponse
  On utilise `bigint` dès qu'un entier peut dépasser `Number.MAX_SAFE_INTEGER` : grands
  identifiants, cryptographie, calculs exacts sur de grands nombres. Ses limites : il ne
  représente que des entiers (la division tronque), il ne se mélange pas aux `number` dans
  un calcul, il ne fonctionne pas avec `Math`, et `JSON.stringify` ne sait pas le
  sérialiser. Il est aussi plus lent que `number` : on ne l'utilise pas par défaut.
  :::
