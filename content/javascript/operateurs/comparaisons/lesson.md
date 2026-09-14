---
id: javascript-comparaisons
title: "Comparer des valeurs : == contre ==="
slug: comparaisons
technology: javascript
level: beginner
module: operateurs
order: 2
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites:
  - javascript-types-primitifs
skills:
  - comparison
tags:
  - javascript
  - operateurs
---

## Objectifs

- Utiliser `===` et `!==` par défaut, et savoir pourquoi.
- Prévoir les conversions de `==`, et reconnaître son unique usage recommandé.
- Comparer correctement des chaînes, des nombres et des objets avec `<`, `>`, `<=`, `>=`.

## Introduction

« Est-ce que ces deux valeurs sont égales ? » La question paraît simple, et JavaScript y
répond de deux façons. `===` compare sans rien transformer. `==` convertit d'abord les
valeurs, selon des règles qui produisent des résultats célèbres pour leur absurdité :
`'' == 0` est vrai, `[] == false` aussi. Savoir lequel utiliser, et pourquoi, fait partie
des bases attendues de tout développeur JavaScript.

## Concept

| Opérateur | Conversion | `'1' == 1` / `'1' === 1` | Usage |
| --- | --- | --- | --- |
| `===` / `!==` | aucune : types différents, donc différents | `false` | par défaut, partout |
| `==` / `!=` | convertit les types avant de comparer | `true` | presque jamais |

Quelques résultats de `==` à connaître :

| Expression | `==` | `===` |
| --- | --- | --- |
| `null == undefined` | `true` | `false` |
| `null == 0` | `false` | `false` |
| `'' == 0` | `true` | `false` |
| `'0' == false` | `true` | `false` |
| `[] == false` | `true` | `false` |
| `NaN == NaN` | `false` | `false` |

La règle professionnelle : **toujours `===`**, avec une seule exception acceptée,
`valeur == null`, qui teste en une fois `null` et `undefined`.

Les opérateurs `<`, `>`, `<=`, `>=` comparent des **nombres** numériquement et des
**chaînes** caractère par caractère, selon leur code. Pour deux objets, `===` compare
**l'identité** : `{} === {}` vaut `false`.

`Object.is(a, b)` est une égalité encore plus stricte : `Object.is(NaN, NaN)` vaut
`true`, et `Object.is(0, -0)` vaut `false`.

## Exemple

```js
const saisie = '18'; // les formulaires renvoient des chaînes

console.log(saisie === 18); // false : types différents
console.log(Number(saisie) === 18); // true : on convertit explicitement

const telephone = undefined;
console.log(telephone == null); // true : null ou undefined

console.log('b' > 'a'); // true
console.log('Zèbre' < 'arbre'); // true : les majuscules ont un code plus petit
console.log('10' < '9'); // true : comparaison de chaînes, '1' < '9'
console.log('10' < 9); // false : l'un est un nombre, comparaison numérique

console.log(['éclair', 'zèbre'].sort()); // ['zèbre', 'éclair'] : 'é' a un grand code
console.log('éclair'.localeCompare('zèbre', 'fr')); // -1 : l'ordre alphabétique réel
```

## Comment ça fonctionne

`===` répond immédiatement : types différents, donc `false` ; même type, on compare les
valeurs. `==`, lui, suit l'algorithme d'égalité abstraite :

1. même type : il se comporte comme `===` ;
2. `null` et `undefined` sont égaux entre eux, et à rien d'autre ;
3. un nombre et une chaîne : la chaîne est convertie en nombre ;
4. un booléen : il est converti en nombre (`true` devient `1`, `false` devient `0`) ;
5. un objet et une primitive : l'objet est converti en primitive.

C'est ainsi que `[] == false` devient vrai : `false` devient `0`, `[]` devient `''`, puis
`''` devient `0`.

Les comparaisons `<` et `>` suivent une autre logique : deux chaînes sont comparées par
codes de caractères, sinon tout est converti en nombre. D'où ce piège classique :

```js
console.log(null == 0); // false : null n'est égal qu'à undefined
console.log(null >= 0); // true : pour >=, null est converti en 0
console.log(undefined > 0); // false : undefined devient NaN, toute comparaison est fausse
```

## Erreurs fréquentes

**Comparer une saisie à un nombre avec `===`.** `'18' === 18` est faux. Convertis
d'abord la saisie, puis compare strictement.

**Utiliser `==` « parce que ça marche ».** Ça marche jusqu'au jour où `0`, `''` ou
`false` arrive. Le code n'exprime plus ce que tu veux dire.

**Comparer des nombres stockés en chaînes.** `'10' < '9'` est vrai. Convertis en nombres
avant de comparer.

**Trier des mots accentués avec `sort()`.** L'ordre suit les codes de caractères, pas
l'alphabet : utilise `localeCompare`.

**Comparer deux objets avec `===` pour tester leur contenu.** Seule l'identité est
comparée.

## À retenir

- `===` par défaut ; `== null` est la seule exception tolérée.
- `==` convertit les types, et ses règles produisent des surprises.
- `<` et `>` comparent deux chaînes par codes de caractères, sinon en nombres.
- `null >= 0` est vrai alors que `null == 0` est faux.
- Pour l'ordre alphabétique réel, `localeCompare`.

## Exercices

1. Prévois le résultat de chaque expression : `0 == ''`, `0 === ''`,
   `null == undefined`, `null === undefined`, `'1' == 1`, `NaN == NaN`.

   :::indice
   `===` ne convertit jamais : des types différents donnent toujours `false`.
   :::

   :::indice
   Pour `==` : `null` et `undefined` ne sont égaux qu'entre eux, et `NaN` n'est égal à rien.
   :::

   :::solution
   - `0 == ''` : `true`, la chaîne vide est convertie en `0`.
   - `0 === ''` : `false`, types différents.
   - `null == undefined` : `true`, règle spéciale de `==`.
   - `null === undefined` : `false`, types différents.
   - `'1' == 1` : `true`, `'1'` est converti en `1`.
   - `NaN == NaN` : `false`, `NaN` n'est égal à rien.
   :::

2. Un formulaire fournit l'âge sous forme de chaîne dans `saisie`. Écris une comparaison
   « est majeur » qui ne dépend pas de `==` et rejette une saisie non numérique.

   :::indice
   Convertis d'abord avec `Number`, vérifie le résultat avec `Number.isNaN`, puis compare
   strictement.
   :::

   :::solution
   ```js
   const saisie = '18';
   const age = Number(saisie);
   const estMajeur = !Number.isNaN(age) && age >= 18;

   console.log(estMajeur); // true
   ```

   Avec `saisie = 'abc'`, `age` vaut `NaN` et `estMajeur` vaut `false` au lieu d'un résultat
   trompeur.
   :::

3. Trie `['éclair', 'zèbre', 'Arbre', 'banane']` dans l'ordre alphabétique français.

   :::indice
   `sort()` sans argument compare les codes de caractères. `localeCompare` connaît les
   règles d'une langue.
   :::

   :::solution
   ```js
   const mots = ['éclair', 'zèbre', 'Arbre', 'banane'];

   console.log([...mots].sort()); // ['Arbre', 'banane', 'zèbre', 'éclair']
   console.log([...mots].sort((a, b) => a.localeCompare(b, 'fr')));
   // ['Arbre', 'banane', 'éclair', 'zèbre']
   ```

   Sans argument, `é` est rangé après `z` parce que son code est plus grand. `localeCompare`
   applique l'ordre de la langue française.
   :::

## Questions d'entretien

- Quelle est la différence entre `==` et `===` ?

  :::indice
  Lequel des deux transforme les valeurs avant de les comparer ?
  :::

  :::reponse
  `===` compare sans conversion : deux valeurs de types différents sont toujours
  différentes. `==` convertit les types selon l'algorithme d'égalité abstraite avant de
  comparer, ce qui rend `'' == 0` et `[] == false` vrais. On utilise `===` par défaut, et
  on réserve `==` à `valeur == null`, qui teste à la fois `null` et `undefined`. ESLint
  impose souvent cette règle avec `eqeqeq`.
  :::

- Pourquoi `null >= 0` est-il vrai alors que `null == 0` est faux ?

  :::indice
  `==` et `>=` n'appliquent pas les mêmes règles de conversion.
  :::

  :::reponse
  L'égalité `==` a une règle spéciale : `null` n'est égal qu'à `null` et à `undefined`, donc
  `null == 0` est faux. Les comparaisons relationnelles comme `>=` convertissent leurs
  opérandes en nombres, et `null` devient `0` : `0 >= 0` est vrai. C'est une incohérence
  historique qui montre pourquoi il vaut mieux convertir explicitement avant de comparer.
  :::

- Comment comparer deux objets selon leur contenu ?

  :::indice
  Que compare `===` quand ses deux opérandes sont des objets ?
  :::

  :::reponse
  `===` ne compare que l'identité des objets. Pour le contenu, on compare les propriétés
  significatives une à une. `JSON.stringify` est fragile, car sensible à l'ordre des
  propriétés et incapable de gérer les dates ou les `undefined`. Pour des structures
  profondes, on écrit une fonction d'égalité dédiée, ou on utilise celle d'une bibliothèque
  comme `isEqual` de Lodash.
  :::
